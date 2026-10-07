'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './landing.module.css'

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API unavailable (insecure context or permission denied): fall back.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    area.remove()
    return ok
  }
}

export function CopyButton({ text, label, className }: {
  text: string
  /** What is being copied, for screen readers: "Copy <label>". */
  label: string
  className?: string
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function copy() {
    const ok = await writeToClipboard(text)
    setState(ok ? 'copied' : 'failed')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 1500)
  }

  const classes = [styles.copyBtn, state === 'copied' ? styles.copyBtnDone : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <button type="button" className={classes} onClick={copy} aria-label={`Copy ${label}`}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : 'Copy'}
      </button>
      <span role="status" className="sr-only">
        {state === 'copied' ? `Copied ${label}` : state === 'failed' ? 'Copy failed' : ''}
      </span>
    </>
  )
}
