'use client'
import React from 'react'
import { TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { AiOutputCard } from '@/modules/ia/components/ai-output-card'
import type { AiGeneration } from '@/modules/ia/interfaces'

export default function PriceAssistantPage() {
  const [businessId, setBusinessId] = React.useState('')
  const [productOrService, setProductOrService] = React.useState('')
  const [currentPrice, setCurrentPrice] = React.useState('')
  const [costPrice, setCostPrice] = React.useState('')
  const [competitorPrice, setCompetitorPrice] = React.useState('')
  const [targetMargin, setTargetMargin] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState('')
  const [generationResult, setGenerationResult] = React.useState<Pick<AiGeneration, 'id' | 'tool' | 'output_text' | 'is_favorite' | 'rating' | 'created_at'> | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch('/api/ai/templates?tool=price_assistant')
      .then((r) => r.json())
      .then((data: { businessId?: string }) => { if (data.businessId) setBusinessId(data.businessId) })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsGenerating(true)
    setStreamingText('')
    setGenerationResult(null)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'price_assistant', businessId, productOrService, currentPrice, costPrice, competitorPrice, targetMargin }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        setError(data.error ?? 'Error en análisis')
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
              const data = JSON.parse(line.slice(6)) as { chunk?: string; generationId?: string; error?: string }
              if (data.chunk) { fullText += data.chunk; setStreamingText(fullText) }
              if (data.generationId) generationId = data.generationId
              if (data.error) { setError(data.error); break }
            } catch { /* ignore */ }
          }
        }
      }

      setGenerationResult({ id: generationId, tool: 'price_assistant', output_text: fullText, is_favorite: false, rating: null, created_at: new Date().toISOString() })
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
          <TrendingUp className="w-5 h-5 text-rose-400" />
          Asistente de Precios
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-800/60 p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Producto o servicio</label>
            <input type="text" value={productOrService} onChange={(e) => setProductOrService(e.target.value)} placeholder="ej: Hamburguesa doble" required maxLength={200} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Precio actual (COP)</label>
              <input type="text" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="25000" required pattern="^\d+(\.\d{1,2})?$" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Costo (COP)</label>
              <input type="text" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="10000" required pattern="^\d+(\.\d{1,2})?$" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Precio competencia (opcional)</label>
              <input type="text" value={competitorPrice} onChange={(e) => setCompetitorPrice(e.target.value)} placeholder="22000" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Margen objetivo % (opcional)</label>
              <input type="text" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} placeholder="60" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500" />
            </div>
          </div>
          <button type="submit" disabled={isGenerating || !productOrService.trim() || !currentPrice.trim() || !costPrice.trim()} className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Analizando...</> : <><TrendingUp className="w-4 h-4" /> Analizar precio</>}
          </button>
        </form>

        <div className="space-y-4">
          {error && <div className="rounded-lg bg-rose-900/40 border border-rose-700/50 p-3 text-sm text-rose-300">{error}</div>}
          {(isGenerating || generationResult) && (
            <AiOutputCard
              generation={generationResult ?? { id: 'streaming', tool: 'price_assistant', output_text: null, is_favorite: false, rating: null, created_at: new Date().toISOString() }}
              isStreaming={isGenerating}
              streamingText={streamingText || undefined}
            />
          )}
          {!isGenerating && !generationResult && !error && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">El análisis aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
