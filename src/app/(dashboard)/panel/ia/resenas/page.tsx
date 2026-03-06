'use client'
import React from 'react'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { ReviewResponderForm } from '@/modules/ia/components/review-responder-form'
import { AiOutputCard } from '@/modules/ia/components/ai-output-card'
import type { AiGeneration } from '@/modules/ia/interfaces'

export default function ReviewResponderPage() {
  const [businessId, setBusinessId] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState('')
  const [generationResult, setGenerationResult] = React.useState<Pick<AiGeneration, 'id' | 'tool' | 'output_text' | 'is_favorite' | 'rating' | 'created_at'> | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch('/api/ai/templates?tool=review_responder')
      .then((r) => r.json())
      .then((data: { businessId?: string }) => { if (data.businessId) setBusinessId(data.businessId) })
      .catch(() => {})
  }, [])

  const handleGenerate = async (params: {
    reviewText: string
    rating: number
    reviewerName: string
    tone: 'formal' | 'amigable' | 'profesional'
  }) => {
    setIsGenerating(true)
    setStreamingText('')
    setGenerationResult(null)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'review_responder', businessId, ...params }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        setError(data.error ?? 'Error generando respuesta')
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let generationId = ''
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as { chunk?: string; done?: boolean; generationId?: string; error?: string }
              if (data.chunk) { fullText += data.chunk; setStreamingText(fullText) }
              if (data.generationId) generationId = data.generationId
              if (data.error) { setError(data.error); break }
            } catch { /* ignore */ }
          }
        }
      }

      setGenerationResult({ id: generationId, tool: 'review_responder', output_text: fullText, is_favorite: false, rating: null, created_at: new Date().toISOString() })
      setStreamingText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Link href="/panel/ia" className="text-slate-400 hover:text-white text-sm">← IA</Link>
        <span className="text-slate-600">/</span>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Responder Reseñas
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-slate-800/60 p-5">
          <ReviewResponderForm businessId={businessId} onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        <div className="space-y-4">
          {error && <div className="rounded-lg bg-rose-900/40 border border-rose-700/50 p-3 text-sm text-rose-300">{error}</div>}
          {(isGenerating || generationResult) && (
            <AiOutputCard
              generation={generationResult ?? { id: 'streaming', tool: 'review_responder', output_text: null, is_favorite: false, rating: null, created_at: new Date().toISOString() }}
              isStreaming={isGenerating}
              streamingText={streamingText || undefined}
            />
          )}
          {!isGenerating && !generationResult && !error && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">La respuesta aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
