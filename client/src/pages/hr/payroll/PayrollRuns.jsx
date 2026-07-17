import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Play, DollarSign } from 'lucide-react'
import { payrollAPI } from '@/api/payroll.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const PAYROLL_STATUS = ['draft', 'processing', 'processed', 'approved', 'paid']


export default function PayrollRuns() {
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['payroll', params],
    queryFn: () => payrollAPI.getRuns(params).then(r => r.data),
  })

  const runPayrollMutation = useMutation({
    mutationFn: (id) => {
      if (id) return payrollAPI.runPayroll(id)
      const now = new Date()
      const period = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`
      return payrollAPI.createRun({ period })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      toast.success('Payroll run initiated')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to initiate payroll run'),
  })

  const statusColors = { Draft: 'gray', Processing: 'warning', Completed: 'success', Failed: 'danger' }

  const columns = [
    {
      key: 'period', label: 'Pay Period', sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val || `${row.month} ${row.year}`}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatDate(row.startDate)} – {formatDate(row.endDate)}</p>
        </div>
      ),
    },
    { key: 'employeeCount', label: 'Employees', render: (val) => <span className="font-medium">{val ?? '—'}</span> },
    { key: 'grossPay', label: 'Gross Salary', render: (val) => <span className="font-semibold">{formatCurrency(val)}</span> },
    { key: 'deductions', label: 'Deductions', render: (val) => <span className="text-red-600">{formatCurrency(val)}</span> },
    { key: 'netPay', label: 'Net Payout', render: (val) => <span className="font-bold" style={{ color: 'var(--success)' }}>{formatCurrency(val)}</span> },
    {
      key: 'status', label: 'Status',
      render: (val = 'draft') => {
        const label = val.charAt(0).toUpperCase() + val.slice(1)
        const variant = { draft: 'gray', processing: 'warning', processed: 'info', approved: 'success', paid: 'success' }[val] || 'gray'
        return <Badge variant={variant} dot>{label}</Badge>
      },
    },
    { key: 'processedAt', label: 'Processed', render: (val) => val ? formatDate(val) : '—' },
    {
      key: 'id', label: '',
      render: (id, row) => (
        <div onClick={e => e.stopPropagation()}>
          {row.status === 'draft' && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                if (confirm(`Process payroll for ${row.employeeCount || 'all'} employees?`))
                  runPayrollMutation.mutate(id)
              }}
              disabled={runPayrollMutation.isPending}
            >
              <Play size={12} /> Process
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Payroll Runs</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} payroll runs</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            const now = new Date()
            const period = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`
            if (confirm(`Create payroll run for ${period}?`))
              runPayrollMutation.mutate(null)
          }}
          disabled={runPayrollMutation.isPending}
        >
          <DollarSign size={14} /> New Payroll Run
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search payroll..."
        filters={[
          { key: 'status', label: 'Status', options: PAYROLL_STATUS.map(s => ({ label: s, value: s })) },
        ]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.runs || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          emptyTitle="No payroll runs"
          emptyDescription="Create a payroll run to process employee salaries"
        />
      </div>
    </div>
  )
}