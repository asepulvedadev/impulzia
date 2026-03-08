'use client'

import { useActionState, useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { FormField } from './form-field'
import { loginAction } from '../actions/auth.actions'
import type { AuthResult } from '../interfaces'

const initialState: AuthResult = { data: null, error: null, success: false }

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, initialState)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    function onFill(e: Event) {
      const { email: e2, password: p } = (e as CustomEvent<{ email: string; password: string }>).detail
      setEmail(e2)
      setPassword(p)
    }
    window.addEventListener('dev:fill-credentials', onFill)
    return () => window.removeEventListener('dev:fill-credentials', onFill)
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-white">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted">Ingresa con tu correo y contraseña</p>
      </div>

      <form action={action} className="space-y-4">
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {state.error && (
          <div className="rounded-xl bg-brand-error-900/20 p-3 text-sm text-brand-error-400">
            {state.error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            'Ingresar'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-medium text-brand-primary-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
