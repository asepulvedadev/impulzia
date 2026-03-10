import { NextResponse } from 'next/server'
import { citiesService } from '@/lib/colombia-api/services'

export const revalidate = 86400 // 24h

export async function GET() {
  try {
    const cities = await citiesService.getAll({ sortBy: 'name', sortDirection: 'asc' })
    return NextResponse.json(cities)
  } catch {
    return NextResponse.json({ error: 'Error al obtener ciudades' }, { status: 502 })
  }
}
