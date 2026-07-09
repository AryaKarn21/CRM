import { Navigate } from 'react-router-dom'
import { usePermission } from '@/hooks/usePermission'

export default function ProtectedRoute({ permission, children }) {
  const { can, isSuperAdmin } = usePermission()

  if (isSuperAdmin || !permission || can(permission)) {
    return children
  }

  return <Navigate to="/unauthorized" replace />
}