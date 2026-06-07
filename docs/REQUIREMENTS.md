# JSON Mock — 模拟 JSON 数据生成器

## 1. 项目概述

一个纯前端 SPA 应用，用户可通过可视化编辑或直接编写 JSON Schema 来生成模拟 JSON 数据，支持自定义数据源绑定、模板管理和项目持久化。

### 1.1 目标用户

- 前后端开发者：快速生成接口 Mock 数据
- 测试人员：构造测试数据集
- 产品/设计：生成示例数据用于原型展示

---

## 2. 技术栈

| 项 | 选型 |
|----|------|
| 框架 | React 18+ / TypeScript |
| 构建工具 | Vite |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 代码编辑器 | Monaco Editor (`@monaco-editor/react`) |
| Mock 生成 | `json-schema-faker` + `@faker-js/faker` |
| CSV 解析 | `papaparse` |
| Excel 解析 | `xlsx` |
| 图标 | `lucide-react` |
| 持久化 | localStorage / 文件导入导出 |
| 部署 | 静态部署（纯前端，无后端） |

---

## 3. 页面布局

```
┌───────────────────────────────────────────────────────┐
│  Header: Logo │ 主题切换 │ 项目导入 / 导出 / 保存      │
├───────────┬────────────────────┬──────────────────────┤
│  Sidebar  │    主编辑区         │     预览区            │
│           │ ┌────────────────┐ │ ┌──────────────────┐ │
│  模板库   │ │ [可视化] [文本] │ │ │ 生成数量: [10]   │ │
│  数据源   │ │                │ │ │ 种子值:  [       ]│ │
│  管理     │ │  字段树 / JSON  │ │ │ [重新生成]       │ │
│           │ │  Schema 编辑器  │ │ │                  │ │
│           │ │                │ │ │  JSON / 表格 预览 │ │
│           │ ├────────────────┤ │ │                  │ │
│           │ │  字段配置面板   │ │ ├──────────────────┤ │
│           │ │  (类型/faker/  │ │ │ [复制] [下载]    │ │
│           │ │   约束/数据源) │ │ │ [导出模板]       │ │
│           │ └────────────────┘ │ └──────────────────┘ │
└───────────┴────────────────────┴──────────────────────┘
```

- **Sidebar**（左侧）：模板库、数据源管理、项目切换
- **主编辑区**（中间）：可视化/文本双模式 Schema 编辑器 + 字段配置面板
- **预览区**（右侧）：生成控制栏 + JSON/表格预览 + 导出操作栏

---

## 4. 功能需求

### 4.1 Schema 编辑（核心）

#### 4.1.1 可视化编辑器

| ID | 功能 | 说明 |
|----|------|------|
| F-01 | 添加字段 | 支持添加 string / number / integer / boolean / object / array / null 类型字段 |
| F-02 | 删除字段 | 删除选中字段及其子字段 |
| F-03 | 编辑字段 | 修改字段名、类型、描述 |
| F-04 | 嵌套对象 | object 类型下可无限嵌套子字段 |
| F-05 | 数组元素 | array 类型可定义 items 的 schema |
| F-06 | 必填切换 | 标记字段为 required |
| F-07 | 字段排序 | 拖拽调整同级字段顺序 |
| F-08 | 折叠/展开 | 树节点支持折叠展开 |

#### 4.1.2 文本编辑器

| ID | 功能 | 说明 |
|----|------|------|
| F-09 | Monaco Editor | 语法高亮、自动补全、错误提示 |
| F-10 | Schema 校验 | 实时校验 JSON Schema 语法合法性 |
| F-11 | 双向同步 | 可视化 ↔ 文本编辑器内容双向同步 |

#### 4.1.3 字段级配置

| ID | 功能 | 说明 |
|----|------|------|
| F-12 | Faker 策略 | 为每个字段选择 faker 生成类型（如 name→fullName、number→int 等） |
| F-13 | 约束条件 | 设置 minLength / maxLength / minimum / maximum / pattern / enum 等 |
| F-14 | 自定义格式 | 输入自定义 faker 表达式（如 `{{date.recent}}`） |
| F-15 | null 概率 | 设置字段值为 null 的概率百分比 |

---

### 4.2 数据生成（核心）

| ID | 功能 | 说明 |
|----|------|------|
| F-16 | 实时预览 | Schema 或配置变更后自动刷新生成结果 |
| F-17 | 手动刷新 | 点击按钮重新生成 |
| F-18 | 批量生成 | 指定生成 1~1000 条记录（数组场景） |
| F-19 | 种子控制 | 输入 seed 值，相同 seed 生成相同数据 |
| F-20 | 类型覆盖 | 覆盖 JSON Schema 常见类型及格式（date、email、uri、uuid 等） |

---

### 4.3 预览与导出

