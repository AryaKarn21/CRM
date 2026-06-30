import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Select = forwardRef(({ label, error, options = [], placeholder, required, className, ...props }, ref) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn('input', error && 'border-red-400', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select