'use client'

import { useId, useState, type ReactNode } from 'react'
import styles from './landing.module.css'

export interface FaqItem {
  question: string
  answer: ReactNode
}

// Accordion of questions. Each question is a real <button> inside a heading, so
// it is reachable by keyboard and announces its expanded state. Several answers
// can be open at once, as in the prototype.
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const baseId = useId()
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set())

  function toggle(index: number) {
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className={styles.faq}>
      {items.map((item, i) => {
        const isOpen = open.has(i)
        const buttonId = `${baseId}-q-${i}`
        const panelId = `${baseId}-a-${i}`
        return (
          <div key={item.question} className={`${styles.faqItem} ${styles.reveal}`} data-reveal="">
            <h3 className={styles.faqHeading}>
              <button
                type="button"
                id={buttonId}
                className={styles.faqQ}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
              >
                <span>{item.question}</span>
                <span className={styles.faqIcon} aria-hidden="true">+</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`${styles.faqPanel} ${isOpen ? styles.faqPanelOpen : ''}`}
            >
              <div className={styles.faqPanelInner}>
                <div className={styles.faqA}>{item.answer}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
