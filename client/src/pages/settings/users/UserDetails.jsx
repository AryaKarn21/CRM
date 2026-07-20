import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
} from 'lucide-react'

import { settingsAPI } from '@/api/settings.api'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default function UserDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () =>
      settingsAPI.getUserById(id).then(res => res.data),
  })

  if (isLoading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        User not found
      </div>
    )
  }

  return (
    <div className="animate-fade-in">

      <div className="page-header">

        <div className="flex items-center gap-3">

          <button
            className="btn btn-ghost"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft size={16} />
          </button>

          <Avatar
            name={user.name}
            size="lg"
          />

          <div>

            <h1
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {user.name}
            </h1>

            <p
              style={{ color: 'var(--text-muted)' }}
            >
              {user.role}
            </p>

          </div>

        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(`/settings/users/${id}/edit`)
          }
        >
          Edit User
        </button>

      </div>

      <div className="card m-6 p-6">

        <div className="grid grid-cols-2 gap-5">

          <Field
            label="Email"
            value={user.email}
            icon={<Mail size={14} />}
          />

          <Field
            label="Phone"
            value={user.phone}
            icon={<Phone size={14} />}
          />

          <Field
            label="Role"
            value={user.role}
            icon={<Shield size={14} />}
          />

          <Field
            label="Company"
            value={
              user.companies?.map(c => c.name).join(', ')
            }
            icon={<Building2 size={14} />}
          />

          <Field
            label="Created"
            value={formatDate(user.createdAt)}
            icon={<Calendar size={14} />}
          />

        </div>

        <div className="mt-6">

          {/* FIXED: was checking user.status, which isn't a real column
              on the User model — only isActive (boolean) exists, so this
              badge always rendered the 'gray'/fallback state regardless
              of the user's actual status. */}
          <Badge
            variant={
              user.isActive
                ? 'success'
                : 'gray'
            }
            dot
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>

        </div>

      </div>

    </div>
  )
}

function Field({ label, value, icon }) {
  return (
    <div>

      <p
        className="text-xs uppercase mb-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>

      <p
        className="flex items-center gap-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {icon}
        {value || '—'}
      </p>

    </div>
  )
}