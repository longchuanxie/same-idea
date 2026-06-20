# 里程碑 3a · Drift 持久化层设计

## 背景

里程碑 1 实现了写作闭环（项目/章节/修订），里程碑 2 实现了 LLM Provider 与设置。两个里程碑均以 `InMemory*Repository` 作为数据层桥接，应用重启后数据丢失。

里程碑 3a 引入 Drift（SQLite）作为生产持久化实现，覆盖现有 4 个领域实体的全部数据，跨 desktop / mobile / web 三个平台。知识库（Character / SettingEntry / Note / OutlineNode）的实体与页面留待里程碑 3b。

## 目标

- 现有 Project / Chapter / Revision / LlmProvider 数据在应用重启后保留
- Drift 作为生产唯一持久化实现，InMemory 仅供测试使用
- 跨平台覆盖：native 用 `sqlite3_flutter_libs`，web 用 `drift_wasm`
- 不破坏里程碑 1/2 上层（Bloc / UI）代码

## 非目标

- 知识库实体（→ 里程碑 3b）
- 章节内容懒加载（留待性能优化里程碑）
- 迁移备份导出（留待数据迁移里程碑）
- web 端 API key 加密持久化（保持 InMemorySecretStorage）
- Repository 接口 Stream 化（保持现有 Future 接口）

## 总体策略

**架构选择：Option A —— Drift 替换 InMemory（生产唯一）**

生产应用通过 `MultiRepositoryProvider` 注入 4 个 `Drift*Repository`（`DriftLlmProviderRepository` 同时承载 provider 和 default settings 两组方法，因为 `LlmProviderRepository` 接口本身包含 `getDefaultSettings` / `setDefaultSettings`）。`InMemory*Repository` 类保留在代码库中，仅供单元/widget 测试使用。Drift Repository 测试用 `NativeDatabase.memory()` 跑真实 schema。

放弃 Option B（运行时 flag 切换）：会双倍打包并隐藏"内存通过、Drift 失败"的 bug。放弃 Option C（Drift 包 InMemory 缓存）：当前数据规模无需缓存层，过早优化。

## 表结构

通用约定：所有时间戳列用 `INTEGER`（Unix epoch ms），所有 ID 列用 `TEXT`（UUID v4）。每张表含 `schema_version INTEGER NOT NULL DEFAULT 1`。

### projects

| 列 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `description` | TEXT | NOT NULL, default '' |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |
| `schema_version` | INTEGER | NOT NULL, default 1 |

### chapters

字段与 `Chapter` 实体一一对应（`markdownContent`、`plainTextCache`、`wordCount`、`status`）。本里程碑不引入 `order_index` 或 `content_hash`（实体未持有；如后续需要由 mapper 计算）。

| 列 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `project_id` | TEXT | NOT NULL, FK→projects(id) ON DELETE CASCADE |
| `title` | TEXT | NOT NULL |
| `markdown_content` | TEXT | NOT NULL, default '' |
| `plain_text_cache` | TEXT | NOT NULL, default '' |
| `word_count` | INTEGER | NOT NULL, default 0 |
| `status` | TEXT | NOT NULL（draft/reviewing/revised/published/locked） |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |
| `schema_version` | INTEGER | NOT NULL, default 1 |

索引：`(project_id)` 用于 `ChapterRepository.list(projectId)` 查询。

### revisions

`Revision` 实体持有嵌套 `RevisionPatch` 值对象（含 chapterId / baseContentHash / operation / anchor / beforeText / afterText / source / metadata），整体序列化为一个 JSON 列 `patch_json`，避免拆分多列后 schema 与 freezed 实体漂移。

| 列 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `project_id` | TEXT | NOT NULL |
| `chapter_id` | TEXT | NOT NULL, FK→chapters(id) ON DELETE CASCADE |
| `patch_json` | TEXT | NOT NULL（`RevisionPatch.toJson()`） |
| `status` | TEXT | NOT NULL（pending/accepted/rejected/superseded） |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |
| `schema_version` | INTEGER | NOT NULL, default 1 |

索引：`(chapter_id, status)` 用于 `RevisionRepository.listPending(chapterId)` 查询。

### llm_providers

| 列 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `project_id` | TEXT | NOT NULL（全局 provider 用固定值 `__global__`） |
| `name` | TEXT | NOT NULL |
| `base_url` | TEXT | NOT NULL |
| `secret_key_ref` | TEXT | NOT NULL |
| `cached_models_json` | TEXT | NOT NULL（`List<LlmModel>` JSON 数组） |
| `selected_model_id` | TEXT | nullable |
| `status` | TEXT | NOT NULL（unknown/connected/error） |
| `temperature` | REAL | NOT NULL, default 0.7 |
| `top_p` | REAL | NOT NULL, default 0.9 |
| `streaming_enabled` | INTEGER | NOT NULL, default 1（SQLite bool） |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |
| `schema_version` | INTEGER | NOT NULL, default 1 |

