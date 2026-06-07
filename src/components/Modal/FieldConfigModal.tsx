import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'
import { useProjectStore } from '../../store/useProjectStore'
import { getStrategiesForType, getStrategyById } from '../../constants/strategies'
import type { SchemaField, FieldType, FieldConfig } from '../../types'

const FIELD_TYPES: FieldType[] = ['string', 'number', 'integer', 'boolean', 'object', 'array']

function findNodeById(node: SchemaField, id: string): SchemaField | null {
  if (node.id === id) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  if (node.items) return findNodeById(node.items, id)
  return null
}

interface FieldConfigModalProps {
  open: boolean
  fieldId: string | null
  onClose: () => void
}

export default function FieldConfigModal({ open, fieldId, onClose }: FieldConfigModalProps) {
  const schema = useProjectStore((s) => s.schema)
  const fieldConfigs = useProjectStore((s) => s.fieldConfigs)
  const dataSources = useProjectStore((s) => s.dataSources)
  const bindings = useProjectStore((s) => s.bindings)
  const updateField = useProjectStore((s) => s.updateField)
  const updateFieldConfig = useProjectStore((s) => s.updateFieldConfig)
  const bindField = useProjectStore((s) => s.bindField)
  const unbindField = useProjectStore((s) => s.unbindField)

  const field = fieldId ? findNodeById(schema, fieldId) : null
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('string')
  const [required, setRequired] = useState(false)
  const [strategy, setStrategy] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [pattern, setPattern] = useState('')
  const [nullProb, setNullProb] = useState('')
  const [boundDsId, setBoundDsId] = useState('')
  const [samplingStr, setSamplingStr] = useState<'random' | 'sequential'>('random')

  const syncFromStore = useCallback(() => {
    if (field) {
      setFieldName(field.name)
      setFieldType(field.type as FieldType)
      setRequired(field.required)

      const config = fieldId ? fieldConfigs[fieldId] : undefined
      const savedStrategy = (config?.fakerType ?? '') || getStrategiesForType(field.type as FieldType)[0]?.id || ''
      setStrategy(savedStrategy)
      setMinValue(config?.constraints?.minimum?.toString() ?? config?.constraints?.minLength?.toString() ?? '')
      setMaxValue(config?.constraints?.maximum?.toString() ?? config?.constraints?.maxLength?.toString() ?? '')
      setPattern(config?.constraints?.pattern ?? '')
      setNullProb(config?.nullProbability?.toString() ?? '')
      const binding = fieldId ? bindings[fieldId] : undefined
      if (binding) {
        const [dsId, strat] = binding.split(':')
        setBoundDsId(dsId)
        setSamplingStr((strat as 'random' | 'sequential') || 'random')
      } else {
        setBoundDsId('')
        setSamplingStr('random')
      }
    }
  }, [field, fieldId, fieldConfigs, bindings])

  useEffect(() => {
    if (open) syncFromStore()
  }, [open, syncFromStore])

  const handleStrategyChange = (newStrategy: string) => {
    setStrategy(newStrategy)
    const info = getStrategyById(newStrategy)
    if (info?.presetConstraints) {
      if (info.presetConstraints.minimum !== undefined) setMinValue(String(info.presetConstraints.minimum))
      if (info.presetConstraints.maximum !== undefined) setMaxValue(String(info.presetConstraints.maximum))
      if (info.presetConstraints.minLength !== undefined) setMinValue(String(info.presetConstraints.minLength))
      if (info.presetConstraints.maxLength !== undefined) setMaxValue(String(info.presetConstraints.maxLength))
    }
    if (info?.isCustom) {
      setMinValue('')
      setMaxValue('')
    }
  }

  const handleSave = () => {
    if (!fieldId || !field) return

    const trimmed = fieldName.trim()
    if (!trimmed) return

    updateField(fieldId, { name: trimmed, type: fieldType, required })

    const configUpdate: Partial<FieldConfig> = {}

    configUpdate.fakerType = strategy || undefined

    const minNum = minValue !== '' ? Number(minValue) : undefined
    const maxNum = maxValue !== '' ? Number(maxValue) : undefined

    if (fieldType === 'string') {
      const constraints: NonNullable<FieldConfig['constraints']> = {}
      if (minNum !== undefined) constraints.minLength = minNum
      if (maxNum !== undefined) constraints.maxLength = maxNum
      if (pattern) constraints.pattern = pattern
      if (Object.keys(constraints).length > 0) configUpdate.constraints = constraints
      else configUpdate.constraints = undefined
    } else if (fieldType === 'number' || fieldType === 'integer') {
      const constraints: NonNullable<FieldConfig['constraints']> = {}
      if (minNum !== undefined) constraints.minimum = minNum
      if (maxNum !== undefined) constraints.maximum = maxNum
      if (Object.keys(constraints).length > 0) configUpdate.constraints = constraints
      else configUpdate.constraints = undefined
    }

    const np = nullProb !== '' ? Math.max(0, Math.min(100, Number(nullProb))) : undefined
    configUpdate.nullProbability = np

    updateFieldConfig(fieldId, configUpdate)

    if (boundDsId) {
      bindField(fieldId, boundDsId, samplingStr)
    } else {
      unbindField(fieldId)
    }

    onClose()
  }

  const currentStrategies = getStrategiesForType(fieldType)
  const hasStrategy = currentStrategies.length > 0
  const currentStrategyInfo = getStrategyById(strategy)
  const isCustom = currentStrategyInfo?.isCustom ?? false
  const showConstraints = hasStrategy && !isCustom && (fieldType === 'string' || fieldType === 'number' || fieldType === 'integer')

  const isStringType = fieldType === 'string'
  const minLabel = isStringType ? '最小长度' : '最小值'
  const maxLabel = isStringType ? '最大长度' : '最大值'

  const displayName = field ? field.name : (fieldId ?? '')

  return (
    <Modal
      open={open}
      title="字段配置"
      subtitle={displayName}
      onClose={onClose}
      footer={
        <>
          <button className="btn-sm" onClick={onClose}>取消</button>
          <button className="btn-sm primary" onClick={handleSave}>保存</button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">字段名称</label>
          <input
            type="text"
            className="form-input mono"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">字段类型</label>
          <select
            className="form-select"
            value={fieldType}
            onChange={(e) => {
              const t = e.target.value as FieldType
              setFieldType(t)
              const first = getStrategiesForType(t)[0]
              if (first) {
                setStrategy(first.id)
                if (first.presetConstraints) {
                  if (first.presetConstraints.minimum !== undefined) setMinValue(String(first.presetConstraints.minimum))
                  else if (first.presetConstraints.minLength !== undefined) setMinValue(String(first.presetConstraints.minLength))
                  else setMinValue('')
                  if (first.presetConstraints.maximum !== undefined) setMaxValue(String(first.presetConstraints.maximum))
                  else if (first.presetConstraints.maxLength !== undefined) setMaxValue(String(first.presetConstraints.maxLength))
                  else setMaxValue('')
                } else {
                  setMinValue('')
                  setMaxValue('')
                }
              } else {
                setStrategy('')
                setMinValue('')
                setMaxValue('')
              }
            }}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <div className="toggle-row">
            <span className="toggle-label">必填</span>
            <button
              className={`toggle ${required ? 'active' : ''}`}
              aria-label="切换必填状态"
              onClick={() => setRequired(!required)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">null 概率 (%)</label>
          <input
            type="number"
            className="form-input"
            min={0}
            max={100}
            value={nullProb}
            onChange={(e) => setNullProb(e.target.value)}
            placeholder="0"
          />
        </div>

        {hasStrategy && (
          <div className="form-group full-width">
            <label className="form-label">生成策略</label>
            <select
              className="form-select"
              value={strategy}
              onChange={(e) => handleStrategyChange(e.target.value)}
            >
              {currentStrategies.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {showConstraints && (
          <>
            <div className="form-group">
              <label className="form-label">{minLabel}</label>
              <input
                type="number"
                className="form-input"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="不限"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{maxLabel}</label>
              <input
                type="number"
                className="form-input"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="不限"
              />
            </div>
          </>
        )}

        {hasStrategy && isCustom && (
          <div className="form-group full-width">
            <label className="form-label">正则约束</label>
            <input
              type="text"
              className="form-input mono"
              placeholder="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
          </div>
        )}

        {(isCustom || dataSources.length > 0) && (
          <>
            <div className="form-group full-width">
              <label className="form-label">数据源</label>
              <select
                className="form-select"
                value={boundDsId}
                onChange={(e) => setBoundDsId(e.target.value)}
                disabled={dataSources.length === 0}
              >
                <option value="">不绑定</option>
                {dataSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>{ds.name} ({ds.data.length}条)</option>
                ))}
              </select>
              {dataSources.length === 0 && (
                <div className="form-hint" style={{ marginTop: 6 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  尚未导入数据源，请通过 TopBar「数据源」导入文件后绑定
                </div>
              )}
            </div>
            {boundDsId && (
              <div className="form-group">
                <label className="form-label">抽样策略</label>
                <select
                  className="form-select"
                  value={samplingStr}
                  onChange={(e) => setSamplingStr(e.target.value as 'random' | 'sequential')}
                >
                  <option value="random">随机抽取</option>
                  <option value="sequential">顺序循环</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}