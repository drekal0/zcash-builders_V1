import { Fragment, type ReactNode } from 'react'
import styles from './landing.module.css'

// A deliberately small syntax colouriser for the quickstart snippets. It only
// decorates; the plain string is what visitors copy, so a missed token can
// never change the code they run. Runs on the server.

export type SnippetLang = 'shell' | 'ts' | 'python'

const COMMENT_PREFIX: Record<SnippetLang, string> = { shell: '#', ts: '//', python: '#' }

const KEYWORDS: Record<SnippetLang, RegExp | null> = {
  shell: null,
  ts: /\b(import|from|const|new|as|if|else|return|throw|function|async|await)\b/g,
  python: /\b(import|from|for|in|if|def|return|print)\b/g,
}

// Commands coloured at the start of a shell line.
const SHELL_COMMAND =
  /^(git clone|docker compose|cargo run|npm install|pip install|python -m|npx|curl|cd|\.\/scripts\/[\w.-]+)(?=\s|$)/

const STRING = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g

function keywords(text: string, lang: SnippetLang, key: string): ReactNode {
  const pattern = KEYWORDS[lang]
  if (!pattern) return text
  return text.split(pattern).map((part, i) =>
    i % 2 === 1
      ? <span key={`${key}-k${i}`} className={styles.codeKeyword}>{part}</span>
      : part,
  )
}

function renderLine(line: string, lang: SnippetLang, key: string): ReactNode {
  const prefix = COMMENT_PREFIX[lang]
  if (line.trimStart().startsWith(prefix)) {
    return <span className={styles.codeComment}>{line}</span>
  }

  const nodes: ReactNode[] = []
  let rest = line

  if (lang === 'shell') {
    const command = SHELL_COMMAND.exec(rest)
    if (command) {
      nodes.push(<span key={`${key}-cmd`} className={styles.codeCommand}>{command[0]}</span>)
      rest = rest.slice(command[0].length)
    }
  }

  // Split into string literals and the code between them.
  const parts = rest.split(STRING)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (i % 2 === 1) {
      nodes.push(<span key={`${key}-s${i}`} className={styles.codeString}>{part}</span>)
      continue
    }
    // A trailing comment outside any string: colour it and stop.
    const commentAt = part.search(lang === 'ts' ? /(^|\s)\/\/\s/ : /(^|\s)#\s/)
    if (commentAt !== -1 && lang !== 'shell') {
      const start = part[commentAt] === prefix[0] ? commentAt : commentAt + 1
      nodes.push(<Fragment key={`${key}-c${i}`}>{keywords(part.slice(0, start), lang, `${key}-${i}`)}</Fragment>)
      nodes.push(
        <span key={`${key}-tc${i}`} className={styles.codeComment}>
          {part.slice(start) + parts.slice(i + 1).join('')}
        </span>,
      )
      break
    }
    nodes.push(<Fragment key={`${key}-c${i}`}>{keywords(part, lang, `${key}-${i}`)}</Fragment>)
  }
  return nodes
}

export function highlight(code: string, lang: SnippetLang): ReactNode {
  return code.split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? '\n' : null}
      {renderLine(line, lang, `l${i}`)}
    </Fragment>
  ))
}
