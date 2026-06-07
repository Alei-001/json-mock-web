import type { SchemaField, FieldConfig } from '../types'

export interface PresetTemplate {
  id: string
  name: string
  description: string
  schema: SchemaField
  fieldConfigs: Record<string, FieldConfig>
}

const userTemplate: PresetTemplate = {
  id: 'user',
  name: 'templates.user',
  description: 'templates.userDesc',
  schema: {
    id: 'root',
    name: 'root',
    type: 'object',
    required: false,
    collapsed: false,
    children: [
      { id: 'root.name', name: 'name', type: 'string', required: true },
      { id: 'root.age', name: 'age', type: 'integer', required: false },
      { id: 'root.email', name: 'email', type: 'string', required: true },
      { id: 'root.phone', name: 'phone', type: 'string', required: false },
      {
        id: 'root.address', name: 'address', type: 'object', required: false, collapsed: true,
        children: [
          { id: 'root.address.street', name: 'street', type: 'string', required: false },
          { id: 'root.address.city', name: 'city', type: 'string', required: false },
          { id: 'root.address.zipCode', name: 'zipCode', type: 'string', required: false },
        ],
      },
      {
        id: 'root.tags', name: 'tags', type: 'array', required: false, collapsed: false,
        items: { id: 'root.tags[0]', name: 'item', type: 'string', required: false },
      },
      { id: 'root.isActive', name: 'isActive', type: 'boolean', required: false },
      { id: 'root.createdAt', name: 'createdAt', type: 'string', required: false },
    ],
  },
  fieldConfigs: {
    'root.name': { fakerType: 'name' },
    'root.age': { fakerType: 'age', constraints: { minimum: 18, maximum: 65 } },
    'root.email': { fakerType: 'email' },
    'root.phone': { fakerType: 'phone' },
    'root.address.street': { fakerType: 'street' },
    'root.address.city': { fakerType: 'city' },
    'root.address.zipCode': { fakerType: 'zipcode' },
    'root.tags[0]': { fakerType: 'jobType' },
    'root.isActive': { fakerType: 'random' },
    'root.createdAt': { fakerType: 'pastDatetime' },
  },
}

const orderTemplate: PresetTemplate = {
  id: 'order',
  name: 'templates.order',
  description: 'templates.orderDesc',
  schema: {
    id: 'root',
    name: 'root',
    type: 'object',
    required: false,
    collapsed: false,
    children: [
      { id: 'root.orderId', name: 'orderId', type: 'string', required: true },
      { id: 'root.customer', name: 'customer', type: 'string', required: true },
      {
        id: 'root.items', name: 'items', type: 'array', required: false, collapsed: false,
        items: {
          id: 'root.items[0]', name: 'item', type: 'object', required: false,
          children: [
            { id: 'root.items[0].product', name: 'product', type: 'string', required: true },
            { id: 'root.items[0].quantity', name: 'quantity', type: 'integer', required: true },
            { id: 'root.items[0].price', name: 'price', type: 'number', required: true },
          ],
        },
      },
      { id: 'root.total', name: 'total', type: 'number', required: true },
      { id: 'root.status', name: 'status', type: 'string', required: false },
      { id: 'root.createdAt', name: 'createdAt', type: 'string', required: false },
    ],
  },
  fieldConfigs: {
    'root.orderId': { fakerType: 'uuid' },
    'root.customer': { fakerType: 'name' },
    'root.items[0].product': { fakerType: 'sentence' },
    'root.items[0].quantity': { fakerType: 'quantity' },
    'root.items[0].price': { fakerType: 'price' },
    'root.total': { fakerType: 'price' },
    'root.createdAt': { fakerType: 'pastDatetime' },
  },
}

const productTemplate: PresetTemplate = {
  id: 'product',
  name: 'templates.product',
  description: 'templates.productDesc',
  schema: {
    id: 'root',
    name: 'root',
    type: 'object',
    required: false,
    collapsed: false,
    children: [
      { id: 'root.id', name: 'id', type: 'integer', required: true },
      { id: 'root.name', name: 'name', type: 'string', required: true },
      { id: 'root.price', name: 'price', type: 'number', required: true },
      { id: 'root.category', name: 'category', type: 'string', required: false },
      { id: 'root.description', name: 'description', type: 'string', required: false },
      { id: 'root.inStock', name: 'inStock', type: 'boolean', required: false },
      {
        id: 'root.tags', name: 'tags', type: 'array', required: false, collapsed: false,
        items: { id: 'root.tags[0]', name: 'item', type: 'string', required: false },
      },
      { id: 'root.rating', name: 'rating', type: 'number', required: false },
    ],
  },
  fieldConfigs: {
    'root.id': { fakerType: 'integer' },
    'root.name': { fakerType: 'sentence' },
    'root.price': { fakerType: 'price' },
    'root.description': { fakerType: 'paragraph' },
    'root.inStock': { fakerType: 'random' },
    'root.tags[0]': { fakerType: 'city' },
    'root.rating': { fakerType: 'float' },
  },
}

const articleTemplate: PresetTemplate = {
  id: 'article',
  name: 'templates.article',
  description: 'templates.articleDesc',
  schema: {
    id: 'root',
    name: 'root',
    type: 'object',
    required: false,
    collapsed: false,
    children: [
      { id: 'root.title', name: 'title', type: 'string', required: true },
      { id: 'root.author', name: 'author', type: 'string', required: true },
      { id: 'root.content', name: 'content', type: 'string', required: false },
      {
        id: 'root.tags', name: 'tags', type: 'array', required: false, collapsed: false,
        items: { id: 'root.tags[0]', name: 'item', type: 'string', required: false },
      },
      { id: 'root.publishedAt', name: 'publishedAt', type: 'string', required: false },
      { id: 'root.views', name: 'views', type: 'integer', required: false },
    ],
  },
  fieldConfigs: {
    'root.title': { fakerType: 'sentence' },
    'root.author': { fakerType: 'name' },
    'root.content': { fakerType: 'paragraph' },
    'root.tags[0]': { fakerType: 'jobType' },
    'root.publishedAt': { fakerType: 'pastDatetime' },
    'root.views': { fakerType: 'integer' },
  },
}

const employeeTemplate: PresetTemplate = {
  id: 'employee',
  name: 'templates.employee',
  description: 'templates.employeeDesc',
  schema: {
    id: 'root',
    name: 'root',
    type: 'object',
    required: false,
    collapsed: false,
    children: [
      { id: 'root.name', name: 'name', type: 'string', required: true },
      { id: 'root.department', name: 'department', type: 'string', required: false },
      { id: 'root.title', name: 'title', type: 'string', required: false },
      { id: 'root.salary', name: 'salary', type: 'number', required: false },
      { id: 'root.hireDate', name: 'hireDate', type: 'string', required: false },
      {
        id: 'root.skills', name: 'skills', type: 'array', required: false, collapsed: false,
        items: { id: 'root.skills[0]', name: 'item', type: 'string', required: false },
      },
      { id: 'root.email', name: 'email', type: 'string', required: true },
    ],
  },
  fieldConfigs: {
    'root.name': { fakerType: 'name' },
    'root.title': { fakerType: 'jobType' },
    'root.salary': { fakerType: 'float' },
    'root.hireDate': { fakerType: 'pastDatetime' },
    'root.skills[0]': { fakerType: 'city' },
    'root.email': { fakerType: 'email' },
  },
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  userTemplate,
  orderTemplate,
  productTemplate,
  articleTemplate,
  employeeTemplate,
]

export function getTemplateById(id: string): PresetTemplate | undefined {
  return PRESET_TEMPLATES.find((t) => t.id === id)
}