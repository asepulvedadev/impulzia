import { describe, it, expect } from 'vitest'
import {
  createBusinessSchema,
  updateBusinessSchema,
  businessHoursSchema,
  searchBusinessSchema,
} from '../validations/business.schema'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('createBusinessSchema', () => {
  const validData = {
    name: 'Mi Restaurante',
    category_id: VALID_UUID,
  }

  it('accepts valid minimal data', () => {
    const result = createBusinessSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('accepts full valid data', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      slug: 'mi-restaurante',
      description: 'Un restaurante increíble',
      short_description: 'Comida casera',
      phone: '+573001234567',
      whatsapp: '3001234567',
      email: 'info@mirestaurante.com',
      website: 'https://mirestaurante.com',
      address: 'Calle 10 #5-20',
      neighborhood: 'Centro',
      city: 'Cúcuta',
    })
    expect(result.success).toBe(true)
  })

  it('rejects name shorter than 3 characters', () => {
    const result = createBusinessSchema.safeParse({ ...validData, name: 'Mi' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 3 caracteres')
    }
  })

  it('rejects name longer than 100 characters', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      name: 'A'.repeat(101),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre no puede tener más de 100 caracteres')
    }
  })

  it('rejects invalid slug format', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      slug: 'Mi Negocio',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'El slug solo puede contener letras minúsculas, números y guiones',
      )
    }
  })

  it('accepts valid slug', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      slug: 'mi-restaurante-123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short_description longer than 160 characters', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      short_description: 'A'.repeat(161),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'La descripción corta no puede tener más de 160 caracteres',
      )
    }
  })

  it('rejects invalid category_id', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      category_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Selecciona una categoría válida')
    }
  })

  it('rejects invalid phone format', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      phone: '123456',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa un número de teléfono colombiano válido')
    }
  })

  it('accepts Colombian phone formats', () => {
    expect(createBusinessSchema.safeParse({ ...validData, phone: '+573001234567' }).success).toBe(
      true,
    )
    expect(createBusinessSchema.safeParse({ ...validData, phone: '3001234567' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa un correo electrónico válido')
    }
  })

  it('rejects invalid website URL', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      website: 'not-a-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa una URL válida')
    }
  })

  it('rejects address shorter than 5 characters', () => {
    const result = createBusinessSchema.safeParse({
      ...validData,
      address: 'Cl 1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La dirección debe tener al menos 5 caracteres')
    }
  })

  it('defaults city to Cúcuta', () => {
    const result = createBusinessSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.city).toBe('Cúcuta')
    }
  })

  it('requires category_id', () => {
    const result = createBusinessSchema.safeParse({ name: 'Mi Negocio' })
    expect(result.success).toBe(false)
  })
})

describe('updateBusinessSchema', () => {
  it('accepts partial data', () => {
    const result = updateBusinessSchema.safeParse({ name: 'Nuevo Nombre' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateBusinessSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('still validates field constraints', () => {
    const result = updateBusinessSchema.safeParse({ name: 'AB' })
    expect(result.success).toBe(false)
  })

  it('does not allow slug changes', () => {
    const result = updateBusinessSchema.safeParse({ slug: 'new-slug' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('slug')
    }
  })
})

describe('businessHoursSchema', () => {
  const validHours = [
    { day_of_week: 0, open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 1, open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 2, open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 3, open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 4, open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 5, open_time: '09:00', close_time: '14:00', is_closed: false },
    { day_of_week: 6, open_time: '00:00', close_time: '00:00', is_closed: true },
  ]

  it('accepts valid 7-day schedule', () => {
    const result = businessHoursSchema.safeParse(validHours)
    expect(result.success).toBe(true)
  })

  it('rejects less than 7 entries', () => {
    const result = businessHoursSchema.safeParse(validHours.slice(0, 3))
    expect(result.success).toBe(false)
  })

  it('rejects more than 7 entries', () => {
    const result = businessHoursSchema.safeParse([
      ...validHours,
      { day_of_week: 0, open_time: '08:00', close_time: '18:00', is_closed: false },
    ])
    expect(result.success).toBe(false)
  })

  it('rejects invalid day_of_week', () => {
    const result = businessHoursSchema.safeParse([
      { ...validHours[0], day_of_week: 7 },
      ...validHours.slice(1),
    ])
    expect(result.success).toBe(false)
  })

  it('rejects invalid time format', () => {
    const result = businessHoursSchema.safeParse([
      { ...validHours[0], open_time: '25:00' },
      ...validHours.slice(1),
    ])
    expect(result.success).toBe(false)
  })

  it('accepts closed days without time validation', () => {
    const closedDay = {
      day_of_week: 0,
      open_time: '00:00',
      close_time: '00:00',
      is_closed: true,
    }
    const hours = [closedDay, ...validHours.slice(1)]
    const result = businessHoursSchema.safeParse(hours)
    expect(result.success).toBe(true)
  })
})

describe('searchBusinessSchema', () => {
  it('accepts empty search (all defaults)', () => {
    const result = searchBusinessSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.per_page).toBe(12)
      expect(result.data.sort_by).toBe('recent')
    }
  })

  it('accepts valid search params', () => {
    const result = searchBusinessSchema.safeParse({
      query: 'restaurante',
      category_id: VALID_UUID,
      city: 'Cúcuta',
      sort_by: 'name',
      page: 2,
      per_page: 24,
    })
    expect(result.success).toBe(true)
  })

  it('rejects per_page above 50', () => {
    const result = searchBusinessSchema.safeParse({ per_page: 100 })
    expect(result.success).toBe(false)
  })

  it('rejects page below 1', () => {
    const result = searchBusinessSchema.safeParse({ page: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid sort_by value', () => {
    const result = searchBusinessSchema.safeParse({ sort_by: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('accepts is_verified filter', () => {
    const result = searchBusinessSchema.safeParse({ is_verified: true })
    expect(result.success).toBe(true)
  })
})
