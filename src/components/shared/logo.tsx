import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

const sizeClasses = {
  sm: { text: 'text-xl', icon: 24 },
  md: { text: 'text-2xl', icon: 32 },
  lg: { text: 'text-4xl', icon: 48 },
} as const

interface LogoProps {
  size?: keyof typeof sizeClasses
  collapsed?: boolean
  className?: string
}

export function Logo({ size = 'md', collapsed = false, className }: LogoProps) {
  const { text, icon } = sizeClasses[size]
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/icono.png"
        alt="Rcomienda isotipo"
        width={icon}
        height={icon}
        className="shrink-0"
        priority
      />
      <span
        data-testid="logo-text"
        className={cn(
          'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100',
        )}
      >
        <span
          className={cn('tracking-widest text-white', text)}
          style={{ fontFamily: 'var(--font-blanka)' }}
        >
          Rcomienda
        </span>
      </span>
    </div>
  )
}
