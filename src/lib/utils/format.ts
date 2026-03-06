import type { Database } from '@/lib/supabase/database.types'

type BusinessHoursRow = Database['public']['Tables']['business_hours']['Row']

export function formatCurrency(amount: number, currency = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/^\+57/, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

export function formatWhatsAppLink(phone: string): string {
  const cleaned = phone.replace(/^\+/, '')
  const withPrefix = cleaned.startsWith('57') ? cleaned : `57${cleaned}`
  return `https://wa.me/${withPrefix}`
}

export function isOpenNow(hours: BusinessHoursRow[]): {
  isOpen: boolean
  closesAt?: string
  opensAt?: string
} {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const todayHours = hours.find((h) => h.day_of_week === dayOfWeek)

  if (!todayHours || todayHours.is_closed || !todayHours.open_time || !todayHours.close_time) {
    for (let i = 1; i <= 7; i++) {
      const nextDay = (dayOfWeek + i) % 7
      const nextHours = hours.find((h) => h.day_of_week === nextDay)
      if (nextHours && !nextHours.is_closed && nextHours.open_time) {
        return { isOpen: false, opensAt: nextHours.open_time }
      }
    }
    return { isOpen: false }
  }

  if (currentTime >= todayHours.open_time && currentTime < todayHours.close_time) {
    return { isOpen: true, closesAt: todayHours.close_time }
  }

  if (currentTime < todayHours.open_time) {
    return { isOpen: false, opensAt: todayHours.open_time }
  }

  return { isOpen: false }
}

export function getBusinessStatus(hours: BusinessHoursRow[]): 'open' | 'closed' | 'closing_soon' {
  const status = isOpenNow(hours)

  if (!status.isOpen) return 'closed'

  if (status.closesAt) {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const [closeH, closeM] = status.closesAt.split(':').map(Number)
    const closeMinutes = closeH * 60 + closeM
    if (closeMinutes - currentMinutes <= 60) return 'closing_soon'
  }

  return 'open'
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
