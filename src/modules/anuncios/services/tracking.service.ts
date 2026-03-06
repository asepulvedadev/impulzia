import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { TrackingContext } from '../interfaces'

interface RedisClient {
  get(key: string): Promise<string | null>
  setex(key: string, ttl: number, value: string): Promise<string | null>
}

const IMPRESSION_TTL = 1800 // 30 minutes dedup window
const CLICK_TTL = 5 // 5 seconds dedup window

export class TrackingService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private redis: RedisClient,
  ) {}

  private impressionKey(adId: string, identifier: string): string {
    return `imp:${adId}:${identifier}`
  }

  private clickKey(adId: string, identifier: string): string {
    return `click:${adId}:${identifier}`
  }

  async trackImpression(
    adId: string,
    viewerId?: string,
    viewerIp?: string,
    context: TrackingContext = 'feed',
  ): Promise<void> {
    const identifier = viewerId ?? viewerIp ?? 'anonymous'
    const key = this.impressionKey(adId, identifier)

    try {
      const cached = await this.redis.get(key)
      if (cached) {
        return // Already tracked within dedup window
      }
    } catch {
      // Redis failure: fall through and track anyway
    }

    // Insert impression
    await this.supabase.from('ad_impressions').insert({
      ad_id: adId,
      viewer_id: viewerId ?? null,
      viewer_ip: viewerIp ?? null,
      context,
    })

    // Set Redis dedup key (fire-and-forget)
    try {
      await this.redis.setex(key, IMPRESSION_TTL, '1')
    } catch {
      // Redis failure is non-fatal
    }
  }

  async trackClick(
    adId: string,
    impressionId?: string,
    viewerId?: string,
    viewerIp?: string,
  ): Promise<void> {
    const identifier = viewerId ?? viewerIp ?? 'anonymous'
    const key = this.clickKey(adId, identifier)

    try {
      const cached = await this.redis.get(key)
      if (cached) {
        return // Already clicked within dedup window
      }
    } catch {
      // Redis failure: fall through and track anyway
    }

    // Insert click
    await this.supabase.from('ad_clicks').insert({
      ad_id: adId,
      impression_id: impressionId ?? null,
      viewer_id: viewerId ?? null,
      viewer_ip: viewerIp ?? null,
    })

    // Set Redis dedup key
    try {
      await this.redis.setex(key, CLICK_TTL, '1')
    } catch {
      // Redis failure is non-fatal
    }
  }
}
