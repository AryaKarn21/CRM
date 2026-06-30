import express from 'express'
import { Op, fn, col } from 'sequelize'
import { protect } from '../middleware/auth.js'
import { Lead, Account, Employee, Ticket, Opportunity, InventoryItem, Expense, User } from '../models/index.js'

const router = express.Router()

router.get('/stats', protect, async (req, res, next) => {
  try {
    const company = req.headers['x-company-id'] || req.user.companyId

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalLeads, leadsThisMonth, leadsLastMonth,
      totalAccounts,
      opportunities,
      totalEmployees,
      openTickets,
      totalInventory,
    ] = await Promise.all([
      Lead.count({ where: { companyId: company } }),
      Lead.count({ where: { companyId: company, createdAt: { [Op.gte]: startOfMonth } } }),
      Lead.count({ where: { companyId: company, createdAt: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth } } }),
      Account.count({ where: { companyId: company } }),
      Opportunity.findAll({ where: { companyId: company, stage: { [Op.notIn]: ['Closed Won', 'Closed Lost'] } }, attributes: ['value'] }),
      Employee.count({ where: { companyId: company, status: 'active' } }),
      Ticket.count({ where: { companyId: company, status: { [Op.notIn]: ['Resolved', 'Closed'] } } }),
      InventoryItem.count({ where: { companyId: company } }),
    ])

    const pipelineValue = opportunities.reduce((s, o) => s + (o.value || 0), 0)
    const leadsChange = leadsLastMonth
      ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
      : 0

    res.json({
      leads:     { total: totalLeads, change: leadsChange },
      accounts:  { total: totalAccounts },
      pipeline:  { value: pipelineValue },
      employees: { total: totalEmployees },
      tickets:   { open: openTickets },
      inventory: { total: totalInventory },
    })
  } catch (err) { next(err) }
})

router.get('/activity', protect, async (req, res, next) => {
  try {
    const company = req.headers['x-company-id'] || req.user.companyId
    const limit = parseInt(req.query.limit) || 10

    const [recentLeads, recentTickets, recentExpenses] = await Promise.all([
      Lead.findAll({ where: { companyId: company }, order: [['createdAt', 'DESC']], limit: 4, include: [{ model: User, as: 'assignedTo', attributes: ['name'] }] }),
      Ticket.findAll({ where: { companyId: company }, order: [['createdAt', 'DESC']], limit: 3, include: [{ model: User, as: 'createdBy', attributes: ['name'] }] }),
      Expense.findAll({ where: { companyId: company }, order: [['createdAt', 'DESC']], limit: 3, include: [{ model: User, as: 'submittedBy', attributes: ['name'] }] }),
    ])

    const items = [
      ...recentLeads.map(l => ({
        user: l.assignedTo?.name || 'System',
        description: `New lead "${l.name}" added`,
        timeAgo: timeAgo(l.createdAt),
        createdAt: l.createdAt,
      })),
      ...recentTickets.map(t => ({
        user: t.createdBy?.name || 'Customer',
        description: `Ticket #${t.ticketId} opened: ${t.subject}`,
        timeAgo: timeAgo(t.createdAt),
        createdAt: t.createdAt,
      })),
      ...recentExpenses.map(e => ({
        user: e.submittedBy?.name || 'Employee',
        description: `Expense "${e.title}" submitted for ${e.amount}`,
        timeAgo: timeAgo(e.createdAt),
        createdAt: e.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit)

    res.json({ items })
  } catch (err) { next(err) }
})

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default router
