import { cn } from '@/lib/utils'

const variants = {
  success: 'badge-success', warning: 'badge-warning',
  danger: 'badge-danger', info: 'badge-info', gray: 'badge-gray',
}

export default function Badge({ children, variant = 'gray', dot = false, className }) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-green-500': variant === 'success',
        'bg-yellow-500': variant === 'warning',
        'bg-red-500': variant === 'danger',
        'bg-blue-500': variant === 'info',
        'bg-gray-400': variant === 'gray',
      })} />}
      {children}
    </span>
  )
}