import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { settingsAPI } from '@/api/settings.api'
import { Tabs } from '@/components/ui/Tabs'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { useForm } from 'react-hook-form'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
//import CompanyTable from '@/components/settings/CompanyTable'
import { useAuthStore } from '@/store/auth.store'
import { authAPI } from '@/api/auth.api'
const TABS = [
  { key: 'company', label: 'Company' },
  { key: 'users', label: 'Users' },
  { key: 'roles', label: 'Roles & Permissions' },
  { key: 'audit', label: 'Audit Log' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage your company and platform settings
          </p>
        </div>
      </div>

      <div className="mx-6 mt-4 mb-6 card overflow-hidden">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div className="p-6">
          {activeTab === 'company' && <CompanyTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'roles' && <RolesTab />}
          {activeTab === 'audit' && <AuditTab />}
        </div>
      </div>
    </div>
  )
}
function CompanyTab() {
  const queryClient = useQueryClient()

  const [showDialog, setShowDialog] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const { refreshCompanies } = useAuthStore()
  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      industry: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      currency: 'NPR',
      timezone: 'Asia/Kathmandu',
    },
  })
  useEffect(() => {
    if (editingCompany) {
      reset({
        name: editingCompany.name || '',
        industry: editingCompany.industry || '',
        website: editingCompany.website || '',
        email: editingCompany.email || '',
        phone: editingCompany.phone || '',
        address: editingCompany.address || '',
        currency: editingCompany.currency || 'NPR',
        timezone: editingCompany.timezone || 'Asia/Kathmandu',
      })
    }
  }, [editingCompany, reset])
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: () => settingsAPI.getCompanies().then((res) => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => settingsAPI.deleteCompany(id),

    onSuccess: () => {
      toast.success('Company deleted')

      queryClient.invalidateQueries({
        queryKey: ['company-settings'],
      })
    },

    onError: () => {
      toast.error('Unable to delete company')
    },
  })
  const createMutation = useMutation({
    mutationFn: (data) => settingsAPI.addCompany(data),
    onSuccess: async () => {
      toast.success("Company created")

      queryClient.invalidateQueries({
        queryKey: ['company-settings']
      })
      const res = await authAPI.getProfile()

      refreshCompanies(res.data.companies)

      reset()

      setShowDialog(false)

      setEditingCompany(null)
    },


    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Unable to create company"
      )
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      settingsAPI.updateCompany(id, data),

    onSuccess: () => {
      toast.success("Company updated")

      queryClient.invalidateQueries({
        queryKey: ['company-settings'],
      })

      reset()
      setEditingCompany(null)
      setShowDialog(false)
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Unable to update company"
      )
    },
  })
  const onSubmit = (data) => {
    if (editingCompany) {
      updateMutation.mutate({
        id: editingCompany.id,
        data,
      })
    } else {
      createMutation.mutate(data)
    }
  }


  if (isLoading) {
    return (
      <div
        className="h-40 rounded-xl animate-pulse"
        style={{ background: "var(--border)" }}
      />
    )
  }

  return (
    <>
      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Companies
          </h2>

          <p
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Manage all companies
          </p>

        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            reset()

            setEditingCompany(null)

            setShowDialog(true)
          }}
        >
          + Add Company
        </button>

      </div>

      {/* Table */}

      <div className="card overflow-hidden">

        <table className="w-full">

          <thead>

            <tr
              style={{
                background: "var(--surface-2)",
              }}
            >

              <th className="text-left p-3">
                Company
              </th>

              <th className="text-left p-3">
                Industry
              </th>

              <th className="text-left p-3">
                Email
              </th>

              <th className="text-left p-3">
                Phone
              </th>

              <th className="text-center p-3">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {companies.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="text-center py-10"
                >
                  No companies found
                </td>

              </tr>

            ) : (

              companies.map((company) => (

                <tr
                  key={company.id}
                  className="border-t"
                  style={{
                    borderColor: "var(--border)",
                  }}
                >

                  <td className="p-3 font-medium">
                    {company.name}
                  </td>

                  <td className="p-3">
                    {company.industry || "-"}
                  </td>

                  <td className="p-3">
                    {company.email || "-"}
                  </td>

                  <td className="p-3">
                    {company.phone || "-"}
                  </td>

                  <td className="p-3">

                    <div className="flex justify-center gap-2">

                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          setEditingCompany(company)
                          setShowDialog(true)
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm text-red-500"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete ${company.name}?`
                            )
                          ) {
                            deleteMutation.mutate(company.id)
                          }
                        }}
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {showDialog && (

        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: "rgba(0,0,0,.5)",
          }}
        >

          <div
            className="card w-[500px] p-6"
          >

            <h2 className="text-xl font-bold mb-4">

              {editingCompany
                ? "Edit Company"
                : "Add Company"}

            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >

              <div>
                <label className="block text-sm mb-1">
                  Company Name
                </label>

                <input
                  {...register("name")}
                  className="input w-full"
                  placeholder="OS Group Pvt Ltd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm mb-1">
                    Industry
                  </label>

                  <input
                    {...register("industry")}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    Website
                  </label>

                  <input
                    className="input w-full"
                    //placeholder="https://example.com"
                    {...register("website")}
                  />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm mb-1">
                    Email
                  </label>

                  <input
                    className="input w-full"
                    placeholder="info@company.com"
                    {...register("email")}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    Phone
                  </label>

                  <input
                    {...register("phone")}
                    className="input w-full"
                    placeholder="+977..."
                  />
                </div>

              </div>

              <div>

                <label className="block text-sm mb-1">
                  Address
                </label>

                <textarea
                  {...register("address")}
                  rows={3}
                  className="input w-full"
                />

              </div>

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    reset()
                    setEditingCompany(null)
                    setShowDialog(false)
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingCompany ? "Update Company" : "Create Company"}
                </button>

              </div>

            </form>



          </div>

        </div>

      )}

    </>
  )
}

