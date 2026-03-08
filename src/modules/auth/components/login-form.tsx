'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { FormField } from './form-field'
import { loginAction } from '../actions/auth.actions'
import type { AuthResult } from '../interfaces'

const initialState: AuthResult = { data: null, error: null, success: false }

const DEV_USERS = [
  { label: 'Usuario',  email: 'usuario@impulzia.com', password: 'Impulzia123!', color: 'border-brand-success-700 text-brand-success-300 hover:bg-brand-success-900/30' },
  { label: 'Negocio',  email: 'negocio@impulzia.com', password: 'Impulzia123!', color: 'border-brand-accent-700 text-brand-accent-300 hover:bg-brand-accent-900/30' },
  { label: 'Admin',    email: 'admin@impulzia.com',   password: 'Impulzia123!', color: 'border-brand-primary-700 text-brand-primary-300 hover:bg-brand-primary-900/30' },
]

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, initialState)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [active, setActive] = useState<string | null>(null)

  function fill(user: typeof DEV_USERS[0]) {
    setEmail(user.email)
    setPassword(user.password)
    setActive(user.label)
  }

  const isDev = process.env.NODE_ENV === 'development'

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
          onChange={(e) => { setEmail(e.target.value); setActive(null) }}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setActive(null) }}
        />

        {state.error && (
          <div className="rounded-xl bg-red-950/40 p-3 text-sm text-red-400">
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

      {/* Dev credentials — inline, visible en móvil */}
      {isDev && (
        <div className="space-y-2">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-slate-600">
            Acceso rápido (dev)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEV_USERS.map((u) => (
              <button
                key={u.label}
                type="button"
                onClick={() => fill(u)}
                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${u.color} ${active === u.label ? 'ring-1 ring-current' : ''}`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-medium text-brand-primary-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
