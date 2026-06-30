import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { procurementAPI } from '@/api/procurement.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import FormModal from '@/components/shared/FormModal'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function PurchaseOrders() {
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [vendorModal, setVendorModal] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () => procurementAPI.getPurchaseOrders(params).then(r => r.data),
  })

  const { data: vendorData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => procurementAPI.getVendors().then(r => r.data),
  })
  const vendors = vendorData?.vendors || []

  // PO form
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      vendorId: '',
      expectedDelivery: '',
      notes: '',
      items: [{ name: '', quantity: 1, unitPrice: 0 }],
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = watch('items')
  const totalAmount = watchedItems?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0) || 0

  // Vendor form
  const { register: regV, handleSubmit: hV, reset: resetV, formState: { errors: errV } } = useForm()

  const createMutation = useMutation({
    mutationFn: (d) => {
      const items = d.items.map(i => ({
        name: i.name,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        total: Number(i.quantity) * Number(i.unitPrice),
      }))
      return procurementAPI.createPO({ ...d, items, totalAmount })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setModalOpen(false)
      reset()
      toast.success('Purchase order created')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create PO'),
  })

  const createVendorMutation = useMutation({
    mutationFn: procurementAPI.createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      setVendorModal(false)
      resetV()
      toast.success('Vendor added')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to add vendor'),
  })

  const approveMutation = useMutation({
    mutationFn: procurementAPI.approvePO,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }); toast.success('PO approved') },
  })

  const cancelMutation = useMutation({
    mutationFn: procurementAPI.cancelPO,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }); toast.success('PO cancelled') },
  })

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
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {row.status === 'pending' && (
            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--success)' }}
              onClick={() => approveMutation.mutate(id)} disabled={approveMutation.isPending}>
              Approve
            </button>
          )}
          {['draft', 'pending'].includes(row.status) && (
            <button className="btn btn-sm btn-ghost text-red-500"
              onClick={() => { if (confirm('Cancel this PO?')) cancelMutation.mutate(id) }}>
              Cancel
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
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Purchase Orders</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} orders</p>
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
        filters={[{
          key: 'status', label: 'Status',
          options: ['draft', 'pending', 'approved', 'received', 'cancelled'].map(v => ({ label: v, value: v })),
        }]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-6 mb-6 card overflow-hidden">
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

      {/* New PO Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="New Purchase Order"
        onSubmit={handleSubmit((d) => createMutation.mutate(d))}
        loading={createMutation.isPending}
        submitLabel="Create PO"
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Vendor *</label>
              <select className="input" {...register('vendorId', { required: 'Vendor is required' })}>
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {errors.vendor && <p className="text-[11px] text-red-500">{errors.vendor.message}</p>}
              {vendors.length === 0 && (
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  No vendors yet.{' '}
                  <button type="button" className="text-[var(--primary)] underline"
                    onClick={() => { setModalOpen(false); setVendorModal(true) }}>
                    Add a vendor first
                  </button>
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Expected Delivery</label>
              <input className="input" type="date" {...register('expectedDelivery')} />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Items *</label>
              <button type="button" className="btn btn-ghost btn-sm"
                onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })}>
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-2 px-1">
                <span className="col-span-5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Item Name</span>
                <span className="col-span-2 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Qty</span>
                <span className="col-span-3 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Unit Price</span>
                <span className="col-span-2 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Total</span>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <input className="input col-span-5" placeholder="Item name"
                    {...register(`items.${index}.name`, { required: true })} />
                  <input className="input col-span-2" type="number" min="1"
                    {...register(`items.${index}.quantity`, { min: 1 })} />
                  <input className="input col-span-3" type="number" min="0" step="0.01"
                    {...register(`items.${index}.unitPrice`, { min: 0 })} />
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-[12px] font-medium">
                      {formatCurrency((Number(watchedItems?.[index]?.quantity) || 0) * (Number(watchedItems?.[index]?.unitPrice) || 0))}
                    </span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                Total: {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={2} placeholder="Any additional notes..." {...register('notes')} />
          </div>
        </div>
      </FormModal>

      {/* Add Vendor Modal */}
      <FormModal
        open={vendorModal}
        onClose={() => { setVendorModal(false); resetV() }}
        title="Add Vendor"
        onSubmit={hV((d) => createVendorMutation.mutate(d))}
        loading={createVendorMutation.isPending}
        submitLabel="Add Vendor"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Vendor Name *</label>
            <input className="input" placeholder="e.g. ABC Suppliers" {...regV('name', { required: 'Name is required' })} />
            {errV.name && <p className="text-[11px] text-red-500">{errV.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="vendor@example.com" {...regV('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+977 98XXXXXXXX" {...regV('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="input" placeholder="Contact name" {...regV('contactPerson')} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <input className="input" placeholder="e.g. Net 30" {...regV('paymentTerms')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="input" rows={2} placeholder="Vendor address..." {...regV('address')} />
          </div>
        </div>
      </FormModal>
    </div>
  )
}