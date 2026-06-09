import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './SchemaEditor.module.css'
import TextEditor from './TextEditor'
import Select from '../Select/Select'
import PromptDialog from '../PromptDialog/PromptDialog'
import { useProjectStore } from '../../store/useProjectStore'
import { schemaFieldToJsonSchema } from '../../utils/schemaConverter'
import { downloadJson } from '../../utils/export'
import { getStrategyById } from '../../constants/strategies'
import type { SchemaField, FieldType, FieldConfig, DataSource, Binding } from '../../types'
import { MAX_GENERATE_COUNT } from '../../types'
import type { PresetTemplate } from '../../constants/templates'

const moreIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

/* ─── Type Icons ─── */

const objectIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H6a2 2 0 00-2 2v3c0 1.1-.9 2-2 2v4c1.1 0 2 .9 2 2v3a2 2 0 002 2h2" />
    <path d="M16 21h2a2 2 0 002-2v-3c0-1.1.9-2 2-2v-4c-1.1 0-2-.9-2-2V5a2 2 0 00-2-2h-2" />
  </svg>
)

const arrayIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4H4a2 2 0 00-2 2v12a2 2 0 002 2h2" />
    <path d="M18 20h2a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
    <path d="M9 10h6" />
    <path d="M9 14h4" />
  </svg>
)

const stringIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M4 12h12" />
    <path d="M4 17h7" />
  </svg>
)

const numberIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4v16" />
    <path d="M16 4v16" />
    <path d="M5 9h14" />
    <path d="M5 15h14" />
  </svg>
)

const booleanIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
    <path d="m8 12 2 2 4-4" />
  </svg>
)

const typeIcons: Record<string, React.ReactNode> = {
  object: objectIcon,
  array: arrayIcon,
  string: stringIcon,
  integer: numberIcon,
  number: numberIcon,
  boolean: booleanIcon,
}

/* ─── TreeNode ─── */

interface TreeNodeProps {
  field: SchemaField
  depth: number
  selected: boolean
  isRoot: boolean
  configTags: React.ReactNode[]
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onToggle: (id: string) => void
  onAdd: (parentId: string) => void
  onRemove: (id: string) => void
}

