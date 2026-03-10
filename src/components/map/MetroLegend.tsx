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
    <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-700 bg-slate-900/90 p-3 backdrop-blur-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Municipios
      </p>
      <ul className="flex flex-col gap-1">
        {municipios.map((m) => (
          <li key={m.MPIOS}>
            <button
              onClick={() => onSelect(selected === m.MPIOS ? null : m.MPIOS)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs transition-colors',
                selected === m.MPIOS
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800',
              )}
            >
              <span
                className="h-3 w-3 flex-shrink-0 rounded-sm"
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
