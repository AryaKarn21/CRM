import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, LayoutGrid } from 'lucide-react'
import { opportunitiesAPI } from '@/api/opportunities.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import OpportunityFormModal from '@/components/shared/OpportunityFormModal'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import { OPPORTUNITY_STAGES } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function OpportunitiesList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', stage: '', sortKey: 'value', sortDir: 'desc' })
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => opportunitiesAPI.getAll(params).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: opportunitiesAPI.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['opportunities'] }); toast.success('Opportunity deleted') },
  })

  const columns = [
    {
      key: 'name', label: 'Opportunity', sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.account?.name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'stage', label: 'Stage', sortable: true,
      render: (val) => <Badge variant={classifyStatus(val)} dot>{val}</Badge>,
    },
    {
      key: 'value', label: 'Value', sortable: true,
      render: (val) => <span className="font-semibold">{formatCurrency(val)}</span>,
    },
    {
      key: 'probability', label: 'Probability',
      render: (val) => val !== undefined ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] max-w-[60px]">
            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${val}%` }} />
          </div>
          <span className="text-[12px]">{val}%</span>
        </div>
      ) : '—',
    },
    { key: 'closeDate', label: 'Close Date', sortable: true, render: (val) => formatDate(val) },
    { key: 'assignedTo', label: 'Owner', render: (val) => val?.name || '—' },
    {
      key: '_id', label: '',
      render: (id) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/crm/opportunities/${id}`)}>View</button>
          <button className="btn btn-ghost btn-sm text-red-500" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(id) }}>Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Opportunities</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} total opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/crm/opportunities/kanban')}>
            <LayoutGrid size={14} /> Kanban
          </button>
<           button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add Opportunity
          </button>
        </div>
      </div>
      <FilterBar
        searchPlaceholder="Search opportunities..."
        filters={[{ key: 'stage', label: 'Stage', options: OPPORTUNITY_STAGES.map(s => ({ label: s, value: s })) }]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />
      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.opportunities || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          sortKey={params.sortKey}
          sortDir={params.sortDir}
          onSort={(k, d) => setParams(p => ({ ...p, sortKey: k, sortDir: d }))}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          onRowClick={(row) => navigate(`/crm/opportunities/${row._id}`)}
          emptyTitle="No opportunities yet"
        />
      </div>
      <OpportunityFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}