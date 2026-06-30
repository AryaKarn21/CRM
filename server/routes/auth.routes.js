import express from 'express'
import jwt from 'jsonwebtoken'
import { User, Company } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    // Mongoose: User.findOne({ email }).populate('companies')
    const user = await User.findOne({ where: { email }, include: [{ model: Company, as: 'companies' }] })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    if (!user.isActive)
      return res.status(401).json({ message: 'Account has been deactivated' })

    user.lastLogin = new Date()
    await user.save()

    const token = signToken(user.id)
    res.json({
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  },
  companies: user.companies
})
    
  } catch (err) { next(err) }
})

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [{ model: Company, as: 'companies' }] })
    res.json(user)
  } catch (err) { next(err) }
})

// POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  res.json({ message: 'Password reset email sent if account exists' })
})

export default router
