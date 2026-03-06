import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('converts simple text to slug', () => {
    expect(slugify('Mi Negocio')).toBe('mi-negocio')
  })

  it('replaces accented characters', () => {
    expect(slugify('Cafetería Ñoño')).toBe('cafeteria-nono')
    expect(slugify('Óptica Única')).toBe('optica-unica')
    expect(slugify('Güéra Café')).toBe('guera-cafe')
  })

  it('removes special characters', () => {
    expect(slugify('Mi Negocio #1!')).toBe('mi-negocio-1')
    expect(slugify('Tienda @Online')).toBe('tienda-online')
  })

  it('replaces multiple spaces with single dash', () => {
    expect(slugify('Mi    Gran   Negocio')).toBe('mi-gran-negocio')
  })

  it('removes consecutive dashes', () => {
    expect(slugify('mi---negocio')).toBe('mi-negocio')
  })

  it('trims dashes from start and end', () => {
    expect(slugify(' -Mi Negocio- ')).toBe('mi-negocio')
  })

  it('handles emojis by removing them', () => {
    expect(slugify('Tienda 🏪 Online')).toBe('tienda-online')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles string with only special characters', () => {
    expect(slugify('!@#$%')).toBe('')
  })

  it('preserves numbers', () => {
    expect(slugify('Tienda 24/7')).toBe('tienda-247')
  })
})
