import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import Select from '../Select/Select'
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
  const { t } = useTranslation()
  const schema = useProjectStore((s) => s.schema)
  const fieldConfigs = useProjectStore((s) => s.fieldConfigs)
  const dataSources = useProjectStore((s) => s.dataSources)
  const bindings = useProjectStore((s) => s.bindings)
  const updateField = useProjectStore((s) => s.updateField)
  const updateFieldConfig = useProjectStore((s) => s.updateFieldConfig)
  const bindField = useProjectStore((s) => s.bindField)
  const unbindField = useProjectStore((s) => s.unbindField)
  const showToast = useProjectStore((s) => s.showToast)

  const field = fieldId ? findNodeById(schema, fieldId) : null
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('string')
  const [required, setRequired] = useState(false)
  const [strategy, setStrategy] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [minItems, setMinItems] = useState('')
  const [maxItems, setMaxItems] = useState('')
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
      const savedStrategy = (config?.fakerType ?? '')
        || (config?.constraints?.pattern ? 'custom' : '')
        || getStrategiesForType(field.type as FieldType)[0]?.id
        || ''
      setStrategy(savedStrategy)
      setMinValue(config?.constraints?.minimum?.toString() ?? config?.constraints?.minLength?.toString() ?? '')
      setMaxValue(config?.constraints?.maximum?.toString() ?? config?.constraints?.maxLength?.toString() ?? '')
      setMinItems(config?.constraints?.minItems?.toString() ?? '')
      setMaxItems(config?.constraints?.maxItems?.toString() ?? '')
      setPattern(config?.constraints?.pattern ?? '')
      setNullProb(config?.nullProbability?.toString() ?? '')
      const binding = fieldId ? bindings[fieldId] : undefined
      if (binding) {
        setBoundDsId(binding.dataSourceId)
        setSamplingStr(binding.strategy)
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
    } else {
      setBoundDsId('')
      setSamplingStr('random')
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
    const minItemsNum = minItems !== '' ? Number(minItems) : undefined
    const maxItemsNum = maxItems !== '' ? Number(maxItems) : undefined

    if (fieldType === 'string') {
      const constraints: NonNullable<FieldConfig['constraints']> = {}
      if (minNum !== undefined) constraints.minLength = Math.max(0, minNum)
      if (maxNum !== undefined) constraints.maxLength = Math.max(0, maxNum)
      if (constraints.minLength !== undefined && constraints.maxLength !== undefined && constraints.minLength > constraints.maxLength) {
        constraints.maxLength = constraints.minLength
      }
      if (pattern) constraints.pattern = pattern
      if (Object.keys(constraints).length > 0) configUpdate.constraints = constraints
      else configUpdate.constraints = undefined
    } else if (fieldType === 'number' || fieldType === 'integer') {
      const constraints: NonNullable<FieldConfig['constraints']> = {}
      if (minNum !== undefined) constraints.minimum = minNum
      if (maxNum !== undefined) constraints.maximum = maxNum
      if (constraints.minimum !== undefined && constraints.maximum !== undefined && constraints.minimum > constraints.maximum) {
        constraints.maximum = constraints.minimum
      }
      if (Object.keys(constraints).length > 0) configUpdate.constraints = constraints
      else configUpdate.constraints = undefined
    } else if (fieldType === 'array') {
      const constraints: NonNullable<FieldConfig['constraints']> = {}
      if (minItemsNum !== undefined) constraints.minItems = Math.max(0, minItemsNum)
      if (maxItemsNum !== undefined) constraints.maxItems = Math.max(0, maxItemsNum)
      if (constraints.minItems !== undefined && constraints.maxItems !== undefined && constraints.minItems > constraints.maxItems) {
        constraints.maxItems = constraints.minItems
      }
      if (Object.keys(constraints).length > 0) configUpdate.constraints = constraints
      else configUpdate.constraints = undefined
    }

    const np = nullProb !== '' ? Math.max(0, Math.min(100, Number(nullProb))) : undefined
    configUpdate.nullProbability = np

    updateFieldConfig(fieldId, configUpdate)

    if (isCustom && boundDsId) {
      bindField(fieldId, boundDsId, samplingStr)
    } else {
      unbindField(fieldId)
    }

    showToast(t('fieldConfig.saved'))
    onClose()
  }

  const currentStrategies = getStrategiesForType(fieldType)
  const hasStrategy = currentStrategies.length > 0
  const currentStrategyInfo = getStrategyById(strategy)
  const isCustom = currentStrategyInfo?.isCustom ?? false
  const showConstraints = hasStrategy && !isCustom && (fieldType === 'string' || fieldType === 'number' || fieldType === 'integer')
  const showArrayConstraints = fieldType === 'array'

  const isStringType = fieldType === 'string'

  const displayName = field ? field.name : (fieldId ?? '')

  return (
    <Modal
      open={open}
      title={t('fieldConfig.title')}
      subtitle={displayName}
      onClose={onClose}
      footer={
        <>
          <button className="btn-sm" onClick={onClose}>{t('common.cancel')}</button>
          <button className="btn-sm primary" onClick={handleSave}>{t('common.save')}</button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">{t('fieldConfig.fieldName')}</label>
          <input
            type="text"
            className="form-input mono"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">{t('fieldConfig.fieldType')}</label>
          <Select
            value={fieldType}
            onChange={(val) => {
              const t = val as FieldType
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
            options={FIELD_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <div className="form-group full-width">
          <div className="toggle-row">
            <span className="toggle-label">{t('fieldConfig.required')}</span>
            <button
              className={`toggle ${required ? 'active' : ''}`}
              aria-label={t('fieldConfig.toggleRequired')}
              onClick={() => setRequired(!required)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('fieldConfig.nullProb')}</label>
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
            <label className="form-label">{t('fieldConfig.strategy')}</label>
            <Select
              value={strategy}
              onChange={handleStrategyChange}
              options={currentStrategies.map((s) => ({ value: s.id, label: t(s.label) }))}
            />
          </div>
        )}

        {showConstraints && (
          <div className="form-group full-width">
            <label className="form-label">{isStringType ? t('fieldConfig.lengthRange') : t('fieldConfig.valueRange')}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                className="form-input"
                min={isStringType ? 0 : undefined}
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder={t('fieldConfig.min')}
                style={{ flex: 1 }}
              />
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>-</span>
              <input
                type="number"
                className="form-input"
                min={isStringType ? 0 : undefined}
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder={t('fieldConfig.max')}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        )}

        {showArrayConstraints && (
          <div className="form-group full-width">
            <label className="form-label">{t('fieldConfig.itemRange')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                className="form-input"
                min={0}
                value={minItems}
                onChange={(e) => setMinItems(e.target.value)}
                placeholder={t('fieldConfig.minItems')}
                style={{ flex: 1 }}
              />
              <span style={{ lineHeight: '36px', color: 'var(--muted)', fontSize: 12 }}>-</span>
              <input
                type="number"
                className="form-input"
                min={0}
                value={maxItems}
                onChange={(e) => setMaxItems(e.target.value)}
                placeholder={t('fieldConfig.maxItems')}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        )}

        {hasStrategy && isCustom && (
          <div className="form-group full-width">
            <label className="form-label">{t('fieldConfig.regex')}</label>
            <input
              type="text"
              className="form-input mono"
              placeholder="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
          </div>
        )}

        {isCustom && (
          <>
            <div className="form-group full-width">
              <label className="form-label">{t('fieldConfig.dataSource')}</label>
              <Select
                value={boundDsId}
                onChange={(val) => setBoundDsId(val)}
                disabled={dataSources.length === 0}
                placeholder={t('fieldConfig.noBinding')}
                options={[
                  { value: '', label: t('fieldConfig.noBinding') },
                  ...dataSources.map((ds) => ({ value: ds.id, label: `${ds.name} (${ds.data.length}条)` }))
                ]}
              />
              {dataSources.length === 0 && (
                <div className="form-hint" style={{ marginTop: 6 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  {t('fieldConfig.noDataSourceHint')}
                </div>
              )}
            </div>
            {boundDsId && (
              <div className="form-group">
                <label className="form-label">{t('fieldConfig.samplingStrategy')}</label>
                <Select
                  value={samplingStr}
                  onChange={(val) => setSamplingStr(val as 'random' | 'sequential')}
                  options={[
                    { value: 'random', label: t('fieldConfig.random') },
                    { value: 'sequential', label: t('fieldConfig.sequential') }
                  ]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}