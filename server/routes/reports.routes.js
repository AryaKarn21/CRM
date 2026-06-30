import express from 'express'
import { Op, fn, col } from 'sequelize'
import { sequelize } from '../config/db.js'
import {
  Lead,
  Opportunity,
  Expense,
  LedgerEntry,
  Employee,
  Ticket
} from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/sales', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { startDate, endDate } = req.query
    const where = { companyId: company }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt[Op.gte] = new Date(startDate)
      if (endDate) where.createdAt[Op.lte] = new Date(endDate)
    }

    // Mongoose aggregate $group by stage -> Sequelize group + count/sum
    const byStage = await Opportunity.findAll({
      where,
      attributes: ['stage', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('value')), 'value']],
      group: ['stage'],
      raw: true,
    })

    res.json(byStage.map(s => ({ _id: s.stage, count: Number(s.count), value: Number(s.value) || 0 })))
  } catch (err) { next(err) }
})

router.get('/leads-funnel', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const funnel = await Lead.findAll({
      where: { companyId: company },
      attributes: ['stage', [fn('COUNT', col('id')), 'count']],
      group: ['stage'],
      raw: true,
    })
    res.json(funnel.map(f => ({ _id: f.stage, count: Number(f.count) })))
  } catch (err) { next(err) }
})

router.get('/financial', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { year = new Date().getFullYear() } = req.query

    // Mongoose used $month/$year date-part aggregation; MySQL equivalent
    // is the MONTH()/YEAR() SQL functions via Sequelize.fn.
    const monthlyExpenses = await Expense.findAll({
      where: {
        companyId: company,
        status: 'approved',
        date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
      },
      attributes: [
        [fn('MONTH', col('date')), 'month'],
        [fn('SUM', col('amount')), 'total'],
      ],
      group: [fn('MONTH', col('date'))],
      raw: true,
    })

    const monthlyRevenue = await LedgerEntry.findAll({
      where: {
        companyId: company,
        type: 'credit',
        date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
      },
      attributes: [
        [fn('MONTH', col('date')), 'month'],
        [fn('SUM', col('credit')), 'total'],
      ],
      group: [fn('MONTH', col('date'))],
      raw: true,
    })

    res.json({
      expenses: monthlyExpenses.map(m => ({ month: Number(m.month), total: Number(m.total) })),
      revenue: monthlyRevenue.map(m => ({ month: Number(m.month), total: Number(m.total) })),
    })
  } catch (err) { next(err) }
})

router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)

    const totalRevenue = await LedgerEntry.sum('credit', {
      where: {
        companyId: company,
        type: 'credit'
      }
    })

    const wonDeals = await Opportunity.count({
      where: {
        companyId: company,
        stage: 'Won'
      }
    })

    const employees = await Employee.count({
      where: {
        companyId: company
      }
    })

    const openTickets = await Ticket.count({
      where: {
        companyId: company,
        status: 'Open'
      }
    })

    res.json({
      totalRevenue: totalRevenue || 0,
      revenueGrowth: 0,
      wonDeals,
      dealsGrowth: 0,
      employees,
      openTickets,
      ticketChange: 0,
      pipeline: [],
      leadSources: []
    })

  } catch (err) {
    next(err)
  }
})

router.get('/revenue-by-month', protect, async (req, res, next) => {
  try {

    const company = getCompany(req)
    const year = req.query.year || new Date().getFullYear()

    const revenue = await LedgerEntry.findAll({
      where: {
        companyId: company,
        type: 'credit',
        date: {
          [Op.between]: [
            `${year}-01-01`,
            `${year}-12-31`
          ]
        }
      },
      attributes: [
        [fn('MONTH', col('date')), 'month'],
        [fn('SUM', col('credit')), 'revenue']
      ],
      group: [fn('MONTH', col('date'))],
      raw: true
    })

    res.json({
      data: revenue
    })

  } catch (err) {
    next(err)
  }
})

router.get('/sales-forecast', protect, async (req, res) => {

  res.json({
    data: [
      { month: 'Jan', forecast: 10000 },
      { month: 'Feb', forecast: 12000 },
      { month: 'Mar', forecast: 18000 },
      { month: 'Apr', forecast: 22000 },
      { month: 'May', forecast: 25000 },
      { month: 'Jun', forecast: 28000 }
    ]
  })

})

export default router
