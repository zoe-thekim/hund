import { useCallback, useEffect, useState } from 'react'

export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const [node, setNode] = useState(null)
  const ref = useCallback((el) => {
    setNode(el)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => setIsVisible(true), 0)
      return () => window.clearTimeout(fallbackTimer)
    }

    const failSafeTimer = window.setTimeout(() => {
      setIsVisible(true)
      return
    }, 1200)

    if (!node) {
      window.clearTimeout(failSafeTimer)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          window.clearTimeout(failSafeTimer)
          observer.unobserve(node)
        }
      },
      {
        threshold,
        rootMargin: '50px 0px'
      }
    )

    observer.observe(node)

    return () => {
      window.clearTimeout(failSafeTimer)
      observer.disconnect()
    }
  }, [node, threshold])

  return [ref, isVisible]
}

export const useScrollHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return isScrolled
}
