
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FolderKanban } from 'lucide-react'
import { projectsAPI } from '@/api/projects.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import FormModal from '@/components/shared/FormModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/lib/validations'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProjectsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' })
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsAPI.getAll(params).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(projectSchema) })

  const createMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setModalOpen(false); reset(); toast.success('Project created') },
  })

  const deleteMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted') },
  })

  const columns = [
    {
      key: 'name', label: 'Project', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary-light)' }}>
            <FolderKanban size={14} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.client || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'startDate', label: 'Start', render: (val) => formatDate(val) },
    { key: 'endDate', label: 'Deadline', render: (val) => formatDate(val) },
    { key: 'budget', label: 'Budget', render: (val) => val ? formatCurrency(val) : '—' },
    {
      key: 'status', label: 'Status',
      render: (val = 'active') => <Badge variant={classifyStatus(val)} dot>{val}</Badge>,
    },
    {
      key: 'progress', label: 'Progress',
      render: (val = 0) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] min-w-[60px]">
            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${val}%` }} />
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{val}%</span>
        </div>
      ),
    },
    {
      key: 'id', label: '',
      render: (id) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${id}`)}>View</button>
          <button className="btn btn-ghost btn-sm text-red-500" onClick={() => { if (confirm('Delete project?')) deleteMutation.mutate(id) }}>Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Projects</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> New Project
        </button>
      </div>
      <FilterBar
        searchPlaceholder="Search projects..."
        filters={[{ key: 'status', label: 'Status', options: ['active', 'on_hold', 'completed', 'cancelled'].map(v => ({ label: v.replace('_', ' '), value: v })) }]}
        values={params}
        onChange={(k, v) => setParams(p => ({ ...p, [k]: v, page: 1 }))}
      />
      <div className="mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.projects || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
          onRowClick={(row) => navigate(`/projects/${row.id}`)}
          emptyTitle="No projects yet"
          emptyDescription="Create your first project to get started"
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="Create New Project"
        onSubmit={handleSubmit((d) => createMutation.mutate(d))}
        loading={createMutation.isPending}
        submitLabel="Create Project"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Project Name <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Enter project name" {...register('name')} />
            {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="input" rows={3} placeholder="Project description..." {...register('description')} />
          </div>
          <div className="form-group">
            <label className="form-label">Client</label>
            <input className="input" placeholder="Client name" {...register('client')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date <span className="text-red-500">*</span></label>
              <input type="date" className="input" {...register('startDate')} />
              {errors.startDate && <p className="text-[11px] text-red-500">{errors.startDate.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">End Date <span className="text-red-500">*</span></label>
              <input type="date" className="input" {...register('endDate')} />
              {errors.endDate && <p className="text-[11px] text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Budget</label>
            <input type="number" className="input" placeholder="0.00" {...register('budget')} />
          </div>
        </div>
      </FormModal>
    </div>
  )
}
