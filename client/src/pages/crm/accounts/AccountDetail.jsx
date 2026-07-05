import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { accountsAPI } from '@/api/accounts.api'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'

export default function AccountDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsAPI.getById(id).then(res => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => accountsAPI.delete(id),

    onSuccess: () => {
      toast.success('Account deleted')
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      })
      navigate('/crm/accounts')
    },
  })

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!account) {
    return <div className="p-6">Account not found.</div>
  }

  return (
    <div className="animate-fade-in">

      <div className="page-header">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button
              className="btn btn-ghost btn-icon"
              onClick={() => navigate('/crm/accounts')}
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className="text-[18px] font-bold">
                {account.name}
              </h1>

              <p className="text-[12px] text-gray-500">
                Account Details
              </p>
            </div>

          </div>

          <div className="flex gap-2">

            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/crm/accounts/${id}/edit`)}
            >
              <Edit size={14} />
              Edit
            </button>

            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('Delete this account?')) {
                  deleteMutation.mutate()
                }
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-6 p-6">

        <div className="col-span-2">

          <div className="card p-6">

            <h2 className="text-lg font-semibold mb-5">
              Account Information
            </h2>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <label className="text-gray-500 text-sm">Name</label>
                <p>{account.name || '-'}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Industry</label>
                <p>{account.industry || '-'}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Website</label>
                <p>{account.website || '-'}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Email</label>
                <p>{account.email || '-'}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Phone</label>
                <p>{account.phone || '-'}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Revenue</label>
                <p>{account.revenue || '-'}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Type</label>
                <Badge>
                  {account.type || 'General'}
                </Badge>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Assigned To</label>

                {account.assignedTo ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar
                      name={account.assignedTo.name}
                      size="sm"
                    />
                    <span>{account.assignedTo.name}</span>
                  </div>
                ) : (
                  <p>Unassigned</p>
                )}
              </div>

            </div>

            <div className="mt-6">

              <label className="text-gray-500 text-sm">
                Address
              </label>

              <p>
                {account.address || '-'}
              </p>

            </div>

          </div>

        </div>

        <div>

          <div className="card p-6">

            <h2 className="font-semibold mb-5">
              Account Details
            </h2>

            <div className="space-y-4">

              <div>
                <label className="text-gray-500 text-sm">
                  Created
                </label>

                <p>
                  {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">
                  Updated
                </label>

                <p>
                  {new Date(account.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">
                  Account ID
                </label>

                <p className="break-all">
                  {account.id}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}