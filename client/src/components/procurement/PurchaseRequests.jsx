import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Send, FileEdit, AlertCircle } from 'lucide-react'

import { procurementAPI } from '@/api/procurement.api'
import { useProcurementActions } from '@/hooks/useProcurementActions'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import toast from 'react-hot-toast'

import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import StatCard from '@/components/shared/StatCard'
import Badge from '@/components/ui/Badge'
import PurchaseOrderFormModal from '@/components/procurement/PurchaseOrderFormModal'
import VendorFormModal from '@/components/procurement/VendorFormModal'

// Rejected is included so a request doesn't just vanish from the
// requester's view the moment it's turned down — they need to see why.
const REQUEST_STATUSES = ['draft', 'pending', 'rejected']
const DEFAULT_STATUS_SCOPE = REQUEST_STATUSES.join(',')

export default function PurchaseRequests() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: searchParams.get('status') || '',
  })
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === '1')
  const [vendorModal, setVendorModal] = useState(false)

  useEffect(() => {
    if (searchParams.get('status') || searchParams.get('new')) {
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase-requests', params],
    queryFn: () => procurementAPI.getPurchaseRequests({ ...params, status: params.status || DEFAULT_STATUS_SCOPE }).then((r) => r.data),
  })

  const { data: vendorData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => procurementAPI.getVendors().then((r) => r.data),
  })
  const vendors = vendorData?.vendors || []

  const requests = data?.orders || []
  const draftCount = requests.filter((r) => r.status === 'draft').length
  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length
  const pendingValue = requests.filter((r) => r.status === 'pending').reduce((sum, r) => sum + Number(r.totalAmount || 0), 0)

  const invalidateRequests = () => queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })

  const createMutation = useMutation({
    mutationFn: (payload) => procurementAPI.createPO(payload),
    onSuccess: () => {
      invalidateRequests()
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setModalOpen(false)
      toast.success('Request saved as draft')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create request'),
  })

  const createVendorMutation = useMutation({
    mutationFn: procurementAPI.createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      setVendorModal(false)
      toast.success('Vendor added')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to add vendor'),
  })

  const { submitMutation, cancelMutation } = useProcurementActions([
    ['purchase-requests'],
    ['purchase-orders'],
  ])

  const columns = [
    { key: 'poNumber', label: 'Request #', render: (val) => <span className="font-mono text-[12px]">{val}</span> },
    { key: 'vendor', label: 'Vendor', render: (val) => val?.name || '—' },
    { key: 'createdBy', label: 'Requested By', render: (val) => val?.name || '—' },
    {
      key: 'items', label: 'Items', render: (val) => (
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {val?.length || 0} item{val?.length === 1 ? '' : 's'}
        </span>
      ),
    },
    { key: 'totalAmount', label: 'Total', sortable: true, render: (val) => <span className="font-semibold">{formatCurrency(val)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={classifyStatus(val)} dot>{val}</Badge>
          {val === 'rejected' && row.rejectionReason && (
            <span
              className="flex items-start gap-1 text-[11px] max-w-[220px]"
              style={{ color: 'var(--danger)' }}
              title={row.rejectionReason}
            >
              <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{row.rejectionReason}</span>
            </span>
          )}
        </div>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (val) => formatDate(val) },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/procurement/orders/${id}`)}>
            View
          </button>

          {row.status === 'draft' && (
            <button className="btn btn-sm btn-primary" onClick={() => navigate(`/procurement/orders/${id}/edit`)}>
              <FileEdit size={12} className="mr-1" /> Edit
            </button>
          )}

          {row.status === 'draft' && (
            <button
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--primary)' }}
              onClick={() => submitMutation.mutate(id)}
              disabled={submitMutation.isPending}
            >
              <Send size={12} className="mr-1" /> Submit for Approval
            </button>
          )}

          {row.status === 'rejected' && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => navigate(`/procurement/requests?new=1`)}
              title="Rejected requests can't be edited directly — start a fresh one with the corrected details"
            >
              <Plus size={12} className="mr-1" /> New Revision
            </button>
          )}

          {['draft', 'pending'].includes(row.status) && (
            <button
              className="btn btn-sm btn-ghost text-red-500"
              onClick={() => {
                if (confirm(row.status === 'draft' ? 'Delete this draft request?' : 'Withdraw this request from approval?')) {
                  cancelMutation.mutate(id)
                }
              }}
              disabled={cancelMutation.isPending}
            >
              {row.status === 'draft' ? 'Delete' : 'Withdraw'}
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[16px] sm:text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Purchase Requests</h1>
          <p className="text-[11px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Requests you can still edit (draft), that are waiting on an approver (pending), or were turned down (rejected)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={() => setVendorModal(true)}>
            <Plus size={14} /> Add Vendor
          </button>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> New Request
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-5 md:gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard title="Draft Requests" value={isLoading ? '—' : draftCount} loading={isLoading} color="gray" />
          <StatCard title="Awaiting Approval" value={isLoading ? '—' : pendingCount} loading={isLoading} color="warning" />
          <StatCard title="Rejected" value={isLoading ? '—' : rejectedCount} loading={isLoading} color="danger" />
          <StatCard title="Value Awaiting Approval" value={isLoading ? '—' : formatCurrency(pendingValue)} loading={isLoading} color="primary" />
        </div>

        <FilterBar
          searchPlaceholder="Search by request number, vendor..."
          filters={[{ key: 'status', label: 'Status', options: REQUEST_STATUSES.map((v) => ({ label: v, value: v })) }]}
          values={params}
          onChange={(k, v) => setParams((p) => ({ ...p, [k]: v, page: 1 }))}
        />

        <div className="card overflow-hidden overflow-x-auto">
          <DataTable
            columns={columns}
            data={requests}
            total={data?.total || 0}
            page={params.page}
            pageSize={params.limit}
            loading={isLoading}
            error={error}
            onPageChange={(page) => setParams((p) => ({ ...p, page }))}
            onRowClick={(row) => navigate(`/procurement/orders/${row.id}`)}
            emptyTitle="No purchase requests"
            emptyDescription="Create a new request to start the approval process"
          />
        </div>
      </div>

      <PurchaseOrderFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vendors={vendors}
        onSubmit={(payload) => createMutation.mutate(payload)}
        loading={createMutation.isPending}
        title="New Purchase Request"
        submitLabel="Save as Draft"
        onAddVendorClick={() => { setModalOpen(false); setVendorModal(true) }}
      />

      <VendorFormModal
        open={vendorModal}
        onClose={() => setVendorModal(false)}
        onSubmit={(payload) => createVendorMutation.mutate(payload)}
        loading={createVendorMutation.isPending}
      />
    </div>
  )
}