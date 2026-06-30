import express from 'express'
import { Op } from 'sequelize'
import { Lead, LeadNote, User } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const getCompany = (req) => req.headers['x-company-id'] || null

// GET /api/leads
router.get('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, search, stage, assignedTo, sortKey = 'createdAt', sortDir = 'desc' } = req.query

    const where = {}
    if (company) where.companyId = company
    if (stage) where.stage = stage
    if (assignedTo) where.assignedToId = assignedTo
    if (search) {
      // Mongoose $or + $regex -> Sequelize Op.or + Op.like
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { company_name: { [Op.like]: `%${search}%` } },
      ]
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { rows: leads, count: total } = await Lead.findAndCountAll({
      where,
      order: [[sortKey || 'createdAt', sortDir === 'asc' ? 'ASC' : 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }],
    })

    res.json({ leads, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) { next(err) }
})

// GET /api/leads/new — prevent 'new' from being treated as an ID
router.get('/new', protect, (req, res) => {
  res.json({ lead: null })
})

// GET /api/leads/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }],
    })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (err) { next(err) }
})

// POST /api/leads
router.post('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { notes, ...leadData } = req.body
    const lead = await Lead.create({
      ...leadData,
      ...(company && { companyId: company }),
    })
    // Mongoose stored notes inline on creation; here we create the related row
    if (notes) {
      await LeadNote.create({ leadId: lead.id, text: notes, createdById: req.user.id })
    }
    await lead.reload({ include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }] })
    res.status(201).json(lead)
  } catch (err) { next(err) }
})

// PATCH /api/leads/:id
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    await lead.update(req.body)
    await lead.reload({ include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }] })
    res.json(lead)
  } catch (err) { next(err) }
})

// PATCH /api/leads/:id/stage
router.patch('/:id/stage', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    await lead.update({ stage: req.body.stage })
    res.json(lead)
  } catch (err) { next(err) }
})

// DELETE /api/leads/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Lead.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Lead deleted' })
  } catch (err) { next(err) }
})

// POST /api/leads/:id/notes
router.post('/:id/notes', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    await LeadNote.create({ leadId: lead.id, text: req.body.note, createdById: req.user.id })
    await lead.reload({ include: [{ model: LeadNote, as: 'notes' }] })
    res.json(lead)
  } catch (err) { next(err) }
})

// GET /api/leads/:id/timeline
router.get('/:id/timeline', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [{
        model: LeadNote,
        as: 'notes',
        include: [{ model: User, as: 'createdBy', attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
      }],
    })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    const items = lead.notes.map(n => ({
      user: { name: n.createdBy?.name || 'System' },
      description: n.text,
      createdAt: n.createdAt,
    }))
    res.json({ items })
  } catch (err) { next(err) }
})

export default router
