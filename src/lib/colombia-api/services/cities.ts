// ─── Colombia API — Cities Service ───────────────────────────────────────────

import { colombiaFetch } from '../client'
import type {
  City,
  ColombiaApiListParams,
  ColombiaApiPagedParams,
  ColombiaApiPagedResponse,
} from '../types'

export const citiesService = {
  /**
   * Returns all cities in Colombia.
   * Cached for 24h — data rarely changes.
   */
  getAll(params?: ColombiaApiListParams): Promise<City[]> {
    return colombiaFetch<City[]>('/City', {
      params: params as Record<string, string>,
      revalidate: 86400,
    })
  },

  getById(id: number): Promise<City> {
    return colombiaFetch<City>(`/City/${id}`, { revalidate: 86400 })
  },

  getByName(name: string): Promise<City> {
    return colombiaFetch<City>(`/City/name/${encodeURIComponent(name)}`, {
      revalidate: 86400,
    })
  },

  search(keyword: string): Promise<City[]> {
    return colombiaFetch<City[]>(`/City/search/${encodeURIComponent(keyword)}`, {
      revalidate: 3600,
    })
  },

  getPaged(params?: ColombiaApiPagedParams): Promise<ColombiaApiPagedResponse<City>> {
    return colombiaFetch<ColombiaApiPagedResponse<City>>('/City/pagedList', {
      params: params as Record<string, string | number>,
      revalidate: 86400,
    })
  },
}
