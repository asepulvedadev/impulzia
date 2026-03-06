import { describe, it, expect } from 'vitest'
import { formatPhone, formatWhatsAppLink, isOpenNow, getBusinessStatus, truncate } from './format'

describe('formatPhone', () => {
  it('formats Colombian phone with +57', () => {
    expect(formatPhone('+573001234567')).toBe('300 123 4567')
  })

  it('formats phone without +57', () => {
    expect(formatPhone('3001234567')).toBe('300 123 4567')
  })

  it('returns original if unrecognized format', () => {
    expect(formatPhone('123')).toBe('123')
  })
})

describe('formatWhatsAppLink', () => {
  it('creates WhatsApp link with +57 prefix', () => {
    expect(formatWhatsAppLink('+573001234567')).toBe('https://wa.me/573001234567')
  })

  it('adds 57 prefix if missing', () => {
    expect(formatWhatsAppLink('3001234567')).toBe('https://wa.me/573001234567')
  })
})

describe('isOpenNow', () => {
  it('returns isOpen false for empty hours', () => {
    const result = isOpenNow([])
    expect(result.isOpen).toBe(false)
  })

  it('returns isOpen false for closed day', () => {
    const dayOfWeek = new Date().getDay()
    const hours = [
      {
        id: '1',
        business_id: 'b1',
        day_of_week: dayOfWeek,
        open_time: null,
        close_time: null,
        is_closed: true,
      },
    ]
    const result = isOpenNow(hours)
    expect(result.isOpen).toBe(false)
  })
})

describe('getBusinessStatus', () => {
  it('returns closed for empty hours', () => {
    expect(getBusinessStatus([])).toBe('closed')
  })
})

describe('truncate', () => {
  it('truncates text longer than maxLength', () => {
    expect(truncate('Hello World', 5)).toBe('He...')
  })

  it('does not truncate shorter text', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })
})
