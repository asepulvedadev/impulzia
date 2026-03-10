// ─── Colombia API — Country Service ──────────────────────────────────────────

import { colombiaFetch } from '../client'
import type { Country } from '../types'

export const countryService = {
  /**
   * Returns general information about Colombia.
   * Cached for 7 days — almost never changes.
   */
  getColombia(): Promise<Country> {
    return colombiaFetch<Country>('/Country/Colombia', {
      revalidate: 86400 * 7,
    })
  },
}
