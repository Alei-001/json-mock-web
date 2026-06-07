# JSON Mock — 模拟 JSON 数据生成器

## 1. 项目概述

一个纯前端 SPA 应用，用户可通过可视化编辑或直接编写 JSON Schema 来生成模拟 JSON 数据，支持自定义数据源绑定、模板管理和项目持久化。

### 1.1 目标用户

- 前后端开发者：快速生成接口 Mock 数据
- 测试人员：构造测试数据集
- 产品/设计：生成示例数据用于原型展示

---

## 2. 技术栈

| 项 | 选型 | 状态 |
|----|------|------|
| 框架 | React 19 + TypeScript | 已引入 |
| 构建工具 | Vite 8 | 已配置 |
| 状态管理 | Zustand | 待引入 |
| 样式 | CSS Modules（OKLCH 色板 + Inter / JetBrains Mono 字体） | 已实施 |
| 代码编辑器 | Monaco Editor (`@monaco-editor/react`) | 待引入 |
| Mock 生成 | `json-schema-faker` + `@faker-js/faker` | 待引入 |
| CSV 解析 | `papaparse` | 待引入 |
| Excel 解析 | `xlsx` | 待引入 |
| 图标 | 内联 SVG（后续可替换为 `lucide-react`） | 已实施 |
| 持久化 | localStorage / 文件导入导出 | 待实施 |
| 部署 | 静态部署（纯前端，无后端） | — |

---

## 3. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│  TopBar                                                         │
│  [Logo JSON Mock] [模板库] [数据源] [项目]          [保存]     │
├────────────────────────────────┬────────────────────────────────┤
│  左面板                        │  右面板                         │
│ ┌────────────────────────────┐ │ ┌────────────────────────────┐ │
│ │ Schema 编辑器  [可视化][文本]│ │ │ 数据预览  [JSON][表格]     │ │
│ │ [导入模板] [导出模板]       │ │ │                            │ │
│ ├────────────────────────────┤ │ ├────────────────────────────┤ │
│ │ ▼ root            object   │ │ │ 数量 [1] 种子 [___] [重新生成]│ │
│ │   name*           string   │ │ ├────────────────────────────┤ │
│ │   age*            integer  │ │ │ 1  {                       │ │
│ │ ▸ email*          string   │ │ │ 2    "name": "张伟",       │ │
│ │ ▸ address         object   │ │ │ 3    "age": 28,            │ │
│ │ ▼ tags            array    │ │ │ ...                        │ │
│ │     [0]           string   │ │ │ 13 }                       │ │
│ │   isActive        boolean  │ │ ├────────────────────────────┤ │
│ │   createdAt       string   │ │ │ [复制 JSON] [下载 JSON]    │ │
│ │ + 添加字段                 │ │ │ [下载 CSV]                 │ │
│ └────────────────────────────┘ │ └────────────────────────────┘ │
└────────────────────────────────┴────────────────────────────────┘
```

- **TopBar**（顶部 56px）：Logo、导航（模板库/数据源/项目）、保存按钮
- **左面板**（50%）：Schema 编辑器卡片，包含 CardHeader + 可视化/文本 tab + SchemaTree
- **右面板**（50%）：数据预览卡片 + 操作栏，包含 GenControls + JSON 预览 + 导出按钮
- **Modal**：点击树节点弹出字段配置弹窗（Faker 类型、约束、数据源绑定）
- **Toast**：操作反馈提示（如"已复制到剪贴板"）

### 3.1 设计系统

详细视觉设计参见 `DESIGN.md`（OKLCH 色板、字体、间距、组件规格）。设计稿参考 `design-mockup.html`。

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
│   ├── TopBar/               # TopBar.tsx + .module.css（Logo、导航、保存按钮）
│   ├── SchemaEditor/         # SchemaEditor.tsx + .module.css
│   │   └── 含 CardHeader（可视化/文本 tabs + 导入/导出按钮）
│   │   └── 含 SchemaTree（TreeNode + AddFieldButton）
│   ├── DataPreview/          # DataPreview.tsx + .module.css
│   │   └── 含 GenControls（数量/种子/重新生成）
│   │   └── 含 JsonPreview（语法高亮行渲染）
│   │   └── 含 ActionBar（复制 JSON / 下载 JSON / 下载 CSV）
│   ├── Modal/                # Modal.tsx（通用外壳）+ FieldConfigModal.tsx（字段配置）
│   └── Toast/                # Toast.tsx（操作反馈提示）
├── store/                    # Zustand stores（待创建）
├── utils/                    # generator, parsers, exporters（待创建）
├── types/                    # TypeScript 类型定义（待创建）
├── constants/                # 内置模板、faker 类型映射（待创建）
└── hooks/                    # 自定义 hooks（待创建）
```

