import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
} as const

const iconSizes = {
  sm: 14,
  md: 20,
  lg: 28,
} as const

interface LogoProps {
  size?: keyof typeof sizeClasses
  collapsed?: boolean
  className?: string
}

export function Logo({ size = 'md', collapsed = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <Zap
        size={iconSizes[size]}
        className="shrink-0 text-brand-accent-500 fill-brand-accent-500"
        strokeWidth={2.5}
      />
      <span
        data-testid="logo-text"
        className={cn(
          'inline-flex overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
          collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-1',
        )}
      >
        <span className={cn('font-heading font-extrabold tracking-tight', sizeClasses[size])}>
          <span className="text-brand-primary-600">IMPULZ</span>
          <span className="text-brand-accent-500">IA</span>
        </span>
      </span>
    </div>
  )
}
