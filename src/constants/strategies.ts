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
  { id: 'email',       fakerPath: 'internet.email',      label: 'strategies.email',      fieldTypes: ['string'] },
  { id: 'name',        fakerPath: 'person.fullName',      label: 'strategies.name',       fieldTypes: ['string'] },
  { id: 'phone',       fakerPath: 'phone.number',         label: 'strategies.phone',      fieldTypes: ['string'] },
  { id: 'uri',         fakerPath: 'internet.url',         label: 'strategies.uri',        fieldTypes: ['string'] },
  { id: 'uuid',        fakerPath: 'string.uuid',          label: 'strategies.uuid',       fieldTypes: ['string'] },
  { id: 'datetime',    fakerPath: 'date.recent',          label: 'strategies.datetime',   fieldTypes: ['string'] },
  { id: 'pastDatetime', fakerPath: 'date.past',          label: 'strategies.pastDatetime', fieldTypes: ['string'] },
  { id: 'ip',          fakerPath: 'internet.ip',          label: 'strategies.ip',         fieldTypes: ['string'] },
  { id: 'sentence',    fakerPath: 'lorem.sentence',       label: 'strategies.sentence',   fieldTypes: ['string'] },
  { id: 'paragraph',   fakerPath: 'lorem.paragraph',      label: 'strategies.paragraph',  fieldTypes: ['string'] },
  { id: 'street',      fakerPath: 'location.streetAddress', label: 'strategies.street',   fieldTypes: ['string'] },
  { id: 'city',        fakerPath: 'location.city',         label: 'strategies.city',      fieldTypes: ['string'] },
  { id: 'zipcode',     fakerPath: 'location.zipCode',     label: 'strategies.zipcode',    fieldTypes: ['string'] },
  { id: 'jobType',     fakerPath: 'person.jobType',       label: 'strategies.jobType',    fieldTypes: ['string'] },

  // number
  { id: 'integer',     fakerPath: 'number.int',           label: 'strategies.integer',    fieldTypes: ['number', 'integer'] },
  { id: 'float',       fakerPath: 'number.float',         label: 'strategies.float',      fieldTypes: ['number'] },
  { id: 'price',       fakerPath: 'commerce.price',        label: 'strategies.price',     fieldTypes: ['number'] },

  // integer-only
  { id: 'age',         fakerPath: 'number.int',           label: 'strategies.age',        fieldTypes: ['integer'], presetConstraints: { minimum: 18, maximum: 65 } },
  { id: 'year',        fakerPath: 'number.int',           label: 'strategies.year',       fieldTypes: ['integer'], presetConstraints: { minimum: 1970, maximum: 2030 } },
  { id: 'quantity',    fakerPath: 'number.int',           label: 'strategies.quantity',   fieldTypes: ['integer'], presetConstraints: { minimum: 1, maximum: 100 } },

  // boolean
  { id: 'random',      fakerPath: 'datatype.boolean',     label: 'strategies.random',     fieldTypes: ['boolean'] },
  { id: 'alwaysTrue',  fakerPath: 'datatype.boolean',     label: 'strategies.alwaysTrue', fieldTypes: ['boolean'] },
  { id: 'alwaysFalse', fakerPath: 'datatype.boolean',     label: 'strategies.alwaysFalse', fieldTypes: ['boolean'] },
  { id: 'mostlyTrue',  fakerPath: 'datatype.boolean',     label: 'strategies.mostlyTrue', fieldTypes: ['boolean'] },
  { id: 'mostlyFalse', fakerPath: 'datatype.boolean',     label: 'strategies.mostlyFalse', fieldTypes: ['boolean'] },

  // custom
  { id: 'custom',      fakerPath: '',                     label: 'strategies.custom',     fieldTypes: ['string', 'number', 'integer'], isCustom: true },
]

const REGISTRY_MAP = new Map(STRATEGY_REGISTRY.map((s) => [s.id, s]))

export function getStrategyById(id: string): StrategyInfo | undefined {
  return REGISTRY_MAP.get(id)
}

export function getStrategiesForType(type: FieldType): StrategyInfo[] {
  return STRATEGY_REGISTRY.filter((s) => s.fieldTypes.includes(type))
}