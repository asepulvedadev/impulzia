import { describe, it, expect, vi } from 'vitest'
import { SlugService } from '../services/slug.service'

function mockSupabase(existingSlugs: string[]): unknown {
  return {
    from: () => ({
      select: () => ({
        eq: (_col: string, slug: string) => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: existingSlugs.includes(slug) ? { slug } : null,
            error: null,
          }),
        }),
      }),
    }),
  }
}

describe('SlugService', () => {
  describe('generate', () => {
    it('converts name to slug', () => {
      expect(SlugService.generate('Mi Restaurante')).toBe('mi-restaurante')
    })

    it('handles accented characters', () => {
      expect(SlugService.generate('Cafetería Ñoño')).toBe('cafeteria-nono')
    })

    it('removes special characters', () => {
      expect(SlugService.generate('Tienda #1!')).toBe('tienda-1')
    })

    it('handles multiple spaces', () => {
      expect(SlugService.generate('Mi   Gran   Tienda')).toBe('mi-gran-tienda')
    })
  })

  describe('ensureUnique', () => {
    it('returns original slug if available', async () => {
      const supabase = mockSupabase([])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SlugService.ensureUnique('mi-tienda', supabase as any)
      expect(result).toBe('mi-tienda')
    })

    it('appends number if slug exists', async () => {
      const supabase = mockSupabase(['mi-tienda'])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SlugService.ensureUnique('mi-tienda', supabase as any)
      expect(result).toBe('mi-tienda-2')
    })

    it('increments number until unique', async () => {
      const supabase = mockSupabase(['mi-tienda', 'mi-tienda-2', 'mi-tienda-3'])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SlugService.ensureUnique('mi-tienda', supabase as any)
      expect(result).toBe('mi-tienda-4')
    })
  })
})
