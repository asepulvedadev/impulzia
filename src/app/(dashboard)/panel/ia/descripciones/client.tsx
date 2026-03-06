'use client'
import React from 'react'
import { FileText } from 'lucide-react'
import { DescriptionGeneratorForm } from '@/modules/ia/components/description-generator-form'
import { AiOutputCard } from '@/modules/ia/components/ai-output-card'
import type { AiTemplate, AiGeneration } from '@/modules/ia/interfaces'

interface DescriptionGeneratorClientProps {
  templates: AiTemplate[]
  businessId: string
}

export function DescriptionGeneratorClient({ templates, businessId }: DescriptionGeneratorClientProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState('')
  const [generationResult, setGenerationResult] = React.useState<Pick<AiGeneration, 'id' | 'tool' | 'output_text' | 'is_favorite' | 'rating' | 'created_at'> | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleGenerate = async (params: {
    templateId: string
    length: 'corta' | 'media' | 'larga'
    keywords: string
    highlight: string
    tone: string
  }) => {
    setIsGenerating(true)
    setStreamingText('')
    setGenerationResult(null)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'description_generator', businessId, ...params }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        setError(data.error ?? 'Error generando descripción')
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

      setGenerationResult({ id: generationId, tool: 'description_generator', output_text: fullText, is_favorite: false, rating: null, created_at: new Date().toISOString() })
      setStreamingText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-white/10 bg-slate-800/60 p-5">
        <DescriptionGeneratorForm templates={templates} businessId={businessId} onGenerate={handleGenerate} isGenerating={isGenerating} />
      </div>
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-rose-900/40 border border-rose-700/50 p-3 text-sm text-rose-300">{error}</div>}
        {(isGenerating || generationResult) && (
          <AiOutputCard
            generation={generationResult ?? { id: 'streaming', tool: 'description_generator', output_text: null, is_favorite: false, rating: null, created_at: new Date().toISOString() }}
            isStreaming={isGenerating}
            streamingText={streamingText || undefined}
          />
        )}
        {!isGenerating && !generationResult && !error && (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">La descripción aparecerá aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}
