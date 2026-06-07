import { useRef, useState } from 'react'
import styles from './TopBar.module.css'
import PromptDialog from '../PromptDialog/PromptDialog'
import { useProjectStore } from '../../store/useProjectStore'

function Logo() {
  return (
    <a href="javascript:void(0)" className={styles.logo}>
      <div className={styles.logoMark}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" />
          <path d="M9 10h6" />
          <path d="M12 7v6" />
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

const exportIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

export default function TopBar({ onTemplate, onDataSource }: { onTemplate: () => void; onDataSource: () => void }) {
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
    showToast('已导出项目')
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
          showToast('已导入项目')
        } else {
          showToast('文件格式不正确')
        }
      } catch {
        showToast('导入失败：文件解析错误')
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
          <NavButton icon={templateIcon} onClick={onTemplate}>模板库</NavButton>
          <NavButton icon={dataSourceIcon} onClick={onDataSource}>数据源</NavButton>
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
        <button className="btn-sm" onClick={handleImport}>
          {importIcon}
          <span className={styles.btnLabel}>导入</span>
        </button>
        <button className="btn-sm primary" onClick={() => setExportOpen(true)}>
          {exportIcon}
          <span className={styles.btnLabel}>导出</span>
        </button>
      </div>
      <PromptDialog
        open={exportOpen}
        title="导出项目"
        label="文件名"
        defaultValue="project"
        suffix=".json-mock"
        onConfirm={handleExportConfirm}
        onClose={() => setExportOpen(false)}
      />
    </header>
  )
}