function TreeNode({ field, depth, selected, isRoot, configTags, onSelect, onEdit, onToggle, onAdd, onRemove }: TreeNodeProps) {
  const { t } = useTranslation()
  const expandable = field.type === 'object' || field.type === 'array'
  const expanded = !field.collapsed
  const indent = 8 + depth * 20
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
      tabIndex={selected ? 0 : -1}
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={selected || undefined}
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
      {configTags.length > 0 && (
        <span className={styles.treeTags}>
          {configTags.map((tag, i) => (
            <span key={i} className={styles.treeTag}>{tag}</span>
          ))}
        </span>
      )}

      <div className={styles.treeActions}>
        <button
          className={styles.treeActionBtn}
          title={t('schemaEditor.editField')}
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
            title={t('schemaEditor.addField')}
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
            title={t('schemaEditor.deleteField')}
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

function computeConfigTags(
  field: SchemaField,
  fieldConfigs: Record<string, FieldConfig>,
  bindings: Record<string, Binding>,
  dataSources: DataSource[],
  t: (key: string) => string,
): React.ReactNode[] {
  const tags: React.ReactNode[] = []
  const config = fieldConfigs[field.id]

  if (config?.fakerType) {
    const info = getStrategyById(config.fakerType)
    if (info) tags.push(t(info.label))
  }

  if (config?.nullProbability && config.nullProbability > 0) {
    tags.push(`null ${config.nullProbability}%`)
  }

  if (config?.constraints) {
    const c = config.constraints
    if (field.type === 'string') {
      if (c.minLength != null && c.maxLength != null) tags.push(`${c.minLength}~${c.maxLength}`)
      else if (c.minLength != null) tags.push(`≥${c.minLength}`)
      else if (c.maxLength != null) tags.push(`≤${c.maxLength}`)
    }
    if (field.type === 'number' || field.type === 'integer') {
      if (c.minimum != null && c.maximum != null) tags.push(`${c.minimum}~${c.maximum}`)
      else if (c.minimum != null) tags.push(`≥${c.minimum}`)
      else if (c.maximum != null) tags.push(`≤${c.maximum}`)
    }
    if (field.type === 'array') {
      if (c.minItems != null && c.maxItems != null) tags.push(`${c.minItems}~${c.maxItems}${t('schemaEditor.itemCount')}`)
      else if (c.minItems != null) tags.push(`≥${c.minItems}${t('schemaEditor.itemCount')}`)
      else if (c.maxItems != null) tags.push(`≤${c.maxItems}${t('schemaEditor.itemCount')}`)
    }
  }

  const binding = bindings[field.id]
  if (binding) {
    const ds = dataSources.find((d) => d.id === binding.dataSourceId)
    if (ds) tags.push(
      <span key={`b-${field.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, flexShrink: 0 }}>
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        {ds.name}
      </span>,
    )
  }

  return tags
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
  fieldConfigs: Record<string, FieldConfig>,
  bindings: Record<string, Binding>,
  dataSources: DataSource[],
  t: (key: string) => string,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const expandable = field.type === 'object' || field.type === 'array'
  const expanded = !field.collapsed

  const configTags = computeConfigTags(field, fieldConfigs, bindings, dataSources, t)

  nodes.push(
    <TreeNode
      key={field.id}
      field={field}
      depth={depth}
      selected={selectedFieldId === field.id}
      isRoot={depth === 0}
      configTags={configTags}
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
        nodes.push(...renderTreeNodes(child, depth + 1, selectedFieldId, onSelect, onEdit, onToggle, onAdd, onRemove, fieldConfigs, bindings, dataSources, t))
      }
    }
    if (field.type === 'array' && field.items) {
      nodes.push(...renderTreeNodes(field.items, depth + 1, selectedFieldId, onSelect, onEdit, onToggle, onAdd, onRemove, fieldConfigs, bindings, dataSources, t))
    }
  }

  return nodes
}

interface SchemaEditorProps {
  onEditField: (id: string) => void
}

export default function SchemaEditor({ onEditField }: SchemaEditorProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual')
  const [editorText, setEditorText] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const userEditingRef = useRef(false)

  useEffect(() => {
    if (!moreMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreMenuOpen])

  const schema = useProjectStore((s) => s.schema)
  const fieldConfigs = useProjectStore((s) => s.fieldConfigs)
  const selectedFieldId = useProjectStore((s) => s.selectedFieldId)
  const selectField = useProjectStore((s) => s.selectField)
  const toggleFieldCollapsed = useProjectStore((s) => s.toggleFieldCollapsed)
  const addField = useProjectStore((s) => s.addField)
  const removeField = useProjectStore((s) => s.removeField)
  const clearSchema = useProjectStore((s) => s.clearSchema)
  const importJsonSchema = useProjectStore((s) => s.importJsonSchema)
  const generationConfig = useProjectStore((s) => s.generationConfig)
  const updateGenerationConfig = useProjectStore((s) => s.updateGenerationConfig)
  const generate = useProjectStore((s) => s.generate)
  const showToast = useProjectStore((s) => s.showToast)
  const bindings = useProjectStore((s) => s.bindings)
  const dataSources = useProjectStore((s) => s.dataSources)
  const addCustomTemplate = useProjectStore((s) => s.addCustomTemplate)
  const autoPreview = useProjectStore((s) => s.autoPreview)
  const toggleAutoPreview = useProjectStore((s) => s.toggleAutoPreview)
  const prevAutoPreview = useRef(autoPreview)
  const skipAutoGenerate = useRef(false)

  const handleCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    updateGenerationConfig({ count: Math.max(1, isNaN(v) ? 1 : v) })
  }, [updateGenerationConfig])

  const handleSelect = useCallback((id: string) => {
    selectField(id)
  }, [selectField])

  const handleEdit = useCallback((id: string) => {
    selectField(id)
    onEditField(id)
  }, [selectField, onEditField])

  const jsonSchemaText = useMemo(() => {
    const jsonSchema = schemaFieldToJsonSchema(schema, fieldConfigs)
    return JSON.stringify(jsonSchema, null, 2)
  }, [schema, fieldConfigs])

  const handleTabChange = useCallback((tab: 'visual' | 'text') => {
    setActiveTab(tab)
    userEditingRef.current = false
  }, [])

  const handleEditorChange = useCallback((value: string) => {
    userEditingRef.current = true
    setEditorText(value)
    const success = importJsonSchema(value)
    if (!success) {
      setParseError(t('schemaEditor.parseError'))
      queueMicrotask(() => { userEditingRef.current = false })
    } else {
      setParseError(null)
    }
  }, [importJsonSchema, t])

  const handleExport = useCallback(() => {
    setExportOpen(true)
  }, [])

  const handleSaveTemplate = useCallback(() => {
    setSaveTemplateOpen(true)
  }, [])

  const handleSaveTemplateConfirm = useCallback((name: string) => {
    const template: PresetTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description: '',
      schema: JSON.parse(JSON.stringify(schema)),
      fieldConfigs: JSON.parse(JSON.stringify(fieldConfigs)),
    }
    addCustomTemplate(template)
    showToast(t('schemaEditor.templateSaved'))
    setSaveTemplateOpen(false)
  }, [schema, fieldConfigs, addCustomTemplate, showToast, t])

  const handleExportConfirm = useCallback((filename: string) => {
    const jsonSchema = schemaFieldToJsonSchema(schema, fieldConfigs)
    downloadJson(jsonSchema, filename)
    showToast(t('schemaEditor.exportedTemplate'))
  }, [schema, fieldConfigs, showToast, t])

  const handleClear = useCallback(() => {
    skipAutoGenerate.current = true
    clearSchema()
    selectField(null)
    if (activeTab === 'text') {
      const empty = JSON.stringify({ type: 'object', $schema: 'http://json-schema.org/draft-07/schema#' }, null, 2)
      setEditorText(empty)
    }
    showToast(t('schemaEditor.cleared'))
  }, [clearSchema, selectField, activeTab, showToast, t])

  useEffect(() => {
    if (activeTab === 'text' && !userEditingRef.current) {
      setEditorText(jsonSchemaText)
      setParseError(null)
    }
    userEditingRef.current = false
  }, [jsonSchemaText, activeTab])

  useEffect(() => {
    const justToggledOn = !prevAutoPreview.current && autoPreview
    prevAutoPreview.current = autoPreview
    if (skipAutoGenerate.current) {
      skipAutoGenerate.current = false
      return
    }
    if (autoPreview && !justToggledOn) {
      generate()
    }
  }, [jsonSchemaText, fieldConfigs, autoPreview, generate])

  const nodes = useMemo(
    () =>
      renderTreeNodes(
        schema, 0, selectedFieldId, handleSelect, handleEdit,
        toggleFieldCollapsed, addField, removeField,
        fieldConfigs, bindings, dataSources, t,
      ),
    [schema, selectedFieldId, fieldConfigs, bindings, dataSources, handleSelect, handleEdit, toggleFieldCollapsed, addField, removeField, t],
  )

  return (
    <div className="panel-left">
      <div className="card card-editor">
        <div className="card-header">
          <div className="card-header-left">
            <span className="card-title">{t('schemaEditor.title')}</span>
            <div className="tabs">
              <button className={`tab ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => handleTabChange('visual')}>
                {t('schemaEditor.visual')}
              </button>
              <button className={`tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => handleTabChange('text')}>
                {t('schemaEditor.text')}
              </button>
            </div>
          </div>
          <div className="card-actions-header">
            <button className="btn-sm danger" onClick={handleClear}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              <span>{t('schemaEditor.clear')}</span>
            </button>
            {activeTab === 'visual' && (
              <div className={styles.moreMenuWrap} ref={moreMenuRef}>
                <button className={`btn-sm ${styles.moreBtn}`} onClick={() => setMoreMenuOpen(!moreMenuOpen)} title={t('schemaEditor.moreActions')}>
                  {moreIcon}
                </button>
                {moreMenuOpen && (
                  <div className={styles.moreDropdown}>
                    <button className={styles.moreItem} onClick={() => { setMoreMenuOpen(false); handleExport() }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {t('schemaEditor.exportTemplate')}
                    </button>
                    <button className={styles.moreItem} onClick={() => { setMoreMenuOpen(false); handleSaveTemplate() }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      {t('schemaEditor.saveTemplate')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <PromptDialog
            key={exportOpen ? 'open' : 'closed'}
            open={exportOpen}
            title={t('schemaEditor.exportTemplate')}
            label={t('common.filename')}
            defaultValue="schema"
            suffix=".json"
            onConfirm={handleExportConfirm}
            onClose={() => setExportOpen(false)}
          />
          <PromptDialog
            key={saveTemplateOpen ? 'save-open' : 'save-closed'}
            open={saveTemplateOpen}
            title={t('schemaEditor.saveTemplateTitle')}
            label={t('schemaEditor.templateName')}
            defaultValue=""
            onConfirm={handleSaveTemplateConfirm}
            onClose={() => setSaveTemplateOpen(false)}
          />
        </div>

        {activeTab === 'visual' && (
          <div className={styles.tree} role="tree">
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

        <div className={styles.genFooter} ref={footerRef}>
          <div className={styles.genToolbar}>
            <div className={styles.genCountGroup}>
              <label className={styles.genLabel}>{t('schemaEditor.generateCount')}</label>
              <input
                type="number"
                className={`form-input ${styles.genInput}`}
                value={generationConfig.count}
                min={1}
                max={MAX_GENERATE_COUNT}
                onChange={handleCountChange}
              />
              {generationConfig.count > MAX_GENERATE_COUNT && (
                <span className={styles.genWarn}>{t('schemaEditor.maxItems', { count: MAX_GENERATE_COUNT })}</span>
              )}
            </div>
            <div className={styles.genActions}>
              <button className="btn-primary" onClick={generate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
                {t('schemaEditor.regenerate')}
              </button>
            </div>
          </div>

          <button
            className={`${styles.genAdvTrigger} ${advancedOpen ? styles.open : ''}`}
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>{t('schemaEditor.advancedOptions')}</span>
          </button>

          <div className={`${styles.genAdvancedPanel} ${advancedOpen ? styles.open : ''}`}>
            <div className={styles.genField}>
              <label className={styles.genLabel}>{t('schemaEditor.seed')}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('schemaEditor.seedPlaceholder')}
                value={generationConfig.seed}
                onChange={(e) => updateGenerationConfig({ seed: e.target.value })}
              />
            </div>
            <div className={styles.genField}>
              <div className={styles.genLabelRow}>
                <label className={styles.genLabel}>{t('schemaEditor.optionalFieldRate')}</label>
                <span className={styles.genRateValue}>{generationConfig.optionalFieldRate ?? 30}%</span>
              </div>
              <input
                type="range"
                className={styles.genSlider}
                min={0}
                max={100}
                step={5}
                value={generationConfig.optionalFieldRate ?? 30}
                onChange={(e) => updateGenerationConfig({ optionalFieldRate: Number(e.target.value) })}
              />
            </div>
            <div className={styles.genField}>
              <label className={styles.genLabel}>{t('schemaEditor.fakerLocale')}</label>
              <Select
                value={generationConfig.fakerLocale || 'en'}
                onChange={(v) => updateGenerationConfig({ fakerLocale: v })}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'zh_CN', label: '中文' },
                  { value: 'ja', label: '日本語' },
                  { value: 'ko', label: '한국어' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'fr', label: 'Français' },
                  { value: 'es', label: 'Español' },
                ]}
              />
            </div>
            <div className={styles.genToggleRow}>
              <span className={styles.genToggleText}>{t('schemaEditor.autoPreview')}</span>
              <button
                className={`${styles.genToggle} ${autoPreview ? styles.active : ''}`}
                aria-label={t('schemaEditor.autoPreview')}
                onClick={() => toggleAutoPreview()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}