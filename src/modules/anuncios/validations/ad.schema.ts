import { z } from 'zod'

const now = () => new Date()

// Base fields (without superRefine) to allow .partial()
const adBaseFields = {
  title: z
    .string()
    .min(5, 'El título debe tener entre 5 y 80 caracteres')
    .max(80, 'El título debe tener entre 5 y 80 caracteres'),
  description: z
    .string()
    .max(300, 'La descripción no puede tener más de 300 caracteres')
    .optional(),
  type: z.enum(['banner', 'featured', 'promotion'] as const, {
    error: 'Tipo de anuncio inválido',
  }),
  image_url: z.string().url('La URL de imagen no es válida').optional(),
  cta_text: z
    .string()
    .max(30, 'El texto del botón no puede tener más de 30 caracteres')
    .default('Ver más'),
  cta_url: z.string().url('La URL de destino no es válida').optional(),
  target_categories: z.array(z.string().uuid('Categoría inválida')).optional(),
  target_neighborhoods: z.array(z.string()).optional(),
  schedule_start: z
    .string()
    .datetime({ message: 'La fecha de inicio no es válida' })
    .optional()
    .refine((val) => !val || new Date(val) >= new Date(now().toDateString()), {
      message: 'La fecha de inicio no puede ser en el pasado',
    }),
  schedule_end: z.string().datetime({ message: 'La fecha de fin no es válida' }).optional(),
  daily_start_hour: z
    .number()
    .int()
    .min(0, 'La hora debe ser entre 0 y 23')
    .max(23, 'La hora debe ser entre 0 y 23')
    .optional(),
  daily_end_hour: z
    .number()
    .int()
    .min(0, 'La hora debe ser entre 0 y 23')
    .max(23, 'La hora debe ser entre 0 y 23')
    .optional(),
}

function refineCrossFieldCreate(
  data: {
    type?: 'banner' | 'featured' | 'promotion'
    image_url?: string
    schedule_start?: string
    schedule_end?: string
    daily_start_hour?: number
    daily_end_hour?: number
  },
  ctx: z.RefinementCtx,
) {
  if (data.type === 'banner' && !data.image_url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Los anuncios de tipo banner requieren una imagen',
      path: ['image_url'],
    })
  }

  if (data.schedule_start && data.schedule_end) {
    if (new Date(data.schedule_end) <= new Date(data.schedule_start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['schedule_end'],
      })
    }
  }

  if (
    data.daily_start_hour !== undefined &&
    data.daily_end_hour !== undefined &&
    data.daily_end_hour <= data.daily_start_hour
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La hora de fin debe ser mayor que la hora de inicio',
      path: ['daily_end_hour'],
    })
  }
}

export const createAdSchema = z.object(adBaseFields).superRefine(refineCrossFieldCreate)

// Update schema: type and business_id cannot be changed
const updateBaseFields = {
  title: adBaseFields.title.optional(),
  description: adBaseFields.description,
  image_url: adBaseFields.image_url,
  cta_text: adBaseFields.cta_text.optional(),
  cta_url: adBaseFields.cta_url,
  target_categories: adBaseFields.target_categories,
  target_neighborhoods: adBaseFields.target_neighborhoods,
  schedule_start: adBaseFields.schedule_start,
  schedule_end: adBaseFields.schedule_end,
  daily_start_hour: adBaseFields.daily_start_hour,
  daily_end_hour: adBaseFields.daily_end_hour,
}

export const updateAdSchema = z.object(updateBaseFields).superRefine((data, ctx) => {
  if (data.schedule_start && data.schedule_end) {
    if (new Date(data.schedule_end) <= new Date(data.schedule_start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['schedule_end'],
      })
    }
  }

  if (
    data.daily_start_hour !== undefined &&
    data.daily_end_hour !== undefined &&
    data.daily_end_hour <= data.daily_start_hour
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La hora de fin debe ser mayor que la hora de inicio',
      path: ['daily_end_hour'],
    })
  }
})

export const publishAdSchema = z
  .object({
    title: z.string().min(5, 'El título es requerido para publicar'),
    type: z.enum(['banner', 'featured', 'promotion'] as const),
    image_url: z.string().url().optional(),
    schedule_start: z.string().datetime().optional(),
    schedule_end: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'banner' && !data.image_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Los anuncios de tipo banner requieren una imagen para publicarse',
        path: ['image_url'],
      })
    }

    if (data.schedule_end && new Date(data.schedule_end) <= now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser futura para publicar el anuncio',
        path: ['schedule_end'],
      })
    }
  })

export const adFiltersSchema = z.object({
  type: z.enum(['banner', 'featured', 'promotion'] as const).optional(),
  category_id: z.string().uuid('Categoría inválida').optional(),
  neighborhood: z.string().optional(),
  city: z.string().default('Cúcuta'),
  limit: z
    .number()
    .int()
    .min(1, 'El límite mínimo es 1')
    .max(20, 'El límite máximo es 20')
    .default(5),
})

export type CreateAdInput = z.infer<typeof createAdSchema>
export type UpdateAdInput = z.infer<typeof updateAdSchema>
export type PublishAdInput = z.infer<typeof publishAdSchema>
export type AdFiltersInput = z.infer<typeof adFiltersSchema>
