'use client'
import Link from 'next/link'
import { Sparkles, Image, Lightbulb, FileText, MessageSquare, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiTool } from '../validations/ai.schema'
import type { UsageSummary } from '../interfaces'
import { AI_TOOL_LABELS } from '@/lib/ai/config'

interface ToolCard {
  tool: AiTool
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
}

const TOOLS: ToolCard[] = [
  {
    tool: 'post_generator',
    href: '/panel/ia/posts',
    icon: Sparkles,
    description: 'Crea posts para redes sociales en segundos',
    color: 'from-brand-primary-600 to-brand-primary-800',
  },
  {
    tool: 'photo_enhancer',
    href: '/panel/ia/fotos',
    icon: Image,
    description: 'Mejora tus fotos de productos automáticamente',
    color: 'from-purple-600 to-purple-800',
  },
  {
    tool: 'promo_ideas',
    href: '/panel/ia/promos',
    icon: Lightbulb,
    description: 'Ideas de promociones para tu negocio',
    color: 'from-brand-accent-500 to-brand-accent-700',
  },
  {
    tool: 'description_generator',
    href: '/panel/ia/descripciones',
    icon: FileText,
    description: 'Descripciones atractivas para tu negocio',
    color: 'from-brand-success-500 to-brand-success-700',
  },
  {
    tool: 'review_responder',
    href: '/panel/ia/resenas',
    icon: MessageSquare,
    description: 'Responde reseñas de clientes con IA',
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    tool: 'price_assistant',
    href: '/panel/ia/precios',
    icon: TrendingUp,
    description: 'Analiza y optimiza tus precios',
    color: 'from-rose-500 to-rose-700',
  },
]

interface AiToolsGridProps {
  usageSummaries?: UsageSummary[]
}

export function AiToolsGrid({ usageSummaries = [] }: AiToolsGridProps) {
  const getUsage = (tool: AiTool) => usageSummaries.find((u) => u.tool === tool)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOOLS.map(({ tool, href, icon: Icon, description, color }) => {
        const usage = getUsage(tool)
        const pct =
          usage && !usage.isUnlimited && usage.limit > 0
            ? Math.round((usage.usageCount / usage.limit) * 100)
            : 0
        const isAtLimit = usage && !usage.isUnlimited && usage.remaining === 0

        return (
          <Link
            key={tool}
            href={isAtLimit ? '#' : href}
            className={cn(
              'group relative flex flex-col gap-3 rounded-xl p-5 border border-white/10 bg-slate-800/60 hover:bg-slate-800/90 transition-all',
              isAtLimit && 'opacity-60 cursor-not-allowed pointer-events-none',
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                color,
              )}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div>
              <p className="font-semibold text-white text-sm">{AI_TOOL_LABELS[tool]}</p>
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            </div>

            {usage && (
              <div className="mt-auto">
                {usage.isUnlimited ? (
                  <p className="text-xs text-brand-success-400">Ilimitado</p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        {usage.usageCount} / {usage.limit} este mes
                      </span>
                      {isAtLimit && <span className="text-rose-400">Límite alcanzado</span>}
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct >= 100
                            ? 'bg-rose-500'
                            : pct >= 80
                              ? 'bg-brand-accent-500'
                              : 'bg-brand-success-500',
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
