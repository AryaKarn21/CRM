import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/lib/constants'

export function usePermission() {
  const { user } = useAuthStore()
  const role = user?.role

  return {
    canCreate: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.MANAGER].includes(role),
    canEdit:   [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.MANAGER].includes(role),
    canDelete: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(role),
    canViewFinance: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(role),
    canManageUsers: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(role),
    isAdmin: [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(role),
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    role,
  }
}