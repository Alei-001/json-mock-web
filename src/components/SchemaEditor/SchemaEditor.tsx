import { useState } from 'react'
import styles from './SchemaEditor.module.css'

function CardHeader() {
  const [activeTab, setActiveTab] = useState('visual')

  return (
    <div className="card-header">
      <div className="card-header-left">
        <span className="card-title">Schema 编辑器</span>
        <div className="tabs">
          <button className={`tab ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => setActiveTab('visual')}>
            可视化
          </button>
          <button className={`tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>
            文本
          </button>
        </div>
      </div>
      <div className="card-actions-header">
        <button className="btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          导入模板
        </button>
        <button className="btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          导出模板
        </button>
      </div>
    </div>
  )
}

/* ─── Type Icons ─── */

const objectIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" />
    <path d="M9 10h6" />
    <path d="M12 7v6" />
  </svg>
)

const arrayIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4h16v3" />
    <path d="M4 17v3h16v-3" />
    <path d="M4 12h16" />
  </svg>
)

const stringIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
)

const booleanIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const typeIcons: Record<string, React.ReactNode> = {
  object: objectIcon,
  array: arrayIcon,
  string: stringIcon,
  integer: stringIcon,
  boolean: booleanIcon,
}

/* ─── TreeNode ─── */

interface TreeNodeProps {
  name: string
  type: string
  depth: number
  required?: boolean
  selected?: boolean
  expandable?: boolean
  expanded?: boolean
  onSelect: (name: string) => void
  onToggle?: () => void
}

function TreeNode({
  name,
  type,
  depth,
  required = false,
  selected = false,
  expandable = false,
  expanded = false,
  onSelect,
  onToggle,
}: TreeNodeProps) {
  const depthClass = `tree-depth-${depth}`
  const classes = [
    styles.treeNode,
    styles[depthClass],
    required ? styles.required : '',
    selected ? styles.selected : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      role="treeitem"
      tabIndex={0}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(`.${styles.treeActions}`) ||
            (e.target as HTMLElement).closest(`.${styles.treeToggle}`)) {
          return
        }
        onSelect(name)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(name)
        }
      }}
    >
      {expandable ? (
        <div
          className={`${styles.treeToggle} ${expanded ? styles.expanded : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggle?.()
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      ) : (
        <div className={styles.treeTogglePlaceholder} />
      )}

      <div className={`${styles.treeTypeIcon} ${type === 'object' || type === 'array' ? styles[type === 'object' ? 'typeObject' : 'typeArray'] : ''}`}>
        {typeIcons[type] || stringIcon}
      </div>

      <span className={styles.treeName}>{name}</span>
      <span className={styles.treeTypeBadge}>{type}</span>

      <div className={styles.treeActions}>
        <button className={styles.treeActionBtn} title="添加字段" onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button className={`${styles.treeActionBtn} ${styles.danger}`} title="删除字段" onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ─── AddFieldButton ─── */

function AddFieldButton({ depth = 1 }: { depth?: number }) {
  const depthClass = `tree-depth-${depth}`
  return (
    <button className={`${styles.addFieldBtn} ${styles[depthClass]}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      添加字段
    </button>
  )
}

/* ─── SchemaEditor ─── */

interface SchemaEditorProps {
  onSelectField: (name: string) => void
}

export default function SchemaEditor({ onSelectField }: SchemaEditorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    tags: true,
  })

  const toggleNode = (name: string) => {
    setExpandedNodes(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="panel-left">
      <div className="card card-editor">
        <CardHeader />
        <div className={styles.tree}>
          <TreeNode
            name="root"
            type="object"
            depth={0}
            expandable
            expanded={expandedNodes.root}
            onToggle={() => toggleNode('root')}
            onSelect={onSelectField}
          />
          <TreeNode
            name="name"
            type="string"
            depth={1}
            required
            onSelect={onSelectField}
          />
          <TreeNode
            name="age"
            type="integer"
            depth={1}
            required
            onSelect={onSelectField}
          />
          <TreeNode
            name="email"
            type="string"
            depth={1}
            required
            selected
            onSelect={onSelectField}
          />
          <TreeNode
            name="address"
            type="object"
            depth={1}
            expandable
            expanded={expandedNodes.address}
            onToggle={() => toggleNode('address')}
            onSelect={onSelectField}
          />
          <TreeNode
            name="tags"
            type="array"
            depth={1}
            expandable
            expanded={expandedNodes.tags}
            onToggle={() => toggleNode('tags')}
            onSelect={onSelectField}
          />
          <TreeNode
            name="[0]"
            type="string"
            depth={2}
            onSelect={onSelectField}
          />
          <TreeNode
            name="isActive"
            type="boolean"
            depth={1}
            onSelect={onSelectField}
          />
          <TreeNode
            name="createdAt"
            type="string"
            depth={1}
            onSelect={onSelectField}
          />
          <AddFieldButton depth={1} />
        </div>
      </div>
    </div>
  )
}
