import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'NPR') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '—'
  return format(new Date(date), fmt)
}

export function formatRelativeTime(date) {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function truncate(str, length = 40) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function classifyStatus(status) {
  const map = {
    active: 'success', open: 'info', closed: 'gray', won: 'success',
    lost: 'danger', pending: 'warning', approved: 'success',
    rejected: 'danger', new: 'info', inprogress: 'warning',
  }
  return map[status?.toLowerCase()] || 'gray'
}