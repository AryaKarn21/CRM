import { AuditLog } from '../models/index.js'

/**
 * logEvent
 * ----------------
 * Writes a row to audit_logs. Originally built for the Employee Timeline
 * tab (which always passes resource: 'Employee' implicitly via its own
 * callers), now extended to be the general-purpose audit writer for the
 * whole app — Role changes, User changes, login/logout, etc.
 *
 * Backward compatible: every new field is optional. Existing callers that
 * only pass { companyId, userId, action, resourceId, changes, ipAddress }
 * (the Employee Timeline call sites) continue to work unchanged — this
 * function still defaults resource to 'Employee' if the caller doesn't
 * specify one, exactly like before.
 */
export const logEvent = async ({
  companyId,
  userId,
  action,
  resource = 'Employee',
  resourceId,
  changes = {},
  ipAddress = null,
  module = null,
  device = null,
  browser = null,
  status = 'success',
}) => {
  try {
    return await AuditLog.create({
      companyId,
      userId,
      action,
      resource,
      resourceId: resourceId != null ? String(resourceId) : null,
      changes,
      ipAddress,
      module,
      device,
      browser,
      status,
    })
  } catch (err) {
    // Audit logging must never break the primary request.
    console.error('audit log write failed:', err.message)
    return null
  }
}

/**
 * getRequestMeta
 * ----------------
 * Pulls ipAddress/device/browser out of an Express req so route handlers
 * don't have to parse the User-Agent header themselves. Deliberately
 * lightweight (no new npm dependency like ua-parser-js) — good enough to
 * distinguish "Chrome on Windows" from "Safari on iPhone" for the audit UI
 * without adding a package just for this.
 */
export const getRequestMeta = (req) => {
  const ua = req.headers['user-agent'] || ''

  const ipAddress =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    null

  let device = 'Desktop'
  if (/mobile/i.test(ua)) device = 'Mobile'
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet'

  let browser = 'Unknown'
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = 'Chrome'
  else if (/firefox\//i.test(ua)) browser = 'Firefox'
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = 'Safari'

  return { ipAddress, device, browser }
}