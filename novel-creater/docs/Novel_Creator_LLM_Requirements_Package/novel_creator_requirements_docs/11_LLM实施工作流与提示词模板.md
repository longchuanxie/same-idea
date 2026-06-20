# 11 LLM 实施工作流与提示词模板

> 把需求转成 LLM 可执行的工作流、任务拆分和提示词模板。

## 1. 实施工作流

推荐每个模块按以下循环执行：

```text
读取规格 -> 生成设计草案 -> 确认接口 -> 生成代码 -> 生成测试 -> 运行测试 -> 修复 -> 更新文档
```

禁止从 UI 直接开始生成整套应用。应先固定 domain、repository、editor command、agent tool contract。

## 2. 任务颗粒度

| 颗粒度 | 示例 | 是否推荐 |
| --- | --- | --- |
| 过大 | 一次生成完整 Novel Creator | 不推荐，难验证。 |
| 适中 | 实现 ChapterRepository + 单元测试 | 推荐。 |
| 适中 | 实现 RewriteTool 契约和 mock LLM 测试 | 推荐。 |
| 过小 | 只写一个按钮样式 | 可作为修复任务，不适合主流程。 |

## 3. 通用实现提示词

```text
你是该项目的实现 Agent。请严格遵守已定义的领域模型和阶段需求。
当前任务：【填写任务名】
所属阶段：【填写阶段】
输入文档：【列出相关规格】

请输出：
1. 设计说明：本任务涉及哪些实体、接口、状态。
2. 文件改动计划：新增/修改/删除文件。
3. 代码实现。
4. 测试代码。
5. 手动验收步骤。
6. 风险和降级方案。

约束：
- 不得绕过 Repository 直接写数据库。
- Agent 不得直接覆盖正文，只能返回 RevisionPatch 或建议。
- 所有异步任务必须有 running/succeeded/failed/cancelled 状态。
- 所有错误必须转成 AppError 或同类结构。
```

## 4. 修复提示词

```text
以下测试/现象失败：【粘贴失败信息】
请只修复与失败相关的最小范围。
要求：
1. 先解释根因。
2. 列出将修改的文件。
3. 保持既有接口兼容，若必须破坏兼容，说明迁移方案。
4. 补充回归测试。
5. 不要重写无关模块。
```

## 5. 代码审查提示词

```text
请审查以下改动是否符合 Novel Creator 阶段需求。
重点检查：
- 是否违反领域模型。
- 是否存在 Agent 静默写入正文。
- 是否缺少失败状态。
- 是否绕过 Repository。
- 是否导致移动端交互不可用。
- 是否缺少测试或迁移。
请按“必须修复 / 建议优化 / 可接受”分类输出。
```

## 6. 文档更新提示词

```text
根据本次实现结果更新需求文档。
要求：
- 只更新与实际实现相关的部分。
- 标记已实现、部分实现、未实现。
- 若实际实现偏离原需求，说明原因和影响。
- 更新验收测试矩阵。
```

## 7. 实施顺序建议

推荐顺序不是产品版本，而是依赖拓扑：
1. Domain model + serialization。
2. Repository + local storage。
3. Project workspace + chapter editor。
4. LLM provider settings + mock LLM。
5. Agent session + basic writing tools。
6. RevisionPatch + accept/reject。
7. Knowledge base。
8. Search module。
9. Snapshot/branch。
10. Export formats and responsive polish。

