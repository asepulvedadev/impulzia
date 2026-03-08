import { cn } from '@/lib/utils/cn'

export function BusinessCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 animate-pulse', className)}>
      <div className="aspect-[16/9] bg-slate-800" />
      <div className="flex flex-col gap-2 px-4 pb-4 pt-8">
        <div className="h-4 w-2/3 rounded bg-slate-800" />
        <div className="h-3 w-1/4 rounded bg-slate-800" />
        <div className="mt-1 space-y-1.5">
          <div className="h-3 w-full rounded bg-slate-800" />
          <div className="h-3 w-3/4 rounded bg-slate-800" />
        </div>
        <div className="mt-2 flex gap-2">
          <div className="h-8 flex-1 rounded-xl bg-slate-800" />
          <div className="h-8 w-20 rounded-xl bg-slate-800" />
        </div>
      </div>
    </div>
  )
}
