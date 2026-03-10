// ─── Colombia API — Holidays Service ─────────────────────────────────────────

import { colombiaFetch } from '../client'
import type { Holiday } from '../types'

export const holidaysService = {
  /**
   * Returns all holidays for a given year.
   * @param year  e.g. 2025
   * @param includeSunday  whether to include Sundays as holidays
   */
  getByYear(year: number, includeSunday = false): Promise<Holiday[]> {
    return colombiaFetch<Holiday[]>(`/Holiday/year/${year}`, {
      params: { includeSunday: String(includeSunday) },
      revalidate: 86400 * 7, // 1 week — holidays don't change
    })
  },

  /**
   * Returns holidays for a specific month of a year.
   */
  getByMonth(year: number, month: number): Promise<Holiday[]> {
    return colombiaFetch<Holiday[]>(`/Holiday/year/${year}/month/${month}`, {
      revalidate: 86400 * 7,
    })
  },

  /**
   * Returns upcoming holidays from today within the current year.
   */
  async getUpcoming(limit = 3): Promise<Holiday[]> {
    const year = new Date().getFullYear()
    const holidays = await holidaysService.getByYear(year)
    const today = new Date().toISOString().split('T')[0]

    return holidays.filter((h) => h.date >= today).slice(0, limit)
  },
}
