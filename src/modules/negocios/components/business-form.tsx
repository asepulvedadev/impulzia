'use client'

import { useActionState, useState, useEffect } from 'react'
import { Loader2, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { createBusinessAction } from '../actions/business.actions'
import { slugify } from '@/lib/utils/slugify'
import type { BusinessCategory, Business, ServiceResult } from '../interfaces'

interface BusinessFormProps {
  categories: BusinessCategory[]
}

const initialState: ServiceResult<Business> = {
  data: null,
  error: null,
  success: false,
}

const STEPS = ['Información básica', 'Contacto y ubicación', 'Imágenes']

export function BusinessForm({ categories }: BusinessFormProps) {
  const [state, action, isPending] = useActionState(createBusinessAction, initialState)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [previewSlug, setPreviewSlug] = useState('')

  useEffect(() => {
    setPreviewSlug(slugify(name))
  }, [name])

  const canAdvance = () => {
    if (step === 0) return name.length >= 3
    return true
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-muted">
          {STEPS.map((label, i) => (
            <span key={label} className={i <= step ? 'font-medium text-brand-primary-600' : ''}>
              {label}
            </span>
          ))}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-brand-primary-600 transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form action={action} className="space-y-6">
        {/* Step 1: Basic Info */}
        <div className={step === 0 ? 'space-y-4' : 'hidden'}>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nombre del negocio *
            </label>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Restaurante El Buen Sabor"
              required
            />
            {previewSlug && (
              <p className="mt-1 text-xs text-muted">
                URL: rcomienda.app/negocio/<span className="font-medium">{previewSlug}</span>
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Categoría *
            </label>
            <select
              name="category_id"
              required
              className="flex h-12 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-foreground focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Descripción
            </label>
            <textarea
              name="description"
              rows={4}
              maxLength={1000}
              placeholder="Describe tu negocio..."
              className="flex w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-foreground placeholder:text-muted focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Descripción corta (para SEO, máx 160 caracteres)
            </label>
            <Input
              name="short_description"
              maxLength={160}
              placeholder="Resumen breve de tu negocio"
            />
          </div>
        </div>

        {/* Step 2: Contact & Location */}
        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Teléfono
              </label>
              <Input name="phone" type="tel" placeholder="+573001234567" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                WhatsApp
              </label>
              <Input name="whatsapp" type="tel" placeholder="3001234567" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Correo electrónico
              </label>
              <Input name="email" type="email" placeholder="contacto@tunegocio.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Sitio web
              </label>
              <Input name="website" type="url" placeholder="https://tunegocio.com" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Dirección
            </label>
            <Input name="address" placeholder="Calle 10 #5-20, Local 3" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Barrio
              </label>
              <Input name="neighborhood" placeholder="Centro" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Ciudad
              </label>
              <Input name="city" defaultValue="Cúcuta" />
            </div>
          </div>
        </div>

        {/* Step 3: Images */}
        <div className={step === 2 ? 'space-y-6' : 'hidden'}>
          <p className="text-sm text-muted">
            Las imágenes se pueden agregar después de crear el negocio.
          </p>
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-card-border py-12">
            <div className="text-center">
              <ImagePlus className="mx-auto h-10 w-10 text-muted" />
              <p className="mt-2 text-sm font-medium text-slate-300">
                Podrás subir logo y portada desde el panel
              </p>
              <p className="mt-1 text-xs text-muted">Formatos: JPEG, PNG, WebP (máx 5MB)</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {state.error && (
          <div className="rounded-xl bg-brand-error-900/20 p-3 text-sm text-brand-error-400">
            {state.error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending || !canAdvance()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear negocio'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
