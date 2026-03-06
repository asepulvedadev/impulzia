import { BusinessCardSkeleton } from '@/modules/negocios/components/business-card-skeleton'

export default function ExplorarLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-20">
      <div className="mb-8">
        <div className="h-9 w-80 animate-pulse rounded bg-slate-700" />
        <div className="mt-2 h-5 w-96 animate-pulse rounded bg-slate-700" />
      </div>

      <div className="mb-8 space-y-4">
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-700" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-slate-700" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <BusinessCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
