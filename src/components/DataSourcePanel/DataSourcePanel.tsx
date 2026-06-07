import { useState, useRef } from 'react'
import Papa from 'papaparse'
import styles from './DataSourcePanel.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import type { DataSource } from '../../types'

function parseFile(name: string, text: string): { data: unknown[]; type: DataSource['type'] } {
  const ext = name.split('.').pop()?.toLowerCase()

  if (ext === 'csv') {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true })
    return { data: result.data, type: 'csv' }
  }

  if (ext === 'json') {
    const parsed = JSON.parse(text)
    const arr = Array.isArray(parsed) ? parsed : [parsed]
    return { data: arr, type: 'json' }
  }

  // text: split by newlines
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  return { data: lines, type: 'text' }
}

export default function DataSourcePanel() {
  const dataSources = useProjectStore((s) => s.dataSources)
  const addDataSource = useProjectStore((s) => s.addDataSource)
  const removeDataSource = useProjectStore((s) => s.removeDataSource)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = reader.result as string
        const { data, type } = parseFile(file.name, text)
        if (data.length === 0) {
          setError('文件中没有可解析的数据')
          return
        }
        const ds: DataSource = {
          id: `ds_${Date.now()}`,
          name: file.name.replace(/\.[^.]+$/, ''),
          type,
          data,
          createdAt: new Date().toISOString(),
        }
        addDataSource(ds)
      } catch (err) {
        setError(`解析失败: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)

    // reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleImport = () => {
    fileRef.current?.click()
  }

  const handleDelete = (id: string) => {
    removeDataSource(id)
    setPreviewIndex(null)
  }

  const previewDs = previewIndex !== null ? dataSources[previewIndex] : null

  return (
    <div className={styles.dataSourcePanel}>
      <div className={styles.importBar}>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv,.txt,.tsv"
          className={styles.fileInput}
          onChange={handleFile}
        />
        <label className={styles.fileLabel} onClick={handleImport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          导入文件
        </label>
        <span className={styles.spacer} />
        {error && <span style={{ fontSize: 12, color: 'var(--error)' }}>{error}</span>}
      </div>

      {dataSources.length === 0 ? (
        <div className={styles.dsEmpty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <span>暂无数据源</span>
          <span style={{ fontSize: 11, opacity: 0.6 }}>支持 JSON / CSV / TXT 文件</span>
        </div>
      ) : (
        <div className={styles.dsList}>
          {dataSources.map((ds, i) => (
            <div
              key={ds.id}
              className={styles.dsItem}
              onClick={() => setPreviewIndex(previewIndex === i ? null : i)}
            >
              <div className={styles.dsIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className={styles.dsInfo}>
                <div className={styles.dsName}>{ds.name}</div>
                <div className={styles.dsMeta}>{ds.type.toUpperCase()} · {ds.data.length} 条</div>
              </div>
              <button
                className={styles.dsDelete}
                title="删除数据源"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(ds.id)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {previewDs && (
        <div className={styles.dsPreview}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              {previewDs.data.slice(0, 20).map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}