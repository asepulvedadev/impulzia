import type { TrackingService } from '../services/tracking.service'

export async function trackClickUseCase(
  service: TrackingService,
  adId: string,
  impressionId?: string,
  viewerId?: string,
  viewerIp?: string,
): Promise<void> {
  // Fire-and-forget: do not block the caller
  service.trackClick(adId, impressionId, viewerId, viewerIp).catch(() => {
    // Tracking failures are non-fatal
  })
}
