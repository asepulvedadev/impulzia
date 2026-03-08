'use client'

import { useActionState, useTransition, useRef, useState } from 'react'
import { Loader2, CheckCircle, Camera } from 'lucide-react'
import { Button } from '@/components/ui'
import { FormField } from './form-field'
import {
  updateProfileAction,
  changePasswordAction,
  uploadAvatarAction,
} from '../actions/auth.actions'
import type { AuthResult } from '../interfaces'
import type { Database } from '@/lib/supabase/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const profileInitial: AuthResult<ProfileRow> = { data: null, error: null, success: false }
const passwordInitial: AuthResult = { data: null, error: null, success: false }

interface ProfileFormProps {
  profile: ProfileRow
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    profileInitial,
  )
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePasswordAction,
    passwordInitial,
  )

  const [avatarUploading, startAvatarUpload] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  const initial =
    profile.full_name?.charAt(0).toUpperCase() ?? profile.email.charAt(0).toUpperCase()
  const roleLabel =
    profile.role === 'admin'
      ? 'Administrador'
      : profile.role === 'business_owner'
        ? 'Negocio'
        : 'Usuario'

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError(null)

    const formData = new FormData()
    formData.append('file', file)

    startAvatarUpload(async () => {
      const result = await uploadAvatarAction(formData)
      if (result.success && result.data) {
        setAvatarUrl(result.data)
      } else {
        setAvatarError(result.error ?? 'Error al subir imagen')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Avatar + name header */}
      <div className="flex items-center gap-4">
        {/* Avatar upload */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => avatarRef.current?.click()}
            disabled={avatarUploading}
            className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary-600 to-brand-accent-500"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-white">{initial}</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
              {avatarUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </button>
          <input
            ref={avatarRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <p className="font-semibold text-white">{profile.full_name || 'Sin nombre'}</p>
          <p className="text-sm text-muted">{profile.email}</p>
          <span className="mt-1 inline-block rounded-full bg-brand-primary-900/40 px-2.5 py-0.5 text-xs font-semibold text-brand-primary-300">
            {roleLabel}
          </span>
        </div>
      </div>

      {avatarError && (
        <p className="rounded-xl bg-red-950/40 p-3 text-sm text-red-400">{avatarError}</p>
      )}

      {/* Personal info */}
      <section className="rounded-2xl border border-slate-800 bg-card p-6">
        <h2 className="mb-4 font-heading text-lg font-bold text-white">Información personal</h2>

        <form action={profileAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre completo"
              name="fullName"
              type="text"
              placeholder="Tu nombre"
              defaultValue={profile.full_name ?? ''}
            />
            <FormField
              label="Teléfono"
              name="phone"
              type="tel"
              placeholder="+57 300 000 0000"
              defaultValue={profile.phone ?? ''}
            />
            <FormField
              label="Ciudad"
              name="city"
              type="text"
              placeholder="Cúcuta"
              defaultValue={profile.city ?? ''}
            />
          </div>

          {profileState.error && (
            <p className="rounded-xl bg-red-950/40 p-3 text-sm text-red-400">
              {profileState.error}
            </p>
          )}
          {profileState.success && (
            <p className="flex items-center gap-2 rounded-xl bg-brand-success-900/30 p-3 text-sm text-brand-success-400">
              <CheckCircle className="h-4 w-4" /> Perfil actualizado correctamente
            </p>
          )}

          <Button type="submit" disabled={profilePending}>
            {profilePending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-slate-800 bg-card p-6">
        <h2 className="mb-1 font-heading text-lg font-bold text-white">Cambiar contraseña</h2>
        <p className="mb-4 text-sm text-muted">Mínimo 8 caracteres</p>

        <form action={passwordAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              required
            />
            <FormField
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {passwordState.error && (
            <p className="rounded-xl bg-red-950/40 p-3 text-sm text-red-400">
              {passwordState.error}
            </p>
          )}
          {passwordState.success && (
            <p className="flex items-center gap-2 rounded-xl bg-brand-success-900/30 p-3 text-sm text-brand-success-400">
              <CheckCircle className="h-4 w-4" /> Contraseña actualizada correctamente
            </p>
          )}

          <Button type="submit" variant="outline" disabled={passwordPending}>
            {passwordPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Actualizando...
              </>
            ) : (
              'Cambiar contraseña'
            )}
          </Button>
        </form>
      </section>
    </div>
  )
}
