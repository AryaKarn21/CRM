import express from 'express'
import { Op } from 'sequelize'
import { Account, Contact, Opportunity, User } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, search, type, sortKey = 'createdAt', sortDir = 'desc' } = req.query
    const where = {}
    if (company) where.companyId = company
    if (type) where.type = type
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ]
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const { rows: accounts, count: total } = await Account.findAndCountAll({
      where,
      order: [[sortKey, sortDir === 'asc' ? 'ASC' : 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name'] }],
    })
    res.json({ accounts, total })
  } catch (err) { next(err) }
})

router.get('/:id', protect, async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name'] }],
    })
    if (!account) return res.status(404).json({ message: 'Account not found' })
    res.json(account)
  } catch (err) { next(err) }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const account = await Account.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(account)
  } catch (err) { next(err) }
})

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id)
    if (!account) return res.status(404).json({ message: 'Account not found' })
    await account.update(req.body)
    res.json(account)
  } catch (err) { next(err) }
})

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Account.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Account deleted' })
  } catch (err) { next(err) }
})

router.get('/:id/contacts', protect, async (req, res, next) => {
  try {
    const contacts = await Contact.findAll({ where: { accountId: req.params.id } })
    res.json({ contacts })
  } catch (err) { next(err) }
})

router.get('/:id/opportunities', protect, async (req, res, next) => {
  try {
    const opportunities = await Opportunity.findAll({ where: { accountId: req.params.id } })
    res.json({ opportunities })
  } catch (err) { next(err) }
})

router.get('/:id/timeline', protect, async (req, res, next) => {
  res.json({ items: [] })
})

export default router
