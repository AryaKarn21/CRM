import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { leavesAPI } from '@/api/leaves.api'
import { employeesAPI } from '@/api/employees.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import FormModal from '@/components/shared/FormModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const leaveSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(5, 'Please provide a reason (min 5 chars)'),
})

const LEAVE_TYPES = ['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid', 'Emergency']
const LEAVE_STATUS = ['Pending', 'Approved', 'Rejected', 'Cancelled']

export default function LeaveRequests() {
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '', leaveType: '' })
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaves', params],
    queryFn: () => leavesAPI.getAll(params).then(r => r.data),
  })

  const { data: empData } = useQuery({
    queryKey: ['employees-all'],
    queryFn: () => employeesAPI.getAll({ limit: 200 }).then(r => r.data),
  })
  const employees = empData?.employees || []

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(leaveSchema),
  })

  const createMutation = useMutation({
    mutationFn: (d) => {
      const start = new Date(d.startDate)
      const end = new Date(d.endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      return leavesAPI.create({ ...d, days })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      setModalOpen(false)
      reset()
      toast.success('Leave request submitted')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit leave'),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, action }) =>
      action === 'Approved' ? leavesAPI.approve(id, '') : leavesAPI.reject(id, ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('Leave status updated')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update status'),
  })

  const statusColors = { Pending: 'warning', Approved: 'success', Rejected: 'danger', Cancelled: 'gray' }

  const columns = [
    {
      key: 'employee', label: 'Employee',
      render: (val) => val ? (
        <div className="flex items-center gap-2">
          <Avatar name={`${val.firstName} ${val.lastName}`} size="sm" />
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val.firstName} {val.lastName}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{val.department}</p>
          </div>
        </div>
      ) : '—',
    },
    { key: 'leaveType', label: 'Type', render: (val) => <Badge variant="info">{val}</Badge> },
    { key: 'startDate', label: 'Start', sortable: true, render: (val) => formatDate(val) },
    { key: 'endDate', label: 'End', render: (val) => formatDate(val) },
    { key: 'days', label: 'Days', render: (val) => <span className="font-medium">{val ?? '—'}</span> },
    {
      key: 'status', label: 'Status',
      render: (val = 'Pending') => <Badge variant={statusColors[val] || 'warning'} dot>{val}</Badge>,
    },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {row.status === 'Pending' && (
            <>
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--success)' }}
                onClick={() => approveMutation.mutate({ id, action: 'Approved' })}>
                Approve
              </button>
              <button className="btn btn-sm btn-ghost text-red-500"
                onClick={() => approveMutation.mutate({ id, action: 'Rejected' })}>
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Leave Requests</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Request Leave
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search employee..."
        filters={[
          { key: 'status', label: 'Status', options: LEAVE_STATUS.map(s => ({ label: s, value: s })) },
          { key: 'leaveType', label: 'Type', options: LEAVE_TYPES.map(t => ({ label: t, value: t })) },
        ]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.leaves || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          emptyTitle="No leave requests"
          emptyDescription="Leave requests from employees will appear here"
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="Request Leave"
        onSubmit={handleSubmit((d) => createMutation.mutate(d))}
        loading={createMutation.isPending}
        submitLabel="Submit Request"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select className="input" {...register('employeeId')}>
              <option value="">Select employee</option>
              {employees.map(e => (
                <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.department}</option>
              ))}
            </select>
            {errors.employee && <p className="text-[11px] text-red-500">{errors.employeeId.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Leave Type *</label>
            <select className="input" {...register('leaveType')}>
              <option value="">Select type</option>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.leaveType && <p className="text-[11px] text-red-500">{errors.leaveType.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input className="input" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-[11px] text-red-500">{errors.startDate.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input className="input" type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-[11px] text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason *</label>
            <textarea className="input" rows={3} placeholder="Why are you requesting leave?" {...register('reason')} />
            {errors.reason && <p className="text-[11px] text-red-500">{errors.reason.message}</p>}
          </div>
        </div>
      </FormModal>
    </div>
  )
}