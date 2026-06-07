import { useState, useRef } from 'react'
import Papa from 'papaparse'
import styles from './DataSourcePanel.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import type { DataSource } from '../../types'

function parseFile(name: string, text: string): { data: unknown[]; type: DataSource['type'] } {
  const ext = name.split('.').pop()?.toLowerCase()

  if (ext === 'csv' || ext === 'tsv') {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true })
    return { data: result.data, type: ext === 'tsv' ? 'csv' : 'csv' }
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
  const showToast = useProjectStore((s) => s.showToast)
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
        const dsName = file.name.replace(/\.[^.]+$/, '')
        const existing = dataSources.find((d) => d.name === dsName)
        const ds: DataSource = {
          id: existing ? existing.id : `ds_${Date.now()}`,
          name: dsName,
          type,
          data,
          createdAt: new Date().toISOString(),
        }
        addDataSource(ds)
        showToast(existing ? `已更新 ${ds.name}` : `已导入 ${ds.name}`)
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
    showToast('已删除数据源')
  }

  const previewDs = previewIndex !== null ? dataSources[previewIndex] : null

  const jsonExample = '["值1","值2"]  或  [\u007B"name":"Alice"\u007D,...]'

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
          <span style={{ fontSize: 11, opacity: 0.6 }}>支持 JSON / CSV / TXT / TSV 文件</span>
<div style={{ margin: '16px 0 0', textAlign: 'left', fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--ink-secondary)' }}>格式要求</div>
            <div><span style={{ fontWeight: 500 }}>JSON</span> — 数组格式，每个元素为一个值或对象</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 8px', background: 'var(--surface)', borderRadius: 4, margin: '2px 0 6px' }}>{jsonExample}</div>
            <div><span style={{ fontWeight: 500 }}>CSV / TSV</span> — 首行为表头，每行一条记录</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 8px', background: 'var(--surface)', borderRadius: 4, margin: '2px 0 6px' }}>name,email<br/>Alice,a@b.com</div>
            <div><span style={{ fontWeight: 500 }}>TXT</span> — 每行一个值</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 8px', background: 'var(--surface)', borderRadius: 4, margin: '2px 0 0' }}>值1<br/>值2<br/>值3</div>
          </div>
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