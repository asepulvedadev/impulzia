import { AdBanner, AdBannerSkeleton } from './ad-banner'
import { createClient } from '@/lib/supabase/server'
import { AdService } from '../services/ad.service'
import type { TrackingContext } from '../interfaces'

interface AdSlotProps {
  context: TrackingContext
  categoryId?: string
  neighborhood?: string
  size?: 'compact' | 'full' | 'hero'
  className?: string
}

export async function AdSlot({
  context,
  categoryId,
  neighborhood,
  size = 'full',
  className,
}: AdSlotProps) {
  const supabase = await createClient()
  const service = new AdService(supabase)

  const result = await service.getActiveAds({
    city: 'Cúcuta',
    category_id: categoryId,
    neighborhood,
    limit: 1,
  })

  if (!result.success || !result.data || result.data.length === 0) {
    return null
  }

  const ad = result.data[0]
  if (!ad) return null

  return <AdBanner ad={ad} context={context} size={size} className={className} />
}

export function AdSlotSkeleton({ size = 'full' }: { size?: 'compact' | 'full' | 'hero' }) {
  return <AdBannerSkeleton size={size} />
}
