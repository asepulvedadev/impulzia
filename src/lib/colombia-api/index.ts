// ─── Colombia API Module ──────────────────────────────────────────────────────
// Public API for data about Colombia: cities, departments, holidays, etc.
// Source: https://api-colombia.com
//
// Usage (Server Components / Server Actions):
//   import { citiesService, holidaysService } from '@/lib/colombia-api'
//
// Usage (Client Components):
//   import { useCities, useUpcomingHolidays } from '@/lib/colombia-api'

// Services (server-side)
export {
  citiesService,
  departmentsService,
  holidaysService,
  touristicService,
  countryService,
  fairsService,
} from './services'

// Hooks (client-side)
export { useCities } from './hooks/use-cities'
export { useUpcomingHolidays } from './hooks/use-holidays'

// Types
export type {
  City,
  Department,
  Region,
  Country,
  Holiday,
  TouristicAttraction,
  NaturalArea,
  CategoryNaturalArea,
  Airport,
  Radio,
  President,
  InvasiveSpecie,
  NativeCommunity,
  IndigenousReservation,
  ConstitutionArticle,
  ColombiaMap,
  TypicalDish,
  TraditionalFairAndFestival,
  IntangibleHeritage,
  HeritageCity,
  ColombiaApiListParams,
  ColombiaApiPagedParams,
  ColombiaApiPagedResponse,
} from './types'
