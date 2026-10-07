'use client'

import { useEffect, useRef } from 'react'

// Thin gold bar at the top of the viewport showing how far down the page you are.
// Decorative, so it is hidden from assistive technology.
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const pct = max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0
      if (bar.current) bar.current.style.width = `${pct}%`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <div ref={bar} className="scroll-progress" aria-hidden="true" />
}
