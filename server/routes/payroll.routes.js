import express from 'express'
import { PayrollRun, Payslip, Employee } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/runs', protect, async (req, res, next) => {
  try {
    const runs = await PayrollRun.findAll({ where: { companyId: getCompany(req) }, order: [['createdAt', 'DESC']] })
    res.json(runs)
  } catch (err) { next(err) }
})

router.get('/runs/:id', protect, async (req, res, next) => {
  try {
    const run = await PayrollRun.findByPk(req.params.id, {
      include: [{ model: Payslip, as: 'payslips', include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'employeeId'] }] }],
    })
    if (!run) return res.status(404).json({ message: 'Payroll run not found' })
    res.json(run)
  } catch (err) { next(err) }
})

router.post('/runs', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { period } = req.body

    const employees = await Employee.findAll({ where: { companyId: company, status: 'active' } })

    const run = await PayrollRun.create({
      companyId: company,
      period,
      employeeCount: employees.length,
      status: 'processing',
      processedById: req.user.id,
    })

    let grossTotal = 0, deductionsTotal = 0, netTotal = 0

    // Mongoose used Payslip.insertMany after building the array in JS;
    // Sequelize equivalent is bulkCreate.
    const payslipRows = employees.map((emp) => {
      const basicSalary = emp.salary
      const allowances = basicSalary * 0.1
      const grossPay = basicSalary + allowances
      const tax = grossPay * 0.13
      const deductions = tax
      const netPay = grossPay - deductions

      grossTotal += grossPay
      deductionsTotal += deductions
      netTotal += netPay

      return {
        companyId: company,
        employeeId: emp.id,
        payrollRunId: run.id,
        period,
        basicSalary, allowances, deductions, tax, netPay, grossPay,
      }
    })

    await Payslip.bulkCreate(payslipRows)

    await run.update({
      grossPay: grossTotal,
      deductions: deductionsTotal,
      netPay: netTotal,
      status: 'processed',
      processedAt: new Date(),
    })

    res.status(201).json(run)
  } catch (err) { next(err) }
})

router.patch('/runs/:id/approve', protect, async (req, res, next) => {
  try {
    const run = await PayrollRun.findByPk(req.params.id)
    if (!run) return res.status(404).json({ message: 'Payroll run not found' })
    await run.update({ status: 'approved', approvedById: req.user.id, approvedAt: new Date() })
    res.json(run)
  } catch (err) { next(err) }
})

router.get('/payslips/:employeeId', protect, async (req, res, next) => {
  try {
    const payslips = await Payslip.findAll({ where: { employeeId: req.params.employeeId }, order: [['createdAt', 'DESC']] })
    res.json(payslips)
  } catch (err) { next(err) }
})

export default router
