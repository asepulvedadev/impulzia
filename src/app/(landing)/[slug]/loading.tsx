export default function LandingLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-950">
      {/* Hero skeleton */}
      <div className="h-[70vh] bg-slate-900" />
      {/* Info skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-6">
        <div className="h-8 w-64 rounded-xl bg-slate-800" />
        <div className="h-4 w-96 rounded bg-slate-800" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  )
}
