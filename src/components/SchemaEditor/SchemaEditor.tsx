import { useState, useCallback, useMemo } from 'react'
import styles from './SchemaEditor.module.css'
import TextEditor from './TextEditor'
import { useProjectStore } from '../../store/useProjectStore'
import { schemaFieldToJsonSchema } from '../../utils/schemaConverter'
import { downloadJson } from '../../utils/export'
import type { SchemaField, FieldType } from '../../types'

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
  number: stringIcon,
  boolean: booleanIcon,
}

/* ─── TreeNode ─── */

interface TreeNodeProps {
  field: SchemaField
  depth: number
  selected: boolean
  isRoot: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onToggle: (id: string) => void
  onAdd: (parentId: string) => void
  onRemove: (id: string) => void
}

function TreeNode({ field, depth, selected, isRoot, onSelect, onEdit, onToggle, onAdd, onRemove }: TreeNodeProps) {
  const expandable = field.type === 'object' || field.type === 'array'
  const expanded = !field.collapsed
  const indent = 8 + depth * 24
  const classes = [
    styles.treeNode,
    field.required ? styles.required : '',
    selected ? styles.selected : '',
  ].filter(Boolean).join(' ')

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.treeActions}`) ||
        (e.target as HTMLElement).closest(`.${styles.treeToggle}`)) {
      return
    }
    onSelect(field.id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.treeActions}`) ||
        (e.target as HTMLElement).closest(`.${styles.treeToggle}`)) {
      return
    }
    onEdit(field.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEdit(field.id)
    }
    if (e.key === ' ') {
      e.preventDefault()
      onSelect(field.id)
    }
  }

  const typeKey: FieldType = field.type
  const hasColorIcon = typeKey === 'object' || typeKey === 'array'

  return (
    <div
      className={classes}
      role="treeitem"
      tabIndex={0}
      style={{ paddingLeft: indent }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {expandable ? (
<div
            className={`${styles.treeToggle} ${expanded ? styles.expanded : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(field.id)
            }}
            onDoubleClick={(e) => e.stopPropagation()}
          >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      ) : (
        <div className={styles.treeTogglePlaceholder} />
      )}

      <div className={`${styles.treeTypeIcon} ${hasColorIcon ? styles[typeKey === 'object' ? 'typeObject' : 'typeArray'] : ''}`}>
        {typeIcons[field.type] || stringIcon}
      </div>

      <span className={styles.treeName}>{field.name}</span>
      <span className={styles.treeTypeBadge}>{field.type}</span>

      <div className={styles.treeActions}>
        <button
          className={styles.treeActionBtn}
          title="编辑字段"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(field.id)
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        {(field.type === 'object' || field.type === 'array') && (
          <button
            className={styles.treeActionBtn}
            title="添加字段"
            onClick={(e) => {
              e.stopPropagation()
              onAdd(field.id)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
        {!isRoot && (
          <button
            className={`${styles.treeActionBtn} ${styles.danger}`}
            title="删除字段"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(field.id)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Tree Render ─── */

function renderTreeNodes(
  field: SchemaField,
  depth: number,
  selectedFieldId: string | null,
  onSelect: (id: string) => void,
  onEdit: (id: string) => void,
  onToggle: (id: string) => void,
  onAdd: (parentId: string) => void,
  onRemove: (id: string) => void,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const expandable = field.type === 'object' || field.type === 'array'
  const expanded = !field.collapsed

  nodes.push(
    <TreeNode
      key={field.id}
      field={field}
      depth={depth}
      selected={selectedFieldId === field.id}
      isRoot={depth === 0}
      onSelect={onSelect}
      onEdit={onEdit}
      onToggle={onToggle}
      onAdd={onAdd}
      onRemove={onRemove}
    />,
  )

  if (expandable && expanded) {
    if (field.children) {
      for (const child of field.children) {
        nodes.push(...renderTreeNodes(child, depth + 1, selectedFieldId, onSelect, onEdit, onToggle, onAdd, onRemove))
      }
    }
    if (field.type === 'array' && field.items) {
      nodes.push(...renderTreeNodes(field.items, depth + 1, selectedFieldId, onSelect, onEdit, onToggle, onAdd, onRemove))
    }
  }

  return nodes
}

interface SchemaEditorProps {
  onEditField: (id: string) => void
}

export default function SchemaEditor({ onEditField }: SchemaEditorProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual')
  const [editorText, setEditorText] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)

  const schema = useProjectStore((s) => s.schema)
  const fieldConfigs = useProjectStore((s) => s.fieldConfigs)
  const selectedFieldId = useProjectStore((s) => s.selectedFieldId)
  const selectField = useProjectStore((s) => s.selectField)
  const toggleFieldCollapsed = useProjectStore((s) => s.toggleFieldCollapsed)
  const addField = useProjectStore((s) => s.addField)
  const removeField = useProjectStore((s) => s.removeField)
  const clearSchema = useProjectStore((s) => s.clearSchema)
  const importJsonSchema = useProjectStore((s) => s.importJsonSchema)

  const handleSelect = (id: string) => {
    selectField(id)
  }

  const handleEdit = (id: string) => {
    selectField(id)
    onEditField(id)
  }

  const jsonSchemaText = useMemo(() => {
    const jsonSchema = schemaFieldToJsonSchema(schema, fieldConfigs)
    return JSON.stringify(jsonSchema, null, 2)
  }, [schema, fieldConfigs])

  const handleTabChange = useCallback((tab: 'visual' | 'text') => {
    if (tab === 'text') {
      setEditorText(jsonSchemaText)
      setParseError(null)
    }
    setActiveTab(tab)
  }, [jsonSchemaText])

  const handleEditorChange = useCallback((value: string) => {
    setEditorText(value)
    const success = importJsonSchema(value)
    if (!success) {
      setParseError('JSON 解析失败，请检查格式是否正确')
    } else {
      setParseError(null)
    }
  }, [importJsonSchema])

  const handleExport = useCallback(() => {
    const jsonSchema = schemaFieldToJsonSchema(schema, fieldConfigs)
    downloadJson(jsonSchema, 'schema.json')
  }, [schema, fieldConfigs])

  const handleClear = useCallback(() => {
    clearSchema()
    selectField(null)
    if (activeTab === 'text') {
      const empty = JSON.stringify({ type: 'object', $schema: 'http://json-schema.org/draft-07/schema#' }, null, 2)
      setEditorText(empty)
    }
  }, [clearSchema, selectField, activeTab])

  const nodes = renderTreeNodes(
    schema,
    0,
    selectedFieldId,
    handleSelect,
    handleEdit,
    toggleFieldCollapsed,
    addField,
    removeField,
  )

  return (
    <div className="panel-left">
      <div className="card card-editor">
        <div className="card-header">
          <div className="card-header-left">
            <span className="card-title">Schema 编辑器</span>
            <div className="tabs">
              <button className={`tab ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => handleTabChange('visual')}>
                可视化
              </button>
              <button className={`tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => handleTabChange('text')}>
                文本
              </button>
            </div>
          </div>
          <div className="card-actions-header">
            {activeTab === 'visual' && (
              <>
                <button className="btn-sm" onClick={handleExport}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  导出模板
                </button>
                <button className="btn-sm" onClick={handleClear}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  清空
                </button>
              </>
            )}
            {activeTab === 'text' && (
              <button className="btn-sm" onClick={handleClear}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                清空
              </button>
            )}
          </div>
        </div>

        {activeTab === 'visual' && (
          <div className={styles.tree}>
            {nodes}
          </div>
        )}
        {activeTab === 'text' && (
          <>
            <TextEditor
              value={editorText}
              onChange={handleEditorChange}
              onError={setParseError}
            />
            {parseError && (
              <div className={styles.errorBar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{parseError}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}