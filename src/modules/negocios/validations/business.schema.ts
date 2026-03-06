import { z } from 'zod'

const COLOMBIAN_PHONE_REGEX = /^(\+57)?3\d{9}$/

const timeFormat = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ingresa una hora válida en formato HH:MM')

export const createBusinessSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(60, 'El slug no puede tener más de 60 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional(),
  description: z
    .string()
    .max(1000, 'La descripción no puede tener más de 1000 caracteres')
    .optional(),
  short_description: z
    .string()
    .max(160, 'La descripción corta no puede tener más de 160 caracteres')
    .optional(),
  category_id: z.string().uuid('Selecciona una categoría válida'),
  phone: z
    .string()
    .regex(COLOMBIAN_PHONE_REGEX, 'Ingresa un número de teléfono colombiano válido')
    .optional(),
  whatsapp: z
    .string()
    .regex(COLOMBIAN_PHONE_REGEX, 'Ingresa un número de WhatsApp colombiano válido')
    .optional(),
  email: z.string().email('Ingresa un correo electrónico válido').optional(),
  website: z.string().url('Ingresa una URL válida').optional(),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').optional(),
  neighborhood: z.string().optional(),
  city: z.string().default('Cúcuta'),
})

export const updateBusinessSchema = createBusinessSchema
  .omit({ slug: true, category_id: true })
  .partial()
  .extend({
    category_id: z.string().uuid('Selecciona una categoría válida').optional(),
  })

const businessHourEntry = z.object({
  day_of_week: z
    .number()
    .int()
    .min(0, 'El día debe ser entre 0 (domingo) y 6 (sábado)')
    .max(6, 'El día debe ser entre 0 (domingo) y 6 (sábado)'),
  open_time: timeFormat,
  close_time: timeFormat,
  is_closed: z.boolean(),
})

export const businessHoursSchema = z
  .array(businessHourEntry)
  .length(7, 'Debes incluir los 7 días de la semana')

export const searchBusinessSchema = z.object({
  query: z.string().optional(),
  category_id: z.string().uuid('Categoría inválida').optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  is_verified: z.boolean().optional(),
  sort_by: z.enum(['recent', 'name', 'rating']).default('recent'),
  page: z.number().int().min(1, 'La página debe ser al menos 1').default(1),
  per_page: z
    .number()
    .int()
    .min(1, 'Mínimo 1 resultado por página')
    .max(50, 'Máximo 50 resultados por página')
    .default(12),
})

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>
export type SearchBusinessInput = z.infer<typeof searchBusinessSchema>
