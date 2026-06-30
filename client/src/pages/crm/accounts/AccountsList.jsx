import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2 } from 'lucide-react'
import { accountsAPI } from '@/api/accounts.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate, formatCurrency } from '@/lib/utils'
import FormModal from '@/components/shared/FormModal'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/lib/validations'

export default function AccountsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', type: '', sortKey: 'createdAt', sortDir: 'desc' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountsAPI.getAll(params).then(r => r.data),
  })
  

 const [modalOpen, setModalOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', industry: '', type: '', website: '', email: '', phone: '', revenue: 0, address: '' }
  })

  const createMutation = useMutation({
    mutationFn: accountsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setModalOpen(false)
      reset()
      toast.success('Account created successfully')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create account')
    }
  })

  const columns = [
    {
      key: 'name', label: 'Account Name', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary-light)' }}>
            <Building2 size={14} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.website || row.email || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'industry', label: 'Industry' },
    { key: 'phone', label: 'Phone' },
    { key: 'type', label: 'Type', render: (val) => val ? <Badge variant="info">{val}</Badge> : '—' },
    { key: 'revenue', label: 'Revenue', sortable: true, render: (val) => val ? formatCurrency(val) : '—' },
    { key: 'createdAt', label: 'Added', sortable: true, render: (val) => formatDate(val) },
    {
      key: '_id', label: '',
      render: (id, row) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/crm/accounts/${id}`)}>View</button>
          <button className="btn btn-ghost btn-sm text-red-500" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(id) }}>Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Accounts</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} total accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add Account
        </button>
      </div>
      <FilterBar
        searchPlaceholder="Search accounts..."
        filters={[{ key: 'type', label: 'Type', options: ['Customer', 'Partner', 'Prospect', 'Competitor'].map(v => ({ label: v, value: v })) }]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />
      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.accounts || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          sortKey={params.sortKey}
          sortDir={params.sortDir}
          onSort={(k, d) => setParams(p => ({ ...p, sortKey: k, sortDir: d }))}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          onRowClick={(row) => navigate(`/crm/accounts/${row._id}`)}
          emptyTitle="No accounts yet"
          emptyDescription="Add your first account to get started"
        />
      </div>
      <FormModal
  open={modalOpen}
  onClose={() => { setModalOpen(false); reset() }}
  title="Add Account"
  onSubmit={handleSubmit((d) => createMutation.mutate(d))}
  loading={createMutation.isPending}
  submitLabel="Create Account"
  size="lg"
>
  <div className="flex flex-col gap-4">
    <div className="form-group">
      <label className="form-label">Account Name *</label>
      <input className="input" placeholder="e.g. Acme Corp" {...register('name')} />
      {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="form-group">
        <label className="form-label">Industry</label>
        <input className="input" placeholder="e.g. Manufacturing" {...register('industry')} />
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <select className="input" {...register('type')}>
          <option value="">Select type</option>
          {['Customer', 'Partner', 'Prospect', 'Competitor', 'Other'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Website</label>
        <input className="input" placeholder="https://example.com" {...register('website')} />
        {errors.website && <p className="text-[11px] text-red-500">{errors.website.message}</p>}
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="input" type="email" placeholder="contact@example.com" {...register('email')} />
        {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
      </div>
      <div className="form-group">
        <label className="form-label">Phone</label>
        <input className="input" placeholder="+977 98XXXXXXXX" {...register('phone')} />
      </div>
      <div className="form-group">
        <label className="form-label">Revenue (NPR)</label>
        <input className="input" type="number" placeholder="0" {...register('revenue')} />
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Address</label>
      <textarea className="input" rows={2} placeholder="Street, city, country..." {...register('address')} />
    </div>
  </div>
</FormModal>
    </div>
  )
}