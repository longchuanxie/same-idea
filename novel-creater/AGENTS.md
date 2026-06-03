# AGENTS.md — Novel Creator 项目编码规范与约束

## 项目概述

Novel Creator 是一个本地优先的 AI 小说创作工作台，基于 Flutter 构建，面向长篇小说/网文/长文虚构创作。整合正文编辑、项目知识库、Agent 协作、修订审核、资料调研和成稿导出。

## 技术栈

- 框架：Flutter（桌面/Web/移动端多平台）
- 语言：Dart
- 本地存储：Isar（优先，支持索引和关系查询），通过 Repository 层隔离
- 正文格式：Markdown 为默认存储格式；delta 为后续富文本扩展；html 仅作导入导出中间格式
- LLM 协议：OpenAI 兼容（base_url / api_key / model / temperature / max_tokens）
- 流式输出：SSE 或兼容流式响应

## 目录结构

```
lib/
  app/                 # 路由、主题、应用壳
  core/                # 通用错误、结果类型、日志、时间、ID
  domain/              # 实体、枚举、领域服务、接口
  data/                # 本地存储、DTO、Repository 实现
  agent/               # Agent Engine、Tool Registry、LLM Client
  editor/              # 编辑器模型、命令、diff、revision
  features/
    projects/          # 项目管理
    workspace/         # 工作台
    knowledge_base/    # 知识库（角色/世界观/笔记/大纲）
    settings/          # 设置与服务商
    export/            # 导出
  infra/
    llm/               # LLM 基础设施
    search/            # 搜索基础设施
    file_system/       # 文件系统操作
```

## 架构原则（强制）

### 1. Domain 不依赖 UI
- 实体和业务规则不引用 Flutter Widget
- 所有领域逻辑必须在 `domain/` 下可独立测试

### 2. Agent 不直接写 UI
- Agent 返回结构化 Command / Patch，由应用层统一写入
- 禁止 Agent 直接操作 UI 控件
- Agent 只能提交 `EditorCommand` 或 `RevisionPatch`

### 3. Repository 封装存储
- UI 不直接访问 Isar/Hive Box
- 所有数据操作通过 Repository 接口
- Repository 实现在 `data/` 层

### 4. 错误显式化
- 使用 `AppResult<T>` 或类似结构表达成功/失败
- 统一错误结构：

```dart
class AppError {
  final String code;
  final String message;
  final String userMessage;       // UI 展示
  final String? technicalDetail;  // 日志记录
  final bool recoverable;
  final String? suggestedAction;
  final AppErrorSource source;    // storage | llm | search | editor | export | unknown
}
```

- 所有失败必须进入可展示错误对象，禁止只打印日志

### 5. 可替换基础设施
- LLM、Search、Export、Storage 都通过接口隔离
- 便于测试时 mock 和未来替换实现

### 6. 数据模型先行
- UI 和 Agent 不得私自定义重复模型
- 需新增字段时，先在 `domain/` 定义实体变更，再更新 Repository 和 UI

## 实体约束

### 10 个核心实体（定义在 `domain/`）

Project、OutlineNode、Chapter、Revision、Character、SettingEntry、Note、Session、AgentTask、Snapshot

### 所有实体必须包含
- `id`：唯一标识
- `projectId`：项目归属（全局实体除外）
- `createdAt` / `updatedAt`：时间戳
- `schemaVersion` 或迁移策略

### 章节状态机
```
draft → reviewing → revised → published
  |         |          |
  +---------+----------+→ locked
```

### AgentTask 状态机
```
created → queued → running → succeeded
                        |→ failed
                        |→ cancelled
```

### Revision 状态
```
pending → accepted | rejected | superseded
```

## Agent 权限矩阵（强制）

| 操作 | 默认权限 | 需用户确认 |
|---|---|---|
| 生成建议 | 允许 | 否 |
| 插入正文 | 受限 | 是（生成 pending revision） |
| 替换选区 | 受限 | 是（必须保留 beforeText） |
| 删除正文 | 高风险 | 必须（只能生成删除修订） |
| 创建笔记 | 允许 | 可选（需可撤销） |
| 修改角色/设定 | 受限 | 是（以建议形式呈现） |
| 联网搜索 | 可配置 | 首次需确认 |
| 导出文件 | 允许 | 需选择路径/格式 |

**核心红线：Agent 绝对不能静默覆盖用户正文。所有对正文的修改必须以 Revision 形式进入，经用户审核后生效。**

## 写作工具契约

6 个工具均输出结构化结果，默认不写入正文：

| 工具 | 输入 | 输出 |
|---|---|---|
| write | projectId, chapterId, instruction, targetLength, contextScope | generatedText, summary, warnings |
| continue_write | chapterId, cursorContext, targetLength | continuedText, stopReason |
| rewrite | selectedText, instruction, styleProfile | revisedText, changeSummary |
| expand | selectedText, targetLength, focus | expandedText, additionsSummary |
| condense | selectedText, targetLength, keepPoints | condensedText, removedPoints |
| polish | selectedText, styleGoal, strictness | polishedText, styleNotes |

输出必须是可解析结构。若模型返回纯文本无法解析，显示为普通建议，不得写入正文。

## RevisionPatch 协议

