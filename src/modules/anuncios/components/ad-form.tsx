'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Image,
  Megaphone,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdBanner } from './ad-banner'
import { createAdAction, updateAdAction } from '../actions/ad.actions'
import type { Ad } from '../interfaces'

interface AdFormProps {
  businessId: string
  ad?: Ad
  mode: 'create' | 'edit'
}

type AdType = 'banner' | 'featured' | 'promotion'
type Step = 1 | 2 | 3

const TYPE_OPTIONS: { value: AdType; label: string; description: string; icon: React.ReactNode }[] =
  [
    {
      value: 'banner',
      label: 'Banner',
      description: 'Imagen + texto en el feed y explorador',
      icon: <Image size={20} />,
    },
    {
      value: 'featured',
      label: 'Destacado',
      description: 'Tu negocio aparece primero en búsquedas',
      icon: <Megaphone size={20} />,
    },
    {
      value: 'promotion',
      label: 'Promoción',
      description: 'Oferta específica con fecha límite',
      icon: <Tag size={20} />,
    },
  ]

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function CharCounter({ value, max }: { value: string; max: number }) {
  return (
    <span
      className={cn('text-xs', value.length > max * 0.9 ? 'text-brand-warning-400' : 'text-muted')}
    >
      {value.length}/{max}
    </span>
  )
}

