import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`

  const activeCompany = useAuthStore.getState().activeCompany
  if (activeCompany) config.headers['X-Company-ID'] = activeCompany

  return config
})
console.log(useAuthStore.getState().activeCompany);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'

    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
   } else if (status === 403) {
  toast.error('You do not have permission to perform this action.')
} else {
  toast.error(message)
}
    return Promise.reject(error)
  }
)

export default api