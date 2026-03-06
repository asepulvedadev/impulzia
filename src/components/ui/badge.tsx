import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-primary-600 text-white',
        accent: 'border-transparent bg-brand-accent-500 text-white',
        success: 'border-transparent bg-brand-success-500 text-white',
        warning: 'border-transparent bg-brand-warning-500 text-white',
        error: 'border-transparent bg-brand-error-600 text-white',
        outline: 'border-card-border text-foreground',
        secondary: 'border-transparent bg-slate-800 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
