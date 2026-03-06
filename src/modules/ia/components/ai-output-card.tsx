'use client'
import React from 'react'
import { Copy, Check, Star, Trash2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StreamingText } from './streaming-text'
import type { AiGeneration } from '../interfaces'

interface AiOutputCardProps {
  generation: Pick<AiGeneration, 'id' | 'tool' | 'output_text' | 'is_favorite' | 'rating' | 'created_at'>
  isStreaming?: boolean
  streamingText?: string
  onToggleFavorite?: (id: string, current: boolean) => void
  onDelete?: (id: string) => void
  onCopy?: (text: string) => void
  className?: string
}

export function AiOutputCard({
  generation,
  isStreaming = false,
  streamingText,
  onToggleFavorite,
  onDelete,
  onCopy,
  className,
}: AiOutputCardProps) {
  const [copied, setCopied] = React.useState(false)
  const text = streamingText ?? generation.output_text ?? ''

  const handleCopy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    onCopy?.(text)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('rounded-xl border border-white/10 bg-slate-800/60 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-brand-primary-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary-400 animate-pulse" />
              Generando...
            </span>
          )}
          {!isStreaming && <span className="text-xs text-slate-400">Resultado</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40"
            title="Copiar"
          >
            {copied ? <Check className="w-4 h-4 text-brand-success-400" /> : <Copy className="w-4 h-4" />}
          </button>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(generation.id, generation.is_favorite)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                generation.is_favorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-700',
              )}
              title={generation.is_favorite ? 'Quitar favorito' : 'Marcar favorito'}
            >
              <Star className={cn('w-4 h-4', generation.is_favorite && 'fill-current')} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(generation.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {text ? (
          <StreamingText text={text} isStreaming={isStreaming} />
        ) : (
          <p className="text-sm text-slate-500 italic">Sin contenido generado aún</p>
        )}
      </div>

      {/* Use in ad/incentive link */}
      {!isStreaming && text && (
        <div className="px-4 pb-3">
          <a
            href={`/panel/anuncios/nuevo?content=${encodeURIComponent(text.slice(0, 200))}`}
            className="inline-flex items-center gap-1.5 text-xs text-brand-primary-400 hover:text-brand-primary-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Usar en un anuncio
          </a>
        </div>
      )}
    </div>
  )
}