export function AdForm({ businessId, ad, mode }: AdFormProps) {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [type, setType] = React.useState<AdType>(ad?.type ?? 'featured')
  const [title, setTitle] = React.useState(ad?.title ?? '')
  const [description, setDescription] = React.useState(ad?.description ?? '')
  const [imageUrl, setImageUrl] = React.useState(ad?.image_url ?? '')
  const [ctaText, setCtaText] = React.useState(ad?.cta_text ?? 'Ver más')
  const [ctaUrl, setCtaUrl] = React.useState(ad?.cta_url ?? '')
  const [targetNeighborhoods, setTargetNeighborhoods] = React.useState(
    (ad?.target_neighborhoods ?? []).join(', '),
  )
  const [scheduleStart, setScheduleStart] = React.useState(
    ad?.schedule_start ? ad.schedule_start.split('T')[0] : '',
  )
  const [scheduleEnd, setScheduleEnd] = React.useState(
    ad?.schedule_end ? ad.schedule_end.split('T')[0] : '',
  )
  const [allDay, setAllDay] = React.useState(!ad?.daily_start_hour)
  const [dailyStart, setDailyStart] = React.useState(ad?.daily_start_hour ?? 8)
  const [dailyEnd, setDailyEnd] = React.useState(ad?.daily_end_hour ?? 20)

  // Preview ad object
  const previewAd: Ad = {
    id: ad?.id ?? 'preview',
    business_id: businessId,
    owner_id: '',
    type,
    status: 'draft',
    title: title || 'Título de tu anuncio',
    description: description || null,
    image_url: imageUrl || null,
    cta_text: ctaText || 'Ver más',
    cta_url: ctaUrl || null,
    target_categories: null,
    target_neighborhoods: null,
    target_cities: ['Cúcuta'],
    schedule_start: scheduleStart ? `${scheduleStart}T00:00:00Z` : null,
    schedule_end: scheduleEnd ? `${scheduleEnd}T23:59:59Z` : null,
    daily_start_hour: allDay ? null : dailyStart,
    daily_end_hour: allDay ? null : dailyEnd,
    budget_type: 'free',
    priority: 0,
    is_active: true,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  async function handleSubmit(publish: boolean) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('type', type)
    if (description) formData.set('description', description)
    if (imageUrl) formData.set('image_url', imageUrl)
    formData.set('cta_text', ctaText)
    if (ctaUrl) formData.set('cta_url', ctaUrl)
    if (scheduleStart) formData.set('schedule_start', `${scheduleStart}T00:00:00Z`)
    if (scheduleEnd) formData.set('schedule_end', `${scheduleEnd}T23:59:59Z`)
    if (!allDay) {
      formData.set('daily_start_hour', String(dailyStart))
      formData.set('daily_end_hour', String(dailyEnd))
    }

    const neighborhoods = targetNeighborhoods
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
    neighborhoods.forEach((n) => formData.append('target_neighborhoods[]', n))

    const prevState = { data: null, error: null, success: false }
    const action = mode === 'create' ? createAdAction : updateAdAction

    const result =
      mode === 'create'
        ? await (createAdAction as typeof createAdAction)(businessId, prevState, formData)
        : await (updateAdAction as typeof updateAdAction)(ad?.id ?? '', prevState, formData)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (publish && result.data) {
      // Publish after creation
      const { publishAdAction } = await import('../actions/ad.actions')
      await publishAdAction(result.data.id)
    }

    router.push('/panel/anuncios')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Form */}
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <React.Fragment key={s}>
              <button
                onClick={() => s < step && setStep(s)}
                className={cn(
                  'w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors',
                  step === s
                    ? 'bg-brand-primary-600 text-white'
                    : s < step
                      ? 'bg-brand-success-600 text-white cursor-pointer'
                      : 'bg-slate-800 text-muted',
                )}
              >
                {s < step ? '✓' : s}
              </button>
              {s < 3 && (
                <div
                  className={cn('flex-1 h-px', s < step ? 'bg-brand-success-600' : 'bg-slate-800')}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Content */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-bold text-white text-lg">Contenido del anuncio</h2>

            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tipo de anuncio</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={cn(
                      'flex flex-col gap-2 p-3 rounded-xl border text-left transition-all',
                      type === opt.value
                        ? 'border-brand-primary-500 bg-brand-primary-900/20'
                        : 'border-slate-800 hover:border-slate-600',
                    )}
                  >
                    <span
                      className={cn('text-brand-primary-400', type !== opt.value && 'text-muted')}
                    >
                      {opt.icon}
                    </span>
                    <span className="font-semibold text-sm text-white">{opt.label}</span>
                    <span className="text-xs text-muted">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-white">Título *</label>
                <CharCounter value={title} max={80} />
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: 50% de descuento en toda la carta"
                maxLength={80}
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-white">Descripción</label>
                <CharCounter value={description} max={300} />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu oferta o negocio brevemente"
                maxLength={300}
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500 resize-none"
              />
            </div>

            {/* Image URL (if banner) */}
            {type === 'banner' && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">URL de imagen *</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            )}

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-white">Texto del botón</label>
                  <CharCounter value={ctaText} max={30} />
                </div>
                <Input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Ver más"
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">URL destino</label>
                <Input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Targeting */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-bold text-white text-lg">Segmentación</h2>
            <p className="text-sm text-muted">
              Tu anuncio aparecerá a personas ubicadas en los barrios seleccionados. Déjalo vacío
              para llegar a toda Cúcuta.
            </p>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Barrios objetivo</label>
              <Input
                value={targetNeighborhoods}
                onChange={(e) => setTargetNeighborhoods(e.target.value)}
                placeholder="Centro, La Riviera, Quinta Oriental (separados por comas)"
              />
              <p className="text-xs text-muted mt-1">Escribe los barrios separados por comas</p>
            </div>
          </div>
        )}

        {/* Step 3: Scheduling */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Calendar size={20} />
              Programación
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Fecha inicio</label>
                <Input
                  type="date"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Fecha fin</label>
                <Input
                  type="date"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  min={scheduleStart || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Daily schedule */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="all-day"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="all-day" className="text-sm text-white cursor-pointer">
                  Mostrar todo el día
                </label>
              </div>

              {!allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Hora inicio</label>
                    <select
                      value={dailyStart}
                      onChange={(e) => setDailyStart(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Hora fin</label>
                    <select
                      value={dailyEnd}
                      onChange={(e) => setDailyEnd(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                    >
                      {HOURS.filter((h) => h > dailyStart).map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            {scheduleStart && scheduleEnd && (
              <div className="p-3 rounded-xl bg-brand-primary-900/20 border border-brand-primary-800/30">
                <p className="text-xs text-brand-primary-300">
                  Tu anuncio se mostrará del{' '}
                  <span className="font-semibold">
                    {new Date(scheduleStart).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>{' '}
                  al{' '}
                  <span className="font-semibold">
                    {new Date(scheduleEnd).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {!allDay &&
                    `, de ${String(dailyStart).padStart(2, '0')}:00 a ${String(dailyEnd).padStart(2, '0')}:00`}
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-muted">
                Tu plan gratuito permite 1 anuncio activo.{' '}
                <button className="text-brand-accent-400 underline">Mejora tu plan</button> para más
                anuncios con mejor posicionamiento.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-brand-error-900/20 border border-brand-error-700/40 text-sm text-brand-error-400">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => (s - 1) as Step)}>
              <ChevronLeft size={16} />
              Anterior
            </Button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <Button type="button" onClick={() => setStep((s) => (s + 1) as Step)}>
              Siguiente
              <ChevronRight size={16} />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                <Save size={16} />
                Guardar borrador
              </Button>
              <Button type="button" onClick={() => handleSubmit(true)} disabled={loading}>
                <Send size={16} />
                {loading ? 'Publicando...' : 'Publicar anuncio'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview (desktop only) */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
            Vista previa
          </p>
          <AdBanner ad={previewAd} size="full" />
        </div>
      </div>
    </div>
  )
}
