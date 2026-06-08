import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './PromptDialog.module.css'

interface PromptDialogProps {
  open: boolean
  title: string
  label?: string
  defaultValue?: string
  suffix?: string
  placeholder?: string
  onConfirm: (value: string) => void
  onClose: () => void
}

export default function PromptDialog({ open, title, label, defaultValue = '', suffix = '', placeholder = '', onConfirm, onClose }: PromptDialogProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.select()
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onConfirm(value.trim() + suffix)
    onClose()
  }

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.open : ''}`} onClick={onClose} />
      <div className={`${styles.dialog} ${open ? styles.open : ''}`} role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <h3 className={styles.title}>{title}</h3>
          {label && <label className={styles.label}>{label}</label>}
          <input
            ref={inputRef}
            className="form-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <div className={styles.actions}>
            <button type="button" className="btn-sm" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="btn-sm primary" disabled={!value.trim()}>{t('common.confirm')}</button>
          </div>
        </form>
      </div>
    </>
  )
}