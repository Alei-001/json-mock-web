import { useCallback } from 'react'
import styles from './TemplateLibrary.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import { PRESET_TEMPLATES } from '../../constants/templates'

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  order: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  product: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  article: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  employee: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <path d="M12 12v4" />
      <path d="M8 14h8" />
    </svg>
  ),
}

interface TemplateLibraryProps {
  onSelect: () => void
}

export default function TemplateLibrary({ onSelect }: TemplateLibraryProps) {
  const loadSchema = useProjectStore((s) => s.loadSchema)
  const showToast = useProjectStore((s) => s.showToast)

  const handleSelect = useCallback((id: string) => {
    const template = PRESET_TEMPLATES.find((t) => t.id === id)
    if (!template) return
    loadSchema(template.schema, template.fieldConfigs)
    showToast(`已加载「${template.name}」模板`)
    onSelect()
  }, [loadSchema, onSelect, showToast])

  return (
    <div className={styles.tmplGrid}>
      {PRESET_TEMPLATES.map((t) => (
        <div
          key={t.id}
          className={styles.tmplCard}
          tabIndex={0}
          role="button"
          onClick={() => handleSelect(t.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSelect(t.id)
          }}
        >
          <div className={styles.tmplCardHeader}>
            <div className={styles.tmplIcon}>
              {TEMPLATE_ICONS[t.id]}
            </div>
            <span className={styles.tmplName}>{t.name}</span>
          </div>
          <div className={styles.tmplDesc}>{t.description}</div>
        </div>
      ))}
    </div>
  )
}