import { NextResponse } from 'next/server'

/**
 * Vercel Cron Job — ejecuta cada hora
 * Llama al Edge Function de Supabase que refresca vistas + recalcula afinidades
 * Configurado en vercel.json
 */
export async function GET(request: Request) {
  // Verificar que viene de Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cronSecret = process.env.CRON_SECRET

  if (!supabaseUrl || !cronSecret) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/analytics-cron`

  const res = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cronSecret}`,
      'Content-Type': 'application/json',
    },
  })

  const body = await res.json() as Record<string, unknown>

  return NextResponse.json({ invoked: true, result: body })
}
