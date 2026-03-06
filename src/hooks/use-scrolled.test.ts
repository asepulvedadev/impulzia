import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrolled } from './use-scrolled'

describe('useScrolled', () => {
  let scrollY = 0

  beforeEach(() => {
    scrollY = 0
    Object.defineProperty(window, 'scrollY', {
      get: () => scrollY,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns isScrolled false when scrollY is 0', () => {
    const { result } = renderHook(() => useScrolled())
    expect(result.current.isScrolled).toBe(false)
    expect(result.current.scrollY).toBe(0)
  })

  it('returns isScrolled true when scroll exceeds default threshold', () => {
    const { result } = renderHook(() => useScrolled())

    act(() => {
      scrollY = 30
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.isScrolled).toBe(true)
    expect(result.current.scrollY).toBe(30)
  })

  it('respects custom threshold', () => {
    const { result } = renderHook(() => useScrolled({ threshold: 100 }))

    act(() => {
      scrollY = 50
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.isScrolled).toBe(false)

    act(() => {
      scrollY = 120
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.isScrolled).toBe(true)
  })

  it('cleans up scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useScrolled())

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
