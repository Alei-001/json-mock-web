import { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Select.module.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  placeholder?: string
}

export default function Select({ value, onChange, options, disabled = false, placeholder }: SelectProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('common.placeholder')
  const [open, setOpen] = useState(false)
  const [direction, setDirection] = useState<'down' | 'up'>('down')
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const selected = options.find((o) => o.value === value)

  const handleToggle = useCallback(() => {
    if (disabled) return
    setOpen((prev) => {
      if (prev) setDirection('down')
      return !prev
    })
  }, [disabled])

  const handleSelect = useCallback((val: string) => {
    onChange(val)
    setOpen(false)
    setDirection('down')
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        handleToggle()
        break
      case 'Escape':
        setOpen(false)
        break
      case 'ArrowDown': {
        e.preventDefault()
        if (!open) {
          setOpen(true)
        } else {
          const idx = options.findIndex((o) => o.value === value)
          const next = options[(idx + 1) % options.length]
          onChange(next.value)
        }
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (!open) {
          setOpen(true)
        } else {
          const idx = options.findIndex((o) => o.value === value)
          const prev = options[(idx - 1 + options.length) % options.length]
          onChange(prev.value)
        }
        break
      }
    }
  }, [open, options, value, onChange, handleToggle])

  useLayoutEffect(() => {
    if (!open) return
    const trigger = containerRef.current?.querySelector<HTMLButtonElement>('button')
    const dropdown = dropdownRef.current
    if (!trigger || !dropdown) return

    const triggerRect = trigger.getBoundingClientRect()
    const dropdownHeight = dropdown.offsetHeight
    let spaceBelow = window.innerHeight - triggerRect.bottom
    let spaceAbove = triggerRect.top

    let parent = trigger.parentElement
    while (parent) {
      const style = window.getComputedStyle(parent)
      const overflowY = style.overflowY
      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') {
        const parentRect = parent.getBoundingClientRect()
        spaceBelow = Math.min(spaceBelow, parentRect.bottom - triggerRect.bottom)
        spaceAbove = Math.min(spaceAbove, triggerRect.top - parentRect.top)
      }
      parent = parent.parentElement
    }

    if (spaceBelow < dropdownHeight + 4 && spaceAbove > dropdownHeight + 4) {
      setDirection('up')
    } else {
      setDirection('down')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div
      ref={containerRef}
      className={`${styles.select} ${disabled ? styles.disabled : ''} ${open ? styles.open : ''}`}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.value}>
          {selected ? selected.label : (value || resolvedPlaceholder)}
        </span>
        <svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          ref={dropdownRef}
          className={`${styles.dropdown} ${styles[direction]}`}
          role="listbox"
          id={listboxId}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.option} ${opt.value === value ? styles.selected : ''}`}
              onClick={() => handleSelect(opt.value)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {opt.label}
              {opt.value === value && (
                <svg
                  className={styles.check}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}