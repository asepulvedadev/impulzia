'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import 'leaflet/dist/leaflet.css'

import { MunicipioLayer } from './MunicipioLayer'
import { MetroLegend } from './MetroLegend'
import { MunicipioInfoPanel } from './MunicipioInfoPanel'

// Cúcuta metro area center
const METRO_CENTER: [number, number] = [7.87, -72.53]
const DEFAULT_ZOOM = 11

interface MunicipioProperties {
  MPIOS: string
  NOMBRE_MPI: string
  HECTARES: number
  AREA: number
}

interface Feature {
  properties: MunicipioProperties
}

export function MapaCucutaInner() {
  const [geojson, setGeojson] = useState<GeoJsonObject | null>(null)
  const [selectedMpio, setSelectedMpio] = useState<string | null>(null)

  useEffect(() => {
    fetch('/geojson/cucuta-metro.geojson')
      .then((r) => r.json())
      .then(setGeojson)
      .catch(console.error)
  }, [])

  const mpioList: MunicipioProperties[] = geojson
    ? (geojson as unknown as { features: Feature[] }).features.map((f) => f.properties)
    : []

  const selectedData = mpioList.find((m) => m.MPIOS === selectedMpio) ?? null

  if (!geojson) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Cargando área metropolitana...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={METRO_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: '#0f172a' }}
      >
        {/* Dark CartoDB tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <ZoomControl position="bottomright" />

        <MunicipioLayer
          geojson={geojson}
          selectedMpio={selectedMpio}
          onSelectMpio={setSelectedMpio}
        />
      </MapContainer>

      <MetroLegend
        municipios={mpioList}
        selected={selectedMpio}
        onSelect={setSelectedMpio}
      />

      <MunicipioInfoPanel
        municipio={selectedData}
        onClose={() => setSelectedMpio(null)}
      />

      {/* Header overlay */}
      <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2 backdrop-blur-sm">
        <p className="text-center text-xs font-semibold text-white">
          Área Metropolitana de Cúcuta
        </p>
        <p className="text-center text-xs text-slate-400">
          {mpioList.length} municipios · Haz click para explorar
        </p>
      </div>
    </div>
  )
}
