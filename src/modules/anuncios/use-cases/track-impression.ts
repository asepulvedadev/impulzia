import type { TrackingService } from '../services/tracking.service'
import type { TrackingContext } from '../interfaces'

export async function trackImpressionUseCase(
  service: TrackingService,
  adId: string,
  viewerId?: string,
  viewerIp?: string,
  context: TrackingContext = 'feed',
): Promise<void> {
  // Fire-and-forget: do not block the caller
  service.trackImpression(adId, viewerId, viewerIp, context).catch(() => {
    // Tracking failures are non-fatal
  })
}
