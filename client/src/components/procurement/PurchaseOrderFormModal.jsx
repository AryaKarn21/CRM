import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import FormModal from '@/components/shared/FormModal'
import { formatCurrency } from '@/lib/utils'

const emptyItem = { name: '', quantity: 1, unitPrice: 0 }

export default function PurchaseOrderFormModal({
  open, onClose, vendors = [], onSubmit, loading,
  title = 'New Purchase Order', submitLabel = 'Create', onAddVendorClick,
}) {
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
    defaultValues: { vendorId: '', expectedDelivery: '', notes: '', items: [emptyItem] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = watch('items')
  const totalAmount = watchedItems?.reduce(
    (sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0
  ) || 0

  useEffect(() => {
    if (open) reset({ vendorId: '', expectedDelivery: '', notes: '', items: [emptyItem] })
  }, [open, reset])

  const submit = handleSubmit((d) => {
    const items = d.items.map((i) => ({
      name: i.name,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      total: Number(i.quantity) * Number(i.unitPrice),
    }))
    onSubmit({ ...d, items, totalAmount })
  })

  return (
    <FormModal open={open} onClose={() => { onClose(); reset() }} title={title} onSubmit={submit} loading={loading} submitLabel={submitLabel} size="lg">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Vendor *</label>
            <select className="input" {...register('vendorId', { required: 'Vendor is required' })}>
              <option value="">Select vendor</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            {errors.vendorId && <p className="text-[11px] text-red-500">{errors.vendorId.message}</p>}
            {vendors.length === 0 && (
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                No vendors yet.{' '}
                <button type="button" className="text-[var(--primary)] underline" onClick={onAddVendorClick}>
                  Add a vendor first
                </button>
              </p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Expected Delivery *</label>
            <input className="input" type="date" {...register('expectedDelivery', { required: 'Expected Delivery is required' })} />
            {errors.expectedDelivery && <p className="text-[11px] text-red-500">{errors.expectedDelivery.message}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">Items *</label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => append({ ...emptyItem })}>
              <Plus size={12} /> Add Item
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-1">
              <span className="col-span-5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Item Name</span>
              <span className="col-span-2 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Qty</span>
              <span className="col-span-3 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Unit Price</span>
              <span className="col-span-2 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Total</span>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-center">
                <input className="input col-span-2 sm:col-span-5" placeholder="Item name" {...register(`items.${index}.name`, { required: true })} />
                <input className="input col-span-1 sm:col-span-2" type="number" min="1" placeholder="Qty" {...register(`items.${index}.quantity`, { min: 1 })} />
                <input className="input col-span-1 sm:col-span-3" type="number" min="0" step="0.01" placeholder="Unit price" {...register(`items.${index}.unitPrice`, { min: 0 })} />
                <div className="col-span-2 sm:col-span-2 flex items-center justify-between">
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
            <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Total: {formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="input" rows={2} placeholder="Any additional notes..." {...register('notes')} />
        </div>
      </div>
    </FormModal>
  )
}