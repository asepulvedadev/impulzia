import { describe, it, expect } from 'vitest'
import { signupSchema, loginSchema, updateProfileSchema } from '../validations/auth.schema'

describe('signupSchema', () => {
  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      fullName: 'Juan Pérez',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({
      email: 'not-an-email',
      password: 'Password1',
      fullName: 'Juan',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes('email'))
      expect(emailError).toBeDefined()
    }
  })

  it('rejects short password', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Pass1',
      fullName: 'Juan',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'password1',
      fullName: 'Juan',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without number', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password',
      fullName: 'Juan',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short fullName', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      fullName: 'J',
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      password: 'anypassword',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateProfileSchema', () => {
  it('accepts partial update data', () => {
    const result = updateProfileSchema.safeParse({
      fullName: 'New Name',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    const result = updateProfileSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects fullName shorter than 2 chars', () => {
    const result = updateProfileSchema.safeParse({
      fullName: 'A',
    })
    expect(result.success).toBe(false)
  })
})
