import { useRef, useEffect, useCallback } from 'react'
import { highlightJsonText } from '../../utils/syntaxHighlight'
import styles from './TextEditor.module.css'

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  onError?: (error: string | null) => void
}

export default function TextEditor({ value, onChange, onError }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const lineNumRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    onChange(text)
    try {
      JSON.parse(text)
      onError?.(null)
    } catch (err) {
      onError?.((err as Error).message)
    }
  }, [onChange, onError])

  useEffect(() => {
    const textarea = textareaRef.current
    const highlight = highlightRef.current
    const lineNums = lineNumRef.current
    if (!textarea || !highlight || !lineNums) return

    const onScroll = () => {
      highlight.scrollTop = textarea.scrollTop
      highlight.scrollLeft = textarea.scrollLeft
      lineNums.scrollTop = textarea.scrollTop
    }

    textarea.addEventListener('scroll', onScroll)
    return () => textarea.removeEventListener('scroll', onScroll)
  }, [])

  const lines = highlightJsonText(value)

  return (
    <div className={styles.editorWrap}>
      <div className={styles.lineNums} ref={lineNumRef}>
        {lines.map((line) => (
          <div className={styles.lineNum} key={line.num}>{line.num}</div>
        ))}
      </div>
      <div className={styles.editorBody}>
        <div className={styles.highlight} ref={highlightRef}>
          {lines.map((line) => (
            <div className={styles.highlightLine} key={line.num}>
              <span className={styles.highlightContent}>{line.content}</span>
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    </div>
  )
}