import express from 'express'
import { Role } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      order: [['createdAt', 'DESC']],
    })

    res.json({
      roles,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/', protect, async (req, res, next) => {
  try {
    console.log('Company ID:', req.companyId)
    console.log('Body:', req.body)

    const role = await Role.create({
      ...req.body,
      companyId: req.companyId,
    })

    res.status(201).json(role)
  } catch (err) {
    next(err)
  }
})


export default router