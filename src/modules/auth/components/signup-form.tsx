'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { FormField } from './form-field'
import { PasswordStrength } from './password-strength'
import { signupAction } from '../actions/auth.actions'
import type { AuthResult } from '../interfaces'

const initialState: AuthResult = { data: null, error: null, success: false }

export function SignupForm() {
  const [state, action, isPending] = useActionState(signupAction, initialState)
  const [password, setPassword] = useState('')

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-success-500" />
        <h2 className="text-xl font-bold text-white">¡Cuenta creada!</h2>
        <p className="text-sm text-muted">
          Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-brand-primary-600 hover:underline"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">Registra tu negocio en Rcomienda</p>
      </div>

      <form action={action} className="space-y-4">
        <FormField
          label="Nombre completo"
          name="fullName"
          placeholder="Juan Pérez"
          required
          autoComplete="name"
        />
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          required
          autoComplete="email"
        />
        <div className="space-y-1.5">
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres, una mayúscula, un número"
            required
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength password={password} />
        </div>

        {state.error && (
          <div className="rounded-xl bg-brand-error-900/20 p-3 text-sm text-brand-error-400">
            {state.error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-brand-primary-600 hover:underline">
          Ingresa
        </Link>
      </p>
    </div>
  )
}