`cached_models_json` 列存 `List<LlmModel>` 的 JSON 数组形式，避免引入 `llm_models` 子表与连接。字段命名与 `LlmProvider` 实体保持一致（`secretKeyRef`、`cachedModels`、`streamingEnabled`），mapper 负责蛇形 ↔ 驼峰转换。

### llm_default_settings

单行表，通过 `CHECK(id=1)` 强制唯一行。字段与 `LlmDefaultSettings` 实体一一对应（3 个角色的 provider+model 配对：writing / reasoning / embedding）。

| 列 | 类型 | 约束 |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY CHECK(id=1) |
| `writing_provider_id` | TEXT | nullable |
| `writing_model_id` | TEXT | nullable |
| `reasoning_provider_id` | TEXT | nullable |
| `reasoning_model_id` | TEXT | nullable |
| `embedding_provider_id` | TEXT | nullable |
| `embedding_model_id` | TEXT | nullable |
| `default_temperature` | REAL | NOT NULL, default 0.7 |
| `default_top_p` | REAL | NOT NULL, default 0.9 |
| `streaming_enabled` | INTEGER | NOT NULL, default 1 |
| `updated_at` | INTEGER | NOT NULL |
| `schema_version` | INTEGER | NOT NULL, default 1 |

### Schema 版本

`AppDatabase.schemaVersion = 1`。`onUpgrade` 框架预留，本里程碑不写实际迁移分支。

## 组件结构

新增目录（worktree 内 `novel-creater/lib/data/local/`）：

```
lib/data/local/
  database/
    app_database.dart              # Drift DB 入口，schemaVersion=1
    app_database.g.dart            # build_runner 生成
    connection/
      connection.dart              # 条件 export 入口
      connection_native.dart       # NativeDatabase（sqlite3_flutter_libs）
      connection_web.dart          # WasmDatabase（drift_wasm）
      connection_stub.dart         # 编译占位
  tables/
    projects_table.dart
    chapters_table.dart
    revisions_table.dart
    llm_providers_table.dart
    llm_default_settings_table.dart
  mappers/
    project_mapper.dart
    chapter_mapper.dart
    revision_mapper.dart
    llm_provider_mapper.dart
    llm_default_settings_mapper.dart
  repositories/
    drift_project_repository.dart
    drift_chapter_repository.dart
    drift_revision_repository.dart
    drift_llm_provider_repository.dart    # 覆盖 LlmProviderRepository 全部 6 个方法（含 default settings）
```

Web 端新增：`web/drift_worker.dart` + `web/sqlite3.wasm` + `web/drift_worker.js`（按 drift_wasm 官方流程生成）。

`lib/data/repositories/in_memory_*.dart` 原样保留，仅供测试。

## 依赖关系

```
main.dart
  ↓
app/app.dart
  ├─ FutureBuilder<AppDatabase>(future: _initDatabase())
  │     ↓
  │     _initDatabase():
  │       ├─ kIsWeb ? openWasm() : openNative()
  │       └─ AppDatabase(executor) + PRAGMA foreign_keys=ON
  ↓
MultiRepositoryProvider:
  ├─ DriftProjectRepository(db)
  ├─ DriftChapterRepository(db)
  ├─ DriftRevisionRepository(db)
  ├─ DriftLlmProviderRepository(db)
  ├─ FlutterSecureStorageAdapter（unchanged）/ InMemorySecretStorage on web
  ↓
WorkspaceBloc / SettingsBloc 通过 context.read 取 Repository（同里程碑 2 模式）
  ↓
Repository 方法：
  try { drift 操作; return AppResult.success } 
  catch { return AppResult.failure(AppError) }
```

## 错误处理

所有 Drift 异常映射为 `AppError`，dotted code 风格：

| Drift 异常 | code | recoverable | userMessage |
|---|---|---|---|
| `SqliteException`（FK / NOT NULL / CHECK 违反） | `database.constraint_violation` | false | "数据冲突，无法保存" |
| `SqliteException`（UNIQUE 违反） | `database.unique_violation` | false | "记录已存在" |
| `SqliteException`（其他） | `database.write_failed` | true | "保存失败，请重试" |
| `DriftWrappedException` | `database.unexpected` | true | "数据库错误" |
| Row not found（业务判断） | `database.not_found` | false | "未找到数据" |
| FK violation on delete | `database.has_dependents` | false | "存在关联数据，无法删除" |

封装在 `DriftErrorMapper` helper，所有 Drift Repository 共用。Repository 方法签名保持 `Future<AppResult<T>>`，异常不外溢。

## 并发与事务

- Drift 默认串行写、并发读
- 单语句写不显式开事务（Drift 自动单语句事务）
- 批量操作用 `database.transaction()` 包裹
- WorkspaceBloc 已有 1-2 秒 debounce 保存，写入频率对 SQLite 友好
- 不引入 `Stream` 返回类型；保持现有 `Future<AppResult<T>>` 接口

