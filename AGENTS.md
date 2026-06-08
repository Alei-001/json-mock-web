# JSON Mock - Agent Instructions

## 项目概览
纯前端 SPA：可视化 JSON Schema 编辑器 + Mock 数据生成器。React 19 + TypeScript + Vite 8 + Zustand。

## 常用命令
```bash
npm install          # 安装依赖
npm run dev          # 开发服务器 (Vite)
npm run build        # 生产构建 (tsc -b && vite build)
npm run lint         # ESLint 检查
npm run preview      # 预览构建产物
```

**验证顺序**：`lint -> build`（无独立测试命令）

## 关键架构
- **单一 Zustand store** (`src/store/useProjectStore.ts:60-315`)：全量状态持久化到 localStorage (`json-mock-project`)
- **Schema 树结构**：`SchemaField` 递归类型，支持 object/array 嵌套
- **双向同步**：可视化树形编辑 ↔ 文本 JSON Schema 编辑 (`src/utils/schemaConverter.ts`)
- **数据生成** (`src/utils/generator.ts`)：基于 `@faker-js/faker` + 20+ 策略 + 自定义数据源
- **i18n**：`src/i18n.ts` 初始化，支持 zh-CN/ja/ko

## 重要约定
- **CSS Modules + camelCase**：`vite.config.ts:9` 配置 `localsConvention: 'camelCase'`
- **TypeScript 严格模式**：`noUnusedLocals/Parameters: true`，`erasableSyntaxOnly: true`
- **无测试框架**：验证靠 `lint + build`，手动测试用 `test/` 目录样例文件
- **状态持久化白名单**：`partialize` 只存储 theme、schema、configs、dataSources、bindings（不存 generatedData、toast、selectedFieldId）

## 常见坑点
1. **store 直接变更 schema 对象**：`findNode`/`findParent` 返回引用，必须先 `clone()` 再修改（见 `useProjectStore.ts:49-51`）
2. **生成数量上限**：`MAX_GENERATE_COUNT = 10000` (`src/types/index.ts`)，超限自动截断（store rehydrate 时也会截断）
3. **导入 JSON Schema**：仅支持标准 JSON Schema 子集，`jsonSchemaToSchemaField` 失败返回 `null`
4. **数据源去重**：同名数据源会覆盖并清理关联 binding (`addDataSource:243-258`)

## 目录结构速查
```
src/
├── components/       # UI 组件（核心：SchemaEditor, DataPreview, DataSourcePanel）
├── constants/        # 策略注册表、模板库、默认 Schema
├── store/            # 单一 Zustand store
├── types/            # 核心类型定义
├── utils/            # generator, schemaConverter, export, syntaxHighlight
├── App.tsx           # 根组件
└── index.css         # 设计令牌 + 全局样式
```

## 环境要求
- Node.js 18+（Vite 8 要求）
- 无后端/数据库/环境变量依赖