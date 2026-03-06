import Anthropic from '@anthropic-ai/sdk'
import { AI_MODEL, AI_MODEL_MAX_TOKENS } from './config'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

export interface GenerateTextOptions {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
}

export interface GenerateTextResult {
  text: string
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

export async function generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
  const { prompt, systemPrompt, maxTokens = AI_MODEL_MAX_TOKENS } = options
  const anthropic = getAnthropicClient()
  const start = Date.now()

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }]

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  })

  const durationMs = Date.now() - start
  const firstBlock = response.content[0]
  const text = firstBlock.type === 'text' ? firstBlock.text : ''

  return {
    text,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    durationMs,
  }
}

export async function streamText(
  options: GenerateTextOptions,
  onChunk: (chunk: string) => void,
): Promise<GenerateTextResult> {
  const { prompt, systemPrompt, maxTokens = AI_MODEL_MAX_TOKENS } = options
  const anthropic = getAnthropicClient()
  const start = Date.now()
  let fullText = ''
  let model = AI_MODEL
  let inputTokens = 0
  let outputTokens = 0

  const stream = anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullText += event.delta.text
      onChunk(event.delta.text)
    }
  }

  const finalMessage = await stream.finalMessage()
  model = finalMessage.model
  inputTokens = finalMessage.usage.input_tokens
  outputTokens = finalMessage.usage.output_tokens

  return {
    text: fullText,
    model,
    inputTokens,
    outputTokens,
    durationMs: Date.now() - start,
  }
}
