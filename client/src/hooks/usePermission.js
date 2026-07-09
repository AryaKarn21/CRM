import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/lib/constants'

export function usePermission() {
  const { user } = useAuthStore()
  const role = user?.role
  const permissions = user?.permissions || {}   // { 'finance.view': true, ... }

  const can = (permission) => {
    if (role === ROLES.SUPER_ADMIN) return true
    return permissions[permission] === true
  }

  return {
    can,
    canCreate: can('crm.leads.create') || role === ROLES.SUPER_ADMIN,
    canDelete: role === ROLES.SUPER_ADMIN || role === ROLES.COMPANY_ADMIN,
    canViewFinance: can('finance.view'),
    canManageUsers: can('settings.users.manage'),
    isAdmin: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(role),
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    role,
  }
}