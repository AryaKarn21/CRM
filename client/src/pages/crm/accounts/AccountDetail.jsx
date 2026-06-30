import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function AccountDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/crm/accounts')} className="btn btn-ghost btn-icon">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Account Detail</h1>
        </div>
      </div>
      <div className="p-6">
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          Account ID: {id} — Full detail view coming next.
        </div>
      </div>
    </div>
  )
}