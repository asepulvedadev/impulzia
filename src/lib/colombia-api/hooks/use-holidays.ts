'use client'

// ─── Hook: useHolidays ────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import type { Holiday } from '../types'

type State = {
  data: Holiday[]
  loading: boolean
  error: string | null
}

export function useUpcomingHolidays(limit = 3) {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    fetch(`/api/colombia/holidays/upcoming?limit=${limit}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json() as Promise<Holiday[]>
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setState({ data: [], loading: false, error: message })
      })
  }, [limit])

  return state
}
