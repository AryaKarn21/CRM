import express from 'express'
import { PerformanceReview, Employee } from '../models/index.js'
import { protect, authorize } from '../middleware/auth.js'
import { logEvent } from '../utils/audit.js'
import { createNotification } from '../services/notification.service.js'

const router = express.Router()
const getCompany = (req) => req.companyId

// Only manager / hr(admin) / admin / super_admin may create or edit reviews.
// 'accountant' and 'employee' are read-only for this resource.
const canReview = authorize('manager', 'admin', 'super_admin')

// Checks whether the requester is allowed to see a given employee's reviews:
// the employee themself, their reporting manager, or HR/admin roles.
const canView = async (req, employee) => {
  if (['admin', 'super_admin', 'manager'].includes(req.user.role)) return true
  if (employee.userId && employee.userId === req.user.id) return true
  return false
}

// ── List reviews for one employee ───────────────────────────
router.get('/employee/:employeeId', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.employeeId)
    if (!employee) return res.status(404).json({ message: 'Employee not found' })
    if (!(await canView(req, employee))) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const reviews = await PerformanceReview.findAll({
      where: { employeeId: req.params.employeeId },
      include: [
        { model: Employee, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'designation'] },
      ],
      order: [['reviewDate', 'DESC']],
    })

    const avg = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length) * 100) / 100
      : 0

    res.json({ reviews, averageRating: avg, total: reviews.length })
  } catch (err) { next(err) }
})

// ── Single review ───────────────────────────────────────────
router.get('/:id', protect, async (req, res, next) => {
  try {
    const review = await PerformanceReview.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'employeeId'] },
        { model: Employee, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'designation'] },
      ],
    })
    if (!review) return res.status(404).json({ message: 'Review not found' })

    const employee = await Employee.findByPk(review.employeeId)
    if (!(await canView(req, employee))) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(review)
  } catch (err) { next(err) }
})

// ── Create review ────────────────────────────────────────────
router.post('/', protect, canReview, async (req, res, next) => {
  try {
    const companyId = getCompany(req)
    const {
      employeeId, reviewDate, reviewPeriod, nextReviewDate,
      technicalSkills, communication, leadership, teamwork, productivity,
      problemSolving, attendanceRating, behaviour, learningAbility, goalAchievement,
      strengths, weaknesses, managerFeedback, employeeFeedback,
      promotionEligible, salaryIncrementRecommendation, status,
    } = req.body

    const employee = await Employee.findByPk(employeeId)
    if (!employee) return res.status(404).json({ message: 'Employee not found' })

    const review = await PerformanceReview.create({
      companyId,
      employeeId,
      reviewerId: req.user.id,
      reviewDate: reviewDate || new Date(),
      reviewPeriod,
      nextReviewDate,
      technicalSkills, communication, leadership, teamwork, productivity,
      problemSolving, attendanceRating, behaviour, learningAbility, goalAchievement,
      strengths, weaknesses, managerFeedback, employeeFeedback,
      promotionEligible: !!promotionEligible,
      salaryIncrementRecommendation,
      status: status || 'submitted',
    })

    await logEvent({
      companyId,
      userId: req.user.id,
      action: 'performance_review_created',
      resourceId: employee.id,
      changes: { reviewId: review.id, reviewPeriod, overallRating: review.overallRating },
    })

    if (promotionEligible) {
      await logEvent({
        companyId,
        userId: req.user.id,
        action: 'promotion',
        resourceId: employee.id,
        changes: { reviewId: review.id, note: 'Flagged promotion eligible in performance review' },
      })
    }

    if (employee.userId) {
      await createNotification({
        companyId,
        userId: employee.userId,
        senderId: req.user.id,
        module: 'hr',
        type: 'performance_review',
        title: 'New Performance Review',
        message: `A performance review for ${reviewPeriod} has been submitted.`,
        priority: 'medium',
        actionUrl: `/hr/employees/${employee.id}?tab=performance`,
        metadata: { reviewId: review.id },
      })
    }

    res.status(201).json(review)
  } catch (err) { next(err) }
})

// ── Update review ────────────────────────────────────────────
router.patch('/:id', protect, canReview, async (req, res, next) => {
  try {
    const review = await PerformanceReview.findByPk(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })

    // beforeSave hook fires on update() too and recomputes overallRating
    await review.update(req.body)

    res.json(review)
  } catch (err) { next(err) }
})

// ── Delete review ────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const review = await PerformanceReview.findByPk(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })
    await review.destroy()
    res.json({ message: 'Review removed' })
  } catch (err) { next(err) }
})

export default router