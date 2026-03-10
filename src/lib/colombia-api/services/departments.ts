// ─── Colombia API — Departments Service ──────────────────────────────────────

import { colombiaFetch } from '../client'
import type {
  City,
  Department,
  ColombiaApiListParams,
  ColombiaApiPagedParams,
  ColombiaApiPagedResponse,
  NaturalArea,
  TouristicAttraction,
} from '../types'

export const departmentsService = {
  getAll(params?: ColombiaApiListParams): Promise<Department[]> {
    return colombiaFetch<Department[]>('/Department', {
      params: params as Record<string, string>,
      revalidate: 86400,
    })
  },

  getById(id: number): Promise<Department> {
    return colombiaFetch<Department>(`/Department/${id}`, { revalidate: 86400 })
  },

  getByName(name: string): Promise<Department> {
    return colombiaFetch<Department>(
      `/Department/name/${encodeURIComponent(name)}`,
      { revalidate: 86400 },
    )
  },

  search(keyword: string): Promise<Department[]> {
    return colombiaFetch<Department[]>(
      `/Department/search/${encodeURIComponent(keyword)}`,
      { revalidate: 3600 },
    )
  },

  getPaged(
    params?: ColombiaApiPagedParams,
  ): Promise<ColombiaApiPagedResponse<Department>> {
    return colombiaFetch<ColombiaApiPagedResponse<Department>>(
      '/Department/pagedList',
      {
        params: params as Record<string, string | number>,
        revalidate: 86400,
      },
    )
  },

  getCities(departmentId: number): Promise<City[]> {
    return colombiaFetch<City[]>(`/Department/${departmentId}/cities`, {
      revalidate: 86400,
    })
  },

  getNaturalAreas(departmentId: number): Promise<NaturalArea[]> {
    return colombiaFetch<NaturalArea[]>(
      `/Department/${departmentId}/naturalareas`,
      { revalidate: 86400 },
    )
  },

  getTouristicAttractions(departmentId: number): Promise<TouristicAttraction[]> {
    return colombiaFetch<TouristicAttraction[]>(
      `/Department/${departmentId}/touristicattractions`,
      { revalidate: 86400 },
    )
  },
}
