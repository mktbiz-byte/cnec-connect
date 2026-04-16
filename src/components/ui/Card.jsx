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
    brand: 'bg-[#F3F1FF] text-[#4733D6]',
    accent: 'bg-[#F3F1FF] text-[#4733D6]',
    warn: 'bg-[#FFF4DE] text-[#8A5A00]',
    danger: 'bg-[#FFE4E4] text-[#C43434]',
    success: 'bg-[#ECFDF3] text-[#17804D]',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-semibold', tones[tone], className)}>
      {children}
    </span>
  )
}
