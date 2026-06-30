import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export default function RoleGuard({ roles, children }) {
  const { hasRole } = useAuthStore()
  if (!hasRole(roles)) return <Navigate to="/unauthorized" replace />
  return children
}