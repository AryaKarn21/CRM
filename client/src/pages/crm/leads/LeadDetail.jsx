import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Building2, DollarSign } from 'lucide-react'
import { leadsAPI } from '@/api/leads.api'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import ActivityTimeline from '@/components/shared/ActivityTimeline'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import { LEAD_STAGES } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsAPI.getById(id).then(r => r.data),
  })

  const { data: timeline } = useQuery({
    queryKey: ['lead-timeline', id],
    queryFn: () => leadsAPI.getTimeline(id).then(r => r.data),
    enabled: activeTab === 'activity',
  })

  const deleteMutation = useMutation({
    mutationFn: () => leadsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead deleted')
      navigate('/crm/leads')
    },
  })

  const stageMutation = useMutation({
    mutationFn: (stage) => leadsAPI.updateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
      toast.success('Stage updated')
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--border)' }} />
        ))}
      </div>
    )
  }

  if (!lead) return null
  console.log(JSON.stringify(lead, null, 2))
  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'activity', label: 'Activity' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/crm/leads')} className="btn btn-ghost btn-icon">
            <ArrowLeft size={16} />
          </button>
          <Avatar name={lead.name} size="md" />
          <div>
            <h1 className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {lead.name}
            </h1>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              {lead.company_name || 'No company'}
            </p>
          </div>
          <Badge variant={classifyStatus(lead.stage)} dot>{lead.stage}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/crm/leads/${id}/edit`)}
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            className="btn btn-secondary btn-sm text-red-500"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="card overflow-hidden">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Email" value={lead.email} icon={<Mail size={13} />} />
                  <Field label="Phone" value={lead.phone} icon={<Phone size={13} />} />
                  <Field
                    label="Company"
                    value={lead.company_name || '—'}
                    icon={<Building2 size={13} />}
                  />

                  <Field
                    label="Lead Value"
                    value={formatCurrency(lead.value)}
                    icon={<DollarSign size={13} />}
                  />
                  <Field label="Source" value={lead.source} />
                  <Field label="Created" value={formatDate(lead.createdAt)} />
                  <Field label="Assigned To" value={lead.assignedTo?.name} />
                  {lead.notes && (
                    <div className="sm:col-span-2">
                      <Field label="Notes" value={lead.notes} />
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'activity' && (
                <ActivityTimeline items={timeline?.items || []} />
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          <div className="card p-4">
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Pipeline Stage
            </p>
            <div className="flex flex-col gap-1">
              {LEAD_STAGES.map(stage => (
                <button
                  key={stage}
                  onClick={() => stageMutation.mutate(stage)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-left transition-colors"
                  style={{
                    background:
                      lead.stage === stage ? 'var(--primary-light)' : 'transparent',
                    color:
                      lead.stage === stage ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background:
                        lead.stage === stage ? 'var(--primary)' : 'var(--border)',
                    }}
                  />
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Details
            </p>
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Created</dt>
                <dd className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(lead.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Last Updated</dt>
                <dd className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(lead.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        title="Delete Lead"
        description={`Are you sure you want to delete "${lead.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}

function Field({ label, value, icon }) {
  return (
    <div>
      <p
        className="text-[11px] font-medium uppercase tracking-wide mb-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-[13px] flex items-center gap-1.5"
        style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
        {value || '—'}
      </p>
    </div>
  )
}     