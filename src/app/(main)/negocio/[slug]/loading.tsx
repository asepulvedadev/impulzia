export default function NegocioLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-20">
      {/* Cover skeleton */}
      <div className="h-48 animate-pulse rounded-2xl bg-slate-700 sm:h-64 lg:h-80" />

      <div className="lg:flex lg:gap-8">
        <div className="flex-1">
          {/* Header skeleton */}
          <div className="-mt-10 flex items-end gap-4 px-4">
            <div className="h-24 w-24 animate-pulse rounded-xl bg-slate-600" />
            <div className="space-y-2 pb-1">
              <div className="h-8 w-48 animate-pulse rounded bg-slate-700" />
              <div className="h-5 w-24 animate-pulse rounded-full bg-slate-700" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="mt-8 space-y-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-700" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="mt-8 w-full shrink-0 lg:mt-0 lg:w-80">
          <div className="space-y-3 rounded-2xl border border-slate-800 p-6">
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-700" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-700" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
