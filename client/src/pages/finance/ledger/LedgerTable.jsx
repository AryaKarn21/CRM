import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function LedgerTable({
  entries = [],
  total = 0,
  page,
  pageSize,
  loading,
  error,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) {
  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (val) => formatDate(val) },
    {
      key: 'reference',
      label: 'Reference',
      render: (val) => <span className="font-mono text-[12px]">{val || '—'}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => <span className="text-[13px]">{val}</span>,
    },
    {
      key: 'accountName',
      label: 'Account',
      render: (val) => val || '—',
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <Badge variant={val === 'debit' ? 'danger' : 'success'}>{val}</Badge>,
    },
    {
      key: 'debit',
      label: 'Debit',
      render: (val) => (val ? <span className="font-medium text-red-600">{formatCurrency(val)}</span> : '—'),
    },
    {
      key: 'credit',
      label: 'Credit',
      render: (val) => (val ? <span className="font-medium text-green-600">{formatCurrency(val)}</span> : '—'),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (val) => (val != null ? <span className="font-semibold">{formatCurrency(val)}</span> : '—'),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => onView?.(row)}>
            View
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit?.(row)}>
            Edit
          </button>
          <button
            className="btn btn-ghost btn-sm text-red-500"
            onClick={() => {
              if (window.confirm('Delete this ledger entry?')) onDelete?.(id)
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-6 mb-6 card overflow-hidden">
      <DataTable
        columns={columns}
        data={entries}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        error={error}
        onPageChange={onPageChange}
        emptyTitle="No ledger entries"
        emptyDescription="Add your first entry to start tracking finances"
      />
    </div>
  )
}