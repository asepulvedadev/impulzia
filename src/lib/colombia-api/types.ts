// ─── Colombia API — Type Definitions ─────────────────────────────────────────
// Source: https://api-colombia.com/swagger/v1/swagger.json

export interface ColombiaApiListParams {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ColombiaApiPagedParams extends ColombiaApiListParams {
  Page?: number
  PageSize?: number
}

export interface ColombiaApiPagedResponse<T> {
  data: T[]
  totalRecords: number
  totalPages: number
  page: number
  pageSize: number
}

// ─── Country ──────────────────────────────────────────────────────────────────

export interface Country {
  id: number
  name: string
  description: string
  stateCapital: string
  surface: number
  population: number
  languages: string[]
  timeZone: string
  currency: string
  currencyCode: string
  currencySymbol: string
  phonePrefix: string
  countryCode: string
  sovereigntyDisputes: string | null
}

// ─── Region ───────────────────────────────────────────────────────────────────

export interface Region {
  id: number
  name: string
  description: string
  departments: Department[] | null
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department {
  id: number
  name: string
  description: string
  cardinalPoint: string
  surface: number
  population: number
  phonePrefix: string
  regionId: number
  region: Region | null
  cities: City[] | null
  naturalAreas: NaturalArea[] | null
  touristAttractions: TouristicAttraction[] | null
}

// ─── City ─────────────────────────────────────────────────────────────────────

export interface City {
  id: number
  name: string
  description: string
  surface: number
  population: number
  postalCode: string
  departmentId: number
  department: Department | null
  touristAttractions: TouristicAttraction[] | null
  presidents: President[] | null
  indigenousReservations: IndigenousReservation[] | null
  airports: Airport[] | null
  radios: Radio[] | null
}

// ─── President ────────────────────────────────────────────────────────────────

export interface President {
  id: number
  image: string
  name: string
  lastName: string
  startPeriodDate: string
  endPeriodDate: string | null
  politicalParty: string
  description: string
  city: City | null
  cityId: number
}

// ─── Touristic Attraction ─────────────────────────────────────────────────────

export interface TouristicAttraction {
  id: number
  name: string
  description: string
  images: string[]
  latitude: number | null
  longitude: number | null
  cityId: number
  city: City | null
}

// ─── Natural Area ─────────────────────────────────────────────────────────────

export interface NaturalArea {
  id: number
  name: string
  description: string
  categoryNaturalAreaId: number
  categoryNaturalArea: CategoryNaturalArea | null
}

export interface CategoryNaturalArea {
  id: number
  name: string
  description: string
  naturalAreas: NaturalArea[] | null
}

// ─── Airport ──────────────────────────────────────────────────────────────────

export interface Airport {
  id: number
  name: string
  description: string
  iataCode: string
  oaciCode: string
  cityId: number
  city: City | null
}

// ─── Radio ────────────────────────────────────────────────────────────────────

export interface Radio {
  id: number
  name: string
  description: string
  frequency: string
  url: string
  cityId: number
  city: City | null
}

// ─── Invasive Species ─────────────────────────────────────────────────────────

export interface InvasiveSpecie {
  id: number
  name: string
  commonNames: string[]
  description: string
  managementAndControl: string
  impact: string
  riskLevel: string
}

// ─── Indigenous ───────────────────────────────────────────────────────────────

export interface NativeCommunity {
  id: number
  name: string
  description: string
  languages: string[]
}

export interface IndigenousReservation {
  id: number
  name: string
  description: string
  nativeCommunity: NativeCommunity | null
}

// ─── Constitution ─────────────────────────────────────────────────────────────

export interface ConstitutionArticle {
  id: number
  chapterNumber: number
  chapterTitle: string
  articleNumber: number
  articleTitle: string
  description: string
}

// ─── Map ──────────────────────────────────────────────────────────────────────

export interface ColombiaMap {
  id: number
  name: string
  description: string
  urlImage: string
}

// ─── Holiday ──────────────────────────────────────────────────────────────────

export interface Holiday {
  date: string
  name: string
  description: string
  type: string
}

// ─── Typical Dish ─────────────────────────────────────────────────────────────

export interface TypicalDish {
  id: number
  name: string
  description: string
  urlImage: string | null
  departmentId: number
  department: Department | null
}

// ─── Traditional Fair & Festival ──────────────────────────────────────────────

export interface TraditionalFairAndFestival {
  id: number
  name: string
  description: string
  cityId: number
  city: City | null
}

// ─── Intangible Heritage ──────────────────────────────────────────────────────

export interface IntangibleHeritage {
  id: number
  name: string
  scope: string
  description: string
  departmentId: number
  department: Department | null
}

export interface HeritageCity {
  id: number
  name: string
  description: string
  cityId: number
  city: City | null
}