function UsersTab() {
  const [showDialog, setShowDialog] = useState(false)
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const [params, setParams] = useState({ page: 1, limit: 10 })
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['settings-users', params],
    queryFn: () => settingsAPI.getUsers(params).then(r => r.data),
  })
  const createUserMutation = useMutation({
  mutationFn: (data) => settingsAPI.createUser(data),

  onSuccess: () => {
    toast.success('User created successfully')

    queryClient.invalidateQueries({
      queryKey: ['settings-users'],
    })

    reset()

    setShowDialog(false)
  },

  onError: (err) => {
    toast.error(
      err.response?.data?.message ||
      'Unable to create user'
    )
  },
})
const onSubmit = (data) => {
  createUserMutation.mutate(data)
}

  const deactivateMutation = useMutation({
    //mutationFn: settingsAPI.deactivateUser,
    mutationFn: (id) => settingsAPI.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-users'] })
      toast.success('User deactivated')
    },
  })

  const columns = [
    {
      key: 'name', label: 'User',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Avatar name={val} size="sm" />
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: (val) => <Badge variant="info">{val?.replace('_', ' ')}</Badge>,
    },
    {
      key: 'status', label: 'Status',
      render: (val = 'active') => (
        <Badge variant={val === 'active' ? 'success' : 'gray'} dot>{val}</Badge>
      ),
    },
    {
      key: 'lastLogin', label: 'Last Login',
      render: (val) => val ? formatDate(val) : 'Never',
    },
    {
      key: 'id',
      label: 'Actions',
      render: (id) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/settings/users/${id}/edit`)
          }}
        >
          Edit
        </button>
      ),
    },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">
            Users
          </h2>

          <p className="text-sm">
            Manage all users
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowDialog(true)}
        >
          + Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.users || []}
        total={data?.total || 0}
        page={params.page}
        pageSize={params.limit}
        loading={isLoading}
        onPageChange={(page) =>
          setParams(p => ({ ...p, page }))
        }
        onRowClick={(row) => navigate(`/settings/users/${row.id}`)}
        emptyTitle="No users found"
      />
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,.5)" }}>

          <div className="card w-[500px] p-6">

            <h2 className="text-xl font-bold mb-5">
              Add User
            </h2>

           <form
  onSubmit={handleSubmit(onSubmit)}
  className="space-y-4"
>

  <div>
    <label>Name</label>

    <input
      className="input w-full"
      {...register('name', {
        required: 'Name is required',
      })}
    />

    {errors.name && (
      <p className="text-red-500 text-xs">
        {errors.name.message}
      </p>
    )}
  </div>

  <div>
    <label>Email</label>

    <input
      type="email"
      className="input w-full"
      {...register('email', {
        required: 'Email is required',
      })}
    />
  </div>

  <div>
    <label>Password</label>

    <input
      type="password"
      className="input w-full"
      {...register('password', {
        required: 'Password is required',
      })}
    />
  </div>

  <div>
    <label>Phone</label>

    <input
      className="input w-full"
      {...register('phone')}
    />
  </div>

  <div>
    <label>Role</label>

    <select
      className="input w-full"
      {...register('role')}
    >
      <option value="employee">Employee</option>
      <option value="manager">Manager</option>
      <option value="accountant">Accountant</option>
      <option value="admin">Admin</option>
      <option value="super_admin">Super Admin</option>
    </select>
  </div>

  <div className="flex justify-end gap-3">

    <button
      type="button"
      className="btn"
      onClick={() => {
        reset()
        setShowDialog(false)
      }}
    >
      Cancel
    </button>

    <button
      className="btn btn-primary"
      disabled={createUserMutation.isPending}
    >
      {createUserMutation.isPending
        ? 'Creating...'
        : 'Create User'}
    </button>

  </div>

</form>

            <button
              className="btn btn-primary mt-5"
              onClick={() => setShowDialog(false)}
            >
              Close
            </button>

          </div>

        </div>
      )}

    </>

  )

}

function RolesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => settingsAPI.getRoles().then(r => r.data),
  })

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-lg" style={{ background: 'var(--border)' }} />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {data?.roles?.map(role => (
        <div key={role.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {role.name}
              </p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {role.description}
              </p>
            </div>
            <Badge variant="info">{role.userCount} users</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {role.permissions?.map(p => (
              <span
                key={p}
                className="px-2 py-0.5 text-[11px] rounded-full font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )) || (
          <div className="text-center py-10 text-[13px]" style={{ color: 'var(--text-muted)' }}>
            No roles configured
          </div>
        )}
    </div>
  )
}

function AuditTab() {
  const [params] = useState({ page: 1, limit: 20 })

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => settingsAPI.getAuditLogs(params).then(r => r.data),
  })

  const columns = [
    {
      key: 'user', label: 'User',
      render: (val) => val ? (
        <div className="flex items-center gap-2">
          <Avatar name={val.name} size="xs" />
          <span className="text-[12px]">{val.name}</span>
        </div>
      ) : 'System',
    },
    {
      key: 'action', label: 'Action',
      render: (val) => <span className="font-medium text-[12px]">{val}</span>,
    },
    {
      key: 'resource', label: 'Resource',
      render: (val) => <Badge variant="gray">{val}</Badge>,
    },
    {
      key: 'ipAddress', label: 'IP',
      render: (val) => (
        <span className="font-mono text-[11px]">{val || '—'}</span>
      ),
    },
    {
      key: 'createdAt', label: 'Time',
      render: (val) => formatDate(val, 'MMM d, yyyy HH:mm'),
    },

  ]

  return (
    <DataTable
      columns={columns}
      data={data?.logs || []}
      total={data?.total || 0}
      loading={isLoading}
      emptyTitle="No audit logs"


    />
  )
}