'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import type { BusinessCard } from '@/modules/negocios/interfaces'

// Fix default marker icon broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const METRO_CENTER: [number, number] = [7.87, -72.53]

function createBusinessIcon(color = '#2563EB') {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  })
}

function FeaturedIcon() {
  return createBusinessIcon('#F97316')
}
function DefaultIcon() {
  return createBusinessIcon('#2563EB')
}

// Fit bounds to markers when results change
function BoundsFitter({ businesses }: { businesses: BusinessCard[] }) {
  const map = useMap()

  useEffect(() => {
    const points = businesses.filter((b) => b.latitude && b.longitude)
    if (points.length === 0) {
      map.setView(METRO_CENTER, 12)
      return
    }
    if (points.length === 1) {
      map.setView([points[0].latitude!, points[0].longitude!], 15)
      return
    }
    const bounds = L.latLngBounds(points.map((b) => [b.latitude!, b.longitude!]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [businesses, map])

  return null
}

interface BusinessMarkerMapInnerProps {
  businesses: BusinessCard[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function BusinessMarkerMapInner({
  businesses,
  selectedId,
  onSelect,
}: BusinessMarkerMapInnerProps) {
  const withCoords = businesses.filter((b) => b.latitude && b.longitude)

  return (
    <MapContainer
      center={METRO_CENTER}
      zoom={12}
      zoomControl={false}
      className="h-full w-full"
      style={{ background: '#0f172a' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <BoundsFitter businesses={businesses} />

      {withCoords.map((b) => (
        <Marker
          key={b.id}
          position={[b.latitude!, b.longitude!]}
          icon={b.is_featured ? FeaturedIcon() : DefaultIcon()}
          eventHandlers={{ click: () => onSelect(b.id === selectedId ? null : b.id) }}
        >
          <Popup className="business-popup">
            <div className="min-w-[180px] rounded-xl bg-slate-900 p-3 text-white">
              {b.logo_url && (
                <img
                  src={b.logo_url}
                  alt={b.name}
                  className="mb-2 h-10 w-10 rounded-lg object-cover"
                />
              )}
              <p className="font-bold text-sm leading-tight">{b.name}</p>
              {b.business_categories?.name && (
                <p className="text-xs text-slate-400 mt-0.5">{b.business_categories.name}</p>
              )}
              {b.address && (
                <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                  <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  {b.address}
                </p>
              )}
              <Link
                href={`/negocio/${b.slug}`}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-brand-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary-500"
              >
                Ver negocio <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Empty state overlay */}
      {withCoords.length === 0 && businesses.length > 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-center backdrop-blur-sm">
            <MapPin className="mx-auto mb-1 h-5 w-5 text-slate-500" />
            <p className="text-xs text-slate-400">Negocios sin ubicación registrada</p>
          </div>
        </div>
      )}
    </MapContainer>
  )
}
