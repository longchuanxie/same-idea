# AGENTS.md

本文件用于指导 LLM 编码代理、AI 编程助手或工程师代理在本项目中按统一流程开发。

项目目标：开发一款干净、准确、长期可用的纪念日 App。首期范围为 Flutter Android 主应用、Android 桌面小组件原生桥、Flutter Windows 桌面悬浮组件、本地优先数据、公历与中国农历支持、普通提醒、JSON 备份恢复。

当前工作区默认开发链路不依赖 Android SDK，也不依赖 Gradle；不要在基础检查、Windows 构建或日期核心任务中要求 Android SDK 或 Gradle。Android 平台壳和原生桥仅在 Android SDK 与设备矩阵可用时恢复，原生 Kotlin 桥接只在该阶段接入。

---

## 1. 必读上下文

开始任何任务前，必须先阅读并理解以下文件：

1. `anniversary_technical_design_v1_1.md`
2. `anniversary_task_breakdown_story_cards_v1_2.md`
3. `flutter_architecture_transition_v1.md`，如任务涉及架构、Flutter、Android 或 Windows
4. `anniversary_ui_prototype_fresh.html`，如任务涉及 UI
5. 当前被认领的故事卡片

若仓库中存在更新版本，以最新版本为准。

---

## 2. 首期范围边界

### 必做

- Android 主应用
- Android 桌面小组件
- Flutter Windows 桌面悬浮组件
- Flutter 本地数据库
- JSON 备份恢复
- Windows 导入 Android JSON
- 公历与中国农历日期支持
- 农历闰月、农历三十、除夕、春节年界、2 月 29 日处理
- 普通提醒
- 未来 5 年预览
- 日期回归测试
- Flutter Android/Flutter Windows 日期一致性测试

### 不做

- 云同步
- 账号登录
- 家庭共享
- 礼物商城
- 贺卡商城
- 复杂主题商城
- Windows Widgets Board
- Windows 完整编辑器
- iOS / Web / Mac
- V1.0 默认准点提醒

任何代码变更不得偷偷引入“不做”范围。

---

## 3. 工作流程

每次处理任务必须严格遵循以下流程：

```text
理解需求
  ↓
编码
  ↓
代码自查
  ↓
测试
  ↓
更新进度
```

---

## 4. 阶段一：理解需求

开始编码前，必须完成：

1. 找到对应故事卡片。
2. 读取卡片的变化、名称、详情、状态。
3. 检查依赖是否满足。
4. 对照技术设计文档确认架构边界。
5. 明确本次要修改的文件、模块和测试。
6. 明确本次不做的内容。

输出计划时使用以下格式：

```md
## 任务理解
- 故事卡片：<ID + 名称>
- 本次目标：
- 输入依据：
- 涉及模块：
- 依赖检查：
- 本次不做：
- 验收标准：
```

如果依赖未满足，将故事卡片状态更新为“阻塞”，不要强行编码。

---

## 5. 阶段二：编码

### 通用编码原则

1. 小步提交，避免一次修改过多模块。
2. 不在 UI 层写业务日期计算。
3. 不在小组件层直接查询复杂业务或执行农历计算。
4. 不用系统农历结果作为业务真值。
5. 不用网络接口实时换算农历。
6. 不只保存转换后的公历日期。
7. occurrence 可以缓存，但不能替代原始日期。
8. 所有 schema、枚举、状态值必须保持 Android 与 Windows 一致。
9. 不为了临时通过 UI 而绕过 CalendarEngine、OccurrenceGenerator、WidgetSnapshot、ReminderScheduler。

### 推荐模块边界

```text
Core Calendar Module
  ├── Date Model
  ├── Gregorian Calculator
  ├── Chinese Lunar Calculator
  ├── Occurrence Generator
  ├── Festival Resolver
  └── Display Formatter

Android App
  ├── Flutter UI
  ├── ViewModel
  ├── Local Database Repository
  ├── Reminder Scheduler
  ├── Widget Snapshot Generator
  ├── Android Native Widget Bridge
  └── Backup Manager

Windows Widget
  ├── Flutter Windows Floating Window
  ├── Native Tray Bridge
  ├── Local Store
  ├── Backup Importer
  ├── Dart Calendar Engine
  └── Settings Panel
```

---

## 6. 日期与农历硬性规则

这些规则不可违反：

1. 首期农历支持范围为 1901-2100。
2. 农历事件必须保存 `lunarYear`、`lunarMonth`、`lunarDay`、`isLeapMonth`。
3. 公历事件保存 `year`、`month`、`day`、`timezone`。
4. 农历日期计算基准使用内置 `calendar-runtime-rules-v1.json`。
5. `calendar-golden-1901-2100.json` 是日期回归测试资产。
6. `calendar-regression-scenarios-v1.json` 是业务 occurrence 回归测试资产。
7. Android 与 Windows 必须使用同一份规则数据和同一份回归场景。
8. 除夕按腊月最后一天计算，不能写死腊月三十。
9. 农历闰月必须显式处理，不能只靠月份数字。
10. 农历三十遇到小月必须按 `missingLunarDayPolicy` 处理。
11. 公历 2 月 29 日每年重复必须按 `leapDayPolicy` 处理。

---

## 7. Android 开发规则

