import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6" style={{ background: 'var(--bg)' }}>
      <p className="text-[80px] font-black leading-none" style={{ color: 'var(--border)' }}>404</p>
      <h1 className="text-[22px] font-bold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h1>
      <p className="text-[14px] mb-8 max-w-sm" style={{ color: 'var(--text-muted)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Dashboard</button>
    </div>
  )
}