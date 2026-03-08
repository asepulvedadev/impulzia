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

const chipBase =
  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors'
const chipActive =
  'border-brand-primary-600 bg-brand-primary-900/40 text-brand-primary-300'
const chipIdle =
  'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'

export function CategoryChips({ categories, activeSlug, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Todas */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(chipBase, !activeSlug ? chipActive : chipIdle)}
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
            className={cn(chipBase, isActive ? chipActive : chipIdle)}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
