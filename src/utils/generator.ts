import { faker } from '@faker-js/faker'
import type { SchemaField, FieldConfig, GenerationConfig, DataSource } from '../types'
import { getStrategyById } from '../constants/strategies'

type FakerFn = () => string | number | boolean

const FAKER_CALL_MAP: Record<string, FakerFn> = {
  'internet.email': () => faker.internet.email(),
  'person.fullName': () => faker.person.fullName(),
  'phone.number': () => faker.phone.number(),
  'internet.url': () => faker.internet.url(),
  'string.uuid': () => faker.string.uuid(),
  'date.recent': () => faker.date.recent().toISOString(),
  'date.past': () => faker.date.past().toISOString(),
  'internet.ip': () => faker.internet.ip(),
  'lorem.sentence': () => faker.lorem.sentence(),
  'lorem.paragraph': () => faker.lorem.paragraph(),
  'location.streetAddress': () => faker.location.streetAddress(),
  'location.city': () => faker.location.city(),
  'location.zipCode': () => faker.location.zipCode(),
  'number.int': () => faker.number.int(),
  'number.float': () => faker.number.float(),
  'commerce.price': () => Number(faker.commerce.price()),
  'datatype.boolean': () => faker.datatype.boolean(),
  'person.jobType': () => faker.person.jobType(),
}

type ConstrainedFn = (min: number, max: number) => number

const FAKER_CALL_CONSTRAINED: Record<string, ConstrainedFn> = {
  'number.int': (min, max) => faker.number.int({ min, max }),
  'number.float': (min, max) => faker.number.float({ min, max, fractionDigits: 2 }),
  'commerce.price': (min, max) => Number(faker.commerce.price({ min, max })),
}

function mergeConstraints(
  preset: Partial<NonNullable<FieldConfig['constraints']>> | undefined,
  user: Partial<NonNullable<FieldConfig['constraints']>> | undefined,
): NonNullable<FieldConfig['constraints']> | undefined {
  if (!preset && !user) return undefined
  return { ...preset, ...user }
}

function generateFieldValue(
  field: SchemaField,
  config: FieldConfig | undefined,
  fieldConfigs: Record<string, FieldConfig>,
  dataSources: DataSource[],
  bindings: Record<string, string>,
): unknown {
  // Check if field is bound to a data source
  const binding = bindings[field.id]
  if (binding) {
    const [dsId, strategy] = binding.split(':')
    const ds = dataSources.find((d) => d.id === dsId)
    if (ds && ds.data.length > 0) {
      if (strategy === 'random') {
        return ds.data[Math.floor(Math.random() * ds.data.length)]
      }
      // sequential: this is approximate — cycles through items per generation session
      const index = sequentialCounter.get(dsId) ?? 0
      sequentialCounter.set(dsId, (index + 1) % ds.data.length)
      return ds.data[index]
    }
  }

  const value = computeFieldValue(field, config, fieldConfigs, dataSources, bindings)
  const nullProb = config?.nullProbability
  if (nullProb && nullProb > 0 && Math.random() * 100 < nullProb) {
    return null
  }
  return value
}

const sequentialCounter = new Map<string, number>()

function computeFieldValue(
  field: SchemaField,
  config: FieldConfig | undefined,
  fieldConfigs: Record<string, FieldConfig>,
  dataSources: DataSource[],
  bindings: Record<string, string>,
): unknown {
  const strategyId = config?.fakerType
  const strategy = strategyId ? getStrategyById(strategyId) : undefined

  // Strategy with fakerPath — must be compatible with field type
  if (strategy && !strategy.isCustom && strategy.fakerPath && strategy.fieldTypes.includes(field.type)) {
    const constraints = mergeConstraints(strategy.presetConstraints, config?.constraints)
    const min = constraints?.minimum ?? constraints?.minLength
    const max = constraints?.maximum ?? constraints?.maxLength

    if (min !== undefined && max !== undefined && FAKER_CALL_CONSTRAINED[strategy.fakerPath]) {
      return FAKER_CALL_CONSTRAINED[strategy.fakerPath](min, max)
    }

    const fn = FAKER_CALL_MAP[strategy.fakerPath]
    if (fn) return fn()
  }

  // Custom strategy with regex pattern — must be compatible
  if (strategy?.isCustom && strategy.fieldTypes.includes(field.type) && config?.constraints?.pattern) {
    return faker.helpers.fromRegExp(config.constraints.pattern)
  }

  // Fallback by field type
  switch (field.type) {
    case 'string': {
      const min = config?.constraints?.minLength
      const max = config?.constraints?.maxLength
      if (min || max) {
        return faker.string.alphanumeric({ length: { min: min ?? 1, max: max ?? 32 } })
      }
      return faker.word.sample()
    }
    case 'number': {
      const min = config?.constraints?.minimum
      const max = config?.constraints?.maximum
      return faker.number.float({ min: min ?? 0, max: max ?? 1000, fractionDigits: 2 })
    }
    case 'integer': {
      const min = config?.constraints?.minimum
      const max = config?.constraints?.maximum
      return faker.number.int({ min: min ?? 0, max: max ?? 100 })
    }
    case 'boolean':
      return faker.datatype.boolean()
    case 'object':
      return generateObject(field, fieldConfigs, dataSources, bindings)
    case 'array':
      return generateArray(field, fieldConfigs, dataSources, bindings)
    default:
      return null
  }
}

function generateObject(field: SchemaField, fieldConfigs: Record<string, FieldConfig>, dataSources: DataSource[], bindings: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (field.children) {
    for (const child of field.children) {
      result[child.name] = generateFieldValue(child, fieldConfigs[child.id], fieldConfigs, dataSources, bindings)
    }
  }
  return result
}

function generateArray(field: SchemaField, fieldConfigs: Record<string, FieldConfig>, dataSources: DataSource[], bindings: Record<string, string>): unknown[] {
  const items = field.items
  if (!items) return []

  const length = faker.number.int({ min: 1, max: 5 })
  return Array.from({ length }, () => generateFieldValue(items, fieldConfigs[items.id], fieldConfigs, dataSources, bindings))
}

export function generateData(
  schema: SchemaField,
  fieldConfigs: Record<string, FieldConfig>,
  config: GenerationConfig,
  dataSources: DataSource[] = [],
  bindings: Record<string, string> = {},
): unknown {
  if (config.seed) {
    faker.seed(Number(config.seed))
  } else {
    faker.seed()
  }

  const count = config.count || 1

  if (count === 1) {
    return generateFromRoot(schema, fieldConfigs, dataSources, bindings)
  }

  return Array.from({ length: count }, () => generateFromRoot(schema, fieldConfigs, dataSources, bindings))
}

function generateFromRoot(schema: SchemaField, fieldConfigs: Record<string, FieldConfig>, dataSources: DataSource[], bindings: Record<string, string>): unknown {
  if (schema.type === 'object') {
    const result: Record<string, unknown> = {}
    if (schema.children) {
      for (const child of schema.children) {
        result[child.name] = generateFieldValue(child, fieldConfigs[child.id], fieldConfigs, dataSources, bindings)
      }
    }
    return result
  }
  return generateFieldValue(schema, fieldConfigs[schema.id], fieldConfigs, dataSources, bindings)
}