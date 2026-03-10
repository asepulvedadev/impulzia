import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { HeroSlider } from '@/modules/negocios/components/landing/hero-slider'
import { ContactBar } from '@/modules/negocios/components/landing/contact-bar'
import { getCatalogBlock } from '@/modules/negocios/components/landing/catalog-blocks'
import { TrackBusinessView } from '@/modules/analytics/components/track-business-view'
import { EditModeProvider } from '@/modules/negocios/components/landing/edit-mode-provider'
import Link from 'next/link'
import Image from 'next/image'
import type React from 'react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const result = await new BusinessService(supabase).getFullLanding(slug)
  if (!result.data) return { title: 'Negocio no encontrado | Rcomienda' }
  const b = result.data
  return {
    title: `${b.name} | Rcomienda`,
    description: b.short_description ?? b.description ?? undefined,
    openGraph: {
      title: b.name,
      description: b.short_description ?? undefined,
      images: b.logo_url ? [b.logo_url] : b.hero_slides[0]?.url ? [b.hero_slides[0].url] : [],
    },
  }
}

export default async function BusinessLandingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const service = new BusinessService(supabase)
  const result = await service.getFullLanding(slug)
  if (!result.data) notFound()

  const business = result.data
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === business.owner_id

  const categorySlug = business.business_categories?.slug ?? null
  const CatalogBlock = getCatalogBlock(categorySlug)
  const hasCatalog = business.business_catalog_sections.length > 0 || isOwner

  const cssVars = {
    '--biz-primary': business.brand_color_primary,
    '--biz-secondary': business.brand_color_secondary,
    '--biz-accent': business.brand_color_accent,
  } as React.CSSProperties

  return (
    <div style={{ ...cssVars, background: business.brand_color_secondary, minHeight: '100vh' }}>
      <TrackBusinessView businessId={business.id} neighborhood={business.neighborhood} />

      {/* Rcomienda pill — top left */}
      <Link
        href="/"
        className="fixed top-3 left-3 z-50 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 backdrop-blur-sm transition hover:bg-slate-900"
      >
        <Image src="/icono.png" alt="Rcomienda" width={16} height={16} className="shrink-0" />
        <span className="text-xs font-semibold text-white/80 tracking-wide">Rcomienda</span>
      </Link>

      <EditModeProvider isOwner={isOwner} businessId={business.id} business={business}>
        {/* Hero Slider */}
        <HeroSlider
          slides={business.hero_slides}
          coverUrl={business.cover_url}
          businessName={business.name}
          brandPrimary={business.brand_color_primary}
          brandSecondary={business.brand_color_secondary}
          logoUrl={business.logo_url}
          isVerified={business.is_verified}
          categoryName={business.business_categories?.name ?? null}
          isOwner={isOwner}
        />

        {/* Contact bar */}
        <ContactBar
          phone={business.phone}
          whatsapp={business.whatsapp}
          email={business.email}
          website={business.website}
          address={business.address}
          neighborhood={business.neighborhood}
          city={business.city}
          socialLinks={business.social_links}
          brandPrimary={business.brand_color_primary}
          brandSecondary={business.brand_color_secondary}
        />

        {/* Body */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">

          {/* Short description */}
          {business.short_description && (
            <p className="text-lg text-white/70 leading-relaxed">
              {business.short_description}
            </p>
          )}

          {/* Catalog section */}
          {hasCatalog && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-white">
                {categorySlug === 'restaurantes' || categorySlug === 'cafeterias'
                  ? 'Menú'
                  : categorySlug === 'tiendas-de-ropa' || categorySlug === 'hogar' || categorySlug === 'mascotas'
                  ? 'Productos'
                  : 'Servicios'}
              </h2>
              <CatalogBlock
                sections={business.business_catalog_sections}
                brandPrimary={business.brand_color_primary}
                isOwner={isOwner}
              />
            </section>
          )}

          {/* Story / About */}
          {(business.story_content || (isOwner && !business.story_content)) && (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="mb-4 text-2xl font-bold text-white">
                {business.story_title || 'Sobre nosotros'}
              </h2>
              {business.story_content ? (
                <p className="whitespace-pre-line text-base leading-relaxed text-white/60">
                  {business.story_content}
                </p>
              ) : (
                <p className="text-sm text-white/30">Agrega tu historia aquí...</p>
              )}
            </section>
          )}

          {/* Full description */}
          {business.description && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-white">Información</h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-white/60">
                {business.description}
              </p>
            </section>
          )}
        </div>

        {/* Footer strip */}
        <footer
          className="mt-16 border-t border-white/10 py-8 text-center text-xs text-white/30"
          style={{ background: `${business.brand_color_secondary}cc` }}
        >
          <p>{business.name} · {business.city ?? 'Colombia'}</p>
          <Link
            href="/"
            className="mt-1 inline-block text-white/20 hover:text-white/50 transition"
          >
            Powered by Rcomienda
          </Link>
        </footer>
      </EditModeProvider>
    </div>
  )
}
