export type FieldType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null'

export const MAX_GENERATE_COUNT = 1000

export interface SchemaField {
  id: string
  name: string
  type: FieldType
  required: boolean
  description?: string
  children?: SchemaField[]
  items?: SchemaField
  collapsed?: boolean
}

export interface FieldConfig {
  fakerType?: string
  customExpression?: string
  nullProbability?: number
  format?: string
  constraints?: {
    minLength?: number
    maxLength?: number
    minimum?: number
    maximum?: number
    minItems?: number
    maxItems?: number
    pattern?: string
    enum?: unknown[]
  }
}

export interface DataSource {
  id: string
  name: string
  type: 'json' | 'csv' | 'xlsx' | 'text'
  data: unknown[]
  columns?: string[]
  createdAt: string
}

export interface Binding {
  dataSourceId: string
  strategy: 'random' | 'sequential'
}

export interface GenerationConfig {
  count: number
  seed: string
}

export interface Project {
  id: string
  name: string
  schema: SchemaField
  fieldConfigs: Record<string, FieldConfig>
  dataSources: DataSource[]
  bindings: Record<string, Binding>
  generationConfig: GenerationConfig
  createdAt: string
  updatedAt: string
}
