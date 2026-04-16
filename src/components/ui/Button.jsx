import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-[#5B47FB] text-white hover:bg-[#4735D1] active:bg-[#3627A3] shadow-[0_8px_24px_-8px_rgba(91,71,251,0.55)]',
  secondary: 'bg-[#0B0B1A] text-white hover:bg-[#333452]',
  ghost: 'bg-transparent text-[#0B0B1A] hover:bg-[#F3F4F6]',
  outline: 'bg-white text-[#0B0B1A] border border-[#E5E7EB] hover:border-[#0B0B1A]',
  soft: 'bg-[#F3F1FF] text-[#4733D6] hover:bg-[#E5E0FF]',
  danger: 'bg-[#FF5A5A] text-white hover:bg-[#E04848]',
}

const sizes = {
  sm: 'h-9 px-3.5 text-[13px] rounded-[10px]',
  md: 'h-11 px-5 text-[14px] rounded-[12px]',
  lg: 'h-13 px-6 text-[15px] rounded-[14px]',
  xl: 'h-14 px-7 text-[16px] rounded-[14px]',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  fullWidth,
  leftIcon,
  rightIcon,
  loading,
  disabled,
  ...props
}) {
  return (
    <Tag
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5B47FB]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </Tag>
  )
}
