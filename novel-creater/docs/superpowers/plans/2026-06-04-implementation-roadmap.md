# Novel Creator 逐步完善实施计划

创建日期：2026-06-04

## 目标

基于当前 Flutter 实现、HTML 原型和 `docs/Novel_Creator_LLM_Requirements_Package/` 需求文档，按依赖拓扑逐步补齐 Novel Creator。优先保证正文安全、本地保存、LLM/Agent 可测基础，再扩展修订审核、知识库、搜索、快照和导出。

## 当前进展

- 阶段 1 已完成：编辑器保存闭环修复，标题/正文统一保存，切章前 flush，保存失败保留内存态，补齐 Markdown plain text 缓存和中英混合字数统计。
- 阶段 2 已完成：LLM Provider 持久化扩展，`temperature`/`maxTokens` 入库，新增 `infra/llm` 契约和 `MockLlmClient`。
- 阶段 3 已完成：新增 `AgentBloc`，Agent 面板接入 Session、AgentTask、Mock LLM，支持任务状态流转、失败和取消。
- 阶段 4 已完成：新增 6 个写作工具契约与实现，输出结构化建议或内存修订建议，不直接写正文、不直接持久化 Revision。
- 阶段 5 已完成基础闭环：新增稳定内容 hash、`RevisionService`、pending revision 创建、accept/reject/supersede、冲突检测、anchor 文本校验，并在工作台修订入口展示 pending revision，可单条接受或拒绝。
- 阶段 6 已完成：新增 `KnowledgeBaseBloc`，角色、笔记、大纲、世界观入口接入 Repository，支持加载、搜索、新建、编辑、删除；补齐 Bloc 单元测试和世界观 Repository 集成测试。
- 阶段 7 已完成第一切片：新增 `infra/search` 契约、`MockSearchProvider`、`SourceCard`/`ResearchNoteDraft` 模型和 `ResearchBloc`，调研页面支持联网边界确认、手动搜索、来源卡展示、缓存命中/提取失败提示，并可保存为 `NoteType.research` 调研笔记。

## 阶段 5 遗留增强

- 批量审核、段落审核和整体预览仍未实现。
- 手动编辑命中 pending revision 区域时自动 supersede 仍未接入编辑器事件。
- 导出前 pending revision 检查放到阶段 9 处理。
- 旧静态修订/待确认占位类因原文件存在编码异常，暂以 analyzer ignore 保留；后续 UI 清理阶段统一移除。

## 阶段 6 状态

已完成：
- `KnowledgeBaseBloc` 统一管理角色、笔记、大纲、世界观四类知识库资料。
- 工作台项目启动时加载知识库状态。
- 角色库页面接入 `CharacterRepository`，支持创建、编辑、删除、搜索和标签。
- 笔记页面接入 `NoteRepository`，支持创建、编辑、删除、搜索、来源 URL 和标签。
- 大纲页面接入 `OutlineNodeRepository`，支持创建、编辑、删除、搜索和按 order 展示。
- 为 `SettingEntry` 补齐 Drift table、Repository 接口/实现、DI 注册和 schema v4 迁移。
- 世界观页面接入 `SettingEntryRepository`，支持分类、标题、内容、标签的 CRUD 与搜索。
- 新增测试覆盖正常路径、失败路径和边界输入。

阶段 6 仍需继续：
- 角色关系、角色一致性事实、笔记类型选择、大纲节点类型/状态选择仍是简化表单。
- 正文选区生成角色事实或笔记建议尚未接入。
- Agent 回复展示知识库引用尚未接入。

## 后续阶段

### 7. 搜索与引用治理

目标：提供可控联网调研，不把外部内容无约束混入正文。

已完成：
- 新增 `SearchPlan`、`SourceCard`、`ResearchCitation`、`ResearchNoteDraft` 模型。
- 新增 `SearchProvider` 接口和 `MockSearchProvider`，覆盖空查询失败、确定性来源卡、重复搜索缓存命中、全文提取失败降级。
- 新增 `ResearchBloc`，搜索前必须确认联网边界；搜索结果只进入来源卡，不写正文。
- 调研页面接入真实搜索流程，可展示 URL、domain、retrievedAt、summary、cache 和 summary-only 状态。
- 来源卡可保存为 `NoteType.research`，笔记内容保留 URL、查询词、检索时间和可信度提示。
- 新增测试覆盖正常路径、失败路径、边界输入和缓存命中。

仍需继续：
- SourceCard/ResearchNote 尚未持久化为独立表，目前保存为 Note research 类型。
- Agent 生成 SearchPlan 并经用户确认后执行尚未接入。
- 真实 SearchProvider、WebExtractor、代理/CORS 降级和预算控制尚未接入。
- 搜索结果缓存当前为 Mock 内存缓存，尚未落地到 Repository。

任务：
- 新增 `infra/search`：SearchProvider、WebExtractor、SourceCard、ResearchNote。
- 首次联网前展示将发送的文本范围和风险。
- 搜索结果保存 title、url、domain、snippet、summary、retrievedAt、credibilityHint。
- 抽取失败时保留搜索摘要并提示无法提取全文。
- 支持缓存命中和更新时间提示。

### 8. Snapshot、Session 分支与时光机

目标：提供可恢复的创作探索能力，避免用户分不清会话回溯和项目回滚。

任务：
- 实现手动 Snapshot。
- 迁移、高风险批量修订、恢复前自动 Snapshot。
- 快照恢复前展示影响范围并二次确认。
- 优先实现“基于快照创建分支”，后续实现直接恢复。

### 9. 导出与多端完善

目标：完成成稿交付和响应式体验。

任务：
- 导出前检查 pending revision，并默认仅导出已接受内容。
- 补导出范围、模板、预览、进度、ExportLog。
- Project Package 包含项目、章节、知识库、修订、Session、Snapshot，不包含 API Key。
- 扩展 EPUB、PDF、DOCX。
- 实现移动端底部导航：正文、大纲、资料、AI。

## 质量门槛

- 每个阶段完成时必须说明改动文件、接口和测试方式。
- 所有写入通过 Repository、Command 或 Revision 服务，不绕过数据层。
- Agent 不直接覆盖正文。
- 异步任务必须有明确状态。
- 失败进入可展示 `AppError`。
- 覆盖正常路径、失败路径、边界输入测试。
- 本阶段相关 `flutter analyze` 无新增问题。
- `flutter test` 必须通过。

当前全项目 `flutter analyze` 仍存在少量历史 lint/info，需要单独安排质量清理阶段；新增阶段不得继续增加 analyzer 噪音。

## 下一步

继续阶段 7 第二切片：补 SourceCard/ResearchNote 持久化或等价 Repository 缓存层，并设计 Agent 搜索计划确认流。
