import Image from 'next/image'
import type { CatalogSection } from '@/modules/negocios/interfaces'

interface ProductsBlockProps {
  sections: CatalogSection[]
  brandPrimary: string
  isOwner: boolean
}

function formatPrice(price: number | null, label: string | null): string {
  if (label) return label
  if (price === null) return ''
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
}

export function ProductsBlock({ sections, brandPrimary, isOwner }: ProductsBlockProps) {
  const allItems = sections.flatMap((s) => s.business_catalog_items)
  if (allItems.length === 0 && !isOwner) return null

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id}>
          {sections.length > 1 && (
            <h3 className="mb-4 text-base font-bold" style={{ color: brandPrimary }}>
              {section.name}
            </h3>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {section.business_catalog_items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20"
              >
                <div className="relative aspect-square bg-white/5">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill sizes="(max-width:640px) 50vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-3xl text-white/10">📦</span>
                    </div>
                  )}
                  {item.is_featured && (
                    <span
                      className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: brandPrimary }}
                    >
                      Destacado
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white leading-tight">{item.name}</p>
                  {(item.price !== null || item.price_label) && (
                    <p className="mt-1 text-sm font-bold" style={{ color: brandPrimary }}>
                      {formatPrice(item.price, item.price_label)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {allItems.length === 0 && isOwner && (
        <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center">
          <p className="text-sm text-white/40">Agrega productos con fotos y precios</p>
        </div>
      )}
    </div>
  )
}
