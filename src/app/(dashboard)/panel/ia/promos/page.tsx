'use client'
import React from 'react'
import { Lightbulb, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { AiOutputCard } from '@/modules/ia/components/ai-output-card'
import type { AiGeneration } from '@/modules/ia/interfaces'

export default function PromoIdeasPage() {
  const [businessId, setBusinessId] = React.useState('')
  const [templateId, setTemplateId] = React.useState('placeholder')
  const [numIdeas, setNumIdeas] = React.useState(5)
  const [budget, setBudget] = React.useState('')
  const [targetAudience, setTargetAudience] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState('')
  const [generationResult, setGenerationResult] = React.useState<Pick<
    AiGeneration,
    'id' | 'tool' | 'output_text' | 'is_favorite' | 'rating' | 'created_at'
  > | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch('/api/ai/templates?tool=promo_ideas')
      .then((r) => r.json())
      .then((data: { businessId?: string; templates?: Array<{ id: string }> }) => {
        if (data.businessId) setBusinessId(data.businessId)
        if (data.templates?.[0]) setTemplateId(data.templates[0].id)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budget.trim() || !targetAudience.trim()) return

    setIsGenerating(true)
    setStreamingText('')
    setGenerationResult(null)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'promo_ideas',
          businessId,
          templateId,
          numIdeas,
          budget,
          targetAudience,
          additionalVariables: {},
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setError(data.error ?? 'Error generando ideas')
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
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                chunk?: string
                generationId?: string
                error?: string
              }
              if (data.chunk) {
                fullText += data.chunk
                setStreamingText(fullText)
              }
              if (data.generationId) generationId = data.generationId
              if (data.error) {
                setError(data.error)
                break
              }
            } catch {
              /* ignore */
            }
          }
        }
      }

      setGenerationResult({
        id: generationId,
        tool: 'promo_ideas',
        output_text: fullText,
        is_favorite: false,
        rating: null,
        created_at: new Date().toISOString(),
      })
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
        <Link href="/panel/ia" className="text-slate-400 hover:text-white text-sm">
          ← IA
        </Link>
        <span className="text-slate-600">/</span>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-brand-accent-400" />
          Ideas de Promociones
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/10 bg-slate-800/60 p-5 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Número de ideas</label>
            <input
              type="number"
              min={1}
              max={10}
              value={numIdeas}
              onChange={(e) => setNumIdeas(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Presupuesto aproximado (COP)
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="ej: 500000"
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Público objetivo</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="ej: Familias jóvenes de Cúcuta"
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !budget.trim() || !targetAudience.trim()}
            className="w-full flex items-center justify-center gap-2 bg-brand-accent-600 hover:bg-brand-accent-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generando...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" /> Generar ideas
              </>
            )}
          </button>
        </form>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-900/40 border border-rose-700/50 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}
          {(isGenerating || generationResult) && (
            <AiOutputCard
              generation={
                generationResult ?? {
                  id: 'streaming',
                  tool: 'promo_ideas',
                  output_text: null,
                  is_favorite: false,
                  rating: null,
                  created_at: new Date().toISOString(),
                }
              }
              isStreaming={isGenerating}
              streamingText={streamingText || undefined}
            />
          )}
          {!isGenerating && !generationResult && !error && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Las ideas aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
