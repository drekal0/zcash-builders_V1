'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { CopyButton } from './CopyButton'
import styles from './landing.module.css'

export interface QuickstartTab {
  id: string
  label: string
  /** Plain text of the snippet: this is what the copy button copies. */
  code: string
  /** The same snippet with syntax colouring, rendered on the server. */
  highlighted: ReactNode
}

// Tabbed code window. Follows the WAI-ARIA tabs pattern: arrow keys, Home and
// End move between tabs, and only the selected tab is in the tab order.
export function QuickstartTabs({ title, tabs }: { title: string; tabs: QuickstartTab[] }) {
  const baseId = useId()
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next = active
    if (event.key === 'ArrowRight') next = (active + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (active - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className={styles.quickstart}>
      <div className={styles.quickstartHead}>
        <span className={styles.winDot} aria-hidden="true" />
        <span className={styles.winDot} aria-hidden="true" />
        <span className={styles.winDot} aria-hidden="true" />
        <div className={styles.winTitle}>{title}</div>
      </div>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Quickstart examples"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[i] = el }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={i !== active}
          className={styles.tabPanel}
        >
          <CopyButton text={tab.code} label={`${tab.label} example`} className={styles.codeCopy} />
          {/* Focusable so keyboard users can scroll long lines horizontally. */}
          <pre className={styles.codeBlock} tabIndex={0} aria-label={`${tab.label} example code`}>
            <code>{tab.highlighted}</code>
          </pre>
        </div>
      ))}
    </div>
  )
}
