import { useState, useEffect } from 'react'
import styles from './DataPreview.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import { highlightJson } from '../../utils/syntaxHighlight'
import { copyToClipboard, downloadJson, downloadCsv } from '../../utils/export'

function GenControls() {
  const generationConfig = useProjectStore((s) => s.generationConfig)
  const updateGenerationConfig = useProjectStore((s) => s.updateGenerationConfig)
  const generate = useProjectStore((s) => s.generate)

  return (
    <div className={styles.genControls}>
      <div className="gen-field">
        <span className="gen-label">数量</span>
        <input
          type="number"
          className="gen-input"
          value={generationConfig.count}
          min={1}
          max={1000}
          onChange={(e) => updateGenerationConfig({ count: Math.max(1, Number(e.target.value)) })}
        />
      </div>
      <div className="gen-seed-group">
        <span className="gen-label">种子</span>
        <input
          type="text"
          className="gen-input wide"
          placeholder="可选"
          value={generationConfig.seed}
          onChange={(e) => updateGenerationConfig({ seed: e.target.value })}
        />
      </div>
      <div className={styles.genSpacer} />
      <button className="btn-sm primary" onClick={generate}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
        重新生成
      </button>
    </div>
  )
}

function JsonPreview() {
  const generatedData = useProjectStore((s) => s.generatedData)

  if (!generatedData) {
    return (
      <div className={styles.jsonPreview}>
        <div className={styles.emptyState}>点击「重新生成」查看数据</div>
      </div>
    )
  }

  const lines = highlightJson(generatedData)

  return (
    <div className={styles.jsonPreview}>
      {lines.map((line) => (
        <div className={styles.jsonLine} key={line.num}>
          <span className={styles.jsonLineNum}>{line.num}</span>
          <span className={styles.jsonContent}>
            {line.content}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActionBar({ onCopy }: { onCopy: () => void }) {
  const generatedData = useProjectStore((s) => s.generatedData)

  const handleDownloadJson = () => {
    if (generatedData) downloadJson(generatedData)
  }

  const handleDownloadCsv = () => {
    if (generatedData) downloadCsv(generatedData)
  }

  return (
    <div className={styles.actionBar}>
      <button className="btn-sm primary" onClick={onCopy}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
        复制 JSON
      </button>
      <button className="btn-sm" onClick={handleDownloadJson}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        下载 JSON
      </button>
      <button className="btn-sm" onClick={handleDownloadCsv}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        下载 CSV
      </button>
    </div>
  )
}

export default function DataPreview() {
  const [activeTab, setActiveTab] = useState('json-view')
  const [toastVisible, setToastVisible] = useState(false)
  const generatedData = useProjectStore((s) => s.generatedData)

  useEffect(() => {
    if (!generatedData) {
      useProjectStore.getState().generate()
    }
  }, [])

  const handleCopy = async () => {
    if (generatedData) {
      await copyToClipboard(generatedData)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 2000)
    }
  }

  return (
    <div className="panel-right">
      <div className="card card-preview">
        <div className="card-header">
          <div className="card-header-left">
            <span className="card-title">数据预览</span>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'json-view' ? 'active' : ''}`}
                onClick={() => setActiveTab('json-view')}
              >
                JSON
              </button>
              <button
                className={`tab ${activeTab === 'table-view' ? 'active' : ''}`}
                onClick={() => setActiveTab('table-view')}
              >
                表格
              </button>
            </div>
          </div>
        </div>

        <GenControls />
        {activeTab === 'json-view' && <JsonPreview />}
        {/* table-view intentionally left empty for now */}
      </div>

      <div className="card card-actions">
        <ActionBar onCopy={handleCopy} />
      </div>

      {toastVisible && (
        <div className="toast toast-success">已复制到剪贴板</div>
      )}
    </div>
  )
}