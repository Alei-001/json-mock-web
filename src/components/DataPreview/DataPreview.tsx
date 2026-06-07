import { useState } from 'react'
import styles from './DataPreview.module.css'

function GenControls() {
  return (
    <div className={styles.genControls}>
      <div className="gen-field">
        <span className="gen-label">数量</span>
        <input type="number" className="gen-input" defaultValue={1} min={1} max={1000} />
      </div>
      <div className="gen-seed-group">
        <span className="gen-label">种子</span>
        <input type="text" className="gen-input wide" placeholder="可选" />
      </div>
      <div className={styles.genSpacer} />
      <button className="btn-sm primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
        重新生成
      </button>
    </div>
  )
}

/* ─── JSON Lines (static mock data) ─── */

const jsonLines = [
  { num: 1, indent: '', content: [<span key="b1" className={styles.jsonBracket}>{'{'}</span>] },
  { num: 2, indent: '  ', content: [
    <span key="k1" className={styles.jsonKey}>"name"</span>,
    <span key="c1" className={styles.jsonColon}>: </span>,
    <span key="s1" className={styles.jsonString}>"张伟"</span>,
    <span key="cm1" className={styles.jsonComma}>,</span>,
  ]},
  { num: 3, indent: '  ', content: [
    <span key="k2" className={styles.jsonKey}>"age"</span>,
    <span key="c2" className={styles.jsonColon}>: </span>,
    <span key="n1" className={styles.jsonNumber}>28</span>,
    <span key="cm2" className={styles.jsonComma}>,</span>,
  ]},
  { num: 4, indent: '  ', content: [
    <span key="k3" className={styles.jsonKey}>"email"</span>,
    <span key="c3" className={styles.jsonColon}>: </span>,
    <span key="s2" className={styles.jsonString}>"zhangwei@example.com"</span>,
    <span key="cm3" className={styles.jsonComma}>,</span>,
  ]},
  { num: 5, indent: '  ', content: [
    <span key="k4" className={styles.jsonKey}>"address"</span>,
    <span key="c4" className={styles.jsonColon}>: </span>,
    <span key="b2" className={styles.jsonBracket}>{'{'}</span>,
  ]},
  { num: 6, indent: '    ', content: [
    <span key="k5" className={styles.jsonKey}>"street"</span>,
    <span key="c5" className={styles.jsonColon}>: </span>,
    <span key="s3" className={styles.jsonString}>"长安街 100 号"</span>,
    <span key="cm4" className={styles.jsonComma}>,</span>,
  ]},
  { num: 7, indent: '    ', content: [
    <span key="k6" className={styles.jsonKey}>"city"</span>,
    <span key="c6" className={styles.jsonColon}>: </span>,
    <span key="s4" className={styles.jsonString}>"北京"</span>,
    <span key="cm5" className={styles.jsonComma}>,</span>,
  ]},
  { num: 8, indent: '    ', content: [
    <span key="k7" className={styles.jsonKey}>"zipCode"</span>,
    <span key="c7" className={styles.jsonColon}>: </span>,
    <span key="s5" className={styles.jsonString}>"100000"</span>,
  ]},
  { num: 9, indent: '  ', content: [
    <span key="b3" className={styles.jsonBracket}>{'}'}</span>,
    <span key="cm6" className={styles.jsonComma}>,</span>,
  ]},
  { num: 10, indent: '  ', content: [
    <span key="k8" className={styles.jsonKey}>"tags"</span>,
    <span key="c8" className={styles.jsonColon}>: </span>,
    <span key="b4" className={styles.jsonBracket}>{'['}</span>,
    <span key="s6" className={styles.jsonString}>"developer"</span>,
    <span key="cm7" className={styles.jsonComma}>, </span>,
    <span key="s7" className={styles.jsonString}>"designer"</span>,
    <span key="b5" className={styles.jsonBracket}>{']'}</span>,
    <span key="cm8" className={styles.jsonComma}>,</span>,
  ]},
  { num: 11, indent: '  ', content: [
    <span key="k9" className={styles.jsonKey}>"isActive"</span>,
    <span key="c9" className={styles.jsonColon}>: </span>,
    <span key="bl1" className={styles.jsonBoolean}>true</span>,
    <span key="cm9" className={styles.jsonComma}>,</span>,
  ]},
  { num: 12, indent: '  ', content: [
    <span key="k10" className={styles.jsonKey}>"createdAt"</span>,
    <span key="c10" className={styles.jsonColon}>: </span>,
    <span key="s8" className={styles.jsonString}>"2024-03-15T08:30:00Z"</span>,
  ]},
  { num: 13, indent: '', content: [<span key="b6" className={styles.jsonBracket}>{'}'}</span>] },
]

function JsonPreview() {
  return (
    <div className={styles.jsonPreview}>
      {jsonLines.map((line) => (
        <div className={styles.jsonLine} key={line.num}>
          <span className={styles.jsonLineNum}>{line.num}</span>
          <span className={styles.jsonContent}>
            {line.indent}
            {line.content}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActionBar({ onCopy }: { onCopy: () => void }) {
  return (
    <div className={styles.actionBar}>
      <button className="btn-sm primary" onClick={onCopy}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
        复制 JSON
      </button>
      <button className="btn-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        下载 JSON
      </button>
      <button className="btn-sm">
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

export default function DataPreview({ onCopy }: { onCopy: () => void }) {
  const [activeTab, setActiveTab] = useState('json-view')

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
        <ActionBar onCopy={onCopy} />
      </div>
    </div>
  )
}
