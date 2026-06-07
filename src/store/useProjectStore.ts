import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SchemaField, FieldConfig, GenerationConfig, FieldType, DataSource, Binding } from '../types'
import { MAX_GENERATE_COUNT } from '../types'
import { demoSchema, demoFieldConfigs, demoGenerationConfig } from '../constants/demoSchema'
import { generateData } from '../utils/generator'
import { jsonSchemaToSchemaField } from '../utils/schemaConverter'

type Theme = 'light' | 'dark'

/* ─── Tree helpers ─── */

function findNode(root: SchemaField, id: string): SchemaField | null {
  if (root.id === id) return root
  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, id)
      if (found) return found
    }
  }
  if (root.items) {
    const found = findNode(root.items, id)
    if (found) return found
  }
  return null
}

function findParent(root: SchemaField, id: string): SchemaField | null {
  if (!root.children && !root.items) return null
  if (root.children) {
    for (const child of root.children) {
      if (child.id === id) return root
    }
  }
  if (root.items && root.items.id === id) return root
  if (root.children) {
    for (const child of root.children) {
      const found = findParent(child, id)
      if (found) return found
    }
  }
  if (root.items) {
    const found = findParent(root.items, id)
    if (found) return found
  }
  return null
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function generateId(parentId: string): string {
  const base = `${parentId}.field_${Date.now()}`
  return base
}

/* ─── Store ─── */

interface ProjectState {
  theme: Theme
  schema: SchemaField
  fieldConfigs: Record<string, FieldConfig>
  selectedFieldId: string | null
  generationConfig: GenerationConfig
  generatedData: unknown
  dataSources: DataSource[]
  bindings: Record<string, Binding>
  toastMessage: string | null

  toggleTheme: () => void

  selectField: (id: string | null) => void
  toggleFieldCollapsed: (id: string) => void
  addField: (parentId: string, type?: FieldType) => void
  removeField: (id: string) => void
  updateField: (id: string, updates: Partial<Pick<SchemaField, 'name' | 'type' | 'required' | 'description'>>) => void
  updateFieldConfig: (id: string, config: Partial<FieldConfig>) => void
  updateGenerationConfig: (config: Partial<GenerationConfig>) => void
  generate: () => void
  clearSchema: () => void
  loadSchema: (schema: SchemaField, configs: Record<string, FieldConfig>) => void
  importJsonSchema: (json: string) => boolean
  addDataSource: (ds: DataSource) => void
  removeDataSource: (id: string) => void
  bindField: (fieldId: string, dataSourceId: string, strategy: 'random' | 'sequential') => void
  unbindField: (fieldId: string) => void
  showToast: (message: string) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      theme: 'light',
      schema: clone(demoSchema),
      fieldConfigs: clone(demoFieldConfigs),
      selectedFieldId: null,
      generationConfig: clone(demoGenerationConfig),
      generatedData: null,
      dataSources: [],
      bindings: {},
      toastMessage: null,

  selectField: (id) => {
    set({ selectedFieldId: id })
  },

  toggleFieldCollapsed: (id) => {
    set((state) => {
      const schema = clone(state.schema)
      const node = findNode(schema, id)
      if (node) {
        node.collapsed = !node.collapsed
      }
      return { schema }
    })
  },

  addField: (parentId, type = 'string') => {
    set((state) => {
      const schema = clone(state.schema)
      const parent = findNode(schema, parentId)
      if (!parent) return {}

      const newField: SchemaField = {
        id: generateId(parentId),
        name: 'newField',
        type,
        required: false,
      }

      if (parent.type === 'array') {
        parent.items = newField
      } else {
        if (!parent.children) parent.children = []
        parent.children.push(newField)
      }

      parent.collapsed = false

      return { schema }
    })
  },

  removeField: (id) => {
    set((state) => {
      const schema = clone(state.schema)
      const parent = findParent(schema, id)
      if (!parent) return {}

      if (parent.type === 'array' && parent.items?.id === id) {
        parent.items = undefined
      } else if (parent.children) {
        parent.children = parent.children.filter((c) => c.id !== id)
      }

      const newConfigs = { ...state.fieldConfigs }
      delete newConfigs[id]

      return {
        schema,
        fieldConfigs: newConfigs,
        selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      }
    })
  },

  updateField: (id, updates) => {
    set((state) => {
      const schema = clone(state.schema)
      const node = findNode(schema, id)
      if (!node) return {}
      Object.assign(node, updates)
      return { schema }
    })
  },

  updateFieldConfig: (id, config) => {
    set((state) => {
      const newConfigs = { ...state.fieldConfigs }
      newConfigs[id] = { ...newConfigs[id], ...config }
      return { fieldConfigs: newConfigs }
    })
  },

  updateGenerationConfig: (config) => {
    set((state) => ({
      generationConfig: {
        ...state.generationConfig,
        ...config,
        ...(config.count !== undefined ? { count: Math.min(MAX_GENERATE_COUNT, Math.max(1, config.count)) } : {}),
      },
    }))
  },

  generate: () => {
    set((state) => {
      const data = generateData(state.schema, state.fieldConfigs, state.generationConfig, state.dataSources, state.bindings)
      return { generatedData: data }
    })
  },

  clearSchema: () => {
    set({
      schema: { id: 'root', name: 'root', type: 'object', required: false, children: [], collapsed: false },
      fieldConfigs: {},
      selectedFieldId: null,
      generatedData: null,
    })
  },

  loadSchema: (schema, configs) => {
    set({
      schema,
      fieldConfigs: configs,
      selectedFieldId: null,
      generatedData: null,
    })
  },

  importJsonSchema: (json) => {
    try {
      const parsed = JSON.parse(json)
      const result = jsonSchemaToSchemaField(parsed)
      if (!result) return false
      const { schema, fieldConfigs } = result
      set({
        schema,
        fieldConfigs,
        selectedFieldId: null,
        generatedData: null,
      })
      return true
    } catch {
      return false
    }
  },

  addDataSource: (ds) => {
    set((state) => {
      const existing = state.dataSources.findIndex((d) => d.name === ds.name)
      if (existing >= 0) {
        const updated = [...state.dataSources]
        updated[existing] = ds
        return {
          dataSources: updated,
          bindings: Object.fromEntries(
            Object.entries(state.bindings).filter(([, b]) => b.dataSourceId !== state.dataSources[existing].id),
          ),
        }
      }
      return { dataSources: [...state.dataSources, ds] }
    })
  },

  removeDataSource: (id) => {
    set((state) => ({
      dataSources: state.dataSources.filter((d) => d.id !== id),
      bindings: Object.fromEntries(
        Object.entries(state.bindings).filter(([, b]) => b.dataSourceId !== id),
      ),
    }))
  },

  bindField: (fieldId, dataSourceId, strategy) => {
    set((state) => ({
      bindings: { ...state.bindings, [fieldId]: { dataSourceId, strategy } },
    }))
  },

  unbindField: (fieldId) => {
    set((state) => {
      const bindings = { ...state.bindings }
      delete bindings[fieldId]
      return { bindings }
    })
  },

  showToast: (message) => {
    set({ toastMessage: message })
    setTimeout(() => {
      set({ toastMessage: null })
    }, 2000)
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
  },
}),
{
  name: 'json-mock-project',
  partialize: (state) => ({
      theme: state.theme,
      schema: state.schema,
      fieldConfigs: state.fieldConfigs,
      generationConfig: state.generationConfig,
      dataSources: state.dataSources,
      bindings: state.bindings,
    }),
  onRehydrateStorage: () => (state) => {
      if (state && state.generationConfig.count > MAX_GENERATE_COUNT) {
        state.generationConfig.count = MAX_GENERATE_COUNT
      }
    },
  },
  ),
)
