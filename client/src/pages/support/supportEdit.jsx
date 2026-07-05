import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { supportAPI } from '@/api/support.api'
import { ticketSchema } from '@/lib/validations'
import { PRIORITY_LEVELS, TICKET_STATUS } from '@/lib/constants'
import { settingsAPI } from '@/api/settings.api'

export default function SupportEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketSchema),
  })

  const { data: usersData } = useQuery({
  queryKey: ['users'],
  queryFn: () => settingsAPI.getUsers().then(res => res.data),
})

const { data: usersData, isLoading: usersLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () =>
    settingsAPI.getUsers({
      page: 1,
      limit: 1000,
    }).then((res) => res.data),
})
const {
  data: ticket,
  isLoading,
} = useQuery({
  queryKey: ['ticket', id],
  queryFn: () =>
    supportAPI.getTicketById(id).then((res) => res.data),
})

  useEffect(() => {
    if (ticket) {
      reset({
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        status: ticket.status,
        assignedToId: ticket.assignedToId || '',
      })
    }
  }, [ticket, reset])

  const updateMutation = useMutation({
  mutationFn: (data) => {
    console.log("Sending to backend:", data)
    return supportAPI.updateTicket(id, data)
  },

  onSuccess: () => {
    toast.success("Ticket updated successfully")
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    navigate(`/support/${id}`)
  },
})

 

  return (
    <div className="animate-fade-in">

      <div className="page-header">

        <div className="flex items-center gap-3">

          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h1 className="text-[18px] font-bold">
              Edit Support Ticket
            </h1>

            <p className="text-[12px] text-gray-500">
              Update ticket details
            </p>
          </div>

        </div>

      </div>

      <div className="card p-6 mx-6">

        <form
  className="flex flex-col gap-5"
  onSubmit={handleSubmit((data) => {
    console.log("Submitting Ticket:", data)
    updateMutation.mutate(data)
  })}
>
        

          <div className="form-group">
            <label className="form-label">
              Subject
            </label>

            <input
              className="input"
              {...register('subject')}
            />

            {errors.subject && (
              <p className="text-red-500 text-xs">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Description
            </label>

            <textarea
              rows={5}
              className="input"
              {...register('description')}
            />

            {errors.description && (
              <p className="text-red-500 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="form-group">
              <label className="form-label">
                Priority
              </label>

              <select
                className="input"
                {...register('priority')}
              >
                {PRIORITY_LEVELS.map((p) => (
                  <option
                    key={p}
                    value={p}
                  >
                    {p}
                  </option>
                ))}
              </select>

              {errors.priority && (
                <p className="text-red-500 text-xs">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>

              <select
                className="input"
                {...register('status')}
              >
                {TICKET_STATUS.map((s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {s}
                  </option>
                ))}
              </select>

              {errors.status && (
                <p className="text-red-500 text-xs">
                  {errors.status.message}
                </p>
              )}
            </div>

          </div>

          <div className="form-group">
            <label className="form-label">
              Category
            </label>

            <select
              className="input"
              {...register('category')}
            >
              <option value="">Select Category</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
  <label className="form-label">
    Assigned To
  </label>

  <select
    className="input"
    {...register('assignedToId')}
  >
    <option value="">
      Unassigned
    </option>

    {usersData?.users?.map((user) => (
      <option
        key={user.id}
        value={user.id}
      >
        {user.name}
      </option>
    ))}
  </select>
</div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? 'Updating...'
                : 'Update Ticket'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}