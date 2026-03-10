import { NextResponse } from 'next/server'
import { departmentsService } from '@/lib/colombia-api/services'

export const revalidate = 86400

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const departmentId = Number(id)

  if (isNaN(departmentId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const cities = await departmentsService.getCities(departmentId)
    return NextResponse.json(cities)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener ciudades del departamento' },
      { status: 502 },
    )
  }
}
