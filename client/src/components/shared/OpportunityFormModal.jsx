import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { opportunitiesAPI } from '@/api/opportunities.api'
import { accountsAPI } from '@/api/accounts.api'
import { settingsAPI } from '@/api/settings.api'
import FormModal from '@/components/shared/FormModal'
import { opportunitySchema } from '@/lib/validations'
import { OPPORTUNITY_STAGES } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function OpportunityFormModal({ open, onClose }) {
  const queryClient = useQueryClient()

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-options'],
    queryFn: () => accountsAPI.getAll({ limit: 200 }).then(r => r.data),
    enabled: open,
  })

  const { data: usersData } = useQuery({
    queryKey: ['users-options'],
    queryFn: () => settingsAPI.getUsers({ limit: 200 }).then(r => r.data),
    enabled: open,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: { stage: 'Prospecting', value: 0, probability: 10 },
  })

  const createMutation = useMutation({
    mutationFn: opportunitiesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['opportunities-kanban'] })
      onClose()
      reset()
      toast.success('Opportunity created')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create opportunity')
    },
  })

  const handleClose = () => { onClose(); reset() }

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Add Opportunity"
      onSubmit={handleSubmit((d) => createMutation.mutate(d))}
      loading={createMutation.isPending}
      submitLabel="Create Opportunity"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="form-group">
          <label className="form-label">Opportunity Name *</label>
          <input className="input" placeholder="e.g. Annual contract renewal" {...register('name')} />
          {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Account *</label>
            <select className="input" {...register('account')}>
              <option value="">Select account</option>
              {accountsData?.accounts?.map(a => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
            {errors.account && <p className="text-[11px] text-red-500">{errors.account.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Stage</label>
            <select className="input" {...register('stage')}>
              {OPPORTUNITY_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Value (NPR) *</label>
            <input className="input" type="number" placeholder="0" {...register('value')} />
            {errors.value && <p className="text-[11px] text-red-500">{errors.value.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Probability (%)</label>
            <input className="input" type="number" min="0" max="100" {...register('probability')} />
          </div>
          <div className="form-group">
            <label className="form-label">Close Date *</label>
            <input className="input" type="date" {...register('closeDate')} />
            {errors.closeDate && <p className="text-[11px] text-red-500">{errors.closeDate.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <select className="input" {...register('assignedTo')}>
              <option value="">Unassigned</option>
              {usersData?.users?.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="input" rows={3} placeholder="Additional details..." {...register('description')} />
        </div>
      </div>
    </FormModal>
  )
}