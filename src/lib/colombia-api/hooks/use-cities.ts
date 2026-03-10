'use client'

// ─── Hook: useCities ─────────────────────────────────────────────────────────
// Fetches cities via the Route Handler (client-safe) with local cache.

import { useEffect, useState } from 'react'
import type { City } from '../types'

type State = {
  data: City[]
  loading: boolean
  error: string | null
}

const cache = new Map<string, City[]>()

export function useCities(departmentId?: number) {
  const cacheKey = departmentId ? `dept-${departmentId}` : 'all'
  const [state, setState] = useState<State>({
    data: cache.get(cacheKey) ?? [],
    loading: !cache.has(cacheKey),
    error: null,
  })

  useEffect(() => {
    if (cache.has(cacheKey)) return

    const url = departmentId
      ? `/api/colombia/departments/${departmentId}/cities`
      : '/api/colombia/cities'

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json() as Promise<City[]>
      })
      .then((data) => {
        cache.set(cacheKey, data)
        setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setState((prev) => ({ ...prev, loading: false, error: message }))
      })
  }, [cacheKey, departmentId])

  return state
}
