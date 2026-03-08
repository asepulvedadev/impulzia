'use client'

import { cn } from '@/lib/utils/cn'
import * as LucideIcons from 'lucide-react'
import type { BusinessCategory } from '../interfaces'

interface CategoryChipsProps {
  categories: BusinessCategory[]
  activeSlug?: string | null
  onSelect: (slug: string | null) => void
}

function getCategoryIcon(iconName: string | null): LucideIcons.LucideIcon | null {
  if (!iconName) return null
  const icons = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>
  return icons[iconName] ?? null
}

export function CategoryChips({ categories, activeSlug, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          !activeSlug
            ? 'bg-brand-primary-900/30 text-brand-primary-300'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
        )}
      >
        Todas
      </button>

      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug
        const Icon = getCategoryIcon(cat.icon)
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.slug)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-primary-900/30 text-brand-primary-300'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
