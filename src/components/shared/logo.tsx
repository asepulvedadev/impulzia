import { cn } from '@/lib/utils/cn'

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
} as const

interface LogoProps {
  size?: keyof typeof sizeClasses
  collapsed?: boolean
  className?: string
}

export function Logo({ size = 'md', collapsed = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <span
        data-testid="logo-text"
        className={cn(
          'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100',
        )}
      >
        <span
          className={cn('tracking-widest text-white', sizeClasses[size])}
          style={{ fontFamily: 'var(--font-blanka)' }}
        >
          IKARUS
        </span>
      </span>
    </div>
  )
}
