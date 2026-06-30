import express from 'express'
import { Op } from 'sequelize'
import { Leave, LeaveType, Employee, User } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, status, employeeId } = req.query
    const where = {}
    if (company) where.companyId = company
    if (status) where.status = status
    if (employeeId) where.employeeId = employeeId
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const { rows: leaves, count: total } = await Leave.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [
        { model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'department', 'avatar'] },
        { model: User, as: 'approvedBy', attributes: ['name'] },
      ],
    })
    res.json({ leaves, total })
  } catch (err) { next(err) }
})

router.get('/types', protect, async (req, res, next) => {
  try {
    const types = await LeaveType.findAll({ where: { companyId: getCompany(req) } })
    res.json(types)
  } catch (err) { next(err) }
})

router.post('/types', protect, async (req, res, next) => {
  try {
    const type = await LeaveType.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(type)
  } catch (err) { next(err) }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const start = new Date(req.body.startDate)
    const end = new Date(req.body.endDate)
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    const leave = await Leave.create({ ...req.body, days, companyId: getCompany(req) })
    res.status(201).json(leave)
  } catch (err) { next(err) }
})

router.patch('/:id/approve', protect, async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id)
    if (!leave) return res.status(404).json({ message: 'Leave request not found' })
    await leave.update({ status: 'approved', approvedById: req.user.id, approvedAt: new Date() })
    res.json(leave)
  } catch (err) { next(err) }
})

router.patch('/:id/reject', protect, async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id)
    if (!leave) return res.status(404).json({ message: 'Leave request not found' })
    await leave.update({ status: 'rejected', approvedById: req.user.id, approvedAt: new Date(), remarks: req.body.remarks })
    res.json(leave)
  } catch (err) { next(err) }
})

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Leave.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Leave request deleted' })
  } catch (err) { next(err) }
})

router.get('/balance/:employeeId', protect, async (req, res, next) => {
  try {
    const year = new Date().getFullYear()
    const approved = await Leave.findAll({
      where: {
        employeeId: req.params.employeeId,
        status: 'approved',
        startDate: { [Op.gte]: new Date(`${year}-01-01`) },
      },
    })
    const used = approved.reduce((sum, l) => sum + l.days, 0)
    res.json({ used, allowed: 20, remaining: Math.max(0, 20 - used) })
  } catch (err) { next(err) }
})

export default router
