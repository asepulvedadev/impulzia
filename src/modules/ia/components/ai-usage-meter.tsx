'use client'
import { cn } from '@/lib/utils'
import { AI_TOOL_LABELS } from '@/lib/ai/config'
import type { UsageSummary } from '../interfaces'

interface AiUsageMeterProps {
  summaries: UsageSummary[]
  className?: string
}

export function AiUsageMeter({ summaries, className }: AiUsageMeterProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-slate-300">Uso este mes</h3>
      {summaries.map((s) => {
        const pct = s.isUnlimited
          ? 0
          : s.limit > 0
            ? Math.min(100, Math.round((s.usageCount / s.limit) * 100))
            : 0
        return (
          <div key={s.tool} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{AI_TOOL_LABELS[s.tool as keyof typeof AI_TOOL_LABELS]}</span>
              <span
                className={cn(
                  s.isUnlimited
                    ? 'text-brand-success-400'
                    : s.remaining === 0
                      ? 'text-rose-400'
                      : 'text-slate-400',
                )}
              >
                {s.isUnlimited ? '∞' : `${s.usageCount}/${s.limit}`}
              </span>
            </div>
            {!s.isUnlimited && (
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    pct >= 100
                      ? 'bg-rose-500'
                      : pct >= 80
                        ? 'bg-brand-accent-500'
                        : 'bg-brand-success-500',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
