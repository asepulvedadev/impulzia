// ─── Colombia API — Traditional Fairs & Festivals Service ────────────────────

import { colombiaFetch } from '../client'
import type {
  TraditionalFairAndFestival,
  ColombiaApiListParams,
  ColombiaApiPagedParams,
  ColombiaApiPagedResponse,
} from '../types'

export const fairsService = {
  getAll(params?: ColombiaApiListParams): Promise<TraditionalFairAndFestival[]> {
    return colombiaFetch<TraditionalFairAndFestival[]>(
      '/TraditionalFairAndFestival',
      {
        params: params as Record<string, string>,
        revalidate: 86400,
      },
    )
  },

  getById(id: number): Promise<TraditionalFairAndFestival> {
    return colombiaFetch<TraditionalFairAndFestival>(
      `/TraditionalFairAndFestival/${id}`,
      { revalidate: 86400 },
    )
  },

  getByCity(cityId: number): Promise<TraditionalFairAndFestival[]> {
    return colombiaFetch<TraditionalFairAndFestival[]>(
      `/TraditionalFairAndFestival/${cityId}/city`,
      { revalidate: 86400 },
    )
  },

  search(keyword: string): Promise<TraditionalFairAndFestival[]> {
    return colombiaFetch<TraditionalFairAndFestival[]>(
      `/TraditionalFairAndFestival/search/${encodeURIComponent(keyword)}`,
      { revalidate: 3600 },
    )
  },

  getPaged(
    params?: ColombiaApiPagedParams,
  ): Promise<ColombiaApiPagedResponse<TraditionalFairAndFestival>> {
    return colombiaFetch<ColombiaApiPagedResponse<TraditionalFairAndFestival>>(
      '/TraditionalFairAndFestival/pagedList',
      {
        params: params as Record<string, string | number>,
        revalidate: 86400,
      },
    )
  },
}
