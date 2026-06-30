import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { financeAPI } from '@/api/finance.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import FormModal from '@/components/shared/FormModal'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const ACCOUNTS = ['Cash', 'Accounts Receivable', 'Revenue', 'Salaries', 'Rent', 'Office Supplies', 'Other']

export default function GeneralLedger() {
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 25, search: '', type: '' })
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['ledger', params],
    queryFn: () => financeAPI.getLedgerEntries(params).then(r => r.data),
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { date: new Date().toISOString().split('T')[0], type: 'debit', debit: '', credit: '', description: '', reference: '', account: '' }
  })

  const entryType = watch('type')

  const createMutation = useMutation({
    mutationFn: financeAPI.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      setModalOpen(false)
      reset()
      toast.success('Ledger entry created')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create entry'),
  })

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (val) => formatDate(val) },
    { key: 'reference', label: 'Reference', render: (val) => <span className="font-mono text-[12px]">{val || '—'}</span> },
    { key: 'description', label: 'Description', render: (val) => <span className="text-[13px]">{val}</span> },
    { key: 'account', label: 'Account', render: (val) => val?.name || val || '—' },
    {
      key: 'type', label: 'Type',
      render: (val) => <Badge variant={val === 'debit' ? 'danger' : 'success'}>{val}</Badge>,
    },
    {
      key: 'debit', label: 'Debit',
      render: (val) => val ? <span className="font-medium text-red-600">{formatCurrency(val)}</span> : '—',
    },
    {
      key: 'credit', label: 'Credit',
      render: (val) => val ? <span className="font-medium text-green-600">{formatCurrency(val)}</span> : '—',
    },
    {
      key: 'balance', label: 'Balance',
      render: (val) => val != null ? <span className="font-semibold">{formatCurrency(val)}</span> : '—',
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>General Ledger</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} entries</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add Entry
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search by description, reference..."
        filters={[
          { key: 'type', label: 'Type', options: ['debit', 'credit'].map(v => ({ label: v, value: v })) },
        ]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.entries || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          emptyTitle="No ledger entries"
          emptyDescription="Add your first entry to start tracking finances"
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="Add Ledger Entry"
        onSubmit={handleSubmit((d) => {
          const amount = parseFloat(d.type === 'debit' ? d.debit : d.credit)
          createMutation.mutate({
            ...d,
            debit: d.type === 'debit' ? amount : 0,
            credit: d.type === 'credit' ? amount : 0,
          })
        })}
        loading={createMutation.isPending}
        submitLabel="Add Entry"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="input" {...register('type', { required: true })}>
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (NPR) *</label>
              <input className="input" type="number" step="0.01" placeholder="0.00"
                {...register(entryType === 'debit' ? 'debit' : 'credit', { required: true, min: 0.01 })} />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="input" type="date" {...register('date', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label">Account</label>
              <select className="input" {...register('account')}>
                <option value="">Select account</option>
                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Reference</label>
              <input className="input" placeholder="e.g. INV-001, REC-002" {...register('reference')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="input" rows={2} placeholder="What is this entry for?"
              {...register('description', { required: 'Description is required' })} />
            {errors.description && <p className="text-[11px] text-red-500">{errors.description.message}</p>}
          </div>
        </div>
      </FormModal>
    </div>
  )
}