import { cn } from '@/lib/cn'

export default function Card({ className, children, padded = true, hover = false, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cn(
        'bg-white border border-[#EEF0F4] rounded-[20px]',
        padded && 'p-6',
        hover && 'hover:-translate-y-0.5 hover:shadow-elevated transition-all',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function Badge({ children, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-[#F3F4F6] text-[#333452]',
    brand: 'bg-[#F2EFFF] text-[#4735D1]',
    accent: 'bg-[#DEFFF8] text-[#006E60]',
    warn: 'bg-[#FFF4DE] text-[#8A5A00]',
    danger: 'bg-[#FFE4E4] text-[#C43434]',
    success: 'bg-[#DEFFE5] text-[#0E7A3C]',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-semibold', tones[tone], className)}>
      {children}
    </span>
  )
}
