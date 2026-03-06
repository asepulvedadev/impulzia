import { describe, it, expect, vi } from 'vitest'
import { createBusinessUseCase } from '../use-cases/create-business'
import { updateBusinessUseCase } from '../use-cases/update-business'
import { searchBusinessesUseCase } from '../use-cases/search-businesses'
import type { BusinessService } from '../services/business.service'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const OWNER_ID = '660e8400-e29b-41d4-a716-446655440001'

const mockService = {
  create: vi.fn(),
  getById: vi.fn(),
  getBySlug: vi.fn(),
  getByOwnerId: vi.fn(),
  update: vi.fn(),
  search: vi.fn(),
  getFeatured: vi.fn(),
  getCategories: vi.fn(),
  saveHours: vi.fn(),
  getHours: vi.fn(),
  uploadLogo: vi.fn(),
  uploadCover: vi.fn(),
} as unknown as BusinessService & Record<string, ReturnType<typeof vi.fn>>

describe('createBusinessUseCase', () => {
  it('validates input before calling service', async () => {
    const result = await createBusinessUseCase(
      mockService,
      { name: 'AB', category_id: 'bad' },
      OWNER_ID,
    )
    expect(result.success).toBe(false)
    expect(result.error).toContain('al menos 3 caracteres')
  })

  it('checks if user already has a business', async () => {
    ;(mockService as Record<string, ReturnType<typeof vi.fn>>).getByOwnerId.mockResolvedValueOnce({
      data: { id: VALID_UUID },
      success: true,
      error: null,
    })

    const result = await createBusinessUseCase(
      mockService,
      { name: 'Mi Negocio', category_id: VALID_UUID },
      OWNER_ID,
    )
    expect(result.success).toBe(false)
    expect(result.error).toContain('Ya tienes un negocio')
  })

  it('calls service.create with valid data', async () => {
    ;(mockService as Record<string, ReturnType<typeof vi.fn>>).getByOwnerId.mockResolvedValueOnce({
      data: null,
      success: true,
      error: null,
    })
    ;(mockService as Record<string, ReturnType<typeof vi.fn>>).create.mockResolvedValueOnce({
      data: { id: VALID_UUID, name: 'Mi Negocio' },
      success: true,
      error: null,
    })

    const result = await createBusinessUseCase(
      mockService,
      { name: 'Mi Negocio', category_id: VALID_UUID },
      OWNER_ID,
    )
    expect(result.success).toBe(true)
  })
})

describe('updateBusinessUseCase', () => {
  it('validates input before calling service', async () => {
    const result = await updateBusinessUseCase(mockService, VALID_UUID, { name: 'AB' }, OWNER_ID)
    expect(result.success).toBe(false)
    expect(result.error).toContain('al menos 3 caracteres')
  })

  it('calls service.update with valid data', async () => {
    ;(mockService as Record<string, ReturnType<typeof vi.fn>>).update.mockResolvedValueOnce({
      data: { id: VALID_UUID, name: 'Nuevo Nombre' },
      success: true,
      error: null,
    })

    const result = await updateBusinessUseCase(
      mockService,
      VALID_UUID,
      { name: 'Nuevo Nombre' },
      OWNER_ID,
    )
    expect(result.success).toBe(true)
  })
})

describe('searchBusinessesUseCase', () => {
  it('applies default values for empty search', async () => {
    ;(mockService as Record<string, ReturnType<typeof vi.fn>>).search.mockResolvedValueOnce({
      data: { data: [], total: 0, page: 1, total_pages: 0 },
      success: true,
      error: null,
    })

    const result = await searchBusinessesUseCase(mockService, {})
    expect(result.success).toBe(true)
    expect((mockService as Record<string, ReturnType<typeof vi.fn>>).search).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, per_page: 12, sort_by: 'recent' }),
    )
  })

  it('rejects invalid search params', async () => {
    const result = await searchBusinessesUseCase(mockService, { per_page: 100 })
    expect(result.success).toBe(false)
  })
})
