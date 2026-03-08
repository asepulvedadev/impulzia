'use client'

import { useActionState, useTransition, useRef } from 'react'
import { Loader2, CheckCircle, Upload, ImagePlus } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { updateBusinessAction, uploadLogoAction, uploadCoverAction } from '../actions/business.actions'
import type { Business, BusinessCategory, ServiceResult } from '../interfaces'

const initial: ServiceResult<Business> = { data: null, error: null, success: false }

interface BusinessEditFormProps {
  business: Business
  categories: BusinessCategory[]
}

export function BusinessEditForm({ business, categories }: BusinessEditFormProps) {
  const updateAction = updateBusinessAction.bind(null, business.id)
  const [state, action, pending] = useActionState(updateAction, initial)

  const [logoUploading, startLogoUpload] = useTransition()
  const [coverUploading, startCoverUpload] = useTransition()
  const logoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(
    file: File,
    uploadFn: typeof uploadLogoAction,
    startTransition: typeof startLogoUpload,
  ) {
    const formData = new FormData()
    formData.append('file', file)
    startTransition(async () => {
      await uploadFn(business.id, formData)
    })
  }

  return (
    <div className="space-y-6">
      {/* Images */}
      <section className="rounded-2xl border border-slate-800 bg-card p-6">
        <h2 className="font-heading text-lg font-bold text-white mb-4">Imágenes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Logo */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Logo</p>
            <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/40 transition hover:border-brand-primary-600">
              {business.logo_url ? (
                <img src={business.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-8 w-8 text-slate-600" />
              )}
              <button
                onClick={() => logoRef.current?.click()}
                disabled={logoUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100 rounded-2xl"
              >
                {logoUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, uploadLogoAction, startLogoUpload)
              }}
            />
          </div>

          {/* Cover */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Portada</p>
            <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/40 transition hover:border-brand-primary-600">
              {business.cover_url ? (
                <img src={business.cover_url} alt="Portada" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-8 w-8 text-slate-600" />
              )}
              <button
                onClick={() => coverRef.current?.click()}
                disabled={coverUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100 rounded-2xl"
              >
                {coverUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, uploadCoverAction, startCoverUpload)
              }}
            />
          </div>
        </div>
      </section>

      {/* Business info */}
      <section className="rounded-2xl border border-slate-800 bg-card p-6">
        <h2 className="font-heading text-lg font-bold text-white mb-4">Información del negocio</h2>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-300">Nombre *</label>
              <Input name="name" defaultValue={business.name} required />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-300">Categoría</label>
              <select
                name="category_id"
                defaultValue={business.category_id ?? ''}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-primary-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-300">Descripción corta</label>
              <Input name="short_description" defaultValue={business.short_description ?? ''} placeholder="Una línea que resume tu negocio" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-300">Descripción completa</label>
              <textarea
                name="description"
                defaultValue={business.description ?? ''}
                rows={3}
                placeholder="Cuéntanos más sobre tu negocio..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-primary-500 focus:outline-none focus:ring-1 focus:ring-brand-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Teléfono</label>
              <Input name="phone" defaultValue={business.phone ?? ''} placeholder="+57 300 000 0000" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">WhatsApp</label>
              <Input name="whatsapp" defaultValue={business.whatsapp ?? ''} placeholder="+57 300 000 0000" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <Input name="email" type="email" defaultValue={business.email ?? ''} placeholder="contacto@minegocio.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Sitio web</label>
              <Input name="website" type="url" defaultValue={business.website ?? ''} placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Dirección</label>
              <Input name="address" defaultValue={business.address ?? ''} placeholder="Calle 5 #10-20" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Barrio</label>
              <Input name="neighborhood" defaultValue={business.neighborhood ?? ''} placeholder="Centro" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Ciudad</label>
              <Input name="city" defaultValue={business.city ?? 'Cúcuta'} />
            </div>
          </div>

          {state.error && (
            <p className="rounded-xl bg-red-950/40 p-3 text-sm text-red-400">{state.error}</p>
          )}
          {state.success && (
            <p className="flex items-center gap-2 rounded-xl bg-brand-success-900/30 p-3 text-sm text-brand-success-400">
              <CheckCircle className="h-4 w-4" /> Negocio actualizado correctamente
            </p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar cambios'}
          </Button>
        </form>
      </section>
    </div>
  )
}
