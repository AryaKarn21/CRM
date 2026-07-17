import { AuditLog } from '../models/index.js'

/**
 * logEvent
 * ----------------
 * Writes a row to audit_logs that the Employee Timeline tab reads back.
 * resource is always 'Employee' for HR timeline events so the timeline
 * endpoint can query with a single simple where clause.
 *
 * action examples used by the Employee Timeline:
 *   employee_created, login_created, shift_assigned, department_changed,
 *   salary_updated, leave_approved, performance_review_created,
 *   promotion, payroll_generated, employee_status_changed, manager_assigned
 */
export const logEvent = async ({
  companyId,
  userId,
  action,
  resourceId,
  changes = {},
  ipAddress = null,
}) => {
  try {
    return await AuditLog.create({
      companyId,
      userId,
      action,
      resource: 'Employee',
      resourceId: String(resourceId),
      changes,
      ipAddress,
    })
  } catch (err) {
    // Timeline logging must never break the primary request.
    console.error('audit log write failed:', err.message)
    return null
  }
}