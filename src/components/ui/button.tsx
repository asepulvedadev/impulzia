import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-brand-primary-600 text-white shadow-lg shadow-brand-primary-600/20 hover:bg-brand-primary-700 hover:scale-105',
        accent:
          'bg-brand-accent-500 text-white shadow-lg shadow-brand-accent-500/20 hover:bg-brand-accent-600 hover:scale-105',
        outline:
          'border-2 border-card-border bg-transparent hover:bg-brand-primary-900/20 hover:scale-105',
        ghost: 'hover:bg-brand-primary-900/20',
        link: 'text-brand-primary-600 underline-offset-4 hover:underline',
        destructive:
          'bg-brand-error-600 text-white shadow-lg shadow-brand-error-600/20 hover:bg-brand-error-700 hover:scale-105',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        default: 'h-11 px-6 py-2.5',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
