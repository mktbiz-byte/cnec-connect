import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { className, label, hint, error, leftAddon, rightAddon, as = 'input', ...props },
  ref,
) {
  const Tag = as
  const inputCls = cn(
    'w-full h-12 px-4 text-[15px] bg-white border rounded-[12px] transition-colors',
    'placeholder:text-[#9CA3AF] text-[#0B0B1A]',
    'focus:outline-none focus:border-[#5B47FB] focus:ring-4 focus:ring-[#5B47FB]/10',
    error ? 'border-[#FF5A5A]' : 'border-[#E5E7EB] hover:border-[#D1D5DB]',
    as === 'textarea' && 'h-auto py-3 min-h-[120px] resize-y leading-relaxed',
    className,
  )

  return (
    <label className="block">
      {label && <span className="block text-[13px] font-semibold text-[#333452] mb-1.5">{label}</span>}
      <div className={cn('relative', (leftAddon || rightAddon) && 'flex items-center')}>
        {leftAddon && (
          <span className="absolute left-3.5 text-[#6B7280] pointer-events-none">{leftAddon}</span>
        )}
        <Tag ref={ref} className={cn(inputCls, leftAddon && 'pl-10', rightAddon && 'pr-10')} {...props} />
        {rightAddon && <span className="absolute right-3.5 text-[#6B7280]">{rightAddon}</span>}
      </div>
      {hint && !error && <span className="block text-[12px] text-[#6B7280] mt-1.5">{hint}</span>}
      {error && <span className="block text-[12px] text-[#FF5A5A] mt-1.5">{error}</span>}
    </label>
  )
})

export default Input
