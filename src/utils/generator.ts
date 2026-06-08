import { faker } from '@faker-js/faker'
import type { SchemaField, FieldConfig, GenerationConfig, DataSource, Binding } from '../types'
import { MAX_GENERATE_COUNT } from '../types'
import { getStrategyById } from '../constants/strategies'

const OMIT_OPTIONAL_RATE = 0.3

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

function applyStringConstraints(value: string, min: number | undefined, max: number | undefined): string {
  if (max !== undefined && value.length > max) {
    return value.slice(0, max)
  }
  if (min !== undefined && value.length < min) {
    return value.padEnd(min, value[value.length - 1] ?? 'x')
  }
  return value
}

function applyNumberConstraints(value: number, min: number | undefined, max: number | undefined): number {
  if (min !== undefined && value < min) return min
  if (max !== undefined && value > max) return max
  return value
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
  bindings: Record<string, Binding>,
): unknown {
  // Check if field is bound to a data source
  const binding = bindings[field.id]
  if (binding) {
    const ds = dataSources.find((d) => d.id === binding.dataSourceId)
    if (ds && ds.data.length > 0) {
      if (binding.strategy === 'random') {
        return ds.data[Math.floor(Math.random() * ds.data.length)]
      }
      // sequential: cycles through items per generation session
      const index = sequentialCounter.get(binding.dataSourceId) ?? 0
      sequentialCounter.set(binding.dataSourceId, (index + 1) % ds.data.length)
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
  bindings: Record<string, Binding>,
): unknown {
  const strategyId = config?.fakerType
  const strategy = strategyId ? getStrategyById(strategyId) : undefined

  // Strategy with fakerPath — must be compatible with field type
  if (strategy && !strategy.isCustom && strategy.fakerPath && strategy.fieldTypes.includes(field.type)) {
    const constraints = mergeConstraints(strategy.presetConstraints, config?.constraints)

    // Check for constrained faker variant (number strategies only)
    const numMin = constraints?.minimum
    const numMax = constraints?.maximum
    if (numMin !== undefined && numMax !== undefined && FAKER_CALL_CONSTRAINED[strategy.fakerPath]) {
      return FAKER_CALL_CONSTRAINED[strategy.fakerPath](numMin, numMax)
    }

    const fn = FAKER_CALL_MAP[strategy.fakerPath]
    if (fn) {
      const value = fn()
      // Apply constraints post-hoc
      if (typeof value === 'string') {
        const strMin = constraints?.minLength
        const strMax = constraints?.maxLength
        if (strMin !== undefined || strMax !== undefined) {
          return applyStringConstraints(value, strMin, strMax)
        }
      }
      if (typeof value === 'number') {
        return applyNumberConstraints(value, numMin, numMax)
      }
      return value
    }
  }

  // Custom strategy with regex pattern — must be compatible
  if (strategy?.isCustom && strategy.fieldTypes.includes(field.type) && config?.constraints?.pattern) {
    let pattern = config.constraints.pattern
    if (pattern.startsWith('^')) pattern = pattern.slice(1)
    if (pattern.endsWith('$')) pattern = pattern.slice(0, -1)
    if (pattern.length > 0) return faker.helpers.fromRegExp(pattern)
  }

  // Fallback by field type
  switch (field.type) {
    case 'string': {
      const min = config?.constraints?.minLength != null ? Math.max(0, config.constraints.minLength) : undefined
      const max = config?.constraints?.maxLength != null ? Math.max(0, config.constraints.maxLength) : undefined
      if (min !== undefined || max !== undefined) {
        return faker.string.alphanumeric({ length: { min: min ?? 1, max: max ?? Math.max(32, min ?? 0) } })
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
    case 'boolean': {
      const boolStrategy = config?.fakerType || 'random'
      switch (boolStrategy) {
        case 'alwaysTrue': return true
        case 'alwaysFalse': return false
        case 'mostlyTrue': return Math.random() < 0.8
        case 'mostlyFalse': return Math.random() < 0.2
        default: return faker.datatype.boolean()
      }
    }
    case 'object':
      return generateObject(field, fieldConfigs, dataSources, bindings)
    case 'array':
      return generateArray(field, fieldConfigs, dataSources, bindings)
    default:
      return null
  }
}

function generateObject(field: SchemaField, fieldConfigs: Record<string, FieldConfig>, dataSources: DataSource[], bindings: Record<string, Binding>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (field.children) {
    for (const child of field.children) {
      if (!child.required && Math.random() < OMIT_OPTIONAL_RATE) continue
      result[child.name] = generateFieldValue(child, fieldConfigs[child.id], fieldConfigs, dataSources, bindings)
    }
  }
  return result
}

function generateArray(field: SchemaField, fieldConfigs: Record<string, FieldConfig>, dataSources: DataSource[], bindings: Record<string, Binding>): unknown[] {
  const items = field.items
  if (!items) return []

  const config = fieldConfigs[field.id]
  const minItems = Math.max(0, config?.constraints?.minItems ?? 1)
  const maxItems = Math.max(minItems, config?.constraints?.maxItems ?? 5)
  const length = minItems >= maxItems ? minItems : faker.number.int({ min: minItems, max: maxItems })
  return Array.from({ length }, () => generateFieldValue(items, fieldConfigs[items.id], fieldConfigs, dataSources, bindings))
}

export function generateData(
  schema: SchemaField,
  fieldConfigs: Record<string, FieldConfig>,
  config: GenerationConfig,
  dataSources: DataSource[] = [],
  bindings: Record<string, Binding> = {},
): unknown {
  if (config.seed) {
    faker.seed(Number(config.seed))
  } else {
    faker.seed()
  }

  sequentialCounter.clear()

  const count = Math.max(1, Math.min(config.count || 1, MAX_GENERATE_COUNT))

  if (count === 1) {
    return generateFromRoot(schema, fieldConfigs, dataSources, bindings)
  }

  return Array.from({ length: count }, () => generateFromRoot(schema, fieldConfigs, dataSources, bindings))
}

function generateFromRoot(schema: SchemaField, fieldConfigs: Record<string, FieldConfig>, dataSources: DataSource[], bindings: Record<string, Binding>): unknown {
  if (schema.type === 'object') {
    const result: Record<string, unknown> = {}
    if (schema.children) {
      for (const child of schema.children) {
        if (!child.required && Math.random() < OMIT_OPTIONAL_RATE) continue
        result[child.name] = generateFieldValue(child, fieldConfigs[child.id], fieldConfigs, dataSources, bindings)
      }
    }
    return result
  }
  return generateFieldValue(schema, fieldConfigs[schema.id], fieldConfigs, dataSources, bindings)
}