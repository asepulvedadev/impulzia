'use client'

import { useCallback, useEffect, useRef } from 'react'
import { trackEventAction } from '@/modules/analytics/actions/track.actions'
import type { TrackEventInput } from '@/modules/analytics/interfaces'

const SESSION_KEY = 'rco_session_id'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function useTracker() {
  const sessionId = useRef<string>('')

  useEffect(() => {
    sessionId.current = getOrCreateSessionId()
  }, [])

  const track = useCallback((input: TrackEventInput) => {
    // Fire-and-forget: no await, no bloqueo de UX
    void trackEventAction({ ...input, session_id: sessionId.current || getOrCreateSessionId() })
  }, [])

  return { track }
}
