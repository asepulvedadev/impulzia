/**
 * Edge Function: analytics-cron
 * Ejecuta cada hora via pg_cron o invocación HTTP con Bearer token.
 * Refresca vistas materializadas y recalcula afinidades de usuarios activos.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

Deno.serve(async (req: Request) => {
  // Verificar autorización
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  if (CRON_SECRET && token !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const started = Date.now()

  try {
    // Función maestra: refresca vistas + recalcula afinidades de usuarios activos
    const { error } = await supabase.rpc('refresh_all_analytics')
    if (error) throw error

    // Purgar eventos viejos (> 90 días) una vez al día (hora 3am UTC)
    const hour = new Date().getUTCHours()
    if (hour === 3) {
      await supabase.rpc('purge_old_events')
    }

    return new Response(
      JSON.stringify({
        ok: true,
        duration_ms: Date.now() - started,
        hour,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[analytics-cron] error:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err), duration_ms: Date.now() - started }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
