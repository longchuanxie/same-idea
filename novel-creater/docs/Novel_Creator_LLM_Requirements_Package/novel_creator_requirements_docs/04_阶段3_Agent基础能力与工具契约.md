# 04 阶段 3：Agent 基础能力与工具契约

> 定义 LLM Client、对话、工具调用、AgentTask 状态、写作类工具输入输出。

## 1. 阶段目标

阶段 3 让应用具备基础 AI 协作能力：用户可以在项目内和 Agent 对话，调用续写、改写、扩写、缩写、润色等工具。该阶段的重点是“结构化输出”和“副作用受控”，而不是让 Agent 自主完成全部创作。

## 2. LLM Client 要求

| 能力 | 要求 |
| --- | --- |
| OpenAI 兼容 | 支持 base_url、api_key、model、temperature、max_tokens。 |
| 流式输出 | SSE 或兼容流式响应，支持取消。 |
| 错误归一 | 认证失败、限流、网络失败、模型不存在均转为 AppError。 |
| 成本估算 | 记录 prompt_tokens、completion_tokens；不可靠时标记 estimated。 |
| 模型选择 | 全局默认、项目默认、单次任务覆盖。 |

## 3. Agent Engine 结构

```text
AgentEngine
  - SessionManager
  - ContextBuilder
  - ToolRegistry
  - TaskRunner
  - SafetyGuard
  - ResultInterpreter
```

职责划分：
- SessionManager 管理对话消息和阶段。
- ContextBuilder 从项目中选择必要上下文。
- ToolRegistry 注册可调用工具及契约。
- TaskRunner 执行工具，记录 AgentTask。
- SafetyGuard 检查权限和确认要求。
- ResultInterpreter 将模型输出转成结构化结果。

## 4. AgentTask 状态机

```text
created -> queued -> running -> succeeded
                         |-> failed
                         |-> cancelled
```

AgentTask 必须记录：
- taskType
- input JSON
- output JSON
- status
- startedAt / completedAt
- model
- tokenUsage
- error
- sideEffects

## 5. 写作工具契约

| 工具 | 输入 | 输出 | 副作用 |
| --- | --- | --- | --- |
| write | projectId, chapterId, instruction, targetLength, contextScope | generatedText, summary, warnings | 默认无；用户确认后生成 revision |
| continue_write | chapterId, cursorContext, targetLength | continuedText, stopReason | 默认无；可插入为 pending revision |
| rewrite | selectedText, instruction, styleProfile | revisedText, changeSummary | 生成 replace revision |
| expand | selectedText, targetLength, focus | expandedText, additionsSummary | 生成 replace revision |
| condense | selectedText, targetLength, keepPoints | condensedText, removedPoints | 生成 replace revision |
| polish | selectedText, styleGoal, strictness | polishedText, styleNotes | 生成 replace revision |

## 6. 工具输入输出示例

```text
RewriteInput {
  projectId,
  chapterId,
  selectedText,
  instruction,
  styleProfileId?,
  contextRefs: [characterIds, settingEntryIds, noteIds]
}

RewriteOutput {
  revisedText,
  changeSummary,
  warnings,
  confidence,
  suggestedRevisionPatch
}
```

输出必须是可解析结构。若模型返回纯文本，ResultInterpreter 应尝试修复；修复失败则显示为普通建议，不得写入正文。

## 7. 上下文构建规则

ContextBuilder 应按任务选择上下文：
- 续写：当前章节前后文、章节大纲、相关角色、世界观摘要。
- 改写：选区、所在段落、用户指令、风格配置。
- 一致性检查：章节摘要、角色卡、世界观规则、时间线。
- 脑暴：项目简介、已有大纲、用户偏好。

上下文过长时，优先保留：用户明确选中文本 > 当前章节摘要 > 相关角色/设定 > 最近对话 > 全局背景。

## 8. 对话面板需求

右侧 Agent 面板包含：
- 当前会话标题和阶段标签。
- 消息列表，支持流式显示。
- 工具执行状态：正在读取上下文、正在生成、等待确认、已失败。
- 快捷操作：续写本章、改写选区、总结当前章、检查一致性。
- 取消按钮：流式生成可中止，中止内容作为草稿建议保留。

## 9. 阶段验收

| 场景 | 通过标准 |
| --- | --- |
| 配置模型 | 输入 base_url/api_key/model 后可发起测试请求。 |
| 普通对话 | 用户提问后 Agent 流式回复，消息保存到 Session。 |
| 续写章节 | 基于当前章节生成续写建议，但不静默覆盖正文。 |
| 改写选区 | 选中文本后生成 revisedText 和 changeSummary。 |
| 取消任务 | 生成中取消后状态为 cancelled，已有正文不被破坏。 |
| 失败提示 | 认证失败/网络失败/限流均显示可理解错误。 |

