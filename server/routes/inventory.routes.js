import express from 'express'
import { Op, col } from 'sequelize'
import { InventoryItem, Warehouse, Asset } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

router.get('/items', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { page = 1, limit = 20, search, category, lowStock } = req.query
    const where = { companyId: company }
    if (category) where.category = category
    if (search) where.name = { [Op.like]: `%${search}%` }
    if (lowStock === 'true') where.quantity = { [Op.lte]: col('reorderPoint') }

    const offset = (parseInt(page) - 1) * parseInt(limit)
    const { rows: items, count: total } = await InventoryItem.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
      include: [{ model: Warehouse, as: 'warehouse', attributes: ['name'] }],
    })
    res.json({ items, total })
  } catch (err) { next(err) }
})

router.post('/items', protect, async (req, res, next) => {
  try {
    const item = await InventoryItem.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(item)
  } catch (err) { next(err) }
})

router.patch('/items/:id', protect, async (req, res, next) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item not found' })
    await item.update(req.body)
    res.json(item)
  } catch (err) { next(err) }
})

router.delete('/items/:id', protect, async (req, res, next) => {
  try {
    await InventoryItem.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Item deleted' })
  } catch (err) { next(err) }
})

// ── Warehouses ────────────────────────────────────────────
router.get('/warehouses', protect, async (req, res, next) => {
  try {
    const warehouses = await Warehouse.findAll({ where: { companyId: getCompany(req) } })
    res.json(warehouses)
  } catch (err) { next(err) }
})

router.post('/warehouses', protect, async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(warehouse)
  } catch (err) { next(err) }
})

// ── Assets ────────────────────────────────────────────────
router.get('/assets', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { category, status } = req.query
    const where = { companyId: company }
    if (category) where.category = category
    if (status) where.status = status
    const assets = await Asset.findAll({ where, order: [['createdAt', 'DESC']] })
    res.json(assets)
  } catch (err) { next(err) }
})

router.post('/assets', protect, async (req, res, next) => {
  try {
    const asset = await Asset.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(asset)
  } catch (err) { next(err) }
})

router.patch('/assets/:id', protect, async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id)
    if (!asset) return res.status(404).json({ message: 'Asset not found' })
    await asset.update(req.body)
    res.json(asset)
  } catch (err) { next(err) }
})

export default router
