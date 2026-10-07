'use client'

import { useEffect } from 'react'

// Fades in elements marked with `data-reveal` as they scroll into view.
//
// Progressive enhancement: the server renders everything visible. After
// hydration only elements that are still below the fold are hidden, so nothing
// on screen flashes, and the page reads normally without JavaScript or when the
// visitor prefers reduced motion.
export function RevealOnScroll() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.reveal = 'shown'
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' },
    )

    const pending: HTMLElement[] = []
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) return
      el.dataset.reveal = 'pending'
      pending.push(el)
      observer.observe(el)
    })

    return () => {
      observer.disconnect()
      pending.forEach(el => { el.dataset.reveal = 'shown' })
    }
  }, [])

  return null
}
