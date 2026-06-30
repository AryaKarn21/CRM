import express from 'express'
import { Op } from 'sequelize'
import { Contact, Account, User } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, search, sortKey = 'createdAt', sortDir = 'desc' } = req.query
    const where = {}
    if (company) where.companyId = company
    if (search) where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName:  { [Op.like]: `%${search}%` } },
      { email:     { [Op.like]: `%${search}%` } },
    ]
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const { rows: contacts, count: total } = await Contact.findAndCountAll({
      where,
      order: [[sortKey || 'createdAt', sortDir === 'asc' ? 'ASC' : 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [
        { model: Account, as: 'account', attributes: ['id', 'name'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] },
      ],
    })
    res.json({ contacts, total })
  } catch (err) { next(err) }
})

router.get('/:id', protect, async (req, res, next) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [{ model: Account, as: 'account', attributes: ['id', 'name'] }],
    })
    if (!contact) return res.status(404).json({ message: 'Contact not found' })
    res.json(contact)
  } catch (err) { next(err) }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const contact = await Contact.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(contact)
  } catch (err) { next(err) }
})

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const contact = await Contact.findByPk(req.params.id)
    if (!contact) return res.status(404).json({ message: 'Contact not found' })
    await contact.update(req.body)
    res.json(contact)
  } catch (err) { next(err) }
})

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Contact.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Contact deleted' })
  } catch (err) { next(err) }
})

router.get('/:id/timeline', protect, (req, res) => res.json({ items: [] }))

export default router
