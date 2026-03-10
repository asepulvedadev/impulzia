'use client'

import { createContext, useContext, useState } from 'react'
import Link from 'next/link'
import { Pencil, X, ExternalLink } from 'lucide-react'
import type { BusinessLanding } from '@/modules/negocios/interfaces'

interface EditModeContextValue {
  isEditMode: boolean
  isOwner: boolean
  businessId: string
}

const EditModeContext = createContext<EditModeContextValue>({
  isEditMode: false,
  isOwner: false,
  businessId: '',
})

export function useEditMode() {
  return useContext(EditModeContext)
}

interface EditModeProviderProps {
  isOwner: boolean
  businessId: string
  business: BusinessLanding
  children: React.ReactNode
}

export function EditModeProvider({ isOwner, businessId, business, children }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false)

  return (
    <EditModeContext.Provider value={{ isEditMode, isOwner, businessId }}>
      {children}

      {/* Floating toolbar — owner only */}
      {isOwner && (
        <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
          {isEditMode && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md w-56">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Edición en desarrollo
              </p>
              <p className="text-xs text-white/50 mb-3">
                Pronto podrás editar cada elemento haciendo clic directamente en él.
              </p>
              <Link
                href="/panel"
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ir al panel
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsEditMode((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
            style={{
              background: isEditMode ? '#ef4444' : business.brand_color_primary,
            }}
            aria-label={isEditMode ? 'Cerrar edición' : 'Editar página'}
          >
            {isEditMode ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Pencil className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      )}
    </EditModeContext.Provider>
  )
}
