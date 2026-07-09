import { Role } from '../models/index.js'

//This middleware loads the user's Role record and checks if the permissions JSON contains the required key

export const requirePermission = (permission) => async (req, res, next) => {
  try {
    const { user } = req

    // super_admin bypasses all permission checks
    if (user.role === 'super_admin') return next()

    // If user has a roleId, check the Role's permissions JSON
    if (user.roleId) {
      const role = await Role.findByPk(user.roleId)
      if (role?.permissions?.[permission] === true) return next()
    }

    // Fallback: check the legacy ENUM role for broad access
    const adminRoles = ['super_admin', 'admin']
    if (adminRoles.includes(user.role)) return next()

    return res.status(403).json({ message: 'Permission denied' })
  } catch (err) {
    next(err)
  }
}