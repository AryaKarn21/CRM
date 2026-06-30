import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ label, error, icon: Icon, suffix, className, required, ...props }, ref) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            <Icon size={14} />
          </span>
        )}
        <input
          ref={ref}
          className={cn('input', Icon && 'pl-9', suffix && 'pr-10', error && 'border-red-400 focus:border-red-400', className)}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input