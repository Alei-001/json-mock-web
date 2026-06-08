import type { ReactNode } from 'react'

export interface JsonLine {
  num: number
  content: ReactNode[]
}

export function highlightJson(data: unknown): JsonLine[] {
  const json = JSON.stringify(data, null, 2)
  return highlightJsonText(json)
}

export function highlightJsonText(text: string): JsonLine[] {
  const lines = text.split('\n')
  return lines.map((line, i) => ({
    num: i + 1,
    content: highlightLine(line),
  }))
}

function highlightLine(line: string): ReactNode[] {
  const tokens: ReactNode[] = []
  let lastIndex = 0
  let key = 0

  // eslint-disable-next-line no-useless-escape
  const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\]])|(.)/g

  let match: RegExpExecArray | null

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(line.slice(lastIndex, match.index))
    }

    const [, keyMatch, stringMatch, boolMatch, nullMatch, numberMatch, bracketMatch, otherMatch] = match

    const k = key++

    if (keyMatch) {
      tokens.push(<span key={k} className="json-key">{keyMatch}</span>)
    } else if (stringMatch) {
      tokens.push(<span key={k} className="json-string">{stringMatch}</span>)
    } else if (boolMatch) {
      tokens.push(<span key={k} className="json-boolean">{boolMatch}</span>)
    } else if (nullMatch) {
      tokens.push(<span key={k} className="json-null">{nullMatch}</span>)
    } else if (numberMatch) {
      tokens.push(<span key={k} className="json-number">{numberMatch}</span>)
    } else if (bracketMatch) {
      tokens.push(<span key={k} className="json-bracket">{bracketMatch}</span>)
    } else if (otherMatch === ',') {
      tokens.push(<span key={k} className="json-comma">,</span>)
    } else if (otherMatch === ':') {
      tokens.push(<span key={k} className="json-colon">:</span>)
    } else {
      tokens.push(otherMatch)
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < line.length) {
    tokens.push(line.slice(lastIndex))
  }

  return tokens
}