import { z } from 'zod'

// ─────────────────────────────────────────────────────────
// Base fields shared between create/update
// ─────────────────────────────────────────────────────────
const incentiveBaseFields = {
  title: z
    .string()
    .min(3, 'El título debe tener entre 3 y 100 caracteres')
    .max(100, 'El título debe tener entre 3 y 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  image_url: z.string().url('La URL de imagen no es válida').optional(),
  terms: z.string().max(1000, 'Los términos no pueden tener más de 1000 caracteres').optional(),

  type: z.enum(['coupon', 'combo', 'reward'] as const, {
    error: 'Tipo de incentivo inválido',
  }),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_item'] as const).optional(),
  discount_value: z
    .number()
    .positive('El valor del descuento debe ser positivo')
    .max(100, 'El porcentaje no puede superar 100')
    .optional(),
  min_purchase: z.number().positive('La compra mínima debe ser positiva').optional(),

  code: z
    .string()
    .min(3, 'El código debe tener entre 3 y 20 caracteres')
    .max(20, 'El código debe tener entre 3 y 20 caracteres')
    .regex(
      /^[A-Z0-9_-]+$/,
      'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos',
    )
    .optional(),

  max_uses: z.number().int().positive('El límite de usos debe ser positivo').optional(),
  max_uses_per_user: z
    .number()
    .int()
    .min(1, 'El límite por usuario debe ser al menos 1')
    .max(10, 'El límite por usuario no puede superar 10')
    .default(1),

  start_date: z.string().datetime({ message: 'La fecha de inicio no es válida' }).optional(),
  end_date: z.string().datetime({ message: 'La fecha de fin no es válida' }).optional(),

  target_categories: z.array(z.string().uuid('Categoría inválida')).optional(),
  target_neighborhoods: z.array(z.string()).optional(),
}

// ─────────────────────────────────────────────────────────
// Cross-field validation function
// ─────────────────────────────────────────────────────────
function refineCrossField(
  data: {
    type?: 'coupon' | 'combo' | 'reward'
    discount_type?: 'percentage' | 'fixed_amount' | 'free_item'
    discount_value?: number
    start_date?: string
    end_date?: string
  },
  ctx: z.RefinementCtx,
) {
  // discount_value required when discount_type is percentage or fixed_amount
  if (data.discount_type && data.discount_type !== 'free_item' && !data.discount_value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El valor del descuento es requerido para este tipo',
      path: ['discount_value'],
    })
  }

  // percentage cannot exceed 100
  if (data.discount_type === 'percentage' && data.discount_value && data.discount_value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El porcentaje no puede superar 100%',
      path: ['discount_value'],
    })
  }

  // coupon or combo require discount_type
  if ((data.type === 'coupon' || data.type === 'combo') && !data.discount_type) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Los cupones y combos requieren un tipo de descuento',
      path: ['discount_type'],
    })
  }

  // end_date must be after start_date
  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['end_date'],
      })
    }
  }

  // end_date must be in the future
  if (data.end_date && new Date(data.end_date) <= new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de fin debe ser futura',
      path: ['end_date'],
    })
  }
}

// ─────────────────────────────────────────────────────────
// Create schema
// ─────────────────────────────────────────────────────────
export const createIncentiveSchema = z.object(incentiveBaseFields).superRefine(refineCrossField)

// ─────────────────────────────────────────────────────────
// Update schema (all fields optional except cross-field rules)
// ─────────────────────────────────────────────────────────
const updateBaseFields = {
  title: incentiveBaseFields.title.optional(),
  description: incentiveBaseFields.description,
  image_url: incentiveBaseFields.image_url,
  terms: incentiveBaseFields.terms,
  discount_type: incentiveBaseFields.discount_type,
  discount_value: incentiveBaseFields.discount_value,
  min_purchase: incentiveBaseFields.min_purchase,
  code: incentiveBaseFields.code,
  max_uses: incentiveBaseFields.max_uses,
  max_uses_per_user: incentiveBaseFields.max_uses_per_user.optional(),
  start_date: incentiveBaseFields.start_date,
  end_date: incentiveBaseFields.end_date,
  target_categories: incentiveBaseFields.target_categories,
  target_neighborhoods: incentiveBaseFields.target_neighborhoods,
}

export const updateIncentiveSchema = z.object(updateBaseFields).superRefine((data, ctx) => {
  if (data.discount_type && data.discount_type !== 'free_item' && !data.discount_value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El valor del descuento es requerido para este tipo',
      path: ['discount_value'],
    })
  }
  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['end_date'],
      })
    }
  }
})

// ─────────────────────────────────────────────────────────
// Publish validation (stricter subset)
// ─────────────────────────────────────────────────────────
export const publishIncentiveSchema = z
  .object({
    title: z.string().min(3, 'El título es requerido para publicar'),
    type: z.enum(['coupon', 'combo', 'reward'] as const),
    discount_type: z.enum(['percentage', 'fixed_amount', 'free_item'] as const).optional(),
    discount_value: z.number().positive().optional(),
    end_date: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.type === 'coupon' || data.type === 'combo') && !data.discount_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Los cupones y combos requieren un tipo de descuento para publicarse',
        path: ['discount_type'],
      })
    }
    if (data.end_date && new Date(data.end_date) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser futura para publicar',
        path: ['end_date'],
      })
    }
  })

// ─────────────────────────────────────────────────────────
// Filters schema
// ─────────────────────────────────────────────────────────
export const incentiveFiltersSchema = z.object({
  type: z.enum(['coupon', 'combo', 'reward'] as const).optional(),
  category_id: z.string().uuid('Categoría inválida').optional(),
  neighborhood: z.string().optional(),
  city: z.string().default('Cúcuta'),
  business_id: z.string().uuid().optional(),
  limit: z
    .number()
    .int()
    .min(1, 'El límite mínimo es 1')
    .max(50, 'El límite máximo es 50')
    .default(12),
  offset: z.number().int().min(0).default(0),
})

// ─────────────────────────────────────────────────────────
// Redeem schema
// ─────────────────────────────────────────────────────────
export const redeemIncentiveSchema = z.object({
  incentive_id: z.string().uuid('ID de incentivo inválido'),
})

// ─────────────────────────────────────────────────────────
// Validate token schema (business confirms redemption)
// ─────────────────────────────────────────────────────────
export const validateTokenSchema = z.object({
  token: z
    .string()
    .min(8, 'Token inválido')
    .max(8, 'Token inválido')
    .regex(/^[A-Z0-9]+$/, 'Token inválido'),
})

export type CreateIncentiveInput = z.infer<typeof createIncentiveSchema>
export type UpdateIncentiveInput = z.infer<typeof updateIncentiveSchema>
export type PublishIncentiveInput = z.infer<typeof publishIncentiveSchema>
export type IncentiveFiltersInput = z.infer<typeof incentiveFiltersSchema>
export type RedeemIncentiveInput = z.infer<typeof redeemIncentiveSchema>
export type ValidateTokenInput = z.infer<typeof validateTokenSchema>
