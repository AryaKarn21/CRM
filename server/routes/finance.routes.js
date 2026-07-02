import express from 'express'
import { Op, fn, col } from 'sequelize'
import { Expense, LedgerEntry, User } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

// ── Expenses ──────────────────────────────────────────────
router.get('/expenses', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, status, category } = req.query
    const where = { companyId: company }
    if (status) where.status = status
    if (category) where.category = category
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const { rows: expenses, count: total } = await Expense.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [{ model: User, as: 'submittedBy', attributes: ['name'] }],
    })
    res.json({ expenses, total })
  } catch (err) { next(err) }
})

router.post('/expenses', protect, async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, companyId: getCompany(req), submittedById: req.user.id })
    res.status(201).json(expense)
  } catch (err) { next(err) }
})

router.patch('/expenses/:id/approve', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    await expense.update({ status: 'approved', approvedById: req.user.id, approvedAt: new Date() })
    res.json(expense)
  } catch (err) { next(err) }
})

router.patch('/expenses/:id/reject', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    await expense.update({ status: 'rejected', rejectionReason: req.body.reason })
    res.json(expense)
  } catch (err) { next(err) }
})

router.delete('/expenses/:id', protect, async (req, res, next) => {
  try {
    await Expense.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Expense deleted' })
  } catch (err) { next(err) }
})

// ── Ledger ────────────────────────────────────────────────
router.get('/ledger', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { startDate, endDate } = req.query
    const where = { companyId: company }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date[Op.gte] = new Date(startDate)
      if (endDate) where.date[Op.lte] = new Date(endDate)
    }
    const entries = await LedgerEntry.findAll({ where, order: [['date', 'ASC']] })
    res.json(entries)
  } catch (err) { next(err) }
})

router.post('/ledger', protect, async (req, res, next) => {
  try {
    const entry = await LedgerEntry.create({ ...req.body, companyId: getCompany(req), createdById: req.user.id })
    res.status(201).json(entry)
  } catch (err) { next(err) }
})
  


// ── Summary ───────────────────────────────────────────────
router.get('/summary', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const [totalExpenses, byCategory] = await Promise.all([
      Expense.sum('amount', { where: { companyId: company, status: 'approved' } }),
      Expense.findAll({
        where: { companyId: company, status: 'approved' },
        attributes: ['category', [fn('SUM', col('amount')), 'total']],
        group: ['category'],
        raw: true,
      }),
    ])
    res.json({
      totalExpenses: totalExpenses || 0,
      byCategory: byCategory.map(c => ({ _id: c.category, total: Number(c.total) })),
    })
  } catch (err) { next(err) }
})
router.get('/overview', protect, async (req, res, next) => {
  try {
    const company = req.companyId

    const totalExpenses = await Expense.sum('amount', {
      where: { companyId: company }
    })

    const totalEntries = await LedgerEntry.count({
      where: { companyId: company }
    })

    res.json({
      totalExpenses: totalExpenses || 0,
      totalLedgerEntries: totalEntries || 0
    })

  } catch (err) {
    next(err)
  }
})

router.get('/reports/revenue-by-month', protect, async (req, res, next) => {

  try {

    res.json([])

  }

  catch(err){

    next(err)

  }

})

router.patch('/expenses/:id', protect, async (req,res,next)=>{

try{

const expense=await Expense.findByPk(req.params.id)

if(!expense)
return res.status(404).json({message:'Expense not found'})

await expense.update(req.body)

res.json(expense)

}catch(err){

next(err)

}

})

router.patch('/expenses/:id', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id)

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' })
    }

    await expense.update(req.body)

    res.json(expense)
  } catch (err) {
    next(err)
  }
})

export default router


