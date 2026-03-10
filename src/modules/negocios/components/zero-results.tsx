'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, ArrowRight, Lightbulb } from 'lucide-react'
import { useTracker } from '@/hooks/use-tracker'

interface ZeroResultsProps {
  query: string
  neighborhood?: string
}

interface GeminiSuggestion {
  intent: string
  suggestions: string[]
  categories: { slug: string; label: string }[]
  tip: string
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('rco_session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('rco_session_id', id)
  }
  return id
}

export function ZeroResults({ query, neighborhood }: ZeroResultsProps) {
  const router = useRouter()
  const { track } = useTracker()
  const [data, setData] = useState<GeminiSuggestion | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSuggestions = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/search/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          neighborhood: neighborhood?.trim() || undefined,
          session_id: getSessionId(),
        }),
      })
      const json = await res.json() as GeminiSuggestion
      setData(json)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [query, neighborhood])

  useEffect(() => {
    void fetchSuggestions()
  }, [fetchSuggestions])

  const handleSuggestion = (suggestion: string) => {
    track({
      event_type: 'search_query',
      entity_type: 'search',
      metadata: { query: suggestion, source: 'gemini_suggestion', original_query: query },
    })
    const params = new URLSearchParams({ query: suggestion })
    if (neighborhood) params.set('neighborhood', neighborhood)
    router.push(`/explorar?${params.toString()}`)
  }

  const handleCategory = (slug: string) => {
    track({
      event_type: 'category_explore',
      entity_type: 'category',
      metadata: { category_slug: slug, source: 'gemini_suggestion', original_query: query },
    })
    router.push(`/explorar?category=${slug}`)
  }

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      {/* Icono */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
        <Search className="h-7 w-7 text-slate-500" />
      </div>

      <h3 className="text-xl font-bold text-white">
        Sin resultados para &ldquo;{query}&rdquo;
      </h3>

      {loading ? (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted">
            <Sparkles className="h-4 w-4 animate-pulse text-brand-primary-400" />
            Buscando alternativas con IA...
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mx-auto h-10 w-3/4 animate-pulse rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : data && (data.suggestions.length > 0 || data.categories.length > 0) ? (
        <div className="mt-8 space-y-6 text-left">
          {/* Intent */}
          {data.intent && (
            <p className="text-center text-sm text-slate-400">
              Quizás buscas:{' '}
              <span className="font-medium text-slate-300">{data.intent}</span>
            </p>
          )}

          {/* Sugerencias de búsqueda */}
          {data.suggestions.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-brand-primary-400" />
                Prueba buscar
              </p>
              <div className="space-y-2">
                {data.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-brand-primary-700 hover:bg-brand-primary-900/10 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      {s}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categorías sugeridas */}
          {data.categories.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                O explora estas categorías
              </p>
              <div className="flex flex-wrap gap-2">
                {data.categories.map(({ slug, label }) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => handleCategory(slug)}
                    className="rounded-full border border-brand-primary-800/50 bg-brand-primary-900/20 px-4 py-1.5 text-sm font-medium text-brand-primary-300 transition-colors hover:bg-brand-primary-900/40 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          {data.tip && (
            <div className="flex items-start gap-2 rounded-xl border border-brand-accent-800/30 bg-brand-accent-900/10 px-4 py-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent-400" />
              <p className="text-sm text-slate-400">{data.tip}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            No hay resultados. Intenta con términos más generales o explora por categoría.
          </p>
          <button
            type="button"
            onClick={() => router.push('/explorar')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-700"
          >
            Ver todos los negocios
          </button>
        </div>
      )}
    </div>
  )
}
