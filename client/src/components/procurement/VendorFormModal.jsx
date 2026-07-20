import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FormModal from '@/components/shared/FormModal'

export default function VendorFormModal({ open, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { if (open) reset() }, [open, reset])

  return (
    <FormModal open={open} onClose={() => { onClose(); reset() }} title="Add Vendor" onSubmit={handleSubmit((d) => onSubmit(d))} loading={loading} submitLabel="Add Vendor">
      <div className="flex flex-col gap-4">
        <div className="form-group">
          <label className="form-label">Vendor Name *</label>
          <input className="input" placeholder="e.g. ABC Suppliers" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="vendor@example.com" {...register('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="input" placeholder="+977 98XXXXXXXX" {...register('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input className="input" placeholder="Contact name" {...register('contactPerson')} />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Terms</label>
            <input className="input" placeholder="e.g. Net 30" {...register('paymentTerms')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea className="input" rows={2} placeholder="Vendor address..." {...register('address')} />
        </div>
      </div>
    </FormModal>
  )
}