| ID | 功能 | 说明 |
|----|------|------|
| F-21 | JSON 预览 | 语法高亮展示生成的 JSON |
| F-22 | 表格预览 | 数组数据支持表格形式展示 |
| F-23 | 复制到剪贴板 | 一键复制 JSON |
| F-24 | 下载 JSON | 导出为 `.json` 文件 |
| F-25 | 下载 CSV | 数组数据导出为 `.csv` 文件 |
| F-26 | 导出 Schema 模板 | 将当前 Schema + 字段配置导出为模板文件 |

---

### 4.4 数据源绑定

| ID | 功能 | 说明 |
|----|------|------|
| F-27 | 导入数据源 | 支持 JSON 数组 / CSV / Excel(.xlsx) / 纯文本列表 |
| F-28 | 数据源预览 | 表格展示已导入数据源的内容和行数 |
| F-29 | 数据源管理 | 重命名、删除已导入的数据源 |
| F-30 | 字段绑定 | 为任意字段选择已导入的数据源作为值来源 |
| F-31 | 抽样策略 | 绑定时选择：随机抽取 / 顺序循环 |
| F-32 | 解绑 | 移除字段的数据源绑定，恢复 faker 生成 |

---

### 4.5 项目与持久化

| ID | 功能 | 说明 |
|----|------|------|
| F-33 | 自动保存 | 当前状态自动存入 localStorage，刷新不丢失 |
| F-34 | 项目导出 | 整个项目（Schema + 配置 + 数据源 + 绑定）导出为 `.json-mock` 文件 |
| F-35 | 项目导入 | 从 `.json-mock` 文件恢复完整项目 |
| F-36 | 新建项目 | 清空当前状态，从空白开始 |
| F-37 | 内置模板库 | 提供常用预设模板（用户、订单、产品、文章等） |
| F-38 | 深色/浅色主题 | 主题切换并持久化偏好 |

---

## 5. 数据模型

### 5.1 项目结构

```typescript
interface Project {
  id: string
  name: string
  schema: JSONSchema
  fieldConfigs: Record<string, FieldConfig>
  dataSources: DataSource[]
  bindings: Record<string, Binding>
  generationConfig: GenerationConfig
  createdAt: string
  updatedAt: string
}
```

### 5.2 字段配置

```typescript
interface FieldConfig {
  fakerType?: string        // faker 方法路径，如 "person.fullName"
  customExpression?: string // 自定义 faker 表达式
  nullProbability?: number  // 0-100
  constraints?: {
    minLength?: number
    maxLength?: number
    minimum?: number
    maximum?: number
    pattern?: string
    enum?: unknown[]
  }
}
```

### 5.3 数据源

```typescript
interface DataSource {
  id: string
  name: string
  type: 'json' | 'csv' | 'xlsx' | 'text'
  data: unknown[]
  columns?: string[]
  createdAt: string
}
```

### 5.4 绑定关系

```typescript
interface Binding {
  dataSourceId: string
  strategy: 'random' | 'sequential'
}
```

### 5.5 生成配置

```typescript
interface GenerationConfig {
  count: number        // 1-1000
  seed: number | null
}
```

---

## 6. 模块划分

```
src/
├── components/
│   ├── layout/           # Header, Sidebar, MainPanel, PreviewPanel
│   ├── schema/           # VisualEditor, TextEditor, SchemaNode, FieldConfigPanel
│   ├── datasource/       # DataSourceManager, DataSourcePreview, BindingModal
│   ├── preview/          # JsonPreview, TableView, GenerationControls, ExportBar
│   └── common/           # ThemeToggle, FileDropzone, ConfirmDialog
├── store/                # Zustand stores
├── utils/                # generator, parsers, exporters
├── types/                # TypeScript 类型定义
├── constants/            # 内置模板、faker 类型映射
└── hooks/                # 自定义 hooks
```

---

## 7. 迭代计划

### 迭代一：MVP

- [ ] 三栏布局 + Header
- [ ] 可视化 Schema 编辑器（增删改字段、嵌套、required）
- [ ] 文本编辑器（Monaco Editor + 双向同步）
- [ ] 字段配置面板（faker 类型选择、约束条件）
- [ ] 实时 JSON 预览 + 语法高亮
- [ ] 批量生成 + 种子控制
- [ ] 导出（复制剪贴板、下载 JSON、下载 CSV）

### 迭代二：数据源绑定

- [ ] 数据源导入（JSON / CSV / Excel / 文本）
- [ ] 数据源预览与管理
- [ ] 字段绑定 UI + 抽样策略
- [ ] 绑定后生成逻辑集成

### 迭代三：项目管理

- [ ] localStorage 自动持久化
- [ ] 项目导入/导出
- [ ] 内置模板库
- [ ] 深色/浅色主题

---

## 8. 非功能需求

| 项 | 要求 |
|----|------|
| 性能 | 1000 条数据生成 < 2s |
| 兼容性 | Chrome / Edge / Firefox 最新两个大版本 |
| 响应式 | 最低支持 1280px 宽度 |
| 无障碍 | 关键操作支持键盘导航 |
| 无后端 | 纯前端运行，无服务器依赖 |
