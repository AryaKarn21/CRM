import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, LayoutGrid } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { leadsAPI } from '@/api/leads.api'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import FilterBar from '@/components/shared/FilterBar'
import FormModal from '@/components/shared/FormModal'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import { LEAD_STAGES } from '@/lib/constants'
import toast from 'react-hot-toast'

const LEAD_SOURCES = ['Website', 'Referral', 'Social Media', 'Email', 'Cold Call', 'Advertisement', 'Other']

export default function LeadsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [params, setParams] = useState({
    page: 1, limit: 20, search: '', stage: '', sortKey: 'createdAt', sortDir: 'desc',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsAPI.getAll(params).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', phone: '', company_name: '', stage: 'New', value: 0, source: '', notes: '' }
  })

  const createMutation = useMutation({
    mutationFn: leadsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setModalOpen(false)
      reset()
      toast.success('Lead created successfully')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create lead')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: leadsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead deleted successfully')
    },
  })

  const columns = [
    {
      key: 'name', label: 'Lead Name', sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.company_name}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'stage', label: 'Stage', sortable: true,
      render: (val) => <Badge variant={classifyStatus(val)} dot>{val}</Badge>,
    },
    {
      key: 'value', label: 'Value',
      render: (val) => <span className="font-medium">{formatCurrency(val)}</span>,
    },
    {
      key: 'assignedTo', label: 'Assigned To',
      render: (val) => val?.name || '—',
    },
    {
      key: 'createdAt', label: 'Created', sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: '_id', label: '',
      render: (id) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/crm/leads/${id}`)}>View</button>
          <button className="btn btn-ghost btn-sm text-red-500"
            onClick={() => { if (confirm('Delete this lead?')) deleteMutation.mutate(id) }}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Leads</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {data?.total ?? 0} total leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm"
            onClick={() => navigate('/crm/leads/kanban')}>
            <LayoutGrid size={14} /> Kanban
          </button>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search leads by name, email, company..."
        filters={[
          { key: 'stage', label: 'Stage', options: LEAD_STAGES.map(s => ({ label: s, value: s })) },
        ]}
        values={params}
        onChange={(key, val) => setParams(p => ({ ...p, [key]: val, page: 1 }))}
      />

      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.leads || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          sortKey={params.sortKey}
          sortDir={params.sortDir}
          onSort={(key, dir) => setParams(p => ({ ...p, sortKey: key, sortDir: dir }))}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          onRowClick={(row) => navigate(`/crm/leads/${row._id}`)}
          emptyTitle="No leads yet"
          emptyDescription="Add your first lead to get started"
        />
      </div>

      {/* Add Lead Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="Add New Lead"
        onSubmit={handleSubmit((d) => createMutation.mutate({
          ...d,
          value: Number(d.value) || 0,
        }))}
        loading={createMutation.isPending}
        submitLabel="Create Lead"
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="input" placeholder="John Doe"
                {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="input" placeholder="Company name"
                {...register('company_name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="john@example.com"
                {...register('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+977 98XXXXXXXX"
                {...register('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="input" {...register('stage')}>
                {LEAD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Value (NPR)</label>
              <input className="input" type="number" placeholder="0"
                {...register('value')} />
            </div>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="input" {...register('source')}>
                <option value="">Select source</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={3} placeholder="Any additional notes..."
              {...register('notes')} />
          </div>
        </div>
      </FormModal>
    </div>
  )
}