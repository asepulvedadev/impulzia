import { NextRequest, NextResponse } from 'next/server'
import { holidaysService } from '@/lib/colombia-api/services'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '3')

  try {
    const holidays = await holidaysService.getUpcoming(limit)
    return NextResponse.json(holidays)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener feriados' },
      { status: 502 },
    )
  }
}
