import type { FieldType, FieldConfig } from '../types'

export interface StrategyInfo {
  id: string
  fakerPath: string
  label: string
  fieldTypes: FieldType[]
  presetConstraints?: Partial<NonNullable<FieldConfig['constraints']>>
  isCustom?: boolean
}

export const STRATEGY_REGISTRY: StrategyInfo[] = [
  // string
  { id: 'email',       fakerPath: 'internet.email',      label: '邮箱',      fieldTypes: ['string'] },
  { id: 'name',        fakerPath: 'person.fullName',      label: '姓名',      fieldTypes: ['string'] },
  { id: 'phone',       fakerPath: 'phone.number',         label: '电话',      fieldTypes: ['string'] },
  { id: 'uri',         fakerPath: 'internet.url',         label: '链接',      fieldTypes: ['string'] },
  { id: 'uuid',        fakerPath: 'string.uuid',          label: 'UUID',      fieldTypes: ['string'] },
  { id: 'datetime',    fakerPath: 'date.recent',          label: '日期时间',   fieldTypes: ['string'] },
  { id: 'pastDatetime', fakerPath: 'date.past',          label: '过去日期',   fieldTypes: ['string'] },
  { id: 'ip',          fakerPath: 'internet.ip',          label: 'IP 地址',   fieldTypes: ['string'] },
  { id: 'sentence',    fakerPath: 'lorem.sentence',       label: '句子',      fieldTypes: ['string'] },
  { id: 'paragraph',   fakerPath: 'lorem.paragraph',      label: '段落',      fieldTypes: ['string'] },
  { id: 'street',      fakerPath: 'location.streetAddress', label: '街道',    fieldTypes: ['string'] },
  { id: 'city',        fakerPath: 'location.city',         label: '城市',     fieldTypes: ['string'] },
  { id: 'zipcode',     fakerPath: 'location.zipCode',     label: '邮编',     fieldTypes: ['string'] },
  { id: 'jobType',     fakerPath: 'person.jobType',       label: '职位',      fieldTypes: ['string'] },

  // number
  { id: 'integer',     fakerPath: 'number.int',           label: '整数',      fieldTypes: ['number', 'integer'] },
  { id: 'float',       fakerPath: 'number.float',         label: '浮点数',    fieldTypes: ['number'] },
  { id: 'price',       fakerPath: 'commerce.price',        label: '价格',      fieldTypes: ['number'] },

  // integer-only
  { id: 'age',         fakerPath: 'number.int',           label: '年龄',      fieldTypes: ['integer'], presetConstraints: { minimum: 18, maximum: 65 } },
  { id: 'year',        fakerPath: 'number.int',           label: '年份',      fieldTypes: ['integer'], presetConstraints: { minimum: 1970, maximum: 2030 } },
  { id: 'quantity',    fakerPath: 'number.int',           label: '数量',      fieldTypes: ['integer'], presetConstraints: { minimum: 1, maximum: 100 } },

  // boolean
  { id: 'random',      fakerPath: 'datatype.boolean',     label: '随机',      fieldTypes: ['boolean'] },
  { id: 'alwaysTrue',  fakerPath: 'datatype.boolean',     label: '总是 true',  fieldTypes: ['boolean'] },
  { id: 'alwaysFalse', fakerPath: 'datatype.boolean',     label: '总是 false', fieldTypes: ['boolean'] },
  { id: 'mostlyTrue',  fakerPath: 'datatype.boolean',     label: '偏向 true',  fieldTypes: ['boolean'] },
  { id: 'mostlyFalse', fakerPath: 'datatype.boolean',     label: '偏向 false', fieldTypes: ['boolean'] },

  // custom
  { id: 'custom',      fakerPath: '',                     label: '自定义',    fieldTypes: ['string', 'number', 'integer'], isCustom: true },
]

const REGISTRY_MAP = new Map(STRATEGY_REGISTRY.map((s) => [s.id, s]))

export function getStrategyById(id: string): StrategyInfo | undefined {
  return REGISTRY_MAP.get(id)
}

export function getStrategiesForType(type: FieldType): StrategyInfo[] {
  return STRATEGY_REGISTRY.filter((s) => s.fieldTypes.includes(type))
}