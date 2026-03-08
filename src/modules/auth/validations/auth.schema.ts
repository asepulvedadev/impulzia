import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
  city: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
