import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '@/api/auth.api'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, token, logout, setAuth, hasRole, activeCompany } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  return { user, token, logout: handleLogout, setAuth, hasRole, activeCompany, isAuthenticated: !!token }
}
