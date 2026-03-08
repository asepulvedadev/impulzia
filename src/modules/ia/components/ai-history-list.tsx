'use client'
import React from 'react'
import { Star, Trash2, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AI_TOOL_LABELS } from '@/lib/ai/config'
import type { AiGeneration } from '../interfaces'

interface AiHistoryListProps {
  generations: AiGeneration[]
  onToggleFavorite?: (id: string, current: boolean) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export function AiHistoryList({
  generations,
  onToggleFavorite,
  onDelete,
  isLoading = false,
}: AiHistoryListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-800/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-sm">No hay generaciones aún</p>
        <p className="text-xs mt-1">Usa las herramientas de IA para empezar</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {generations.map((gen) => (
        <div
          key={gen.id}
          className="rounded-xl border border-white/10 bg-slate-800/60 p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-primary-400">
              {AI_TOOL_LABELS[gen.tool]}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy(gen.id, gen.output_text ?? '')}
                disabled={!gen.output_text}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                {copiedId === gen.id ? (
                  <Check className="w-3.5 h-3.5 text-brand-success-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(gen.id, gen.is_favorite)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    gen.is_favorite
                      ? 'text-yellow-400'
                      : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-700',
                  )}
                >
                  <Star className={cn('w-3.5 h-3.5', gen.is_favorite && 'fill-current')} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(gen.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {gen.output_text && (
            <p className="text-sm text-slate-300 line-clamp-3">{gen.output_text}</p>
          )}

          <p className="text-xs text-slate-600">
            {new Date(gen.created_at).toLocaleDateString('es-CO', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ))}
    </div>
  )
}
