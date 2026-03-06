'use client'
import React from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewResponderFormProps {
  businessId: string
  onGenerate: (params: {
    reviewText: string
    rating: number
    reviewerName: string
    tone: 'formal' | 'amigable' | 'profesional'
  }) => void
  isGenerating?: boolean
}

const TONES = [
  { value: 'amigable', label: 'Amigable' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'formal', label: 'Formal' },
] as const

export function ReviewResponderForm({
  businessId,
  onGenerate,
  isGenerating = false,
}: ReviewResponderFormProps) {
  const [reviewText, setReviewText] = React.useState('')
  const [rating, setRating] = React.useState(5)
  const [reviewerName, setReviewerName] = React.useState('')
  const [tone, setTone] = React.useState<'formal' | 'amigable' | 'profesional'>('amigable')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    onGenerate({ reviewText, rating, reviewerName, tone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Texto de la reseña</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Pega aquí la reseña del cliente..."
          maxLength={1000}
          rows={4}
          required
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500 resize-none"
        />
        <p className="text-xs text-slate-500 text-right">{reviewText.length}/1000</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Calificación</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={cn(
                  'text-lg transition-colors',
                  star <= rating ? 'text-yellow-400' : 'text-slate-600',
                )}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Nombre del cliente</label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="ej: María G."
            maxLength={100}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Tono de respuesta</label>
        <div className="flex gap-2">
          {TONES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTone(value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs border transition-colors',
                tone === value
                  ? 'bg-brand-primary-600 border-brand-primary-500 text-white'
                  : 'border-slate-600 text-slate-400 hover:border-slate-400',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name="businessId" value={businessId} />

      <button
        type="submit"
        disabled={isGenerating || !reviewText.trim()}
        className="w-full flex items-center justify-center gap-2 bg-brand-primary-600 hover:bg-brand-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando respuesta...
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            Generar respuesta
          </>
        )}
      </button>
    </form>
  )
}
