import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Truck,
  FileText,
  DollarSign,
  User,
  Building2
} from 'lucide-react'

import { procurementAPI } from '@/api/procurement.api'
import Badge from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import {
  formatDate,
  formatCurrency,
  classifyStatus,
} from '@/lib/utils'

export default function PurchaseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: order, isLoading } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () =>
      procurementAPI.getPurchaseOrder(id).then((res) => res.data),
  })

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--border)] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!order) return null

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
    },
    {
      key: 'items',
      label: 'Items',
    },
    {
      key: 'timeline',
      label: 'Timeline',
    },
  ]

  return (
    <div className="animate-fade-in">

      {/* Header */}

      <div className="page-header">

        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate('/procurement')}
            className="btn btn-ghost btn-icon"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h1
              className="text-[18px] font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {order.poNumber}
            </h1>

            <p
              className="text-[12px]"
              style={{ color: 'var(--text-muted)' }}
            >
              Purchase Order
            </p>
          </div>

          <Badge
            variant={classifyStatus(order.status)}
            dot
          >
            {order.status}
          </Badge>

        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() =>
            navigate(`/procurement/orders/${id}/edit`)
          }
        >
          Edit Purchase
        </button>

      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">

        {/* Main */}

        <div className="flex-1 card overflow-hidden">

          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="p-5">

            {activeTab === 'overview' && (

              <div className="grid sm:grid-cols-2 gap-5">

                <Field
                  label="Vendor"
                  value={order.vendor?.name}
                  icon={<Building2 size={13} />}
                />

                <Field
                  label="Order Date"
                  value={formatDate(order.orderDate)}
                  icon={<Calendar size={13} />}
                />

                <Field
                  label="Expected Delivery"
                  value={formatDate(order.expectedDelivery)}
                  icon={<Truck size={13} />}
                />

                <Field
                  label="Created By"
                  value={order.createdBy?.name}
                  icon={<User size={13} />}
                />

                <Field
                  label="Total Amount"
                  value={formatCurrency(order.totalAmount)}
                  icon={<DollarSign size={13} />}
                />

                <Field
                  label="Notes"
                  value={order.notes}
                  icon={<FileText size={13} />}
                />

              </div>

            )} 
                        {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className="border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <tr>
                      <th className="text-left py-3 text-[12px]">Item</th>
                      <th className="text-center py-3 text-[12px]">Qty</th>
                      <th className="text-right py-3 text-[12px]">
                        Unit Price
                      </th>
                      <th className="text-right py-3 text-[12px]">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.items?.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <td className="py-4">
                          <p className="font-medium">{item.name}</p>
                        </td>

                        <td className="text-center">
                          {item.quantity}
                        </td>

                        <td className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>

                        <td className="text-right font-semibold">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  className="flex justify-end mt-6 border-t pt-4"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="text-right">
                    <p
                      className="text-[12px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Grand Total
                    </p>

                    <p
                      className="text-xl font-bold"
                      style={{ color: 'var(--primary)' }}
                    >
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="flex flex-col gap-4">

                <TimelineItem
                  title="Purchase Order Created"
                  value={formatDate(order.createdAt)}
                />

                {order.approvedAt && (
                  <TimelineItem
                    title="Approved"
                    value={formatDate(order.approvedAt)}
                  />
                )}

                {order.receivedDate && (
                  <TimelineItem
                    title="Received"
                    value={formatDate(order.receivedDate)}
                  />
                )}

                {order.cancelledAt && (
                  <TimelineItem
                    title="Cancelled"
                    value={formatDate(order.cancelledAt)}
                  />
                )}

              </div>
            )}

          </div>
        </div>

        {/* Sidebar */}

        <div className="w-full lg:w-72 flex flex-col gap-4">

          <div className="card p-4">

            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Quick Info
            </p>

            <dl className="flex flex-col gap-4">

              <div>
                <dt
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  PO Number
                </dt>

                <dd className="font-mono font-semibold">
                  {order.poNumber}
                </dd>
              </div>

              <div>
                <dt
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Vendor
                </dt>

                <dd>{order.vendor?.name || '—'}</dd>
              </div>

              <div>
                <dt
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Status
                </dt>

                <dd>
                  <Badge
                    variant={classifyStatus(order.status)}
                    dot
                  >
                    {order.status}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Total
                </dt>

                <dd
                  className="font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {formatCurrency(order.totalAmount)}
                </dd>
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
      <p
        className="text-[11px] font-medium uppercase tracking-wide mb-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>

      <p
        className="text-[13px] flex items-center gap-2"
        style={{
          color: value
            ? 'var(--text-primary)'
            : 'var(--text-muted)',
        }}
      >
        {icon}
        {value || '—'}
      </p>
    </div>
  )
}

function TimelineItem({ title, value }) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border"
      style={{ borderColor: 'var(--border)' }}
    >
      <p className="font-medium">{title}</p>
      <p
        className="text-[12px]"
        style={{ color: 'var(--text-muted)' }}
      >
        {value}
      </p>
    </div>
  )
}