## 测试策略

- 单元测试：`NativeDatabase.memory()`，每个测试新 DB 实例
- 新增 `test/unit/data/local/` 4 个 Drift Repository 测试（CRUD / not_found / constraint violation）
- 新增 `test/unit/data/local/mappers/` 5 个 mapper 往返测试
- 新增 `test/integration/drift_workflow_test.dart`：建项目 → 章节 → revision → 接受 → 验证章节内容
- 现有 107 个测试不动，InMemory Repository 测试继续作为接口契约层
- 目标：~137 测试全绿，0 analyze issues

## 跨平台验证

- `flutter test`：native sqlite，desktop / mobile 路径
- `flutter build web --release`：生成 wasm worker 与 sqlite3.wasm
- Playwright MCP 烟雾：启 dev server → 打开 `/settings` → 新建 provider → 刷新页面 → 验证 provider 仍存在（里程碑 2 InMemory 做不到，本里程碑可观察到的回归点）

## 实施任务拆解

按依赖顺序，13 个原子任务，每任务粒度 = 实现 + 测试 + `flutter analyze` 0 issues。

### Phase A · 基建（3 任务）

1. 添加依赖：`drift`、`drift_flutter`、`sqlite3_flutter_libs`、`drift_dev`、`build_runner`；`flutter pub get`
2. 创建 5 张表 schema 与 `AppDatabase`（schemaVersion=1）；`build_runner build --delete-conflicting-outputs` 跑通生成
3. 创建 connection 层：`connection_native.dart` + `connection_web.dart` + 条件 export；启用 `PRAGMA foreign_keys=ON`

### Phase B · 错误映射与 Mappers（2 任务）

4. 新增 `database.*` dotted code 系列 + `DriftErrorMapper` helper
5. 5 个 mapper（project / chapter / revision / llm_provider / llm_default_settings）+ 往返单元测试

### Phase C · Drift Repositories（4 任务）

6. `DriftProjectRepository` + 测试（CRUD / list / notFound）
7. `DriftChapterRepository` + 测试（CRUD / list-by-project / order / contentHash）
8. `DriftRevisionRepository` + 测试（CRUD / list-by-chapter / 状态过滤 / cascade delete）
9. `DriftLlmProviderRepository`（实现 `LlmProviderRepository` 接口的全部 6 个方法，包括 `getDefaultSettings` / `setDefaultSettings`）+ 测试（CRUD / cached_models_json 往返 / default settings 单行约束）

### Phase D · 应用层接入（2 任务）

10. 修改 `lib/app/app.dart`：`FutureBuilder<AppDatabase>` + kIsWeb 分支 + MultiRepositoryProvider 替换为 Drift；加 loading / error 屏
11. 跨 Repository 集成测试（建项目 → 章节 → revision → accept → 验证内容）

### Phase E · Web 验证与评审（2 任务）

12. `flutter build web --release`（含 drift_worker.js / sqlite3.wasm 拷贝到 web/）+ Playwright MCP 持久化烟雾测试
13. Subagent 代码评审 + 修复 Important 项 + 最终 `flutter analyze` + `flutter test` 全绿

## 验收标准

- `flutter analyze` 0 issues
- `flutter test` 全绿（~137 测试）
- `flutter build web --release` 成功
- Playwright 持久化烟雾测试：新建 provider → 刷新页面 → provider 仍存在
- 主仓库不受污染：实现在 worktree 分支 `milestone-1-writing-loop`，spec/plan 提交主仓库 `comics` 分支

## 风险与降级

| 风险 | 降级方案 |
|---|---|
| drift_wasm 在 Windows 上的 worker 构建失败 | web 端临时用 `NativeDatabase.memory()`（内存数据），记入 follow-up |
| `sqlite3_flutter_libs` Windows 桌面需要 VS Build Tools，缺失时编译失败 | 临时用纯 Dart `sqlite3` 包，记入 follow-up |
| FK ON DELETE CASCADE 在 drift_wasm 上行为不一致 | 集成测试在 web 上重跑一次；如不一致则改为应用层级联 delete |
| build_runner 在 freezed + drift 混用时生成顺序问题 | 显式分两步：`build_runner build` 前先 `clean` 缓存目录 |

## 与现有里程碑的边界

- 不修改 `lib/agent/`、`lib/editor/`、`lib/features/workspace/`、`lib/features/settings/` 的 Bloc / UI 代码
- 不修改 `lib/domain/`（实体、Repository 接口）
- 仅替换 `lib/app/app.dart` 的 Provider 注入实现
- 里程碑 2 评审的 7 个未修 Important + 9 Minor 不在本里程碑范围

## 后续里程碑

- 3b：知识库 4 实体（Character / SettingEntry / Note / OutlineNode）+ 4 页面，建立在 3a 的 Drift 之上
- 4+：UI 保真度专项、章节内容懒加载、修订追踪 UI、导出工作流、快照与分支



