'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Tag, Percent, Gift } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { Incentive } from '../interfaces'

type IncentiveType = 'coupon' | 'combo' | 'reward'
type DiscountType = 'percentage' | 'fixed_amount' | 'free_item'

interface IncentiveFormProps {
  onSubmit: (data: unknown) => Promise<{ success: boolean; error?: string | null; data?: Incentive | null }>
  initialValues?: Partial<{
    title: string
    description: string
    type: IncentiveType
    discount_type: DiscountType
    discount_value: number
    min_purchase: number
    max_uses: number
    code: string
    end_date: string
    terms: string
  }>
  mode?: 'create' | 'edit'
}

const TYPE_OPTIONS = [
  { value: 'coupon' as const, label: 'Cupón', icon: Tag, desc: 'Descuento en precio' },
  { value: 'combo' as const, label: 'Combo', icon: Percent, desc: 'Oferta combinada' },
  { value: 'reward' as const, label: 'Premio', icon: Gift, desc: 'Lealtad / colecciona sellos' },
]

const DISCOUNT_TYPES = [
  { value: 'percentage' as const, label: 'Porcentaje (%)' },
  { value: 'fixed_amount' as const, label: 'Monto fijo ($)' },
  { value: 'free_item' as const, label: 'Ítem gratis' },
]

export function IncentiveForm({ onSubmit, initialValues, mode = 'create' }: IncentiveFormProps) {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [form, setForm] = React.useState({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    terms: initialValues?.terms ?? '',
    type: initialValues?.type ?? ('coupon' as IncentiveType),
    discount_type: initialValues?.discount_type ?? ('' as DiscountType | ''),
    discount_value: initialValues?.discount_value?.toString() ?? '',
    min_purchase: initialValues?.min_purchase?.toString() ?? '',
    max_uses: initialValues?.max_uses?.toString() ?? '',
    code: initialValues?.code ?? '',
    end_date: initialValues?.end_date
      ? initialValues.end_date.slice(0, 16)
      : '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const payload = {
      title: form.title,
      description: form.description || undefined,
      terms: form.terms || undefined,
      type: form.type,
      discount_type: form.discount_type || undefined,
      discount_value: form.discount_value ? Number(form.discount_value) : undefined,
      min_purchase: form.min_purchase ? Number(form.min_purchase) : undefined,
      max_uses: form.max_uses ? Number(form.max_uses) : undefined,
      code: form.code || undefined,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
    }

    const result = await onSubmit(payload)
    setLoading(false)

    if (result.success && result.data) {
      router.push(`/panel/incentivos/${result.data.id}`)
    } else {
      setError(result.error ?? 'Error desconocido')
    }
  }

  const needsDiscount = form.type === 'coupon' || form.type === 'combo'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                step >= s
                  ? 'bg-brand-primary-600 text-white'
                  : 'bg-slate-800 text-muted',
              )}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  'flex-1 h-0.5 rounded transition-all',
                  step > s ? 'bg-brand-primary-600' : 'bg-slate-800',
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Type + basic info */}
      {step === 1 && (
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-white">Tipo e información básica</h2>

          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                onClick={() => set('type', value)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center',
                  form.type === value
                    ? 'border-brand-primary-500 bg-brand-primary-900/30 text-white'
                    : 'border-card-border bg-transparent text-muted hover:border-slate-600',
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[10px] leading-tight">{desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Título *</label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="ej. 20% de descuento en tu primera compra"
                maxLength={100}
              />
              <p className="text-[10px] text-muted mt-0.5 text-right">{form.title.length}/100</p>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Detalles adicionales..."
                maxLength={500}
                rows={3}
                className="w-full bg-input border border-card-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary-500 resize-none"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Discount details */}
      {step === 2 && (
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-white">Detalles del descuento</h2>

          {needsDiscount && (
            <div>
              <label className="text-xs text-muted mb-2 block">Tipo de descuento *</label>
              <div className="space-y-2">
                {DISCOUNT_TYPES.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount_type"
                      value={value}
                      checked={form.discount_type === value}
                      onChange={() => set('discount_type', value)}
                      className="accent-brand-primary-500"
                    />
                    <span className="text-sm text-white">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(form.discount_type === 'percentage' || form.discount_type === 'fixed_amount') && (
            <div>
              <label className="text-xs text-muted mb-1 block">
                {form.discount_type === 'percentage' ? 'Porcentaje (%)' : 'Monto ($)'}
              </label>
              <Input
                type="number"
                value={form.discount_value}
                onChange={(e) => set('discount_value', e.target.value)}
                placeholder={form.discount_type === 'percentage' ? '20' : '10000'}
                min={1}
                max={form.discount_type === 'percentage' ? 100 : undefined}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Compra mínima ($)</label>
              <Input
                type="number"
                value={form.min_purchase}
                onChange={(e) => set('min_purchase', e.target.value)}
                placeholder="Sin mínimo"
                min={0}
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Máx. usos totales</label>
              <Input
                type="number"
                value={form.max_uses}
                onChange={(e) => set('max_uses', e.target.value)}
                placeholder="Ilimitado"
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Código personalizado</label>
              <Input
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="PROMO2026"
                maxLength={20}
                className="uppercase"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Fecha de vencimiento</label>
              <Input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Terms + review */}
      {step === 3 && (
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-white">Términos y revisión</h2>

          <div>
            <label className="text-xs text-muted mb-1 block">Términos y condiciones</label>
            <textarea
              value={form.terms}
              onChange={(e) => set('terms', e.target.value)}
              placeholder="ej. Válido de lunes a viernes. No aplica con otras promociones..."
              maxLength={1000}
              rows={4}
              className="w-full bg-input border border-card-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary-500 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Tipo</span>
              <Badge variant="secondary">{TYPE_OPTIONS.find((t) => t.value === form.type)?.label}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Título</span>
              <span className="text-white text-right max-w-48 truncate">{form.title}</span>
            </div>
            {form.discount_value && (
              <div className="flex justify-between">
                <span className="text-muted">Descuento</span>
                <span className="text-brand-accent-400 font-bold">
                  {form.discount_type === 'percentage'
                    ? `${form.discount_value}%`
                    : `$${Number(form.discount_value).toLocaleString('es-CO')}`}
                </span>
              </div>
            )}
            {form.end_date && (
              <div className="flex justify-between">
                <span className="text-muted">Vence</span>
                <span className="text-white">
                  {new Date(form.end_date).toLocaleDateString('es-CO')}
                </span>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-brand-error-400">{error}</p>}
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
            <ChevronLeft size={16} />
            Atrás
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} className="flex-1" disabled={!form.title || !form.type}>
            Siguiente
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear incentivo'
                : 'Guardar cambios'}
          </Button>
        )}
      </div>
    </div>
  )
}
