import express from 'express'
import { Op } from 'sequelize'
import { Role, User } from '../models/index.js'
import { protect, authorize } from '../middleware/auth.js'
import { logEvent, getRequestMeta } from '../utils/audit.js'

const router = express.Router()

// ── List (search, status filter, pagination, excludes soft-deleted by default) ──
router.get('/', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const { search = '', status, includeDeleted, page = 1, limit = 20 } = req.query

    const where = {}
    if (req.companyId) where.companyId = req.companyId
    if (!includeDeleted || includeDeleted === 'false') where.isDeleted = false
    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (search) where.name = { [Op.like]: `%${search}%` }

    const { rows, count } = await Role.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (page - 1) * limit,
    })

    // Attach a live user count per role (userCount was referenced in the
    // frontend before but was never a real value).
    const roleIds = rows.map((r) => r.id)
    const counts = await User.findAll({
      where: { roleId: roleIds },
      attributes: ['roleId', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
      group: ['roleId'],
      raw: true,
    })
    const countMap = Object.fromEntries(counts.map((c) => [c.roleId, Number(c.count)]))

    const roles = rows.map((r) => ({ ...r.toJSON(), userCount: countMap[r.id] || 0 }))

    res.json({ roles, total: count })
  } catch (err) {
    next(err)
  }
})

// ── Stats (for a Role Dashboard) ──
router.get('/stats', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = {}
    if (req.companyId) where.companyId = req.companyId

    const [total, active, inactive, deleted] = await Promise.all([
      Role.count({ where: { ...where, isDeleted: false } }),
      Role.count({ where: { ...where, isDeleted: false, isActive: true } }),
      Role.count({ where: { ...where, isDeleted: false, isActive: false } }),
      Role.count({ where: { ...where, isDeleted: true } }),
    ])

    const usersWithRole = await User.count({ where: { roleId: { [Op.ne]: null } } })
    const usersWithoutRole = await User.count({ where: { roleId: null } })

    res.json({ total, active, inactive, deleted, usersWithRole, usersWithoutRole })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = { id: req.params.id }
    if (req.companyId) where.companyId = req.companyId

    const role = await Role.findOne({ where })
    if (!role) return res.status(404).json({ message: 'Role not found' })

    const userCount = await User.count({ where: { roleId: role.id } })

    res.json({ ...role.toJSON(), userCount })
  } catch (err) {
    next(err)
  }
})

router.post('/', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const role = await Role.create({
      ...req.body,
      companyId: req.companyId,
    })

    await logEvent({
      companyId: req.companyId,
      userId: req.user.id,
      action: 'role_created',
      resource: 'Role',
      resourceId: role.id,
      module: 'settings',
      changes: { name: role.name },
      ...getRequestMeta(req),
    })

    res.status(201).json(role)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = { id: req.params.id }
    if (req.companyId) where.companyId = req.companyId

    const role = await Role.findOne({ where })
    if (!role) return res.status(404).json({ message: 'Role not found' })

    const before = { name: role.name, permissions: role.permissions }
    await role.update(req.body)

    await logEvent({
      companyId: req.companyId,
      userId: req.user.id,
      action: 'role_updated',
      resource: 'Role',
      resourceId: role.id,
      module: 'settings',
      changes: { before, after: { name: role.name, permissions: role.permissions } },
      ...getRequestMeta(req),
    })

    res.json(role)
  } catch (err) {
    next(err)
  }
})

// ── Clone ──
router.post('/:id/clone', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = { id: req.params.id }
    if (req.companyId) where.companyId = req.companyId

    const source = await Role.findOne({ where })
    if (!source) return res.status(404).json({ message: 'Role not found' })

    const clone = await Role.create({
      companyId: source.companyId,
      name: `${source.name} (Copy)`,
      description: source.description,
      permissions: source.permissions,
    })

    await logEvent({
      companyId: req.companyId,
      userId: req.user.id,
      action: 'role_cloned',
      resource: 'Role',
      resourceId: clone.id,
      module: 'settings',
      changes: { clonedFrom: source.id, clonedFromName: source.name },
      ...getRequestMeta(req),
    })

    res.status(201).json(clone)
  } catch (err) {
    next(err)
  }
})

