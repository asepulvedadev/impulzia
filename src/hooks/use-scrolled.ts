'use client'

import { useState, useEffect } from 'react'

interface UseScrolledOptions {
  threshold?: number
}

interface UseScrolledReturn {
  isScrolled: boolean
  scrollY: number
}

export function useScrolled(options: UseScrolledOptions = {}): UseScrolledReturn {
  const { threshold = 20 } = options
  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY
      setScrollY(y)
      setIsScrolled(y > threshold)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { isScrolled, scrollY }
}
