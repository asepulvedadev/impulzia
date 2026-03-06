'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiGenerationService } from '../services/ai-generation.service'
import type { ServiceResult } from '../interfaces'

export async function deleteGeneration(generationId: string): Promise<ServiceResult<void>> {
  const supabase = await createServerClient()
  const service = new AiGenerationService(supabase)
  return service.delete(generationId)
}