```dart
class RevisionPatch {
  final String chapterId;
  final String baseContentHash;  // 检测生成期间正文是否变化
  final RevisionOperation operation; // insert | delete | replace
  final RevisionAnchor anchor;
  final String beforeText;
  final String afterText;
  final RevisionSource source;    // agent | user
  final RevisionPatchMetadata metadata; // prompt, model, taskId, summary
}
```

- `baseContentHash` 不一致时进入冲突处理，不强行套用旧 patch
- 审核模式：单条审核 / 段落审核 / 整体审核 / 预览模式

## 保存策略

```
用户输入 → EditorState → debounce(1-2s) → ChapterRepository.saveContent()
                                → update plainTextCache / wordCount / updatedAt
```

- 切换章节前不得丢失未保存内容
- 保存失败时保留本地内存态并提示重试
- 长章节保存应避免全项目重写

## 导出规则

- 导出不修改项目正文
- 存在 pending revision 时导出前必须提示，默认仅导出已接受内容
- 支持格式：TXT → Markdown → EPUB → PDF → DOCX → Project Package

## 数据迁移

所有实体包含 `schemaVersion`。迁移策略：
- 迁移前自动创建项目备份
- 迁移失败时保留旧数据并提示用户导出备份
- 提供 `dryRun()` / `apply()` / `rollbackHint()`

## 跨模块事件（解耦用）

```
ProjectCreated | ChapterContentChanged | RevisionCreated | RevisionAccepted
RevisionRejected | CharacterUpdated | NoteCreated | AgentTaskStarted
AgentTaskCompleted | AgentTaskFailed | SnapshotCreated | ExportCompleted
```

事件只描述事实，不直接执行业务逻辑。

## UI 设计约束

- 莫兰迪色系
- 无 emoji
- Heroicons 风格内联 SVG 图标
- 桌面三栏布局：左结构 / 中编辑 / 右 Agent
- 移动端底部导航：正文 / 大纲 / 资料 / AI
- 保存状态必须始终可见
- 时光机入口远离高频写作按钮，避免误触

## 测试要求

每个模块完成时必须提供：
1. 正常路径测试
2. 失败路径测试
3. 边界输入测试

测试分层：
- **Unit**：实体、Repository、工具函数、diff 算法
- **Integration**：AgentTask、存储、编辑器命令、导出流程
- **E2E/Manual**：用户从 UI 完成核心路径

## 代码规范

详细编码规范参见 [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)，Lint 配置参见 [analysis_options.yaml](analysis_options.yaml)。

以下为关键约束摘要：

### 通用
- 不允许一次生成无边界的大模块；每次改动必须声明改动文件、接口和测试方式
- 所有异步任务必须有状态（pending / running / succeeded / failed / cancelled）
- API Key 本地加密保存，Web 端必须提示暴露风险
- 禁止提交密钥到代码仓库
- 禁止 `print()` 代替日志系统
- 禁止空 `catch` 块
- 禁止硬编码颜色值、尺寸值

### Dart/Flutter
- 使用 `freezed` 定义不可变实体
- 使用 `json_serializable` 处理序列化
- 字段缺失有默认值或迁移逻辑
- 实体可 JSON 序列化和反序列化
- 状态管理使用 `flutter_bloc`（BLoC 模式）
- 依赖注入使用 `get_it` + `injectable`
- 错误处理使用 `AppResult<T>` 模式

### 命名
- 文件名：snake_case
- 类名：PascalCase
- 变量/函数：camelCase
- 常量：lowerCamelCase（Dart 惯例）
- 私有成员：前缀 `_`
- 枚举值：lowerCamelCase
- BLoC 后缀：`Bloc` / `Event` / `State`
- Widget 后缀：`Widget` / `Page`
- 布尔变量：`is`/`has`/`should`/`can` 前缀
- 回调参数：`on` 前缀

## 实施顺序（依赖拓扑，非产品版本）

1. Domain model + serialization
2. Repository + local storage
3. Project workspace + chapter editor
4. LLM provider settings + mock LLM
5. Agent session + basic writing tools
6. RevisionPatch + accept/reject
7. Knowledge base
8. Search module
9. Snapshot/branch
10. Export formats and responsive polish

## 非功能要求

| 类别 | 要求 |
|---|---|
| 可靠性 | Agent 操作失败不能损坏用户正文；所有写入操作有事务或可恢复记录 |
| 性能 | 打开项目首屏不加载全部章节正文；长章节懒加载；流式生成不阻塞编辑器 |
| 隐私 | API Key 本地加密；联网搜索和模型调用前应明确哪些文本会被发送 |
| 可移植 | 项目支持导出为单个项目包，便于备份和未来云同步 |
| 可降级 | 搜索/模型/导出高级格式失败时，基础编辑和本地保存必须继续可用 |

## 性能目标

| 场景 | 目标 |
|---|---|
| 打开 100 章项目 | 不一次性渲染所有正文，首屏可交互 |
| 单章 2 万字 | 编辑、保存和字数统计无明显卡顿 |
| Agent 流式输出 3000 字 | UI 可取消，滚动和输入不被长期阻塞 |
| 全文搜索 500 条知识库记录 | 结果在可接受时间内返回 |
| 导出 20 万字 Markdown/TXT | 不崩溃，进度可见 |

## Lint 与验证

每次完成编码任务后，运行：
```bash
flutter analyze
flutter test
```
确保无 analyzer 错误和测试失败。
