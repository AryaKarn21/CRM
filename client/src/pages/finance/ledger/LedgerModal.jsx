import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FormModal from '@/components/shared/FormModal'

const ACCOUNTS = ['Cash', 'Accounts Receivable', 'Revenue', 'Salaries', 'Rent', 'Office Supplies', 'Other']

export default function LedgerModal({ open, onClose, onSubmit, loading, entry = null }) {
  const isEdit = !!entry

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'debit',
      debit: '',
      credit: '',
      description: '',
      reference: '',
      accountName: '',
    },
  })

  const entryType = watch('type')

  useEffect(() => {
    if (!open) return
    if (entry) {
      reset({
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        type: entry.type || 'debit',
        debit: entry.debit || '',
        credit: entry.credit || '',
        description: entry.description || '',
        reference: entry.reference || '',
        accountName: entry.accountName || '',
      })
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        type: 'debit',
        debit: '',
        credit: '',
        description: '',
        reference: '',
        accountName: '',
      })
    }
  }, [open, entry, reset])

  const handleClose = () => {
    onClose()
    reset()
  }

  const submitHandler = handleSubmit((d) => {
    const amount = parseFloat(d.type === 'debit' ? d.debit : d.credit)
    onSubmit({
      ...d,
      debit: d.type === 'debit' ? amount : 0,
      credit: d.type === 'credit' ? amount : 0,
    })
  })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit Ledger Entry' : 'Add Ledger Entry'}
      onSubmit={submitHandler}
      loading={loading}
      submitLabel={isEdit ? 'Update Entry' : 'Add Entry'}
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
            <label className="form-label">
              Amount (NPR) * {entryType === 'debit' ? '— Debit' : '— Credit'}
            </label>

            {/*
              Two physically separate inputs, swapped via conditional
              rendering (not just a changing `name`). Forces RHF to
              cleanly register/unregister on type switch, which is
              what actually fixes "credit value won't save".
            */}
            {entryType === 'debit' ? (
              <input
                key="debit-field"
                className="input"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('debit', { required: 'Enter a debit amount', min: { value: 0.01, message: 'Must be greater than 0' } })}
              />
            ) : (
              <input
                key="credit-field"
                className="input"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('credit', { required: 'Enter a credit amount', min: { value: 0.01, message: 'Must be greater than 0' } })}
              />
            )}
            {(errors.debit || errors.credit) && (
              <p className="text-[11px] text-red-500">{(errors.debit || errors.credit).message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="input" type="date" {...register('date', { required: true })} />
          </div>

          <div className="form-group">
            <label className="form-label">Account</label>
            <select className="input" {...register('accountName')}>
              <option value="">Select account</option>
              {ACCOUNTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Reference</label>
            <input className="input" placeholder="e.g. INV-001, REC-002" {...register('reference')} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            className="input"
            rows={2}
            placeholder="What is this entry for?"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <p className="text-[11px] text-red-500">{errors.description.message}</p>}
        </div>
      </div>
    </FormModal>
  )
}