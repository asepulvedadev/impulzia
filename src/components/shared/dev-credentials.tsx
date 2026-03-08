'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, FlaskConical, Check } from 'lucide-react'

const USERS = [
  {
    role: 'user',
    label: 'Usuario',
    email: 'usuario@impulzia.com',
    password: 'Impulzia123!',
    style: 'border-brand-success-700 bg-brand-success-900/30 hover:bg-brand-success-900/50',
    activeStyle: 'border-brand-success-500 bg-brand-success-900/60',
    badge: 'text-brand-success-300',
  },
  {
    role: 'business_owner',
    label: 'Negocio',
    email: 'negocio@impulzia.com',
    password: 'Impulzia123!',
    style: 'border-brand-accent-700 bg-brand-accent-900/30 hover:bg-brand-accent-900/50',
    activeStyle: 'border-brand-accent-500 bg-brand-accent-900/60',
    badge: 'text-brand-accent-300',
  },
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@impulzia.com',
    password: 'Impulzia123!',
    style: 'border-brand-primary-700 bg-brand-primary-900/30 hover:bg-brand-primary-900/50',
    activeStyle: 'border-brand-primary-500 bg-brand-primary-900/60',
    badge: 'text-brand-primary-300',
  },
]

export function DevCredentials() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  function fillCredentials(email: string, password: string, role: string) {
    setSelected(role)
    window.dispatchEvent(
      new CustomEvent('dev:fill-credentials', { detail: { email, password } }),
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-slate-300 shadow-lg backdrop-blur transition hover:border-slate-600 hover:text-white"
      >
        <FlaskConical className="h-3.5 w-3.5 text-brand-accent-400" />
        <span>Dev</span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 w-64 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur">
          <div className="border-b border-slate-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Iniciar sesión como
          </div>
          <div className="flex flex-col gap-2 p-2">
            {USERS.map((u) => {
              const isActive = selected === u.role
              return (
                <button
                  key={u.role}
                  onClick={() => fillCredentials(u.email, u.password, u.role)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${isActive ? u.activeStyle : u.style}`}
                >
                  <div>
                    <div className={`font-bold ${u.badge}`}>{u.label}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{u.email}</div>
                  </div>
                  {isActive && <Check className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                </button>
              )
            })}
          </div>
          <div className="border-t border-slate-700 px-3 py-1.5 text-[10px] text-slate-600">
            pass: Impulzia123!
          </div>
        </div>
      )}
    </div>
  )
}
