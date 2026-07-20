import express from 'express'
import { Op } from 'sequelize'
import { AuditLog, User } from '../models/index.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

const csvEscape = (v) => {
  if (v == null) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function buildWhere(req) {
  const { module, action, userId, status, search, startDate, endDate, resource, resourceId } = req.query
  const where = {}

  if (req.companyId) where.companyId = req.companyId
  if (module) where.module = module
  if (action) where.action = action
  if (userId) where.userId = userId
  if (status) where.status = status
  if (resource) where.resource = resource
  if (resourceId) where.resourceId = String(resourceId)

  if (search) {
    where[Op.or] = [
      { action: { [Op.like]: `%${search}%` } },
      { resource: { [Op.like]: `%${search}%` } },
      { resourceId: { [Op.like]: `%${search}%` } },
    ]
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt[Op.gte] = new Date(startDate)
    if (endDate) where.createdAt[Op.lte] = new Date(endDate)
  }

  return where
}


// ── List (filters + pagination) ──
router.get('/', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const where = buildWhere(req)

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (page - 1) * limit,
    })

    res.json({ logs: rows, total: count })
  } catch (err) {
    next(err)
  }
})

// ── Stats (for the Audit Log dashboard) ──
router.get('/stats', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = {}
    if (req.companyId) where.companyId = req.companyId

    const [total, success, failed, byModule] = await Promise.all([
      AuditLog.count({ where }),
      AuditLog.count({ where: { ...where, status: 'success' } }),
      AuditLog.count({ where: { ...where, status: 'failed' } }),
      AuditLog.findAll({
        where,
        attributes: ['module', [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']],
        group: ['module'],
        raw: true,
      }),
    ])

    res.json({
      total,
      success,
      failed,
      byModule: byModule.map((m) => ({ module: m.module || 'unknown', count: Number(m.count) })),
    })
  } catch (err) {
    next(err)
  }
})

// ── CSV export (matches the zero-dependency CSV pattern used elsewhere in the app) ──
router.get('/export', protect, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const where = buildWhere(req)

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 5000, // sane upper bound for a single export
    })

    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Module', 'Resource', 'Resource ID', 'Status', 'IP Address', 'Device', 'Browser']
    const rows = logs.map((l) => [
      l.createdAt.toISOString(),
      l.user?.name || 'System',
      l.user?.email || '',
      l.action,
      l.module || '',
      l.resource,
      l.resourceId || '',
      l.status,
      l.ipAddress || '',
      l.device || '',
      l.browser || '',
    ])

    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`)
    res.send(csv)
  } catch (err) {
    next(err)
  }
})

export default router