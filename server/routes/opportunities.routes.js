import express from 'express'
import { Op } from 'sequelize'
import { Opportunity, Account, User } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, search, stage, sortKey = 'value', sortDir = 'desc' } = req.query
    const where = {}
    if (company) where.companyId = company
    if (stage) where.stage = stage
    if (search) where.name = { [Op.like]: `%${search}%` }
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const { rows: opportunities, count: total } = await Opportunity.findAndCountAll({
      where,
      order: [[sortKey || 'createdAt', sortDir === 'asc' ? 'ASC' : 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] },
      ],
    })
    res.json({ opportunities, total })
  } catch (err) { next(err) }
})

router.get('/:id', protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.findByPk(req.params.id, {
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] },
      ],
    })
    if (!opp) return res.status(404).json({ message: 'Not found' })
    res.json(opp)
  } catch (err) { next(err) }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(opp)
  } catch (err) { next(err) }
})

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.findByPk(req.params.id)
    if (!opp) return res.status(404).json({ message: 'Not found' })
    await opp.update(req.body)
    res.json(opp)
  } catch (err) { next(err) }
})

router.patch('/:id/stage', protect, async (req, res, next) => {
  try {
    const opp = await Opportunity.findByPk(req.params.id)
    if (!opp) return res.status(404).json({ message: 'Not found' })
    await opp.update({ stage: req.body.stage })
    res.json(opp)
  } catch (err) { next(err) }
})

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Opportunity.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

router.get('/:id/timeline', protect, (req, res) => res.json({ items: [] }))

export default router
