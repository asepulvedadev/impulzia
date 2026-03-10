'use client'

import { GeoJSON } from 'react-leaflet'
import type { Feature, GeoJsonObject } from 'geojson'
import type { PathOptions, Layer } from 'leaflet'

export interface MunicipioProperties {
  MPIOS: string
  NOMBRE_MPI: string
  HECTARES: number
  color: string
}

const MUNICIPIO_COLORS: Record<string, string> = {
  '54001': '#2563EB', // Cúcuta — brand primary
  '54405': '#F97316', // Los Patios — brand accent
  '54874': '#10B981', // Villa del Rosario — brand success
  '54673': '#8B5CF6', // San Cayetano — purple
  '54261': '#06B6D4', // El Zulia — cyan
}

export function getMunicipioColor(mpios: string): string {
  return MUNICIPIO_COLORS[mpios] ?? '#64748B'
}

interface MunicipioLayerProps {
  geojson: GeoJsonObject
  selectedMpio: string | null
  onSelectMpio: (mpios: string | null) => void
}

export function MunicipioLayer({ geojson, selectedMpio, onSelectMpio }: MunicipioLayerProps) {
  function style(feature?: Feature): PathOptions {
    const mpios = feature?.properties?.MPIOS as string | undefined
    const color = getMunicipioColor(mpios ?? '')
    const isSelected = mpios === selectedMpio

    return {
      fillColor: color,
      fillOpacity: isSelected ? 0.55 : 0.25,
      color,
      weight: isSelected ? 2.5 : 1.5,
      opacity: 0.85,
    }
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const mpios = feature.properties?.MPIOS as string
    const nombre = feature.properties?.NOMBRE_MPI as string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(layer as any).on({
      click() {
        onSelectMpio(selectedMpio === mpios ? null : mpios)
      },
      mouseover(e: { target: { setStyle: (s: PathOptions) => void; bringToFront: () => void } }) {
        e.target.setStyle({ fillOpacity: 0.5, weight: 2.5 })
        e.target.bringToFront()
      },
      mouseout(e: { target: { setStyle: (s: PathOptions) => void } }) {
        e.target.setStyle(style(feature))
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(layer as any).bindTooltip(nombre, {
      permanent: false,
      direction: 'center',
      className: 'leaflet-tooltip-dark',
    })
  }

  return (
    <GeoJSON
      key={selectedMpio}
      data={geojson}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}
