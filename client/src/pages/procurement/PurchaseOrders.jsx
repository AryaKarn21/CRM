import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Send } from 'lucide-react'
import { procurementAPI } from '@/api/procurement.api'
import { useProcurementActions } from '@/hooks/useProcurementActions'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import PurchaseOrderFormModal from '@/components/procurement/PurchaseOrderFormModal'
import VendorFormModal from '@/components/procurement/VendorFormModal'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function PurchaseOrders() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [params, setParams] = useState({
    page: 1, limit: 20, search: '', status: searchParams.get('status') || '',
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
    queryKey: ['purchase-orders', params],
    queryFn: () => procurementAPI.getPurchaseOrders(params).then(r => r.data),
  })

  const { data: vendorData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => procurementAPI.getVendors().then(r => r.data),
  })
  const vendors = vendorData?.vendors || []

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })

  const createMutation = useMutation({
    mutationFn: (payload) => procurementAPI.createPO(payload),
    onSuccess: () => { invalidate(); setModalOpen(false); toast.success('Purchase order created') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create PO'),
  })

  const createVendorMutation = useMutation({
    mutationFn: procurementAPI.createVendor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendors'] }); setVendorModal(false); toast.success('Vendor added') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to add vendor'),
  })

  const { submitMutation, approveMutation, receiveMutation, cancelMutation } = useProcurementActions([['purchase-orders']])

  const columns = [
    { key: 'poNumber', label: 'PO Number', render: (val) => <span className="font-mono text-[12px]">{val}</span> },
    { key: 'vendor', label: 'Vendor', render: (val) => val?.name || '—' },
    { key: 'orderDate', label: 'Order Date', render: (val) => formatDate(val) },
    { key: 'expectedDelivery', label: 'Expected Delivery', render: (val) => val ? formatDate(val) : '—' },
    { key: 'totalAmount', label: 'Total', sortable: true, render: (val) => <span className="font-semibold">{formatCurrency(val)}</span> },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={classifyStatus(val)} dot>{val}</Badge> },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/procurement/orders/${id}`)}>View</button>

          {['draft', 'pending'].includes(row.status) && (
            <button className="btn btn-sm btn-primary" onClick={() => navigate(`/procurement/orders/${id}/edit`)}>Edit</button>
          )}

          {row.status === 'draft' && (
            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--primary)' }} onClick={() => submitMutation.mutate(id)} disabled={submitMutation.isPending}>
              <Send size={12} className="mr-1" /> Submit
            </button>
          )}

          {row.status === 'pending' && (
            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--success)' }} onClick={() => approveMutation.mutate(id)} disabled={approveMutation.isPending}>
              Approve
            </button>
          )}

          {row.status === 'approved' && (
            <button className="btn btn-sm btn-ghost" onClick={() => receiveMutation.mutate(id)} disabled={receiveMutation.isPending}>
              Receive
            </button>
          )}

          {['draft', 'pending'].includes(row.status) && (
            <button
              className="btn btn-sm btn-ghost text-red-500"
              onClick={() => { if (confirm('Cancel this Purchase Order?')) cancelMutation.mutate(id) }}
              disabled={cancelMutation.isPending}
            >
              Cancel
            </button>
          )}
        </div>
      ),
    }
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[16px] sm:text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Purchase Orders</h1>
          <p className="text-[11px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={() => setVendorModal(true)}>
            <Plus size={14} /> Add Vendor
          </button>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> New PO
          </button>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search by PO number, vendor..."
        filters={[{ key: 'status', label: 'Status', options: ['draft', 'pending', 'approved', 'received', 'cancelled'].map(v => ({ label: v, value: v })) }]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-3 sm:mx-6 mb-6 card overflow-hidden overflow-x-auto">
        <DataTable
          columns={columns}
          data={data?.orders || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          emptyTitle="No purchase orders"
          emptyDescription="Create your first purchase order to get started"
        />
      </div>

      <PurchaseOrderFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vendors={vendors}
        onSubmit={(payload) => createMutation.mutate(payload)}
        loading={createMutation.isPending}
        title="New Purchase Order"
        submitLabel="Create PO"
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