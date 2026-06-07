import type { SchemaField, FieldConfig, GenerationConfig } from '../types'

export const demoSchema: SchemaField = {
  id: 'root',
  name: 'root',
  type: 'object',
  required: false,
  collapsed: false,
  children: [
    {
      id: 'root.name',
      name: 'name',
      type: 'string',
      required: true,
    },
    {
      id: 'root.age',
      name: 'age',
      type: 'integer',
      required: true,
    },
    {
      id: 'root.email',
      name: 'email',
      type: 'string',
      required: true,
    },
    {
      id: 'root.address',
      name: 'address',
      type: 'object',
      required: false,
      collapsed: true,
      children: [
        {
          id: 'root.address.street',
          name: 'street',
          type: 'string',
          required: false,
        },
        {
          id: 'root.address.city',
          name: 'city',
          type: 'string',
          required: false,
        },
        {
          id: 'root.address.zipCode',
          name: 'zipCode',
          type: 'string',
          required: false,
        },
      ],
    },
    {
      id: 'root.tags',
      name: 'tags',
      type: 'array',
      required: false,
      collapsed: false,
      items: {
        id: 'root.tags[0]',
        name: '[0]',
        type: 'string',
        required: false,
      },
    },
    {
      id: 'root.isActive',
      name: 'isActive',
      type: 'boolean',
      required: false,
    },
    {
      id: 'root.createdAt',
      name: 'createdAt',
      type: 'string',
      required: false,
    },
  ],
}

export const demoFieldConfigs: Record<string, FieldConfig> = {
  'root.name': {
    fakerType: 'name',
  },
  'root.age': {
    fakerType: 'age',
    constraints: { minimum: 18, maximum: 65 },
  },
  'root.email': {
    fakerType: 'email',
  },
  'root.address.street': {
    fakerType: 'street',
  },
  'root.address.city': {
    fakerType: 'city',
  },
  'root.address.zipCode': {
    fakerType: 'zipcode',
  },
  'root.tags[0]': {
    fakerType: 'jobType',
  },
  'root.isActive': {
    fakerType: 'random',
  },
  'root.createdAt': {
    fakerType: 'pastDatetime',
  },
}

export const demoGenerationConfig: GenerationConfig = {
  count: 1,
  seed: '',
}