import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import styles from './TopBar.module.css'
import PromptDialog from '../PromptDialog/PromptDialog'

const LANGS: { code: string; label: string }[] = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
]

function LangSwitcher() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const current = LANGS.find((l) => l.code === i18n.language) || LANGS[0]

  return (
    <div className={styles.langSwitcher} ref={ref}>
      <button className={styles.themeBtn} onClick={() => setOpen(!open)} title={current.label}>
        {current.label}
      </button>
      {open && (
        <div className={styles.langDropdown}>
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.langItem} ${lang.code === i18n.language ? styles.langActive : ''}`}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                localStorage.setItem('json-mock-lang', lang.code)
                setOpen(false)
              }}
            >
              <span>{lang.label}</span>
              {lang.code === i18n.language && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
import { useProjectStore } from '../../store/useProjectStore'

function Logo() {
  return (
    <a href="javascript:void(0)" className={styles.logo}>
      <div className={styles.logoMark}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H6a2 2 0 00-2 2v3c0 1.1-.9 2-2 2v4c1.1 0 2 .9 2 2v3a2 2 0 002 2h2" />
          <path d="M16 21h2a2 2 0 002-2v-3c0-1.1.9-2 2-2v-4c-1.1 0-2-.9-2-2V5a2 2 0 00-2-2h-2" />
        </svg>
      </div>
      <span className={styles.logoText}>JSON Mock</span>
    </a>
  )
}

function NavButton({ icon, children, active = false, onClick }: { icon: React.ReactNode; children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button className={`${styles.navBtn} ${active ? styles.active : ''}`} onClick={onClick}>
      {icon}
      <span className={styles.navLabel}>{children}</span>
    </button>
  )
}

const templateIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const dataSourceIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
    <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
  </svg>
)

const importIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const moonIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)

const sunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const exportIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

export default function TopBar({ onTemplate, onDataSource }: { onTemplate: () => void; onDataSource: () => void }) {
  const { t } = useTranslation()
  const theme = useProjectStore((s) => s.theme)
  const toggleTheme = useProjectStore((s) => s.toggleTheme)
  const loadSchema = useProjectStore((s) => s.loadSchema)
  const showToast = useProjectStore((s) => s.showToast)
  const importFileRef = useRef<HTMLInputElement>(null)
  const [exportOpen, setExportOpen] = useState(false)

  const handleExportConfirm = (filename: string) => {
    const state = useProjectStore.getState()
    const project = {
      schema: state.schema,
      fieldConfigs: state.fieldConfigs,
      generationConfig: state.generationConfig,
      dataSources: state.dataSources,
      bindings: state.bindings,
    }
    const json = JSON.stringify(project, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(t('topbar.exportedProject'))
  }

  const handleImport = () => {
    importFileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.schema) {
          loadSchema(data.schema, data.fieldConfigs || {})
          if (data.generationConfig) {
            useProjectStore.getState().updateGenerationConfig(data.generationConfig)
          }
          if (data.dataSources) {
            useProjectStore.setState({ dataSources: data.dataSources })
          }
          if (data.bindings) {
            useProjectStore.setState({ bindings: data.bindings })
          }
          showToast(t('topbar.importedProject'))
        } else {
          showToast(t('topbar.invalidFormat'))
        }
      } catch {
        showToast(t('topbar.importFailed'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <Logo />
        <nav className={styles.topbarNav}>
          <NavButton icon={templateIcon} onClick={onTemplate}>{t('topbar.templates')}</NavButton>
          <NavButton icon={dataSourceIcon} onClick={onDataSource}>{t('topbar.dataSources')}</NavButton>
        </nav>
      </div>
      <div className={styles.topbarRight}>
        <input
          ref={importFileRef}
          type="file"
          accept=".json-mock,.json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button className={styles.themeBtn} onClick={toggleTheme} title={theme === 'light' ? t('topbar.switchDark') : t('topbar.switchLight')}>
          {theme === 'light' ? moonIcon : sunIcon}
        </button>
        <LangSwitcher />
        <button className="btn-sm" onClick={handleImport}>
          {importIcon}
          <span className={styles.btnLabel}>{t('common.import')}</span>
        </button>
        <button className="btn-sm primary" onClick={() => setExportOpen(true)}>
          {exportIcon}
          <span className={styles.btnLabel}>{t('common.export')}</span>
        </button>
      </div>
      <PromptDialog
        open={exportOpen}
        title={t('topbar.exportProject')}
        label={t('common.filename')}
        defaultValue="project"
        suffix=".json-mock"
        onConfirm={handleExportConfirm}
        onClose={() => setExportOpen(false)}
      />
    </header>
  )
}