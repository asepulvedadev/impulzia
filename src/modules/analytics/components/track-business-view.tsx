'use client'

import { useEffect } from 'react'
import { useTracker } from '@/hooks/use-tracker'

interface TrackBusinessViewProps {
  businessId: string
  neighborhood?: string | null
}

/**
 * Componente invisible que trackea la vista de un perfil de negocio.
 * Se monta una vez en el cliente al cargar la página del negocio.
 */
export function TrackBusinessView({ businessId, neighborhood }: TrackBusinessViewProps) {
  const { track } = useTracker()

  useEffect(() => {
    track({
      event_type: 'business_view',
      entity_type: 'business',
      entity_id: businessId,
      neighborhood: neighborhood ?? undefined,
    })
    // Solo al montar — no re-trackear si cambian props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
