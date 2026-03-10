import Image from 'next/image'
import type { CatalogSection } from '@/modules/negocios/interfaces'

interface MenuBlockProps {
  sections: CatalogSection[]
  brandPrimary: string
  isOwner: boolean
}

function formatPrice(price: number | null, label: string | null): string {
  if (label) return label
  if (price === null) return ''
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
}

export function MenuBlock({ sections, brandPrimary, isOwner }: MenuBlockProps) {
  if (sections.length === 0 && !isOwner) return null

  return (
    <div className="space-y-8">
      {sections.length === 0 && isOwner && (
        <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center">
          <p className="text-sm text-white/40">Agrega secciones al menú (Desayunos, Almuerzos, etc.)</p>
        </div>
      )}
      {sections.map((section) => (
        <div key={section.id}>
          <h3
            className="mb-3 text-lg font-bold"
            style={{ color: brandPrimary }}
          >
            {section.name}
          </h3>
          {section.description && (
            <p className="mb-3 text-sm text-white/50">{section.description}</p>
          )}
          <div className="space-y-2">
            {section.business_catalog_items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/[0.08]"
              >
                {item.image_url && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image src={item.image_url} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-white/50 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    {(item.price !== null || item.price_label) && (
                      <span
                        className="shrink-0 rounded-lg px-2 py-0.5 text-sm font-bold"
                        style={{ color: brandPrimary }}
                      >
                        {formatPrice(item.price, item.price_label)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {section.business_catalog_items.length === 0 && isOwner && (
              <p className="text-center text-xs text-white/30 py-4">Sin items aún</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
