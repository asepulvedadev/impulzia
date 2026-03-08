'use client'
import React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AI_TONES, AI_SOCIAL_NETWORKS } from '../validations/ai.schema'
import type { AiTemplate } from '../interfaces'

interface PostGeneratorFormProps {
  templates: AiTemplate[]
  businessId: string
  onGenerate: (params: {
    templateId: string
    socialNetwork: string
    productOrService: string
    tone: string
  }) => void
  isGenerating?: boolean
}

export function PostGeneratorForm({
  templates,
  businessId,
  onGenerate,
  isGenerating = false,
}: PostGeneratorFormProps) {
  const [templateId, setTemplateId] = React.useState(templates[0]?.id ?? '')
  const [socialNetwork, setSocialNetwork] = React.useState('Instagram')
  const [productOrService, setProductOrService] = React.useState('')
  const [tone, setTone] = React.useState('amigable')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productOrService.trim()) return
    onGenerate({ templateId, socialNetwork, productOrService, tone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Template selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Plantilla</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
        {templates.find((t) => t.id === templateId)?.description && (
          <p className="text-xs text-slate-500">
            {templates.find((t) => t.id === templateId)!.description}
          </p>
        )}
      </div>

      {/* Social network */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Red social</label>
        <div className="flex flex-wrap gap-2">
          {AI_SOCIAL_NETWORKS.map((net) => (
            <button
              key={net}
              type="button"
              onClick={() => setSocialNetwork(net)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                socialNetwork === net
                  ? 'bg-brand-primary-600 border-brand-primary-500 text-white'
                  : 'border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200',
              )}
            >
              {net}
            </button>
          ))}
        </div>
      </div>

      {/* Product/service */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">¿Qué quieres promocionar?</label>
        <input
          type="text"
          value={productOrService}
          onChange={(e) => setProductOrService(e.target.value)}
          placeholder="ej: Hamburguesa doble con papas y bebida"
          maxLength={200}
          required
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
        />
      </div>

      {/* Tone */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Tono</label>
        <div className="flex flex-wrap gap-2">
          {AI_TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs border capitalize transition-colors',
                tone === t
                  ? 'bg-brand-accent-600 border-brand-accent-500 text-white'
                  : 'border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name="businessId" value={businessId} />

      <button
        type="submit"
        disabled={isGenerating || !productOrService.trim() || !templateId}
        className="w-full flex items-center justify-center gap-2 bg-brand-primary-600 hover:bg-brand-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generar post
          </>
        )}
      </button>
    </form>
  )
}
