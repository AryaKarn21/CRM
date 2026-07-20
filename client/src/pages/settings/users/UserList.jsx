import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { settingsAPI } from '@/api/settings.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = ['super_admin', 'admin', 'manager', 'employee', 'accountant']

export default function UserList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useState({ search: '', role: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', params],
    queryFn: () => settingsAPI.getUsers(params).then((r) => r.data),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id) => settingsAPI.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deactivated')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to deactivate user'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => settingsAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete user'),
  })

  const users = data?.users || []
  const filtered = users.filter((u) => {
    const matchesSearch =
      !params.search ||
      u.name?.toLowerCase().includes(params.search.toLowerCase()) ||
      u.email?.toLowerCase().includes(params.search.toLowerCase())
    const matchesRole = !params.role || u.role === params.role
    return matchesSearch && matchesRole
  })

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{val}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (val) => <Badge variant="info">{val?.replace('_', ' ')}</Badge>,
    },
    {
      key: 'companies',
      label: 'Company',
      render: (val) => val?.map((c) => c.name).join(', ') || '—',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => <Badge variant={val ? 'success' : 'gray'} dot>{val ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (val) => formatDate(val),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/settings/users/${id}`)}>View</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/settings/users/${id}/edit`)}>Edit</button>
          {row.isActive && (
            <button
              className="btn btn-ghost btn-sm text-yellow-600"
              onClick={() => {
                if (confirm(`Deactivate ${row.name}?`)) deactivateMutation.mutate(id)
              }}
            >
              Deactivate
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm text-red-500"
            onClick={() => {
              if (confirm(`Permanently delete ${row.name}? This cannot be undone.`)) deleteMutation.mutate(id)
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} of {users.length} users
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/settings/users/new')}>
          <Plus size={14} /> Add User
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search by name or email..."
        filters={[{ key: 'role', label: 'Role', options: ROLE_OPTIONS.map((r) => ({ label: r.replace('_', ' '), value: r })) }]}
        values={params}
        onChange={(k, v) => setParams((p) => ({ ...p, [k]: v }))}
      />

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          total={filtered.length}
          loading={isLoading}
          error={error}
          onRowClick={(row) => navigate(`/settings/users/${row.id}`)}
          emptyTitle="No users found"
          emptyDescription="Add your first user to get started"
        />
      </div>
    </div>
  )
}