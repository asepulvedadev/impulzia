import { cn } from '@/lib/utils/cn'

interface BusinessCardSkeletonProps {
  className?: string
}

export function BusinessCardSkeleton({ className }: BusinessCardSkeletonProps) {
  return (
    <div className={cn('rounded-2xl border border-slate-800 bg-card animate-pulse', className)}>
      <div className="flex items-center gap-4 p-4">
        <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-700" />
          <div className="h-5 w-20 rounded-full bg-slate-700" />
        </div>
      </div>
      <div className="space-y-1.5 px-4 pb-2">
        <div className="h-3 w-full rounded bg-slate-700" />
        <div className="h-3 w-2/3 rounded bg-slate-700" />
      </div>
      <div className="border-t border-slate-800 px-4 py-3">
        <div className="h-3 w-1/3 rounded bg-slate-700" />
      </div>
    </div>
  )
}
