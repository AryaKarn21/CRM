import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supportAPI } from '@/api/support.api'
import { settingsAPI } from '@/api/settings.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import FormModal from '@/components/shared/FormModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ticketSchema } from '@/lib/validations'
import { formatDate, classifyStatus } from '@/lib/utils'
import { TICKET_STATUS, PRIORITY_LEVELS } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function TicketsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '', priority: '' })
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => supportAPI.getTickets(params).then(r => r.data),
  })

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      settingsAPI.getUsers({
        page: 1,
        limit: 1000,
      }).then((res) => res.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(ticketSchema) })

  const createMutation = useMutation({
    mutationFn: supportAPI.createTicket,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); setModalOpen(false); reset(); toast.success('Ticket created') },
  })

  const deleteMutation = useMutation({
    mutationFn: supportAPI.deleteTicket,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tickets'],
      })

      toast.success('Ticket deleted successfully')
    },

    onError: () => {
      toast.error('Failed to delete ticket')
    },
  })

  const priorityColors = { Low: 'gray', Medium: 'info', High: 'warning', Urgent: 'danger' }

  const columns = [
    {
      key: 'ticketId', label: 'ID',
      render: (val) => <span className="font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>#{val}</span>,
    },
    {
      key: 'subject', label: 'Subject', sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.category || 'General'}</p>
        </div>
      ),
    },
    {
      key: 'priority', label: 'Priority',
      render: (val) => <Badge variant={priorityColors[val] || 'gray'}>{val}</Badge>,
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge variant={classifyStatus(val)} dot>{val}</Badge>,
    },
    {
      key: 'assignedTo', label: 'Assigned To',
      render: (val) => val ? (
        <div className="flex items-center gap-2">
          <Avatar name={val.name} size="xs" />
          <span className="text-[12px]">{val.name}</span>
        </div>
      ) : <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Unassigned</span>,
    },
    { key: 'createdAt', label: 'Created', sortable: true, render: (val) => formatDate(val) },
    { key: 'updatedAt', label: 'Updated', render: (val) => formatDate(val) },
    {
      key: 'id',
      label: 'Actions',
      render: (id) => (
        <div
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/support/${id}`)}
          >
            View
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to delete this ticket?'
                )
              ) {
                deleteMutation.mutate(id)
              }
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Support Tickets</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} tickets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> New Ticket
        </button>
      </div>
      <FilterBar
        searchPlaceholder="Search tickets..."
        filters={[
          { key: 'status', label: 'Status', options: TICKET_STATUS.map(s => ({ label: s, value: s })) },
          { key: 'priority', label: 'Priority', options: PRIORITY_LEVELS.map(p => ({ label: p, value: p })) },
        ]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />
      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.tickets || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          onRowClick={(row) => navigate(`/support/${row._id}`)}
          emptyTitle="No tickets yet"
          emptyDescription="All support requests will appear here"
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="Create Support Ticket"
        onSubmit={handleSubmit((d) => {
          console.log("Create Ticket Data:", d)
          createMutation.mutate(d)
        })}
        loading={createMutation.isPending}
        submitLabel="Create Ticket"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Subject <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Brief description of the issue" {...register('subject')} />
            {errors.subject && <p className="text-[11px] text-red-500">{errors.subject.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Description <span className="text-red-500">*</span></label>
            <textarea className="input" rows={4} placeholder="Describe the issue in detail..." {...register('description')} />
            {errors.description && <p className="text-[11px] text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Priority <span className="text-red-500">*</span></label>
              <select className="input" {...register('priority')}>
                <option value="">Select priority</option>
                {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.priority && <p className="text-[11px] text-red-500">{errors.priority.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>

              <select className="input" {...register('category')}>
                <option value="">Select category</option>
                {['Technical', 'Billing', 'Account', 'Feature Request', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
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
                  Select User
                </option>

                {(usersData?.users || []).map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </FormModal>
    </div>

  )
}
