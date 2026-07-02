import express from 'express'
import { sequelize } from '../config/db.js'
import { Vendor, PurchaseOrder, PurchaseOrderItem } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getCompany = (req) => req.headers['x-company-id'] || null

// ── Vendors ───────────────────────────────────────────────
router.get('/vendors', protect, async (req, res, next) => {
  try {
    const vendors = await Vendor.findAll({ where: { companyId: getCompany(req) }, order: [['name', 'ASC']] })
    res.json({
      vendors,
      total: vendors.length,
    })
  } catch (err) { next(err) }
})

router.post('/vendors', protect, async (req, res, next) => {
  try {
    const vendor = await Vendor.create({ ...req.body, companyId: getCompany(req) })
    res.status(201).json(vendor)
  } catch (err) { next(err) }
})

// ── Update Purchase Order ─────────────────────────────────
router.put('/orders/:id', protect, async (req, res, next) => {
  const t = await sequelize.transaction()

  try {
    const company = getCompany(req)

    const order = await PurchaseOrder.findOne({
      where: {
        id: req.params.id,
        companyId: company,
      },
      transaction: t,
    })

    if (!order) {
      await t.rollback()

      return res.status(404).json({
        message: 'Purchase Order not found',
      })
    }

    const {
      vendorId,
      expectedDelivery,
      notes,
      status,
      items = [],
    } = req.body

    const totalAmount = items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity) *
        Number(item.unitPrice),
      0
    )

    // Update Purchase Order
    await order.update(
      {
        vendorId,
        expectedDelivery,
        notes,
        status,
        totalAmount,
      },
      {
        transaction: t,
      }
    )

    // Remove old items
    await PurchaseOrderItem.destroy({
      where: {
        purchaseOrderId: order.id,
      },
      transaction: t,
    })

    // Insert new items
    if (items.length) {
      await PurchaseOrderItem.bulkCreate(
        items.map(item => ({
          purchaseOrderId: order.id,
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total:
            Number(item.quantity) *
            Number(item.unitPrice),
        })),
        {
          transaction: t,
        }
      )
    }

    await t.commit()

    await order.reload({
      include: [
        {
          model: Vendor,
          as: 'vendor',
        },
        {
          model: PurchaseOrderItem,
          as: 'items',
        },
      ],
    })

    res.json({
      message: 'Purchase Order updated successfully',
      order,
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
})

router.patch('/vendors/:id', protect, async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id)
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
    await vendor.update(req.body)
    res.json(vendor)
  } catch (err) { next(err) }
})

// ── Purchase Orders ───────────────────────────────────────
router.get('/orders', protect, async (req, res, next) => {
  try {
    const company = getCompany(req)
    const { status } = req.query
    const where = { companyId: company }
    if (status) where.status = status
    const orders = await PurchaseOrder.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: Vendor, as: 'vendor', attributes: ['name'] }, { model: PurchaseOrderItem, as: 'items' }],
    })
    res.json({
      orders,
      total: orders.length,
    })
  } catch (err) { next(err) }
})

router.get('/orders/:id', protect, async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: Vendor, as: 'vendor' }, { model: PurchaseOrderItem, as: 'items' }],
    })
    if (!order) return res.status(404).json({ message: 'Purchase order not found' })
    res.json(order)
  } catch (err) { next(err) }
})

// POST creates a PO plus its line items inside one transaction, matching the
// atomicity the Mongoose embedded-array version got "for free".
router.post('/orders', protect, async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const company = getCompany(req)
    const { items = [], ...orderData } = req.body

console.log("=================================");
console.log("Order ID:", req.params.id);
console.log("Company Header:", getCompany(req));
console.log("=================================");
    const lastPO = await PurchaseOrder.findOne({
      where: { companyId: company },
      order: [['createdAt', 'DESC']]
    });

    let poNumber = 'PO-00001';

    console.log("last PO " + lastPO);

    if (lastPO) {
      const lastNumber = parseInt(lastPO.poNumber.replace('PO-', ''), 10);
      poNumber = `PO-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

    console.log("ponumber " + poNumber);

    const order = await PurchaseOrder.create(
      { ...orderData, companyId: company, poNumber, totalAmount: total, createdById: req.user.id },
      { transaction: t }
    )

    if (items.length) {
      await PurchaseOrderItem.bulkCreate(
        items.map(i => ({ ...i, total: i.quantity * i.unitPrice, purchaseOrderId: order.id })),
        { transaction: t }
      )
    }

    await t.commit()
    await order.reload({ include: [{ model: PurchaseOrderItem, as: 'items' }] })
    res.status(201).json(order)
  } catch (err) {
    await t.rollback()
    next(err)
  }
})

router.patch('/orders/:id/approve', protect, async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id)
    if (!order) return res.status(404).json({ message: 'Purchase order not found' })
    await order.update({ status: 'approved', approvedById: req.user.id })
    res.json(order)
  } catch (err) { next(err) }
})

router.patch('/orders/:id/receive', protect, async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id)
    if (!order) return res.status(404).json({ message: 'Purchase order not found' })
    await order.update({ status: 'received', receivedDate: new Date() })
    res.json(order)
  } catch (err) { next(err) }
})

// Get Vendor By ID
router.get('/vendors/:id', protect, async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id)

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    res.json(vendor)
  } catch (err) {
    next(err)
  }
})

// Cancel Purchase Order
router.patch('/orders/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' })
    }

    await order.update({
      status: 'cancelled'
    })

    res.json(order)
  } catch (err) {
    next(err)
  }
})

export default router
