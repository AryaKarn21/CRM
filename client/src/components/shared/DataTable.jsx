import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/lib/utils'

export default function DataTable({
  columns,        // [{ key, label, render, sortable, width }]
  data = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  emptyTitle = 'No records found',
  emptyDescription = '',
  onRowClick,
}) {
  const handleSort = (key) => {
    if (!onSort) return
    if (sortKey === key) {
      onSort(key, sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(key, 'asc')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Spinner />
    </div>
  )

  if (error) return (
    <div className="text-center py-20" style={{ color: 'var(--danger)' }}>
      <p className="text-[13px]">Failed to load data. Please try again.</p>
    </div>
  )

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(col.sortable && 'cursor-pointer select-none hover:bg-[var(--border)]')}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        : <ChevronsUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row._id || i}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {total > pageSize && (
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <Pagination
            total={total}
            page={page}
            pageSize={pageSize}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}