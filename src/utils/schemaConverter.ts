import type { SchemaField, FieldConfig } from '../types'

type JsonSchema = Record<string, unknown>

const JSON_SCHEMA_TYPES: Record<string, string> = {
  string: 'string',
  number: 'number',
  integer: 'integer',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
}

function buildId(parentId: string, name: string): string {
  return parentId === 'root' ? `root.${name}` : `${parentId}.${name}`
}

function fieldToJsonSchema(field: SchemaField, configs: Record<string, FieldConfig>): JsonSchema {
  const config = configs[field.id]
  const schema: JsonSchema = {}

  switch (field.type) {
    case 'string':
      schema.type = 'string'
      if (config?.constraints?.minLength != null) schema.minLength = config.constraints.minLength
      if (config?.constraints?.maxLength != null) schema.maxLength = config.constraints.maxLength
      if (config?.constraints?.pattern) schema.pattern = config.constraints.pattern
      if (config?.fakerType) schema['x-faker'] = config.fakerType
      break

    case 'number':
      schema.type = 'number'
      if (config?.constraints?.minimum != null) schema.minimum = config.constraints.minimum
      if (config?.constraints?.maximum != null) schema.maximum = config.constraints.maximum
      if (config?.fakerType) schema['x-faker'] = config.fakerType
      break

    case 'integer':
      schema.type = 'integer'
      if (config?.constraints?.minimum != null) schema.minimum = config.constraints.minimum
      if (config?.constraints?.maximum != null) schema.maximum = config.constraints.maximum
      if (config?.fakerType) schema['x-faker'] = config.fakerType
      break

    case 'boolean':
      schema.type = 'boolean'
      if (config?.fakerType) schema['x-faker'] = config.fakerType
      break

    case 'object': {
      schema.type = 'object'
      if (field.children && field.children.length > 0) {
        const properties: Record<string, JsonSchema> = {}
        const required: string[] = []
        for (const child of field.children) {
          properties[child.name] = fieldToJsonSchema(child, configs)
          if (child.required) required.push(child.name)
        }
        schema.properties = properties
        if (required.length > 0) schema.required = required
      }
      break
    }

    case 'array': {
      schema.type = 'array'
      if (field.items) {
        schema.items = fieldToJsonSchema(field.items, configs)
      }
      if (config?.constraints?.minItems != null) schema.minItems = config.constraints.minItems
      if (config?.constraints?.maxItems != null) schema.maxItems = config.constraints.maxItems
      if (config?.fakerType) schema['x-faker'] = config.fakerType
      break
    }
  }

  if (config?.nullProbability != null && config.nullProbability > 0) {
    schema['x-null-probability'] = config.nullProbability
  }

  if (field.description) {
    schema.description = field.description
  }

  return schema
}

function jsonSchemaToField(
  schema: JsonSchema,
  name: string,
  parentId: string,
): { field: SchemaField; fieldConfigs: Record<string, FieldConfig> } {
  const type = (schema.type as string) || 'string'
  const normalizedType = JSON_SCHEMA_TYPES[type] ?? 'string'

  const id = parentId === 'root' && name === 'root' ? 'root' : buildId(parentId, name)

  const field: SchemaField = {
    id,
    name,
    type: normalizedType as SchemaField['type'],
    required: false,
    description: schema.description as string | undefined,
    collapsed: false,
  }

  const config: FieldConfig = {}
  let fieldConfigs: Record<string, FieldConfig> = {}

  if (schema['x-faker']) {
    config.fakerType = schema['x-faker'] as string
  }

  if (schema['x-null-probability'] != null) {
    config.nullProbability = schema['x-null-probability'] as number
  }

  if (normalizedType === 'string') {
    if (schema.minLength != null) config.constraints = { ...config.constraints, minLength: schema.minLength as number }
    if (schema.maxLength != null) config.constraints = { ...config.constraints, maxLength: schema.maxLength as number }
    if (schema.pattern) config.constraints = { ...config.constraints, pattern: schema.pattern as string }
  }

  if (normalizedType === 'number' || normalizedType === 'integer') {
    if (schema.minimum != null) config.constraints = { ...config.constraints, minimum: schema.minimum as number }
    if (schema.maximum != null) config.constraints = { ...config.constraints, maximum: schema.maximum as number }
  }

  if (normalizedType === 'object') {
    const properties = schema.properties as Record<string, JsonSchema> | undefined
    const requiredList = (schema.required as string[]) || []

    if (properties) {
      field.children = []
      for (const [propName, propSchema] of Object.entries(properties)) {
        const childResult = jsonSchemaToField(propSchema, propName, id)
        childResult.field.required = requiredList.includes(propName)
        field.children.push(childResult.field)
        fieldConfigs = { ...fieldConfigs, ...childResult.fieldConfigs }
      }
    }
  }

  if (normalizedType === 'array' && schema.items) {
    const itemResult = jsonSchemaToField(schema.items as JsonSchema, 'item', id)
    field.items = itemResult.field
    fieldConfigs = { ...fieldConfigs, ...itemResult.fieldConfigs }

    if (schema.minItems != null || schema.maxItems != null) {
      const c: NonNullable<FieldConfig['constraints']> = {}
      if (schema.minItems != null) c.minItems = schema.minItems as number
      if (schema.maxItems != null) c.maxItems = schema.maxItems as number
      config.constraints = { ...config.constraints, ...c }
    }
  }

  if (Object.keys(config).length > 0) {
    fieldConfigs[id] = config
  }

  return { field, fieldConfigs }
}

export function schemaFieldToJsonSchema(
  root: SchemaField,
  configs: Record<string, FieldConfig>,
): JsonSchema {
  const result = fieldToJsonSchema(root, configs)
  result.$schema = 'http://json-schema.org/draft-07/schema#'
  return result
}

export function jsonSchemaToSchemaField(
  json: unknown,
): { schema: SchemaField; fieldConfigs: Record<string, FieldConfig> } | null {
  if (!json || typeof json !== 'object') return null

  const schema = json as JsonSchema

  let type = (schema.type as string) || 'object'
  if (!JSON_SCHEMA_TYPES[type]) type = 'object'

  const result = jsonSchemaToField(schema, 'root', '')
  return {
    schema: result.field,
    fieldConfigs: result.fieldConfigs,
  }
}

export function extractFieldConfigs(
  field: SchemaField,
  configs: Record<string, FieldConfig>,
): Record<string, FieldConfig> {
  const result: Record<string, FieldConfig> = {}
  if (configs[field.id] && Object.keys(configs[field.id]).length > 0) {
    result[field.id] = configs[field.id]
  }

  if (field.children) {
    for (const child of field.children) {
      const childConfigs = extractFieldConfigs(child, configs)
      Object.assign(result, childConfigs)
    }
  }

  if (field.items) {
    const itemConfigs = extractFieldConfigs(field.items, configs)
    Object.assign(result, itemConfigs)
  }

  return result
}