// ─── Colombia API — Touristic Attractions Service ────────────────────────────

import { colombiaFetch } from '../client'
import type {
  TouristicAttraction,
  ColombiaApiListParams,
  ColombiaApiPagedParams,
  ColombiaApiPagedResponse,
} from '../types'

export const touristicService = {
  getAll(params?: ColombiaApiListParams): Promise<TouristicAttraction[]> {
    return colombiaFetch<TouristicAttraction[]>('/TouristicAttraction', {
      params: params as Record<string, string>,
      revalidate: 86400,
    })
  },

  getById(id: number): Promise<TouristicAttraction> {
    return colombiaFetch<TouristicAttraction>(`/TouristicAttraction/${id}`, {
      revalidate: 86400,
    })
  },

  getByName(name: string): Promise<TouristicAttraction> {
    return colombiaFetch<TouristicAttraction>(
      `/TouristicAttraction/name/${encodeURIComponent(name)}`,
      { revalidate: 86400 },
    )
  },

  search(keyword: string): Promise<TouristicAttraction[]> {
    return colombiaFetch<TouristicAttraction[]>(
      `/TouristicAttraction/search/${encodeURIComponent(keyword)}`,
      { revalidate: 3600 },
    )
  },

  getPaged(
    params?: ColombiaApiPagedParams,
  ): Promise<ColombiaApiPagedResponse<TouristicAttraction>> {
    return colombiaFetch<ColombiaApiPagedResponse<TouristicAttraction>>(
      '/TouristicAttraction/pagedList',
      {
        params: params as Record<string, string | number>,
        revalidate: 86400,
      },
    )
  },
}
