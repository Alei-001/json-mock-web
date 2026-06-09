import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './TemplateLibrary.module.css'
import PromptDialog from '../PromptDialog/PromptDialog'
import { useProjectStore } from '../../store/useProjectStore'
import { PRESET_TEMPLATES } from '../../constants/templates'
import type { PresetTemplate } from '../../constants/templates'

function countFields(schema: PresetTemplate['schema']): number {
  let count = 0
  if (schema.children) {
    for (const child of schema.children) {
      count += 1
      if (child.children) count += child.children.length
      if (child.items) count += 1
    }
  }
  return count
}

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
  custom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
}

interface TemplateLibraryProps {
  onSelect: () => void
}

export default function TemplateLibrary({ onSelect }: TemplateLibraryProps) {
  const { t } = useTranslation()
  const loadSchema = useProjectStore((s) => s.loadSchema)
  const customTemplates = useProjectStore((s) => s.customTemplates)
  const removeCustomTemplate = useProjectStore((s) => s.removeCustomTemplate)
  const renameCustomTemplate = useProjectStore((s) => s.renameCustomTemplate)
  const showToast = useProjectStore((s) => s.showToast)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null)

  const handleSelect = useCallback((template: PresetTemplate, isCustom: boolean) => {
    loadSchema(template.schema, template.fieldConfigs, isCustom ? template.id : undefined)
    showToast(t('template.loaded', { name: isCustom ? template.name : t(template.name) }))
    onSelect()
  }, [loadSchema, onSelect, showToast, t])

  const handleDelete = useCallback((e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    removeCustomTemplate(id)
    showToast(t('template.deleted', { name }))
  }, [removeCustomTemplate, showToast, t])

  const handleRename = useCallback((e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    setRenameTarget({ id, name })
    setRenameOpen(true)
  }, [])

  const handleRenameConfirm = useCallback((newName: string) => {
    if (renameTarget) {
      renameCustomTemplate(renameTarget.id, newName.trim())
      showToast(t('template.renamed', { name: newName.trim() }))
    }
    setRenameOpen(false)
    setRenameTarget(null)
  }, [renameTarget, renameCustomTemplate, showToast, t])

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.tmplGrid}>
          {PRESET_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className={styles.tmplCard}
              tabIndex={0}
              role="button"
              onClick={() => handleSelect(tmpl, false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSelect(tmpl, false)
              }}
            >
              <div className={styles.tmplCardHeader}>
                <div className={styles.tmplIcon}>
                  {TEMPLATE_ICONS[tmpl.id]}
                </div>
                <span className={styles.tmplName}>{t(tmpl.name)}</span>
              </div>
              <div className={styles.tmplDesc}>{t(tmpl.description)}</div>
            </div>
          ))}
        </div>
      </div>
      {customTemplates.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('template.customTitle')}</div>
          <div className={styles.tmplGrid}>
            {customTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className={styles.tmplCard}
                tabIndex={0}
                role="button"
                onClick={() => handleSelect(tmpl, true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelect(tmpl, true)
                }}
              >
                <div className={styles.tmplCardHeader}>
                  <div className={styles.tmplIcon}>
                    {TEMPLATE_ICONS.custom}
                  </div>
                  <span className={styles.tmplName}>{tmpl.name}</span>
                </div>
                <div className={styles.tmplDesc}>{countFields(tmpl.schema)} {t('template.fields')}</div>
                <div className={styles.tmplActions}>
                  <button
                    className={styles.tmplEdit}
                    onClick={(e) => handleRename(e, tmpl.id, tmpl.name)}
                    title={t('template.rename')}
                  >
                    {TEMPLATE_ICONS.edit}
                  </button>
                  <button
                    className={styles.tmplDelete}
                    onClick={(e) => handleDelete(e, tmpl.id, tmpl.name)}
                    title={t('template.delete')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <PromptDialog
        key={renameOpen ? 'rename-open' : 'rename-closed'}
        open={renameOpen}
        title={t('template.renameTitle')}
        label={t('template.renameLabel')}
        defaultValue={renameTarget?.name ?? ''}
        onConfirm={handleRenameConfirm}
        onClose={() => { setRenameOpen(false); setRenameTarget(null) }}
      />
    </div>
  )
}
