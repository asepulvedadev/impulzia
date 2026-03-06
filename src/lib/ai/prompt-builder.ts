// Shared system prompt for all AI tools — sets Colombian context
export const BASE_SYSTEM_PROMPT = `Eres un asistente de marketing especializado en negocios locales de Cúcuta, Colombia.
Tus respuestas son siempre en español colombiano, amigables, directas y orientadas a resultados comerciales.
Contexto: mercado local colombiano, moneda COP (pesos colombianos), cultura cucuteña.
No uses emojis en exceso. Prioriza claridad y persuasión.`

/**
 * Replaces {{variable}} placeholders with actual values.
 * Unknown variables are left as-is.
 */
export function fillTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return key in variables ? variables[key] : match
  })
}

// ─────────────────────────────────────────────────────────
// Post Generator
// ─────────────────────────────────────────────────────────

export interface PostGeneratorInput {
  businessName: string
  businessCity: string
  productOrService: string
  socialNetwork: string
  tone: string
  templatePrompt: string
  variables: Record<string, string>
}

export function buildPostGeneratorPrompt(input: PostGeneratorInput): string {
  const filled = fillTemplate(input.templatePrompt, {
    business_name: input.businessName,
    business_city: input.businessCity,
    product_or_service: input.productOrService,
    social_network: input.socialNetwork,
    tone: input.tone,
    ...input.variables,
  })
  return `${filled}

Requisitos adicionales:
- Máximo 280 caracteres si es para Twitter/X, hasta 2200 para Instagram/Facebook
- Incluye llamada a la acción clara
- Usa hashtags relevantes al final (3-5 máximo)
- Adapta el lenguaje para ${input.socialNetwork}`
}

// ─────────────────────────────────────────────────────────
// Description Generator
// ─────────────────────────────────────────────────────────

export interface DescriptionGeneratorInput {
  businessName: string
  businessCity: string
  businessCategory: string
  length: 'corta' | 'media' | 'larga'
  keywords: string
  highlight: string
  tone: string
  templatePrompt: string
}

const DESCRIPTION_LENGTHS: Record<string, string> = {
  corta: '50-80 palabras',
  media: '100-150 palabras',
  larga: '200-250 palabras',
}

export function buildDescriptionGeneratorPrompt(input: DescriptionGeneratorInput): string {
  const filled = fillTemplate(input.templatePrompt, {
    business_name: input.businessName,
    business_city: input.businessCity,
    business_category: input.businessCategory,
    length: DESCRIPTION_LENGTHS[input.length] ?? input.length,
    keywords: input.keywords,
    highlight: input.highlight,
  })
  return `${filled}

Formato de salida: solo el texto de la descripción, sin explicaciones adicionales.`
}

// ─────────────────────────────────────────────────────────
// Promo Ideas
// ─────────────────────────────────────────────────────────

export interface PromoIdeasInput {
  businessName: string
  businessCity: string
  businessCategory: string
  numIdeas: number
  budget: string
  targetAudience: string
  templatePrompt: string
  variables: Record<string, string>
}

export function buildPromoIdeasPrompt(input: PromoIdeasInput): string {
  const filled = fillTemplate(input.templatePrompt, {
    business_name: input.businessName,
    business_city: input.businessCity,
    business_category: input.businessCategory,
    num_ideas: String(input.numIdeas),
    budget: input.budget,
    target_audience: input.targetAudience,
    ...input.variables,
  })
  return `${filled}

Formato de salida:
Para cada idea incluye:
1. Nombre de la promoción
2. Descripción en 1-2 oraciones
3. Cómo implementarla
4. Duración sugerida
5. Costo estimado aproximado en COP`
}

// ─────────────────────────────────────────────────────────
// Review Responder
// ─────────────────────────────────────────────────────────

export interface ReviewResponderInput {
  businessName: string
  reviewText: string
  rating: number
  reviewerName: string
  tone: 'formal' | 'amigable' | 'profesional'
}

export function buildReviewResponderPrompt(input: ReviewResponderInput): string {
  const sentiment = input.rating >= 4 ? 'positiva' : input.rating >= 3 ? 'neutral' : 'negativa'
  return `Eres el dueño de ${input.businessName}. Responde esta reseña ${sentiment} (${input.rating}/5 estrellas) de manera ${input.tone}.

Reseña de ${input.reviewerName}: "${input.reviewText}"

Instrucciones:
- Agradece la reseña
- Si es negativa: reconoce el problema y ofrece solución concreta
- Si es positiva: refuerza lo que les gustó e invita a volver
- Máximo 150 palabras
- Tono ${input.tone}, sin ser genérico
- No uses plantillas obvias`
}

// ─────────────────────────────────────────────────────────
// Price Assistant
// ─────────────────────────────────────────────────────────

export interface PriceAssistantInput {
  businessName: string
  businessCategory: string
  productOrService: string
  currentPrice: string
  costPrice: string
  competitorPrice: string
  targetMargin: string
}

export function buildPriceAssistantPrompt(input: PriceAssistantInput): string {
  return `Analiza la estrategia de precios para ${input.businessName} (${input.businessCategory}) en Cúcuta, Colombia.

Producto/Servicio: ${input.productOrService}
Precio actual: $${input.currentPrice} COP
Costo: $${input.costPrice} COP
Precio competencia: $${input.competitorPrice} COP
Margen objetivo: ${input.targetMargin}%

Proporciona:
1. Análisis del precio actual vs mercado
2. Precio recomendado (con justificación)
3. Estrategia de precios (penetración / premium / competitivo)
4. Sugerencias para comunicar el precio al cliente
5. Oportunidades de bundle o complementos

Responde en español con cifras en COP.`
}
