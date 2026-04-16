import { cn } from '@/lib/cn'

export default function Container({ className, children, size = 'default' }) {
  const maxW =
    size === 'narrow' ? 'max-w-[880px]'
    : size === 'wide' ? 'max-w-[1320px]'
    : 'max-w-[1200px]'
  return <div className={cn('w-full mx-auto px-5 sm:px-8', maxW, className)}>{children}</div>
}
