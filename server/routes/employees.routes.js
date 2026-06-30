import express from 'express'
import { Op } from 'sequelize'
import { Employee, Payslip, Leave, Attendance, EmployeeDocument } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, search, department, status, sortKey = 'createdAt', sortDir = 'desc' } = req.query
    const where = {}
    if (company) where.companyId = company
    if (department) where.department = department
    if (status) where.status = status
    if (search) where[Op.or] = [
      { firstName:  { [Op.like]: `%${search}%` } },
      { lastName:   { [Op.like]: `%${search}%` } },
      { email:      { [Op.like]: `%${search}%` } },
      { employeeId: { [Op.like]: `%${search}%` } },
    ]
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const { rows: employees, count: total } = await Employee.findAndCountAll({
      where,
      order: [[sortKey || 'createdAt', sortDir === 'asc' ? 'ASC' : 'DESC']],
      offset,
      limit: parseInt(limit),
    })
    res.json({ employees, total })
  } catch (err) { next(err) }
})

router.get('/:id', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id)
    if (!employee) return res.status(404).json({ message: 'Employee not found' })
    res.json(employee)
  } catch (err) { next(err) }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const count = await Employee.count({ where: { companyId: company } })
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`
    const employee = await Employee.create({ ...req.body, companyId: company, employeeId })
    res.status(201).json(employee)
  } catch (err) { next(err) }
})

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id)
    if (!employee) return res.status(404).json({ message: 'Employee not found' })
    await employee.update(req.body)
    res.json(employee)
  } catch (err) { next(err) }
})

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Employee.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Employee removed' })
  } catch (err) { next(err) }
})

router.get('/:id/payslips', protect, async (req, res, next) => {
  try {
    const payslips = await Payslip.findAll({ where: { employeeId: req.params.id }, order: [['createdAt', 'DESC']] })
    res.json(payslips)
  } catch (err) { next(err) }
})

router.get('/:id/leaves', protect, async (req, res, next) => {
  try {
    const leaves = await Leave.findAll({ where: { employeeId: req.params.id }, order: [['createdAt', 'DESC']] })
    res.json({ leaves })
  } catch (err) { next(err) }
})

router.get('/:id/attendance', protect, async (req, res, next) => {
  try {
    const attendance = await Attendance.findAll({ where: { employeeId: req.params.id }, order: [['date', 'DESC']], limit: 30 })
    res.json({ attendance })
  } catch (err) { next(err) }
})

router.get('/:id/documents', protect, async (req, res, next) => {
  try {
    // Mongoose: Employee.findById(id).select('documents') -> documents own table now
    const documents = await EmployeeDocument.findAll({ where: { employeeId: req.params.id } })
    res.json(documents || [])
  } catch (err) { next(err) }
})

export default router