### 6.1 布局说明

- **左右两栏布局**（50/50），无 Sidebar，导航通过 TopBar 的按钮实现
- 左面板：Schema 编辑器卡片（Header + SchemaTree）
- 右面板：数据预览卡片（Header + GenControls + JSON/表格预览） + 操作栏
- 全局 UI 状态（tabs、modal、toast）当前在 App.tsx 中管理，后续迁移至 Zustand

---

## 7. 迭代计划

### 迭代一：MVP

| 模块 | 进度 |
|------|------|
| 左右两栏布局 + TopBar | UI 完成，待接入逻辑 |
| 可视化 Schema 编辑器 UI（树节点渲染、展开/折叠、节点选中、添加/删除按钮） | UI 完成，增删改逻辑待实施 |
| 字段配置弹窗 UI（Faker 类型、格式、约束、数据源绑定区域） | UI 完成，store 绑定待实施 |
| JSON 预览 + 语法高亮 | UI 完成（静态 mock），动态数据绑定待实施 |
| 生成控制栏 UI（数量、种子、重新生成） | UI 完成，Mock 生成逻辑待实施 |
| 操作栏 UI（复制、下载 JSON、下载 CSV） | UI 完成，导出逻辑待实施 |
| 文本编辑器（Monaco Editor + 双向同步） | 待实施 |
| 表格预览 | 待实施 |

#### 详细任务

- [x] 左右两栏布局 + TopBar（Logo、导航、保存按钮）
- [x] 可视化 Schema 编辑器 UI（TreeNode 渲染、toggle 展开、hover actions、required 标记）
- [x] 字段配置 Modal（Faker 类型选择、格式、约束条件输入、数据源绑定占位）
- [x] JSON 预览 UI（行号 + 语法高亮着色：key/string/number/boolean/bracket）
- [x] 生成控制栏 UI（数量 input、种子 input、重新生成按钮）
- [x] 操作栏 UI（复制 JSON / 下载 JSON / 下载 CSV 按钮）
- [x] Toast 提示组件（复制成功反馈）
- [x] Tab 切换 UI（可视化 ↔ 文本、JSON）
- [x] 可视化 Schema 编辑器逻辑（增删改字段 F-01~03、嵌套 F-04~05、required F-06）
- [x] 文本编辑器（语法高亮 + 校验 + 自动双向同步 F-09~11）
- [x] 字段配置接入 store（策略注册表 F-12、约束条件 F-13、自定义表达式 F-14）
- [x] 实时 JSON 预览（@faker-js/faker 生成 F-16 + 动态渲染 F-21）
- [x] 批量生成 + 种子控制逻辑（F-17~19）
- [x] 导出逻辑（复制 F-23、下载 JSON F-24、下载 CSV F-25、导出 Schema 模板 F-26）

### 迭代二：数据源绑定

- [ ] 数据源导入（JSON / CSV / Excel / 文本）
- [ ] 数据源预览与管理
- [ ] 字段绑定 UI + 抽样策略
- [ ] 绑定后生成逻辑集成

### 迭代三：项目管理

- [x] localStorage 自动持久化
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