1. 主应用首选 Dart / Flutter，Android 原生桥使用 Kotlin。
2. UI 使用 Flutter。
3. 本地数据库使用 Flutter 可用的 SQLite/Drift 类方案。
4. 异步使用 Future / Stream。
5. 普通提醒通过 Android 原生桥使用 WorkManager / Notification 组合。
6. Android 13+ 必须处理通知权限。
7. V1.0 不默认启用 Exact Alarm。
8. 小组件 Glance 优先，RemoteViews 兜底。
9. 小组件只读取 `WidgetSnapshot`。
10. 编辑事件后必须触发 occurrence cache、reminder、widget snapshot 刷新。

小组件数据流必须是：

```text
Local Event Store
  ↓
OccurrenceGenerator
  ↓
WidgetSnapshot
  ↓
Glance 或 RemoteViews Widget UI
```

禁止：

```text
Glance Widget UI → 直接农历计算
Glance Widget UI → 直接复杂查询主业务数据库
```

---

## 8. Windows 开发规则

1. 首期使用 Flutter Windows，必要系统能力通过 Windows 原生桥接。
2. 做桌面悬浮组件与托盘程序，不做 Windows Widgets Board。
3. Windows 不做完整编辑器。
4. Windows 数据来源为 Android 导出的 `anniversary-backup-v1.json`。
5. Windows 使用 Dart `CalendarEngine`。
6. Dart 日期核心必须加载同一份 `calendar-runtime-rules-v1.json`。
7. Windows 输出的 nextOccurrence 与未来 5 年预览必须与 Android 一致。
8. Flutter Windows 程序必须支持显示/隐藏、托盘、开机启动、手动刷新、深浅色。

---

## 9. 备份与协议规则

1. 备份文件使用 `anniversary-backup-v1.json`。
2. schema 文件使用 `anniversary-backup-v1.schema.json`。
3. 备份中必须包含 schemaVersion 与 calendarRulesVersion。
4. 恢复时必须保留原始日期类型。
5. 恢复后必须重新计算 occurrence，不得信任旧缓存。
6. Windows 导入失败必须给出可理解的错误原因。
7. 导入报告必须包含成功、跳过、失败数量。

---

## 10. 阶段三：代码自查

编码完成后，必须自查：

```md
## 代码自查
- 是否满足故事卡片详情：是/否
- 是否违反首期范围：是/否
- 是否保持模块边界：是/否
- 是否破坏日期模型：是/否
- 是否有 UI 层日期计算：是/否
- 是否有小组件直接业务计算：是/否
- 是否有测试覆盖：是/否
- 是否存在未处理异常：是/否
- 是否需要更新文档或故事卡片：是/否
```

发现问题必须先修复，再进入测试。

---

## 11. 阶段四：测试

根据任务类型运行对应测试。

### 日期任务必须运行

```text
CalendarEngine unit tests
calendar-golden-1901-2100 tests
calendar-regression-scenarios-v1 tests
round-trip tests
```

### Android 任务必须运行

```text
Unit tests
ViewModel tests
Local database migration tests
Flutter UI smoke tests
Reminder permission tests, if relevant
Widget snapshot tests, if relevant
```

### Windows 任务必须运行

```text
JSON import tests
Flutter Windows CalendarEngine tests
Flutter Android/Flutter Windows consistency tests
Flutter Windows smoke tests
Tray behavior tests, if relevant
```

### 备份任务必须运行

```text
Schema validation tests
Export/import tests
Restore/recompute occurrence tests
Cross-platform import tests
```

测试结果必须记录在进度更新中。

---

## 12. 阶段五：更新进度

每次完成任务后，必须更新故事卡片状态。

允许状态：

```text
待开始
进行中
代码自查
测试中
已完成
阻塞
后置
```

进度更新格式：

```md
## 进度更新
- 故事卡片：<ID + 名称>
- 状态变更：<旧状态> → <新状态>
- 本次完成：
- 修改文件：
- 测试结果：
- 风险/阻塞：
- 下一步：
```

如果任务未完全完成，不能标记为“已完成”。

---

## 13. 发布门禁

发布 V1.0 前必须全部通过：

1. `calendar-golden-1901-2100.json` 全量测试。
2. `calendar-regression-scenarios-v1.json` 全量测试。
3. Android / Windows occurrence 一致性测试。
4. Android 主流程验收。
5. Android 小组件跨日刷新测试。
6. Android 通知权限与普通提醒测试。
7. JSON 备份恢复测试。
8. Windows 导入与悬浮窗稳定性测试。
9. 深浅色与隐私模式测试。
10. P0/P1 缺陷清零。

任一日期核心测试失败，禁止发布。

---

## 14. LLM 行为约束

LLM 编码代理必须：

1. 先读文档，再写代码。
2. 先理解故事卡片，再拆实现步骤。
3. 先实现最小闭环，再扩展细节。
4. 每次改动后自查。
5. 每次自查后测试。
6. 每次测试后更新进度。
7. 遇到冲突时优先遵守技术设计文档。
8. 遇到日期相关不确定性时优先增加测试，不要猜。
9. 不得为了演示绕过数据模型。
10. 不得引入云同步、账号、商城、社交等后置范围。

---

## 15. 推荐单次任务响应模板

LLM 在执行一个故事卡片时，必须按以下结构回复：

```md
# 执行故事卡片 <ID>

## 任务理解
...

## 实现计划
...

## 编码结果
...

## 代码自查
...

## 测试结果
...

## 进度更新
...
```

---

## 16. 最重要的工程原则

```text
先把日期算准，再做界面；
先把本地闭环做好，再做同步；
先把小组件稳定，再做复杂装饰；
先用数据和测试保证一致，再谈跨端体验。
```