// ── Activate / Deactivate ──
router.patch('/:id/activate', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = { id: req.params.id }
    if (req.companyId) where.companyId = req.companyId

    const role = await Role.findOne({ where })
    if (!role) return res.status(404).json({ message: 'Role not found' })

    await role.update({ isActive: true })

    await logEvent({
      companyId: req.companyId,
      userId: req.user.id,
      action: 'role_activated',
      resource: 'Role',
      resourceId: role.id,
      module: 'settings',
      ...getRequestMeta(req),
    })

    res.json(role)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/deactivate', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = { id: req.params.id }
    if (req.companyId) where.companyId = req.companyId

    const role = await Role.findOne({ where })
    if (!role) return res.status(404).json({ message: 'Role not found' })

    await role.update({ isActive: false })

    await logEvent({
      companyId: req.companyId,
      userId: req.user.id,
      action: 'role_deactivated',
      resource: 'Role',
      resourceId: role.id,
      module: 'settings',
      ...getRequestMeta(req),
    })

    res.json(role)
  } catch (err) {
    next(err)
  }
})

// ── Soft delete ──
router.delete('/:id', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = { id: req.params.id }
    if (req.companyId) where.companyId = req.companyId

    const role = await Role.findOne({ where })
    if (!role) return res.status(404).json({ message: 'Role not found' })

    await role.update({ isDeleted: true, deletedAt: new Date() })

    await logEvent({
      companyId: req.companyId,
      userId: req.user.id,
      action: 'role_deleted',
      resource: 'Role',
      resourceId: role.id,
      module: 'settings',
      changes: { name: role.name },
      ...getRequestMeta(req),
    })

    res.json({ message: 'Role moved to trash' })
  } catch (err) {
    next(err)
  }
})

// ── Restore ──
router.patch('/:id/restore', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const role = await Role.findOne({ where: { id: req.params.id, ...(req.companyId ? { companyId: req.companyId } : {}) } })
    if (!role) return res.status(404).json({ message: 'Role not found' })

    await role.update({ isDeleted: false, deletedAt: null })

    await logEvent({
      companyId: req.companyId,
      userId: req.user.id,
      action: 'role_restored',
      resource: 'Role',
      resourceId: role.id,
      module: 'settings',
      ...getRequestMeta(req),
    })

    res.json(role)
  } catch (err) {
    next(err)
  }
})

// ── Permanent delete (only allowed on already-soft-deleted roles) ──
router.delete('/:id/permanent', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    const role = await Role.findOne({ where: { id: req.params.id } })
    if (!role) return res.status(404).json({ message: 'Role not found' })
    if (!role.isDeleted) {
      return res.status(400).json({ message: 'Role must be soft-deleted before it can be permanently removed.' })
    }

    const assignedCount = await User.count({ where: { roleId: role.id } })
    if (assignedCount > 0) {
      return res.status(400).json({
        message: `Cannot permanently delete: ${assignedCount} user(s) are still assigned to this role.`,
      })
    }

    await logEvent({
      companyId: role.companyId,
      userId: req.user.id,
      action: 'role_permanently_deleted',
      resource: 'Role',
      resourceId: role.id,
      module: 'settings',
      changes: { name: role.name },
      ...getRequestMeta(req),
    })

    await role.destroy()
    res.json({ message: 'Role permanently deleted' })
  } catch (err) {
    next(err)
  }
})

// ── Bulk actions ──
router.post('/bulk-activate', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const { ids = [] } = req.body
    if (!ids.length) return res.status(400).json({ message: 'No role IDs provided' })

    await Role.update({ isActive: true }, { where: { id: ids } })
    res.json({ message: `${ids.length} role(s) activated` })
  } catch (err) {
    next(err)
  }
})

router.post('/bulk-deactivate', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const { ids = [] } = req.body
    if (!ids.length) return res.status(400).json({ message: 'No role IDs provided' })

    await Role.update({ isActive: false }, { where: { id: ids } })
    res.json({ message: `${ids.length} role(s) deactivated` })
  } catch (err) {
    next(err)
  }
})

router.post('/bulk-delete', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const { ids = [] } = req.body
    if (!ids.length) return res.status(400).json({ message: 'No role IDs provided' })

    await Role.update({ isDeleted: true, deletedAt: new Date() }, { where: { id: ids } })
    res.json({ message: `${ids.length} role(s) moved to trash` })
  } catch (err) {
    next(err)
  }
})

export default router