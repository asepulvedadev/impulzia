'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { saveHoursAction } from '../actions/business.actions'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface HourEntry {
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

interface BusinessHoursFormProps {
  businessId: string
  initialHours?: HourEntry[]
}

function defaultHours(): HourEntry[] {
  return Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    open_time: '08:00',
    close_time: '18:00',
    is_closed: i === 0, // Domingo cerrado
  }))
}

export function BusinessHoursForm({ businessId, initialHours }: BusinessHoursFormProps) {
  const [hours, setHours] = useState<HourEntry[]>(initialHours ?? defaultHours())
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const updateHour = (index: number, field: keyof HourEntry, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
  }

  const applyToWeekdays = () => {
    const monday = hours.find((h) => h.day_of_week === 1)
    if (!monday) return
    setHours((prev) =>
      prev.map((h) =>
        h.day_of_week >= 1 && h.day_of_week <= 5
          ? { ...h, open_time: monday.open_time, close_time: monday.close_time, is_closed: false }
          : h,
      ),
    )
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveHoursAction(businessId, hours)
      if (result.success) {
        setMessage({ type: 'success', text: 'Horarios guardados' })
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Error al guardar' })
      }
      setTimeout(() => setMessage(null), 3000)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-white">Horarios de atención</h3>
        <Button type="button" variant="ghost" size="sm" onClick={applyToWeekdays}>
          Aplicar L-V igual
        </Button>
      </div>

      <div className="space-y-2">
        {hours
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map((entry, index) => (
            <div
              key={entry.day_of_week}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 p-3"
            >
              <span className="w-24 text-sm font-medium text-slate-300">
                {DAY_NAMES[entry.day_of_week]}
              </span>

              <label className="flex items-center gap-1.5 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={entry.is_closed}
                  onChange={(e) => updateHour(index, 'is_closed', e.target.checked)}
                  className="rounded border-card-border"
                />
                Cerrado
              </label>

              {!entry.is_closed && (
                <>
                  <input
                    type="time"
                    value={entry.open_time}
                    onChange={(e) => updateHour(index, 'open_time', e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-muted">a</span>
                  <input
                    type="time"
                    value={entry.close_time}
                    onChange={(e) => updateHour(index, 'close_time', e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                  />
                </>
              )}
            </div>
          ))}
      </div>

      {message && (
        <p
          className={`text-sm ${message.type === 'success' ? 'text-brand-success-600' : 'text-brand-error-600'}`}
        >
          {message.text}
        </p>
      )}

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar horarios'
        )}
      </Button>
    </div>
  )
}
