'use client'
import React from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiTemplate } from '../interfaces'

interface DescriptionGeneratorFormProps {
  templates: AiTemplate[]
  businessId: string
  onGenerate: (params: {
    templateId: string
    length: 'corta' | 'media' | 'larga'
    keywords: string
    highlight: string
    tone: string
  }) => void
  isGenerating?: boolean
}

const LENGTHS = [
  { value: 'corta', label: 'Corta', desc: '50-80 palabras' },
  { value: 'media', label: 'Media', desc: '100-150 palabras' },
  { value: 'larga', label: 'Larga', desc: '200-250 palabras' },
] as const

export function DescriptionGeneratorForm({
  templates,
  businessId,
  onGenerate,
  isGenerating = false,
}: DescriptionGeneratorFormProps) {
  const [templateId, setTemplateId] = React.useState(templates[0]?.id ?? '')
  const [length, setLength] = React.useState<'corta' | 'media' | 'larga'>('media')
  const [keywords, setKeywords] = React.useState('')
  const [highlight, setHighlight] = React.useState('')

  const selectedTpl = templates.find((t) => t.id === templateId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      templateId,
      length,
      keywords,
      highlight,
      tone: selectedTpl?.name ?? 'profesional',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Estilo de descripción</label>
        <div className="space-y-2">
          {templates.map((tpl) => (
            <label
              key={tpl.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                templateId === tpl.id
                  ? 'border-brand-primary-500 bg-brand-primary-500/10'
                  : 'border-slate-600 hover:border-slate-400',
              )}
            >
              <input
                type="radio"
                name="templateId"
                value={tpl.id}
                checked={templateId === tpl.id}
                onChange={() => setTemplateId(tpl.id)}
                className="mt-0.5 accent-brand-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-white">{tpl.name}</p>
                {tpl.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{tpl.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Longitud</label>
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLength(value)}
              className={cn(
                'py-2 px-3 rounded-lg border text-center transition-colors',
                length === value
                  ? 'border-brand-primary-500 bg-brand-primary-500/10 text-white'
                  : 'border-slate-600 text-slate-400 hover:border-slate-400',
              )}
            >
              <p className="text-xs font-medium">{label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Palabras clave (opcional)</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="ej: rápido, confiable, económico"
          maxLength={300}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">
          ¿Qué nos hace únicos? (opcional)
        </label>
        <textarea
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          placeholder="ej: 10 años de experiencia, atención personalizada..."
          maxLength={300}
          rows={2}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500 resize-none"
        />
      </div>

      <input type="hidden" name="businessId" value={businessId} />

      <button
        type="submit"
        disabled={isGenerating || !templateId}
        className="w-full flex items-center justify-center gap-2 bg-brand-success-600 hover:bg-brand-success-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando descripción...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Generar descripción
          </>
        )}
      </button>
    </form>
  )
}
