'use client'

import { clsx } from 'clsx'
import { getMunicipioColor } from './MunicipioLayer'

interface MunicipioItem {
  MPIOS: string
  NOMBRE_MPI: string
}

const DISPLAY_NAMES: Record<string, string> = {
  '54001': 'Cúcuta',
  '54405': 'Los Patios',
  '54874': 'Villa del Rosario',
  '54673': 'San Cayetano',
  '54261': 'El Zulia',
}

interface MetroLegendProps {
  municipios: MunicipioItem[]
  selected: string | null
  onSelect: (mpios: string | null) => void
}

export function MetroLegend({ municipios, selected, onSelect }: MetroLegendProps) {
  return (
    <div className="absolute z-[1000] rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-sm
      left-4 top-4 p-2
      sm:bottom-4 sm:left-4 sm:top-auto sm:p-3">
      {/* Desktop label */}
      <p className="mb-2 hidden text-xs font-semibold uppercase tracking-wider text-slate-400 sm:block">
        Municipios
      </p>
      {/* Mobile: horizontal scroll row; Desktop: vertical list */}
      <ul className="flex flex-row gap-1 overflow-x-auto sm:flex-col">
        {municipios.map((m) => (
          <li key={m.MPIOS} className="shrink-0">
            <button
              onClick={() => onSelect(selected === m.MPIOS ? null : m.MPIOS)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs transition-colors whitespace-nowrap',
                selected === m.MPIOS
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800',
              )}
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: getMunicipioColor(m.MPIOS) }}
              />
              <span className="font-medium">
                {DISPLAY_NAMES[m.MPIOS] ?? m.NOMBRE_MPI}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
