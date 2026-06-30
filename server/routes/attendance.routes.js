import express from 'express'
import { Op, fn, col } from 'sequelize'
import { Attendance, Employee } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 25, date, status, search } = req.query
    const where = {}
    if (company) where.companyId = company
    if (status) where.status = status
    if (date) {
      const d = new Date(date)
      const start = new Date(d.setHours(0, 0, 0, 0))
      const end = new Date(d.setHours(23, 59, 59, 999))
      where.date = { [Op.gte]: start, [Op.lte]: end }
    }
    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Mongoose used populate(...match) to filter on a joined field and then
    // dropped rows whose employee didn't match. Sequelize: filter the
    // include directly with `where`, and use `required: true` (inner join)
    // so non-matching rows are excluded by the DB, not after the fact.
    const employeeWhere = search
      ? { [Op.or]: [{ firstName: { [Op.like]: `%${search}%` } }, { lastName: { [Op.like]: `%${search}%` } }] }
      : undefined

    const { rows: attendance, count: total } = await Attendance.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'department', 'avatar'],
        where: employeeWhere,
        required: !!search, // only force inner join when filtering by search
      }],
    })

    res.json({ attendance, total })
  } catch (err) { next(err) }
})

router.post('/checkin', protect, async (req, res, next) => {
  try {
    const record = await Attendance.create({ ...req.body, companyId: getCompany(req), checkIn: new Date() })
    res.status(201).json(record)
  } catch (err) { next(err) }
})

router.patch('/:id/checkout', protect, async (req, res, next) => {
  try {
    const record = await Attendance.findByPk(req.params.id)
    if (!record) return res.status(404).json({ message: 'Record not found' })
    const checkOut = new Date()
    const hours = (checkOut - record.checkIn) / (1000 * 60 * 60)
    record.checkOut = checkOut
    record.hoursWorked = Math.round(hours * 100) / 100
    await record.save()
    res.json(record)
  } catch (err) { next(err) }
})

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const record = await Attendance.findByPk(req.params.id)
    if (!record) return res.status(404).json({ message: 'Record not found' })
    await record.update(req.body)
    res.json(record)
  } catch (err) { next(err) }
})

router.get('/shifts', protect, (req, res) => res.json([{ _id: '1', name: 'Morning', start: '09:00', end: '17:00' }, { _id: '2', name: 'Evening', start: '14:00', end: '22:00' }]))

router.get('/summary', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    // Mongoose $group by status -> Sequelize group by + count
    const summary = await Attendance.findAll({
      where: { companyId: company },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    })
    // shape to match the old { _id, count } output
    res.json(summary.map(s => ({ _id: s.status, count: Number(s.count) })))
  } catch (err) { next(err) }
})

export default router
