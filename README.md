# JSON Mock

可视化 JSON Schema 编辑器 + Mock 数据生成器，纯前端 SPA，无需后端。

## 功能

- **可视化 Schema 编辑**：树形结构增删改字段，支持 object / array / string / number / integer / boolean 类型
- **文本 Schema 编辑**：直接编辑 JSON Schema 文本，双向同步
- **20+ 生成策略**：邮箱、姓名、电话、UUID、日期、地址等，按字段类型自动筛选
- **约束配置**：字符串长度范围、数字值范围、正则约束、数组元素个数
- **自定义数据源**：导入 JSON / CSV / TSV / TXT 文件绑定字段，支持随机抽取或顺序循环
- **null 概率**：按字段设置输出 null 的概率
- **模板库**：5 个预设模板（用户/订单/产品/文章/员工），一键加载
- **项目导入导出**：`.json-mock` 格式完整保存/恢复项目
- **数据导出**：JSON 复制/下载、CSV 下载
- **响应式布局**：桌面端左右分栏，窄屏自动竖向堆叠

## 技术栈

- React 19 + TypeScript
- Vite 8
- Zustand（状态管理 + localStorage 持久化）
- @faker-js/faker（数据生成）
- papaparse（CSV 解析）
- CSS Modules + OKLCH 色彩空间

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 项目结构

```
src/
├── components/
│   ├── DataPreview/        # 数据预览面板
│   ├── DataSourcePanel/    # 数据源管理
│   ├── Modal/              # 模态框 + 字段配置
│   ├── PromptDialog/       # 导出文件名对话框
│   ├── SchemaEditor/       # Schema 编辑器（树形 + 文本）
│   ├── Select/             # 自定义下拉组件
│   ├── TemplateLibrary/    # 模板库
│   ├── Toast/              # 提示消息
│   └── TopBar/             # 顶部导航栏
├── constants/
│   ├── demoSchema.ts       # 默认演示 Schema
│   ├── strategies.ts       # 生成策略注册表
│   └── templates.ts        # 预设模板
├── store/
│   └── useProjectStore.ts  # Zustand 全局状态
├── types/
│   └── index.ts            # TypeScript 类型定义
├── utils/
│   ├── export.ts           # 导出/复制工具
│   ├── generator.ts        # Mock 数据生成器
│   └── schemaConverter.ts  # Schema ↔ JSON Schema 双向转换
├── App.tsx                 # 根组件
└── index.css               # 全局样式 + 设计令牌
```

## 数据源格式

| 格式 | 说明 | 示例 |
|------|------|------|
| JSON | 数组，每元素一条数据 | `["值1","值2"]` 或 `[{"name":"Alice"},...]` |
| CSV | 首行为表头，逗号分隔 | `name,email\nAlice,a@b.com` |
| TSV | 首行为表头，Tab 分隔 | `name\temail\nAlice\ta@b.com` |
| TXT | 每行一个值 | `值1\n值2\n值3` |

`test/` 目录下有示例文件可供测试。
