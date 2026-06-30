import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Building2 } from 'lucide-react'
import { employeesAPI } from '@/api/employees.api'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { useState } from 'react'
import { formatDate, formatCurrency, classifyStatus } from '@/lib/utils'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesAPI.getById(id).then(r => r.data),
  })

  const { data: payslips } = useQuery({
    queryKey: ['employee-payslips', id],
    queryFn: () => employeesAPI.getPayslips(id).then(r => r.data),
    enabled: activeTab === 'payslips',
  })

  const { data: leaveData } = useQuery({
    queryKey: ['employee-leaves', id],
    queryFn: () => employeesAPI.getLeaves(id).then(r => r.data),
    enabled: activeTab === 'leaves',
  })

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-[var(--border)] animate-pulse" />)}
      </div>
    )
  }

  if (!employee) return null

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'payslips', label: 'Payslips' },
    { key: 'leaves', label: 'Leave History' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hr/employees')} className="btn btn-ghost btn-icon">
            <ArrowLeft size={16} />
          </button>
          <Avatar name={`${employee.firstName} ${employee.lastName}`} size="lg" src={employee.avatar} />
          <div>
            <h1 className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              {employee.designation} — {employee.department}
            </p>
          </div>
          <Badge variant={classifyStatus(employee.status || 'active')} dot>
            {employee.status || 'active'}
          </Badge>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/hr/employees/${id}/edit`)}>
          Edit Profile
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Main */}
        <div className="flex-1 min-w-0 card overflow-hidden">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          <div className="p-5">
            {activeTab === 'overview' && (
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Email" value={employee.email} icon={<Mail size={13} />} />
                <Field label="Phone" value={employee.phone} icon={<Phone size={13} />} />
                <Field label="Department" value={employee.department} icon={<Building2 size={13} />} />
                <Field label="Designation" value={employee.designation} />
                <Field label="Join Date" value={formatDate(employee.joinDate)} icon={<Calendar size={13} />} />
                <Field label="Salary" value={formatCurrency(employee.salary)} icon={<DollarSign size={13} />} />
                <Field label="Employee ID" value={employee.employeeId} />
                <Field label="Email" value={employee.email} />
              </div>
            )}

            {activeTab === 'payslips' && (
              <div className="flex flex-col gap-2">
                {payslips?.length ? payslips.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border hover:bg-[var(--surface-2)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{p.period}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Processed: {formatDate(p.processedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(p.netPay)}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Net Pay</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>No payslips yet</div>
                )}
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="flex flex-col gap-2">
                {leaveData?.leaves?.length ? leaveData.leaves.map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{l.leaveType}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatDate(l.startDate)} → {formatDate(l.endDate)}</p>
                    </div>
                    <Badge variant={classifyStatus(l.status)} dot>{l.status}</Badge>
                  </div>
                )) : (
                  <div className="py-10 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>No leave history</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-4">
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Quick Info</p>
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Employee ID</dt>
                <dd className="text-[13px] font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{employee.employeeId || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Join Date</dt>
                <dd className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(employee.joinDate)}</dd>
              </div>
              <div>
                <dt className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Gross Salary</dt>
                <dd className="text-[13px] font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(employee.salary)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, icon }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-[13px] flex items-center gap-1.5" style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
        {value || '—'}
      </p>
    </div>
  )
}