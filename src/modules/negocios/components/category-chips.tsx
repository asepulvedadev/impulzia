'use client'

import { cn } from '@/lib/utils/cn'
import * as LucideIcons from 'lucide-react'
import type { BusinessCategory } from '../interfaces'

interface CategoryChipsProps {
  categories: BusinessCategory[]
  activeSlug?: string | null
  onSelect: (slug: string | null) => void
}

function getCategoryIcon(iconName: string | null) {
  if (!iconName) return null
  const icons = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>
  const Icon = icons[iconName]
  return Icon ? <Icon className="h-3.5 w-3.5" /> : null
}

export function CategoryChips({ categories, activeSlug, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          !activeSlug
            ? 'bg-brand-primary-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
        )}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.slug)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            activeSlug === cat.slug
              ? 'bg-brand-primary-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
          )}
        >
          {getCategoryIcon(cat.icon)}
          {cat.name}
        </button>
      ))}
    </div>
  )
}
