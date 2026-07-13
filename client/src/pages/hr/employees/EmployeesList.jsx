import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, UserCheck } from 'lucide-react'
import { employeesAPI } from '@/api/employees.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import toast from 'react-hot-toast'
import FormModal from '@/components/shared/FormModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema } from '@/lib/validations'

export default function EmployeesList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', department: '', status: '', sortKey: 'createdAt', sortDir: 'desc' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesAPI.getAll(params).then(r => r.data),
  })

  const [modalOpen, setModalOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', joinDate: '', salary: 0, employeeId: '' }
  })

  const createMutation = useMutation({
    mutationFn: employeesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setModalOpen(false)
      reset()
      toast.success('Employee created successfully')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create employee')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: employeesAPI.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee removed') },
  })

  const columns = [
    {
      key: 'firstName', label: 'Employee', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" src={row.avatar} />
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{row.firstName} {row.lastName}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.employeeId || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'joinDate', label: 'Joined', sortable: true, render: (val) => formatDate(val) },
    { key: 'salary', label: 'Salary', render: (val) => formatCurrency(val) },
    {
      key: 'status', label: 'Status',
      render: (val = 'active') => <Badge variant={classifyStatus(val)} dot>{val}</Badge>,
    },
    {
  key: "id",
  label: "",
  render: (_, row) => (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(`/hr/employees/${row.id}`)}
      >
        View
      </button>

      <button
        className="btn btn-ghost btn-sm text-red-500"
        onClick={() => {
          if (confirm("Remove employee?")) {
            deleteMutation.mutate(row.id);
          }
        }}
      >
        Remove
      </button>
    </div>
  ),
},
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Employees</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} total employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add Employee
        </button>
      </div>
      <FilterBar
        searchPlaceholder="Search by name, ID, email..."
        filters={[
          { key: 'department', label: 'Department', options: ['Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'Marketing'].map(v => ({ label: v, value: v })) },
          { key: 'status', label: 'Status', options: ['active', 'inactive', 'on_leave'].map(v => ({ label: v, value: v })) },
        ]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />
      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.employees || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          sortKey={params.sortKey}
          sortDir={params.sortDir}
          onSort={(k, d) => setParams(p => ({ ...p, sortKey: k, sortDir: d }))}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          onRowClick={(row) => navigate(`/hr/employees/${row.id}`)}
          emptyTitle="No employees yet"
          emptyDescription="Add your first employee to get started"
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="Add Employee"
        onSubmit={handleSubmit((d) => createMutation.mutate(d))}
        loading={createMutation.isPending}
        submitLabel="Create Employee"
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="input" placeholder="John" {...register('firstName')} />
              {errors.firstName && <p className="text-[11px] text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="input" placeholder="Doe" {...register('lastName')} />
              {errors.lastName && <p className="text-[11px] text-red-500">{errors.lastName.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="input" type="email" placeholder="john@company.com" {...register('email')} />
              {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+977 98XXXXXXXX" {...register('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input className="input" placeholder="e.g. Engineering" {...register('department')} />
              {errors.department && <p className="text-[11px] text-red-500">{errors.department.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Designation *</label>
              <input className="input" placeholder="e.g. Software Engineer" {...register('designation')} />
              {errors.designation && <p className="text-[11px] text-red-500">{errors.designation.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Join Date *</label>
              <input className="input" type="date" {...register('joinDate')} />
              {errors.joinDate && <p className="text-[11px] text-red-500">{errors.joinDate.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Salary (NPR) *</label>
              <input className="input" type="number" placeholder="0" {...register('salary')} />
              {errors.salary && <p className="text-[11px] text-red-500">{errors.salary.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input className="input" placeholder="e.g. EMP-001" {...register('employeeId')} />
            </div>
          </div>
        </div>
      </FormModal>
      
    </div>
  )
}