import { getInitials, cn } from '@/lib/utils'

const COLORS = [
  ['#dbeafe', '#1d4ed8'], ['#dcfce7', '#15803d'], ['#fef3c7', '#b45309'],
  ['#fce7f3', '#be185d'], ['#ede9fe', '#7c3aed'], ['#ffedd5', '#c2410c'],
]

function colorFromStr(str = '') {
  const i = str.charCodeAt(0) % COLORS.length
  return COLORS[i]
}

export default function Avatar({ name = '', src, size = 'md', className }) {
  const [bg, text] = colorFromStr(name)
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm', xl: 'w-14 h-14 text-base' }

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)} />
  }

  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizes[size], className)}
      style={{ background: bg, color: text }}
    >
      {getInitials(name)}
    </div>
  )
}