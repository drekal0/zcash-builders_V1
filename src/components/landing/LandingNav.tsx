'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './landing.module.css'

export interface NavSection {
  /** id of the section element on the page */
  id: string
  label: string
}

const MOBILE_QUERY = '(max-width: 960px)'

function Brandmark() {
  return (
    <svg className={styles.logoMark} viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="m270,540c0-148.9,121.1-270,270-270s270,121.1,270,270-121.1,270-270,270-270-121.1-270-270Zm366.31-125.3v41.09l-114.28,155h114.28v54.5h-73.67v45.16h-45.28v-45.16h-73.67v-41.09l114.16-155h-114.16v-54.5h73.67v-45.28h45.28v45.28h73.67Z"
        fill="var(--gold)"
        fillRule="evenodd"
      />
    </svg>
  )
}

// Sticky top bar for the landing page: in-page anchors with the current section
// highlighted, plus Curriculum / Sign in / Apply. Below 960px the links collapse
// into a menu button.
export function LandingNav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const menuButton = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  // Highlight the section currently under the top of the viewport.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let active = ''
      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 140) active = id
      }
      setCurrent(active)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [sections])

  // While the menu is open: Escape closes it, and so does growing past the breakpoint.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      menuButton.current?.focus()
    }
    const media = window.matchMedia(MOBILE_QUERY)
    const onChange = () => { if (!media.matches) setOpen(false) }
    document.addEventListener('keydown', onKey)
    media.addEventListener('change', onChange)
    return () => {
      document.removeEventListener('keydown', onKey)
      media.removeEventListener('change', onChange)
    }
  }, [open])

  const close = () => setOpen(false)

  const sectionLinks = (keyPrefix: string) =>
    sections.map(section => (
      <li key={`${keyPrefix}-${section.id}`}>
        <a
          href={`#${section.id}`}
          className={`${styles.navLink} ${current === section.id ? styles.navLinkActive : ''}`}
          aria-current={current === section.id ? 'location' : undefined}
          onClick={close}
        >
          {section.label}
        </a>
      </li>
    ))

  return (
    <header className={styles.nav}>
      <a href="#top" className={styles.logo} aria-label="Zcash Builders — back to top" onClick={close}>
        <Brandmark />
        <span>Zcash <em>Builders</em></span>
      </a>

      <nav aria-label="Main">
        <ul className={styles.navLinks}>
          {sectionLinks('bar')}
          <li>
            <Link href="/learn" className={styles.navLink}>Curriculum</Link>
          </li>
        </ul>
      </nav>

      <div className={styles.navActions}>
        <Link href="/login" className={`btn btn-ghost ${styles.navBtn} ${styles.navSignIn}`}>
          Sign in
        </Link>
        <Link href="/apply" className={`btn btn-primary ${styles.navBtn}`}>
          Apply
        </Link>
        <button
          ref={menuButton}
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(value => !value)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <nav aria-label="Menu" id={panelId} className={open ? styles.mobilePanelOpen : styles.mobilePanel}>
        <ul className={styles.mobileList}>
          {sectionLinks('menu')}
          <li className={styles.mobileDivider} role="presentation" />
          <li>
            <Link href="/learn" className={styles.navLink} onClick={close}>Curriculum</Link>
          </li>
          <li>
            <Link href="/login" className={styles.navLink} onClick={close}>Sign in</Link>
          </li>
          <li>
            <Link href="/apply" className={styles.navLink} onClick={close}>Apply to Cohort 01</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
