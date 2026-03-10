import { NextResponse } from 'next/server'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const requestSchema = z.object({
  query: z.string().min(2).max(200),
  neighborhood: z.string().optional(),
  session_id: z.string().min(1).max(64),
})

// Categorías disponibles en la plataforma
const AVAILABLE_CATEGORIES = [
  'restaurantes', 'cafeterias', 'tiendas-de-ropa', 'tecnologia',
  'belleza-y-salud', 'deportes', 'hogar', 'servicios-profesionales',
  'educacion', 'entretenimiento', 'mascotas', 'automotriz',
]

const CATEGORY_LABELS: Record<string, string> = {
  'restaurantes': 'Restaurantes',
  'cafeterias': 'Cafeterías',
  'tiendas-de-ropa': 'Tiendas de ropa',
  'tecnologia': 'Tecnología',
  'belleza-y-salud': 'Belleza y salud',
  'deportes': 'Deportes',
  'hogar': 'Hogar',
  'servicios-profesionales': 'Servicios profesionales',
  'educacion': 'Educación',
  'entretenimiento': 'Entretenimiento',
  'mascotas': 'Mascotas',
  'automotriz': 'Automotriz',
}

export async function POST(request: Request) {
  const body = await request.json() as unknown
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { query, neighborhood, session_id } = parsed.data

  // Trackear búsqueda sin resultados
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  void supabase.from('user_events').insert({
    session_id,
    user_id: user?.id ?? null,
    event_type: 'search_zero_results',
    entity_type: 'search',
    metadata: { query, neighborhood: neighborhood ?? null },
    neighborhood: neighborhood ?? null,
  })

  // Llamar a Gemini para interpretar la búsqueda
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ suggestions: [], categories: [] })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Eres un asistente de búsqueda para Rcomienda, una plataforma de comercios locales en Cúcuta, Colombia.

Un usuario buscó "${query}"${neighborhood ? ` en el barrio "${neighborhood}"` : ''} y no encontró resultados.

Categorías disponibles en la plataforma: ${AVAILABLE_CATEGORIES.join(', ')}

Responde SOLO con un JSON válido con esta estructura exacta (sin markdown, sin explicaciones):
{
  "intent": "descripción breve de lo que el usuario probablemente busca",
  "suggestions": ["búsqueda alternativa 1", "búsqueda alternativa 2", "búsqueda alternativa 3"],
  "categories": ["slug-categoria-1", "slug-categoria-2"],
  "tip": "consejo breve y útil de máximo 15 palabras"
}

Reglas:
- suggestions: 3 búsquedas alternativas en español, cortas y concretas
- categories: máximo 2 slugs de las categorías disponibles más relevantes
- tip: consejo práctico para el usuario
- Todo en español colombiano natural`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Limpiar posible markdown
    const jsonText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const geminiData = JSON.parse(jsonText) as {
      intent: string
      suggestions: string[]
      categories: string[]
      tip: string
    }

    // Validar y limpiar respuesta
    const validCategories = (geminiData.categories ?? [])
      .filter((c) => AVAILABLE_CATEGORIES.includes(c))
      .slice(0, 2)

    return NextResponse.json({
      intent: geminiData.intent ?? '',
      suggestions: (geminiData.suggestions ?? []).slice(0, 3),
      categories: validCategories.map((slug) => ({
        slug,
        label: CATEGORY_LABELS[slug] ?? slug,
      })),
      tip: geminiData.tip ?? '',
    })
  } catch {
    // Si Gemini falla, devolver vacío silenciosamente
    return NextResponse.json({ suggestions: [], categories: [], intent: '', tip: '' })
  }
}
