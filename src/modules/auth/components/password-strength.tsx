'use client'

import { cn } from '@/lib/utils/cn'

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']
const strengthColors = [
  'bg-slate-200',
  'bg-red-500',
  'bg-brand-accent-500',
  'bg-yellow-500',
  'bg-brand-success-500',
]

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password)

  if (!password) return null

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              level <= strength ? strengthColors[strength] : 'bg-slate-700',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted">{strengthLabels[strength]}</p>
    </div>
  )
}
