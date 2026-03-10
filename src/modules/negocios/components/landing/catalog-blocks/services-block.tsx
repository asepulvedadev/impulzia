import type { CatalogSection } from '@/modules/negocios/interfaces'
import { CheckCircle } from 'lucide-react'

interface ServicesBlockProps {
  sections: CatalogSection[]
  brandPrimary: string
  isOwner: boolean
}

function formatPrice(price: number | null, label: string | null): string {
  if (label) return label
  if (price === null) return 'Consultar'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
}

export function ServicesBlock({ sections, brandPrimary, isOwner }: ServicesBlockProps) {
  const allItems = sections.flatMap((s) => s.business_catalog_items)
  if (allItems.length === 0 && !isOwner) return null

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id}>
          {sections.length > 1 && (
            <h3 className="mb-3 text-base font-bold" style={{ color: brandPrimary }}>
              {section.name}
            </h3>
          )}
          <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10">
            {section.business_catalog_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white/5 px-4 py-3.5 transition hover:bg-white/[0.08]">
                <CheckCircle className="h-4 w-4 shrink-0" style={{ color: brandPrimary }} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-white/50">{item.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-bold" style={{ color: brandPrimary }}>
                  {formatPrice(item.price, item.price_label)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {allItems.length === 0 && isOwner && (
        <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center">
          <p className="text-sm text-white/40">Agrega tus servicios con precios</p>
        </div>
      )}
    </div>
  )
}
