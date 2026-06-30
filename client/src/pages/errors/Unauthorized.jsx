import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6" style={{ background: 'var(--bg)' }}>
      <ShieldOff size={48} className="mb-4" style={{ color: 'var(--text-muted)' }} />
      <h1 className="text-[22px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
      <p className="text-[14px] mb-8" style={{ color: 'var(--text-muted)' }}>You don't have permission to view this page.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Dashboard</button>
    </div>
  )
}