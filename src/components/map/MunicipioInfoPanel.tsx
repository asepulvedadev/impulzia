'use client'

import { X, MapPin } from 'lucide-react'
import { clsx } from 'clsx'
import { getMunicipioColor } from './MunicipioLayer'

interface MunicipioData {
  MPIOS: string
  NOMBRE_MPI: string
  HECTARES: number
  AREA: number
}

interface MunicipioInfoPanelProps {
  municipio: MunicipioData | null
  onClose: () => void
}

const MUNICIPIO_LABELS: Record<string, { label: string; desc: string }> = {
  '54001': { label: 'Cúcuta', desc: 'Capital del Norte de Santander' },
  '54405': { label: 'Los Patios', desc: 'Municipio del área metropolitana' },
  '54874': { label: 'Villa del Rosario', desc: 'Municipio del área metropolitana' },
  '54673': { label: 'San Cayetano', desc: 'Municipio del área metropolitana' },
  '54261': { label: 'El Zulia', desc: 'Municipio del área metropolitana' },
}

export function MunicipioInfoPanel({ municipio, onClose }: MunicipioInfoPanelProps) {
  if (!municipio) return null

  const color = getMunicipioColor(municipio.MPIOS)
  const meta = MUNICIPIO_LABELS[municipio.MPIOS]
  const hectares = Math.round(municipio.HECTARES).toLocaleString('es-CO')

  return (
    <div
      className={clsx(
        'absolute z-[1000] rounded-xl border border-slate-700',
        'bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm',
        // Mobile: bottom bar full width; sm+: top-right panel
        'bottom-4 left-4 right-4 top-auto w-auto',
        'sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-64',
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 flex-shrink-0 rounded"
            style={{ backgroundColor: color }}
          />
          <div>
            <h3 className="text-sm font-bold text-white">
              {meta?.label ?? municipio.NOMBRE_MPI}
            </h3>
            <p className="text-xs text-slate-400">{meta?.desc}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-2">
          <MapPin size={13} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Área</p>
            <p className="text-xs font-semibold text-slate-200">{hectares} ha</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-2">
          <span className="text-xs text-slate-500">Código DANE</span>
          <span className="ml-auto font-mono text-xs text-slate-300">{municipio.MPIOS}</span>
        </div>
      </div>
    </div>
  )
}
