# 纪念日 App 任务拆分文档：标准故事卡片版

版本：v1.2-story-cards  
更新日期：2026-06-19  
来源基线：`anniversary_technical_design_v1_1.md`、CTO 决策记录、v1.1 任务拆分文档  
范围：Flutter Android 主应用 + Android 桌面小组件原生桥 + Flutter Windows 桌面悬浮组件  
状态：已按 Flutter 主线更新“变化 / 名称 / 详情 / 状态”标准故事卡片

---

## 0. 文档目的

本文档将原任务拆分改造成标准故事卡片，便于项目管理系统、研发人员和 LLM 编码代理逐项执行。

每张故事卡片必须包含四个固定字段：

- **变化**：说明该卡片带来的项目变化，例如新增、实现、验证、后置、文档、发布门禁等。
- **名称**：故事卡片的简明标题，可作为 Jira / TAPD / 飞书任务标题。
- **详情**：包含任务范围、关键约束、输出物和验收标准。
- **状态**：当前执行状态。

---

## 1. 状态枚举

| 状态 | 含义 |
|---|---|
| 待开始 | 已纳入计划，但尚未编码或执行 |
| 进行中 | 正在开发或验证 |
| 代码自查 | 已完成编码，正在自查 |
| 测试中 | 已提交测试或正在运行自动化验证 |
| 已完成 | 已通过验收并合并 |
| 阻塞 | 存在依赖或技术问题，无法继续 |
| 后置 | 明确不进入 V1.0，进入后续版本 |

LLM 或工程师更新进度时，只允许使用上述状态值。

---

## 2. 里程碑顺序

```text
M0 技术预研
  ↓
M1 Android 核心数据与日期引擎
  ↓
M2 Android 主应用 UI
  ↓
M3 Android 提醒与小组件
  ↓
M4 备份恢复
  ↓
M5 Flutter Windows 桌面组件
  ↓
M6 稳定化与发布
```

强制门禁：

1. M0 未通过，不允许进入 UI 联调。
2. CalendarEngine 未通过回归测试，不允许接入小组件业务展示。
3. `anniversary-backup-v1.schema.json` 未冻结，不允许 Windows 主开发。
4. Flutter Android/Flutter Windows 日期一致性未通过，不允许发布 Windows 版本。
5. 任一日期核心测试失败，禁止发布。

---

## 3. 故事卡片清单

### M0-ARCH-001

- 变化：架构变更 / Flutter 主线冻结
- 名称：冻结 Flutter 主线架构
- 详情：将首期主线从 Android Compose + Windows WPF 调整为 Flutter Android 主应用 + Android 原生小组件/提醒桥 + Flutter Windows 桌面悬浮组件。输出物：`docs/flutter_architecture_transition_v1.md`，并同步更新技术设计与故事卡。验收：Flutter UI 不直接计算复杂农历日期；Android 小组件仍只读取 `WidgetSnapshot`；日期真值继续来自同一份规则数据、golden 与 regression scenarios；不引入云同步、账号、iOS/Web/Mac 等后置范围。
- 状态：已完成

### M0-CALENDAR-001

- 变化：新增 / CTO 决策落地
- 名称：确认农历数据源与授权边界
- 详情：确认首期采用 GB/T 33661-2017 规则基线 + 内置农历数据表，支持范围固定为 1901-2100；输出数据来源、授权可内置分发说明、版本命名 `lunar-rules-1.0.0`、超范围用户提示文案。验收：形成可归档确认记录 `docs/calendar_data_source_decision_v1.md`，后续可生成运行时规则数据。
- 状态：已完成

### M0-ENV-001

- 变化：环境治理 / 解除默认 Android SDK 依赖
- 名称：移除默认工程对 Android SDK 的硬依赖
- 详情：当前工作区保留 Flutter Windows 与共享 Dart 开发链路，移除生成的 `anniversary_app/android` 平台目录；默认 `flutter analyze`、`flutter test`、`flutter build windows`、日期核心门禁和备份 schema 校验均不得依赖 Android SDK。Android 主应用、小组件和提醒仍为产品目标，待有效 Android SDK 与设备矩阵可用后再通过 `flutter create --platforms=android .` 恢复 Android 平台壳并继续原生桥任务。
- 状态：已完成

### M0-ENV-002

- 变化：环境治理 / 解除默认 Gradle 依赖
- 名称：移除默认工程对 Gradle 的依赖
- 详情：移除旧 Kotlin/JVM `calendar-core` 预研模块、根目录 Gradle 构建入口和本地 Gradle/Kotlin 构建产物；默认日期门禁改为 Python 规则校验、JSON Schema 校验、Dart `calendar_core` analyze 与测试；CI 不再安装 Java 或执行 Gradle。Android 原生桥后续如需 Kotlin，仅在恢复 Android SDK 阶段作为平台桥接接入，不作为默认日期核心构建入口。
- 状态：已完成

### M0-CALENDAR-002

- 变化：新增 / 数据资产建设
- 名称：生成 calendar-runtime-rules-v1.json
- 详情：根据确认的数据源生成运行时规则数据，字段至少包含公历年、春节日期、闰月、每个农历月天数、是否闰月。输出物：`shared/calendar/calendar-runtime-rules-v1.json`、`shared/calendar/calendar-runtime-rules-v1.schema.json`、`tools/calendar/generate_runtime_rules.py`、`tools/calendar/validate_runtime_rules.py`。验收：JSON 可被 Android 与 Windows 解析；内置校验脚本通过；版本号、范围、来源、边界说明与 SHA-256 校验摘要完整。
- 状态：已完成

### M0-CALENDAR-003

- 变化：新增 / 测试资产建设
- 名称：生成 calendar-golden-1901-2100.json
- 详情：生成 1901-01-01 至 2100-12-31 每一天的公历农历映射 golden 数据。输出物：`shared/calendar/calendar-golden-1901-2100.json`、`shared/calendar/calendar-golden-1901-2100.schema.json`、`tools/calendar/generate_golden.py`、`tools/calendar/validate_golden.py`。验收：包含 gregorian、lunarYear、lunarMonth、lunarDay、isLeapMonth、lunarMonthDays、lunarDisplay；可用于双向转换与 round-trip 测试；内置校验与 JSON Schema 校验通过。
- 状态：已完成

### M0-CALENDAR-004

- 变化：新增 / 架构冻结
- 名称：冻结 CalendarEngine 接口
- 详情：定义纯业务日期引擎接口，不依赖 Android Context、Flutter UI、本地数据库、Windows UI。接口必须覆盖公历转农历、农历转公历、下次 occurrence、未来 N 年 occurrence、节日解析、异常策略处理。输出物：`shared/calendar/calendar-engine-contract-v1.md`、`shared/calendar/contracts/kotlin/CalendarEngine.kt`、`shared/calendar/contracts/csharp/ICalendarEngineAdapter.cs`；Flutter 主线后续补充 Dart 契约。验收：接口进入技术设计文档与代码仓库，Flutter Android/Flutter Windows 均按该语义实现。
- 状态：已完成

### M0-CALENDAR-005

- 变化：后置 / 历史路线
- 名称：实现 Android CalendarEngine 原型
- 详情：该卡片来自 Kotlin/JVM 预研路线。v1.2 Flutter 主线已改为 Dart `calendar_core` 作为唯一默认可执行日期核心；旧 `calendar-core` 预研模块与 Gradle 构建入口已移除。保留该卡用于追溯早期 Android 原型设计，后续 Android 原生桥如需 Kotlin 代码，仅作为平台桥接重新评估。
- 状态：后置

### M0-CALENDAR-006

- 变化：后置 / 历史路线
- 名称：实现 Windows C# CalendarEngineAdapter 原型
- 详情：该卡片来自 v1.1 WPF/.NET 路线。v1.2 Flutter 主线已改为 Windows 侧复用 Dart `calendar_core`，不再要求 V1.0 实现 C# CalendarEngineAdapter。保留该卡用于追溯早期跨语言契约设计，后续如恢复 .NET/WPF 路线再重新评估。
- 状态：后置

### M0-CALENDAR-008

- 变化：新增 / Flutter 技术预研
- 名称：实现 Dart CalendarEngine 原型
- 详情：在 Dart 侧加载同一份 `calendar-runtime-rules-v1.json`，完成公历转农历、农历转公历、下次纪念日、未来 5 年预览原型。输出物：`calendar_core` Dart package，包含模型、运行时规则引擎、公历策略、OccurrenceGenerator、农历显示格式化器与测试。验收：`dart test` 通过 `calendar-golden-1901-2100.json` 全量 round-trip 与 `calendar-regression-scenarios-v1.json` 全量业务场景；`dart analyze` 无问题；作为当前唯一默认可执行日期核心基线。
- 状态：已完成

### M0-CALENDAR-007

- 变化：新增 / 强制门禁
- 名称：建设 Flutter Android/Flutter Windows 日期一致性测试
- 详情：建立 Flutter 跨端一致性测试流程，对普通公历、普通农历、闰月、农历三十、除夕、春节前后、2 月 29 日、备份导入后重算进行校验。验收：任一用例失败即阻断合并。依赖：M0-CALENDAR-008 Dart CalendarEngine 原型。
- 状态：待开始

### M0-WIDGET-001

- 变化：新增 / 技术预研
- 名称：完成 Android Glance 小组件 Spike
- 详情：验证 2x2 单纪念日、4x2 最近纪念日、2x2 已过天数小组件在 Android 10-15、主流厂商桌面、深浅色、省电模式下的基础显示和刷新。验收：确认 Glance 可作为主路线；记录需要 RemoteViews 兜底的场景。阻塞原因：当前环境未发现有效 Android SDK、`adb` 或 `sdkmanager`，且无可用 Android 10-15 设备/模拟器矩阵。
- 状态：阻塞

### M0-REMINDER-001

- 变化：新增 / 技术预研
- 名称：完成 Android 通知与普通提醒 Spike
- 详情：验证通知权限、WorkManager、系统重启后恢复调度、App 启动校准能力；明确 V1.0 不默认启用精确提醒。验收：形成提醒可靠性说明和权限降级策略。阻塞原因：当前环境未发现有效 Android SDK、`adb` 或 `sdkmanager`，无法验证通知权限、WorkManager、重启恢复和设备省电策略。
- 状态：阻塞

### M0-WINDOWS-001

- 变化：新增 / 技术预研
- 名称：完成 Flutter Windows 悬浮窗与托盘 Spike
- 详情：验证 Flutter Windows 桌面悬浮窗、透明背景、置顶、托盘显示/隐藏、开机启动、JSON 本地读取，以及必要 Windows 原生桥接能力。验收：确认首期 Windows 不做 Widgets Board，Flutter Windows 可满足轻量桌面组件目标；记录托盘、置顶、开机启动需要的插件或平台桥。
- 状态：待开始

### M1-DATA-001

- 变化：实现 / 数据地基
- 名称：创建 Flutter 本地数据库
- 详情：建立 Event、Reminder、WidgetConfig、OccurrenceCache、WidgetSnapshot 表与 DAO/Repository；支持新增、编辑、删除、查询、归档、置顶。验收：数据库 migration 基线完成，单元测试覆盖 CRUD 与基础查询；字段语义与备份 schema、Android 原生小组件快照保持一致。
- 状态：待开始

### M1-DATA-002

- 变化：实现 / 核心模型
- 名称：实现 AnniversaryEvent 领域模型
- 详情：模型必须区分原始日期、occurrence 日期、reminder 日期、display 文案；农历日期必须保存 lunarYear、lunarMonth、lunarDay、isLeapMonth。输出物：`calendar_core/lib/src/models.dart`。验收：禁止出现只保存转换后公历日期的业务模型；Dart 测试覆盖闰月原始载荷保留、payload 类型约束、occurrence/reminder/display 分离。
- 状态：已完成

### M1-DATA-003

- 变化：实现 / 日期载荷
- 名称：实现 GregorianDatePayload 与 LunarDatePayload
- 详情：公历载荷包含 year/month/day/timezone；农历载荷包含 lunarYear/lunarMonth/lunarDay/isLeapMonth/timezoneBasis。已完成：`DatePayload`、`GregorianDatePayload`、`LunarDatePayload` 增加稳定 JSON 序列化契约，`DatePayloadJsonTest` 覆盖公历与农历闰月反序列化。阻塞原因：Flutter 本地数据库尚未创建，持久化验收迁移到 M1-DATA-001 完成后继续。
- 状态：阻塞

### M1-DATA-004

- 变化：实现 / 重复规则
- 名称：实现 RepeatRule 与异常策略枚举
- 详情：支持 NONE、YEARLY；支持 2 月 29 日策略、农历缺失日策略、闰月策略。输出物：`RepeatRule`、`LeapDayPolicy`、`MissingLunarDayPolicy`、`LeapMonthPolicy`、`RepeatRulePolicy`。验收：策略默认值符合 CTO 决策；`RepeatRulePolicyTest` 覆盖 2 月 29 日、农历三十、小月、闰月、普通日期与 NONE 重复规则。
- 状态：已完成

### M1-CALENDAR-001

- 变化：实现 / 日期引擎
- 名称：实现 GregorianCalculator
- 详情：处理公历日期合法性、2 月 29 日、年度 occurrence、周年计算、天数差计算。输出物：`calendar_core/lib/src/gregorian_calculator.dart`。验收：Dart 测试覆盖普通公历、闰年、2 月 29 日策略、next occurrence、周年与天数差。
- 状态：已完成

### M1-CALENDAR-002

- 变化：实现 / 日期引擎
- 名称：实现 ChineseLunarCalculator
- 详情：基于内置农历数据表实现农历转公历、公历转农历、闰月识别、大小月识别、春节年界。输出物：`calendar_core/lib/src/runtime_rules_calendar_engine.dart`。验收：Dart 测试覆盖 calendar-golden 全量双向转换、闰月识别、大小月识别与春节年界。
- 状态：已完成

### M1-CALENDAR-003

- 变化：实现 / 业务核心
- 名称：实现 OccurrenceGenerator
- 详情：根据事件原始日期和重复规则生成 nextOccurrence 与未来 5 年预览；处理 2 月 29 日、农历闰月、农历三十、除夕。输出物：`calendar_core/lib/src/occurrence_generator.dart`，`RuntimeRulesCalendarEngine` 已委托 occurrence 入口。验收：Dart `runtime_rules_calendar_engine_test.dart` 通过 `calendar-regression-scenarios-v1.json` 全量 122 条场景。
- 状态：已完成

### M1-CALENDAR-004

- 变化：实现 / 展示能力
- 名称：实现 FestivalResolver
- 详情：识别春节、元宵、端午、七夕、中秋、重阳、腊八、小年、除夕等常见传统节日；除夕按腊月最后一天计算。输出物：`calendar_core/lib/src/festival_resolver.dart`。验收：Dart 测试覆盖核心传统节日、小年、除夕按腊月最后一天、闰月不解析节日；全量 occurrence 测试仍通过。
- 状态：待开始

### M1-CALENDAR-005

- 变化：实现 / 显示能力
- 名称：实现 DateDisplayFormatter
- 详情：生成用户可理解的公历、农历、闰月、双日期、未来预览文案；不得暴露 occurrence cache 等技术术语。输出物：`calendar_core/lib/src/date_display_formatter.dart`。验收：Dart 测试覆盖公历、农历、闰月、双日期、状态文案、未来预览，文案不暴露 occurrence cache 术语。
- 状态：已完成

### M1-CACHE-001

- 变化：实现 / 性能优化
- 名称：实现 OccurrenceCache
- 详情：缓存未来 occurrence 结果，但缓存不得替代原始日期；事件编辑、规则变更、数据版本变更时缓存失效。输出物：Flutter 本地数据库中的 `occurrence_cache` 表与对应 Repository。验收：Dart/Flutter 测试覆盖缓存命中、事件更新时间失效、engine/rule 版本失效、单事件失效；缓存条目只保存 occurrence 结果和版本信息，不替代原始日期。
- 状态：待开始

### M1-TEST-001

- 变化：新增 / 门禁
- 名称：接入日期单元测试与 CI
- 详情：将 golden、scenario、round-trip、一致性测试纳入 CI。已完成：`tools/calendar/run_calendar_checks.py` 串联 runtime rules 校验、golden 校验、3 份 JSON Schema 校验、Dart `calendar_core` analyze 与测试；`.github/workflows/calendar-core.yml` 接入无 Android SDK、无 Gradle 的 calendar core CI。阻塞原因：平台级 Flutter Android/Flutter Windows 一致性测试仍依赖后续 Flutter Android App 与 Flutter Windows 壳工程，暂不能完成完整跨端门禁。
- 状态：阻塞

### M2-UI-001

- 变化：实现 / Flutter UI
- 名称：搭建 Flutter 应用框架
- 详情：建立 Flutter 工程、主题、导航、页面骨架、状态管理、Repository 注入；视觉方向遵循年轻、清新、轻量。已完成：`anniversary_app` Flutter 工程，包含首页、新增、详情、设置路由，接入本地 `calendar_core` 生成种子纪念日与未来预览；Windows debug 构建通过。验收：首页、新增、详情、设置路由可跳转；Android 与 Windows 可共享非平台 UI/领域代码。
- 状态：已完成

### M2-UI-002

- 变化：实现 / 首页
- 名称：实现首页最近纪念日列表
- 详情：展示今日、即将到来、已过、置顶事件；每条展示名称、主数字、原始日期、本年对应日期。验收：排序规则正确，空状态文案符合产品定位。
- 状态：待开始

### M2-UI-003

- 变化：实现 / 新增流程
- 名称：实现新增纪念日页面
- 详情：支持名称、日期类型、公历/农历选择器、重复规则、提醒、分类、备注；保存前展示今年对应日期。已完成：新增页从静态原型改为可交互页面；支持名称输入、公历/农历切换、重复规则选择、未来日期预览和保存；Windows 版保存会写入本地 `anniversary-backup-v1.cache.json`，重启后可读取。待完成：提醒、分类、备注、编辑已有事件与删除流程。验收：普通新增流程 30 秒内可完成。
- 状态：进行中

### M2-UI-004

- 变化：实现 / 日期选择
- 名称：实现公历日期选择器
- 详情：支持年月日选择，处理 2 月 29 日每年重复时的策略提示。已完成：接入 Flutter 公历 DatePicker，范围限制为 CalendarEngine 支持的 1901-2100，并使用 `calendar_core` 生成预览。待完成：2 月 29 日策略选择与保存。验收：非闰年策略选项正确保存。
- 状态：进行中

### M2-UI-005

- 变化：实现 / 日期选择
- 名称：实现农历日期选择器
- 详情：支持农历年、月份、日期、闰月显示；闰月只在对应年份存在时出现。已完成：农历年/月/日下拉选择，闰月选项只在对应年份出现，农历日按当月天数动态收敛，并使用 `calendar_core` 生成预览。待完成：更完整的农历年份展示文案和特殊策略保存。验收：农历闰月与普通月份显示不混淆。
- 状态：进行中

### M2-UI-006

- 变化：实现 / 异常交互
- 名称：实现特殊日期策略弹层
- 详情：仅在用户选择闰月、农历三十、2 月 29 日等特殊日期时出现策略选择；普通日期不打扰用户。验收：特殊策略保存到 RepeatRule。
- 状态：待开始

### M2-UI-007

- 变化：实现 / 详情页
- 名称：实现纪念日详情页
- 详情：展示主数字、原始日期、今年对应日期、下次日期、未来 5 年预览、提醒规则、备注、编辑入口。验收：农历生日预览正确并增强用户信任。
- 状态：待开始

### M2-UI-008

- 变化：实现 / 编辑删除
- 名称：实现编辑与删除流程
- 详情：支持修改事件所有字段、删除确认、归档/恢复可选。验收：编辑后 occurrence cache、提醒、小组件快照触发刷新。
- 状态：待开始

### M2-UI-009

- 变化：实现 / 设置页
- 名称：实现设置页面
- 详情：包含通知设置、小组件设置、数据备份、数据恢复、隐私保护、外观模式、关于。验收：入口完整，后置功能不可误导用户。
- 状态：进行中

### M2-UI-010

- 变化：实现 / 视觉统一
- 名称：实现年轻清新主题系统
- 详情：落地低饱和薄荷绿、晴空蓝、蜜桃粉、柔和卡片、清晰大数字、深浅色模式。验收：与 HTML 原型风格一致，长期观看不疲劳。
- 状态：待开始

### M2-UI-011

- 变化：实现 / 可访问性
- 名称：实现基础无障碍支持
- 详情：支持系统字体、深色模式、内容描述、非颜色唯一信息表达。验收：主要页面可被屏幕阅读器理解。
- 状态：待开始

### M3-REMINDER-001

- 变化：实现 / 提醒
- 名称：实现通知权限检测与引导
- 详情：Android 13+ 检查 POST_NOTIFICATIONS；未授权时给出提醒风险提示，不阻断记录纪念日。验收：授权、拒绝、关闭权限场景均有明确状态。
- 状态：待开始

### M3-REMINDER-002

- 变化：实现 / 提醒
- 名称：实现普通提醒调度
- 详情：使用 WorkManager/非精确调度实现当天提醒与提前提醒；不承诺绝对准点。验收：提醒日期正确，系统限制文案清晰。
- 状态：待开始

### M3-REMINDER-003

- 变化：实现 / 提醒
- 名称：实现系统重启后恢复调度
- 详情：监听系统重启，重建未来提醒任务。验收：重启后打开 App 与后台恢复均不会丢失提醒计划。
- 状态：待开始

### M3-REMINDER-004

- 变化：实现 / 提醒
- 名称：实现 App 启动提醒校准
- 详情：每次启动检查未来提醒、权限状态、缓存状态并修正异常。验收：修改系统时间/跨日后能校准。
- 状态：待开始

### M3-REMINDER-005

- 变化：后置 / 精确提醒
- 名称：预留准点提醒 P1/Beta 入口
- 详情：代码结构预留 Exact Alarm 能力，但 V1.0 默认不启用；不得在主界面承诺准点。验收：P1 任务明确后置，不影响 V1.0 发布。
- 状态：后置

### M3-WIDGET-001

- 变化：实现 / 小组件数据
- 名称：实现 WidgetSnapshot 生成器
- 详情：从 Event + OccurrenceGenerator 生成小组件只读快照；小组件不得直接计算农历或查询复杂业务。验收：快照字段满足 3 类小组件展示。
- 状态：待开始

### M3-WIDGET-002

- 变化：实现 / Android 小组件
- 名称：实现单个纪念日 2x2 小组件
- 详情：展示名称、主数字、原始日期或隐私文案，点击进入详情。验收：跨日刷新、编辑后刷新、深浅色显示通过。
- 状态：待开始

### M3-WIDGET-003

- 变化：实现 / Android 小组件
- 名称：实现最近纪念日 4x2 小组件
- 详情：展示最近 3 个纪念日，按 nextOccurrence 排序。验收：无数据、隐私模式、深色模式、日期刷新正确。
- 状态：待开始

### M3-WIDGET-004

- 变化：实现 / Android 小组件
- 名称：实现已过天数 2x2 小组件
- 详情：适用于恋爱、出生、习惯等已过天数场景，支持包含起始日计数规则。验收：主数字与详情页一致。
- 状态：待开始

### M3-WIDGET-005

- 变化：实现 / 小组件刷新
- 名称：实现小组件刷新调度
- 详情：事件变更、零点跨日、App 启动、主题变更后刷新 WidgetSnapshot 与 Glance UI。验收：编辑后 5 秒内刷新，零点后首次打开校准成功。
- 状态：待开始

### M3-WIDGET-006

- 变化：实现 / 隐私
- 名称：实现小组件隐私模式
- 详情：支持普通模式、重要日子模式、极简天数模式。验收：隐私模式不泄露事件名称。
- 状态：待开始

### M3-WIDGET-007

- 变化：验证 / 兼容性
- 名称：执行 Android 小组件兼容测试
- 详情：覆盖 Android 10-15、主流厂商桌面、深浅色、省电模式。验收：关键机型显示正确率 100%，异常记录到兼容性报告。
- 状态：待开始

### M4-BACKUP-001

- 变化：实现 / 数据协议
- 名称：冻结 anniversary-backup-v1.schema.json
- 详情：定义备份 schema，包含 event、datePayload、repeatRule、reminderRule、displayRule、schemaVersion、calendarRuleVersion。输出物：`shared/backup/anniversary-backup-v1.schema.json`、`shared/backup/examples/anniversary-backup-v1.example.json`、`tools/backup/validate_backup_schema.py`。验收：示例备份通过 schema 校验；schema 保留原始日期类型与 `isLeapMonth`，Android 与 Windows 后续均使用该 schema。
- 状态：已完成

### M4-BACKUP-002

- 变化：实现 / Android 备份
- 名称：实现 JSON 导出
- 详情：将本地纪念日、提醒、分类、备注、显示规则导出为 anniversary-backup-v1.json。验收：导出文件可通过 schema 校验，包含版本信息。
- 状态：待开始

### M4-BACKUP-003

- 变化：实现 / Android 恢复
- 名称：实现 JSON 导入与恢复
- 详情：支持从备份恢复数据，处理重复 ID、版本兼容、部分失败报告。验收：导入后日期重新计算正确，原始日期类型不丢失。
- 状态：待开始

### M4-BACKUP-004

- 变化：实现 / 导入报告
- 名称：实现备份导入报告
- 详情：展示导入成功数量、跳过数量、失败原因、版本警告。验收：用户可理解导入结果。
- 状态：待开始

### M4-BACKUP-005

- 变化：测试 / 协议稳定
- 名称：备份恢复回归测试
- 详情：覆盖公历、农历、闰月、农历三十、提醒、隐私模式、小组件设置。验收：导出→清空→恢复→重算结果一致。
- 状态：待开始

### M4-BACKUP-006

- 变化：文档 / 跨端协作
- 名称：更新 Windows 导入协议说明
- 详情：将 schema、字段含义、兼容策略、错误码写入技术文档。验收：Windows 工程师可独立实现导入。
- 状态：待开始

### M5-WIN-001

- 变化：实现 / Windows 基础
- 名称：创建 Flutter Windows 桌面组件项目
- 详情：建立 Flutter Windows 工程、托盘桥、单实例、日志、配置、本地数据目录。验收：应用可启动、退出、托盘显示正常；必要 Windows 系统能力通过插件或平台桥封装。
- 状态：待开始

### M5-WIN-002

- 变化：实现 / Windows 数据
- 名称：实现 Android JSON 备份导入
- 详情：读取 anniversary-backup-v1.json，校验 schemaVersion 与 calendarRuleVersion，保留原始公历/农历日期载荷，导入到 Windows 本地缓存，并使用 Dart `calendar_core` 重新计算 nextOccurrence 与未来预览。已完成：`BackupImporter`、`WindowsAnniversaryRepository`、默认 `%APPDATA%/SameIdeaDays/anniversary-backup-v1.cache.json` 缓存、`--import=<path>` 启动参数、导入报告单元测试。验收：导入报告准确，异常文件有清晰错误；示例备份导入后日期由同一份规则数据重算。
- 状态：已完成

### M5-WIN-003

- 变化：实现 / Windows 日期
- 名称：接入 Dart CalendarEngine
- 详情：Flutter Windows 侧接入 Dart `calendar_core`，基于同一份 `calendar-runtime-rules-v1.json` 计算日期。验收：通过与 Flutter Android 相同的 regression scenarios。
- 状态：待开始

### M5-WIN-004

- 变化：实现 / Windows UI
- 名称：实现最近纪念日悬浮卡片
- 详情：展示最近 3 个纪念日，支持清新轻量视觉、深浅色、透明背景。已完成：新增 Flutter Windows 专用首页 `WindowsHomeScreen`，以桌面悬浮卡片样式展示最近 3 个纪念日；Windows runner 初始窗口调整为 520x540 桌面组件尺寸；新增窄窗口 widget smoke test。待完成：原生透明/置顶窗口能力和长时间不闪烁验证需在 Windows 平台桥与稳定性测试中继续完成。验收：桌面长期显示不遮挡、不闪烁。
- 状态：进行中

### M5-WIN-005

- 变化：实现 / Windows UI
- 名称：实现单个纪念日卡片
- 详情：支持固定展示一个纪念日，显示主数字、原始日期、下次日期。验收：与 Android 详情页数值一致。
- 状态：待开始

### M5-WIN-006

- 变化：实现 / Windows 行为
- 名称：实现托盘菜单
- 详情：支持显示/隐藏、导入数据、刷新、设置、退出。已完成：Win32 原生托盘图标与右键菜单；菜单支持 Show/Hide、Import backup、Refresh、Settings、Exit；Import backup 通过系统文件选择器把 JSON 路径传给 Dart `BackupImporter`；Refresh 会重新加载 Windows 本地缓存；Settings 会打开 Flutter 设置页；Exit 前会删除托盘图标并销毁窗口。待完成：真实桌面环境下的托盘点击、隐藏恢复、退出资源释放与多轮导入稳定性验收。验收：托盘交互稳定，退出后资源释放。
- 状态：进行中

### M5-WIN-007

- 变化：实现 / Windows 设置
- 名称：实现开机启动、置顶、透明度、字号设置
- 详情：提供轻量设置面板，保存到本地配置。已完成：新增 `%APPDATA%/SameIdeaDays/windows-settings-v1.json` 本地配置；设置页支持窗口置顶、开机启动、透明度、字号；Dart 设置变更通过 MethodChannel 应用到 Win32 runner；原生层已实现 `SetWindowPos` 置顶、`SetLayeredWindowAttributes` 透明度、HKCU Run 注册表开机启动；新增设置存储单元测试。待完成：真实 Windows 登录重启后配置保持与开机启动行为验证。验收：重启后设置保持。
- 状态：进行中

### M5-WIN-008

- 变化：验证 / 一致性
- 名称：执行 Flutter Android/Flutter Windows 数据一致性测试
- 详情：使用同一份备份文件比较 nextOccurrence、futureOccurrences、display 文案。验收：核心日期结果必须完全一致。
- 状态：待开始

### M5-WIN-009

- 变化：验证 / 稳定性
- 名称：执行 Windows 长时间运行测试
- 详情：验证内存、CPU、悬浮窗稳定性、重启恢复。验收：长时间运行无明显资源异常。
- 状态：待开始

### M6-QA-001

- 变化：测试 / 发布门禁
- 名称：执行日期全量回归测试
- 详情：运行 calendar-golden-1901-2100、calendar-regression-scenarios-v1、round-trip、跨端一致性测试。验收：零失败。
- 状态：待开始

### M6-QA-002

- 变化：测试 / Android
- 名称：执行 Android 主流程验收
- 详情：覆盖新增、编辑、删除、公历、农历、详情预览、提醒、备份恢复、深浅色、隐私。验收：P0 缺陷清零。
- 状态：待开始

### M6-QA-003

- 变化：测试 / 小组件
- 名称：执行 Android 小组件发布验收
- 详情：覆盖 3 类小组件、跨日刷新、编辑刷新、深色模式、隐私模式、厂商桌面兼容。验收：关键机型通过。
- 状态：待开始

### M6-QA-004

- 变化：测试 / Windows
- 名称：执行 Windows 发布验收
- 详情：覆盖 JSON 导入、悬浮窗、托盘、设置、重启、长时间运行、一致性。验收：P0/P1 缺陷清零。
- 状态：待开始

### M6-QA-005

- 变化：测试 / 性能
- 名称：执行性能与资源占用测试
- 详情：Android 首页、详情、小组件刷新、Windows 常驻内存与 CPU 均需达标。验收：无明显卡顿和耗电异常。
- 状态：待开始

### M6-DOC-001

- 变化：文档 / 发布
- 名称：更新用户侧说明与技术发布说明
- 详情：说明农历支持范围、提醒权限、备份恢复、Windows 导入方式、已知限制。验收：发布前文档可直接使用。
- 状态：待开始

### M6-RELEASE-001

- 变化：发布 / 冻结
- 名称：执行 V1.0 发布门禁评审
- 详情：由 CTO/产品/测试共同确认日期、提醒、小组件、备份、Windows 一致性门禁通过。验收：形成发布确认记录。
- 状态：待开始

### P1-REMINDER-001

- 变化：后置 / 高级能力
- 名称：实现准点提醒高级开关
- 详情：基于 Exact Alarm 权限实现准点提醒，需用户主动开启并授权；权限关闭时自动降级。
- 状态：后置

### P1-SYNC-001

- 变化：后置 / 云能力
- 名称：设计可选云同步
- 详情：账号、加密、冲突合并、删除同步、隐私合规全部进入后续版本，不进入 V1.0。
- 状态：后置

### P1-WIN-001

- 变化：后置 / Windows
- 名称：评估 WinUI 3 或完整 Windows 客户端
- 详情：V1.0 仅 Flutter Windows 悬浮组件；完整编辑器与更深 Windows 原生能力后续评估。
- 状态：后置

### P1-FAMILY-001

- 变化：后置 / 协作
- 名称：设计家庭共享能力
- 详情：家庭成员、权限、共享提醒、冲突处理后续评估。
- 状态：后置

### P1-THEME-001

- 变化：后置 / 视觉
- 名称：扩展主题与节气玩法
- 详情：保持首版克制，不做主题商城；后续可增加节气提醒和更多主题。
- 状态：后置


---

## 4. 执行规则

1. 每次开发只认领一张故事卡片，除非任务之间明确可并行。
2. 编码前必须阅读技术设计文档和当前故事卡片。
3. 编码后必须进行代码自查，并将状态更新为“代码自查”。
4. 测试通过后才能更新为“已完成”。
5. 发现需求不清、依赖缺失或测试失败，应更新为“阻塞”，并在详情中补充阻塞原因。
6. 后置任务不得在 V1.0 中偷偷实现，避免范围失控。

---

## 本次执行记录：Windows 当前日期与设置菜单可用性修复

## 任务理解
- 故事卡片：M5-WIN-006 托盘菜单、M5-WIN-007 Windows 设置、M2-UI-009 设置页面、M6-QA-004 Windows 发布验收
- 本次目标：修复 Windows 版默认 today 仍停留在原型日期的问题；移除或改造设置页中不可用的菜单入口；让 Windows 版可从设置页打开数据目录、导入 Android 备份并刷新本地缓存。
- 输入依据：用户反馈 Windows 当前时间计算错误、多个菜单不可用；技术设计第 12 章 Windows 组件必须支持托盘、手动刷新、本地缓存、开机启动与设置面板。
- 涉及模块：Flutter Windows App、WindowsAnniversaryRepository、SeedAnniversaryRepository、EventEditScreen、SettingsScreen、Win32 runner MethodChannel、Flutter widget/unit tests。
- 依赖检查：Dart CalendarEngine、备份 schema、Windows 原生托盘桥均已存在；不依赖 Android SDK 或 Gradle。
- 本次不做：不实现 Android 通知提醒、不实现 Android 小组件隐私模式、不引入云同步/账号/商城、不扩展 Windows 完整编辑器。
- 验收标准：默认 today 使用本机当前本地日期；新增页不再使用硬编码日期；Windows 设置页入口可执行或不再展示为可点击；导入备份可从设置页触发原生文件选择器；自动化测试通过。

## 代码自查
- 是否满足故事卡片详情：是，覆盖 Windows 手动刷新、导入、设置面板可用性。
- 是否违反首期范围：否。
- 是否保持模块边界：是，日期仍由 CalendarEngine/Repository 负责。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否，仅使用 repository.today 和 CalendarEngine 转换初始化输入。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增默认 today 回归测试并更新设置页/新增页 widget 测试。
- 是否存在未处理异常：否，导入仍走现有 BackupImportException/PlatformException 流程。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M5-WIN-006 托盘菜单、M5-WIN-007 Windows 设置、M2-UI-009 设置页面、M6-QA-004 Windows 发布验收
- 状态变更：进行中 → 进行中
- 本次完成：修复默认当前日期硬编码；新增当前日期工具；新增页按 today 初始化公历/农历日期；Windows 设置页改为本地数据目录、导入 Android 备份、刷新数据和桌面组件设置；Win32 runner 增加 `pickBackupFile` 方法；测试断言去除原型日期依赖。
- 修改文件：`anniversary_app/lib/src/data/app_clock.dart`、`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/lib/src/app/anniversary_app.dart`、`anniversary_app/lib/src/features/settings/settings_screen.dart`、`anniversary_app/windows/runner/flutter_window.cpp`、`anniversary_app/test/widget_test.dart`、`anniversary_app/test/backup_importer_test.dart`
- 测试结果：`flutter analyze` 通过；`flutter test` 通过；`python tools/backup/validate_backup_schema.py` 通过；`python tools/calendar/run_calendar_checks.py` 通过；`flutter build windows --debug` 因正在运行的 `anniversary_app.exe` 占用输出文件而在链接阶段被阻塞。
- 风险/阻塞：Windows debug exe 当前被进程锁定，需要退出正在运行的应用后重跑构建验证。
- 下一步：关闭正在运行的 Windows 应用后重跑 `flutter build windows --debug`；继续补 Windows 详情页按选中事件展示和编辑/删除闭环。

---

## 本次执行记录：硬编码巡检与修复

## 任务理解
- 故事卡片：M2-UI-003 新增纪念日页面、M5-WIN-002 Android JSON 备份导入、M5-WIN-004 Windows 最近纪念日悬浮卡片、M5-WIN-007 Windows 设置、M6-QA-004 Windows 发布验收
- 本次目标：检查产品代码中是否仍存在原型日期、原型事件、伪造提醒、固定规则范围等硬编码，并修复会影响真实可用性的项目。
- 输入依据：用户要求继续检查硬编码；上一轮已修复 `today` 固定为 2026-09-06 的问题。
- 涉及模块：Flutter 首页/Windows 首页/新增页/详情页、Windows repository、Dart CalendarEngine、OccurrenceGenerator、Flutter 与 calendar_core 测试。
- 依赖检查：Dart CalendarEngine、备份 schema 与 Windows 本地缓存已存在；不依赖 Android SDK 或 Gradle。
- 本次不做：不移除测试夹具、golden/regression 数据、示例备份和文档原型中的固定日期；不实现 Android 提醒或小组件。
- 验收标准：产品运行路径不再展示 seed 演示数据；新增页不预填“妈妈生日”；详情页不展示未接入的假提醒；年份范围来自规则数据；日期引擎版本不再标记 prototype。

## 代码自查
- 是否满足故事卡片详情：是。
- 是否违反首期范围：否。
- 是否保持模块边界：是。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增空仓库与新增页标题回归测试。
- 是否存在未处理异常：否。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-003、M5-WIN-002、M5-WIN-004、M5-WIN-007、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：移除 Windows 空数据时回退 seed 演示事件；新增首页和 Windows 悬浮窗空状态；新增页标题默认改为空；农历年份选择范围改为读取 CalendarEngine supportedRange；详情页提醒改为“暂未启用”；日期引擎版本改为 `calendar-engine-dart-1.0.0`；农历缺失日 next-month 策略沿用事件 timezoneBasis；引擎闰月范围判断改为基于规则数据。
- 修改文件：`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/lib/src/features/home/home_screen.dart`、`anniversary_app/lib/src/features/windows/windows_home_screen.dart`、`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/lib/src/features/detail/event_detail_screen.dart`、`calendar_core/lib/src/runtime_rules_calendar_engine.dart`、`calendar_core/lib/src/occurrence_generator.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`flutter analyze` 通过；`flutter test` 通过；`dart analyze` 和 `dart test` in `calendar_core` 通过；`python tools/calendar/run_calendar_checks.py` 通过；`python tools/backup/validate_backup_schema.py` 通过。
- 风险/阻塞：`SeedAnniversaryRepository` 中仍保留演示事件，作为开发/测试 seed 使用；真实 Windows repository 已不再回退到它。Windows debug exe 仍有运行中进程占用，构建验证需退出应用后执行。
- 下一步：继续清理详情页按选中事件展示、编辑已有事件、删除/归档与导入结果提示。

---

## 本次执行记录：修复小卡片详情路由

## 任务理解
- 故事卡片：M2-UI-007 纪念日详情页、M5-WIN-004 Windows 最近纪念日悬浮卡片、M6-QA-004 Windows 发布验收
- 本次目标：修复点击任意最近纪念日小卡片都进入第一个事件详情的问题。
- 输入依据：用户反馈 Windows 悬浮窗中点击不同小卡片仍显示第一个卡片详情。
- 涉及模块：Flutter HomeScreen、WindowsHomeScreen、EventDetailScreen、Widget tests。
- 依赖检查：详情页与列表预览均已有稳定 event id；无需变更日期核心或备份协议。
- 本次不做：不实现编辑已有事件、删除、归档；不调整详情页完整字段设计。
- 验收标准：点击任意小卡片时，详情页展示对应事件而不是默认第一个事件；无参数路由仍可回退到第一个事件。

## 代码自查
- 是否满足故事卡片详情：是。
- 是否违反首期范围：否。
- 是否保持模块边界：是。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增小卡片进入对应详情的 widget 回归测试。
- 是否存在未处理异常：否，详情页对空列表提供兜底文案。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-007、M5-WIN-004、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：首页与 Windows 悬浮窗小卡片点击时传递 `preview.id`；详情页根据路由参数查找对应 preview；无参数或 id 不存在时回退到第一个 preview；空列表时显示不可查看提示；新增回归测试覆盖点击 `宝宝生日` 后详情页不再显示 `妈妈生日`。
- 修改文件：`anniversary_app/lib/src/features/home/home_screen.dart`、`anniversary_app/lib/src/features/windows/windows_home_screen.dart`、`anniversary_app/lib/src/features/detail/event_detail_screen.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`flutter analyze` 通过；`flutter test` 通过；`python tools/backup/validate_backup_schema.py` 通过。
- 风险/阻塞：Windows debug exe 仍有运行中进程占用，构建验证需退出应用后执行。
- 下一步：补详情页编辑已有事件、删除/归档，以及导入结果提示。

---

## 本次执行记录：设置页可用性复查与修复

## 任务理解
- 故事卡片：M2-UI-009 设置页面、M5-WIN-006 托盘菜单、M5-WIN-007 Windows 设置、M6-QA-004 Windows 发布验收
- 本次目标：检查设置页是否仍存在“带箭头但不可用”、Windows 混入 Android 功能、操作无反馈、实现不正确等类似问题。
- 输入依据：用户反馈设置页全是不能用或实现不正确，截图显示 Android 通知/小组件/备份/恢复/外观入口与 Windows 桌面组件混在同一页。
- 涉及模块：SettingsScreen、AnniversaryApp Windows MethodChannel、Win32 runner、Widget tests。
- 依赖检查：Windows 设置存储、托盘 MethodChannel、备份导入、刷新缓存已存在；无需 Android SDK 或 Gradle。
- 本次不做：不实现 Android 通知提醒、小组件隐私模式、Android 备份导出和完整外观设置；这些不应在 Windows 页面误导展示。
- 验收标准：Windows 设置页只展示可用 Windows 入口；可点入口必须有真实 action；刷新/打开目录/导入备份有反馈；取消导入不提示成功；导入完成显示成功/跳过/失败数量；测试覆盖防回退。

## 代码自查
- 是否满足故事卡片详情：是。
- 是否违反首期范围：否。
- 是否保持模块边界：是。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，覆盖 Windows 设置页不显示 Android 未接入口、仅 3 个可点数据入口有箭头、操作反馈。
- 是否存在未处理异常：否，导入失败会显示错误消息并返回 PlatformException。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-009、M5-WIN-006、M5-WIN-007、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：设置页 action 改为返回用户反馈文案；刷新数据显示反馈；打开本地数据目录显示反馈；导入 Android 备份通过 `pickBackupFile` 返回是否选择文件，取消时不误报成功；导入完成后显示成功/跳过/失败数量；导入失败显示可理解错误；Win32 `ImportBackupFromFileDialog` 改为返回 bool；测试确认 Windows 设置页不再混入通知提醒、小组件隐私、本地备份、恢复数据、外观模式等 Android/未接入口。
- 修改文件：`anniversary_app/lib/src/features/settings/settings_screen.dart`、`anniversary_app/lib/src/app/anniversary_app.dart`、`anniversary_app/windows/runner/flutter_window.cpp`、`anniversary_app/windows/runner/flutter_window.h`、`anniversary_app/test/widget_test.dart`
- 测试结果：`flutter analyze` 通过；`flutter test` 通过；`python tools/backup/validate_backup_schema.py` 通过；`flutter build windows --debug` 通过。
- 风险/阻塞：截图中的页面属于旧构建表现；当前源码和 debug 构建已修复。Android 侧设置入口仍属于后续 Android 平台任务，Windows 版不会展示。
- 下一步：继续补编辑已有事件、删除/归档、导入报告持久展示和设置页关于/版本信息。

---

## 本次执行记录：提醒规则数据链路修复

## 任务理解
- 故事卡片：M2-UI-003 新增纪念日页面、M2-UI-007 纪念日详情页、M3-REMINDER-002 普通提醒调度、M4-BACKUP-003 Android JSON 恢复、M5-WIN-002 Android JSON 备份导入、M6-QA-004 Windows 发布验收
- 本次目标：修复详情页提醒固定显示“暂未启用”的问题，让提醒规则从备份协议、Windows 本地缓存、新增页保存到详情页展示形成真实数据链路。
- 输入依据：用户反馈详情页“提醒”不可用；备份 schema 已包含 `reminderRule`，但现有 Windows/Flutter 运行路径没有解析、保存或展示该字段。
- 涉及模块：Flutter domain model、BackupImporter、WindowsAnniversaryRepository、SeedAnniversaryRepository、EventEditScreen、EventDetailScreen、Flutter widget/unit tests。
- 依赖检查：备份 schema、示例备份、Windows 本地缓存和 Flutter Windows 路由均已存在；当前任务不依赖 Android SDK 或 Gradle。
- 本次不做：不实现 Android WorkManager/通知权限/系统级通知调度，不实现精确提醒，不引入云同步、账号或商城；Windows 侧先完成提醒规则配置、持久化、导入和展示。
- 验收标准：导入备份时保留 `reminderRule`；新增事件可选择提醒预设并写入本地缓存；详情页展示真实提醒规则；禁用提醒时才显示“未启用”；自动化测试覆盖导入、保存重载和详情展示。

## 代码自查
- 是否满足故事卡片详情：部分满足，已完成提醒规则数据/展示闭环；系统级普通提醒调度仍待 Android 原生桥任务继续。
- 是否违反首期范围：否。
- 是否保持模块边界：是，提醒规则作为 domain model 与备份协议字段传递，UI 不直接计算业务日期。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，覆盖备份导入提醒规则、Windows 保存后重载提醒规则、详情页展示提醒文本。
- 是否存在未处理异常：否，备份提醒字段仍走现有 BackupImportException 解析失败路径。
- 是否需要更新文档或故事卡片：是，追加本记录；M3-REMINDER-002 不标记完成，因为系统通知调度尚未接入。

## 进度更新
- 故事卡片：M2-UI-003、M2-UI-007、M3-REMINDER-002、M4-BACKUP-003、M5-WIN-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：新增 `AnniversaryReminderRule`；导入 Android 备份时解析 `reminderRule`；Windows 保存事件时写回提醒规则；详情页显示真实提醒文案；新增页提供关闭、当天、提前 1/3 天、提前 7 天和当天等提醒预设；测试断言导入与保存后的提醒规则不会丢失。
- 修改文件：`anniversary_app/lib/src/domain/anniversary_reminder.dart`、`anniversary_app/lib/src/domain/anniversary_preview.dart`、`anniversary_app/lib/src/domain/anniversary_repository.dart`、`anniversary_app/lib/src/data/backup_importer.dart`、`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/lib/src/features/detail/event_detail_screen.dart`、`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/test/backup_importer_test.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过；`python tools/backup/validate_backup_schema.py` 通过；`flutter build windows --debug` 因正在运行的 `anniversary_app.exe` 锁定输出文件，在链接阶段报 `LNK1168`，需退出当前 Windows 应用后重跑。
- 风险/阻塞：当前修复的是提醒规则配置、导入、保存和展示；真正弹出系统通知仍需要 M3-REMINDER-001/002/003/004 的 Android 原生权限与调度实现。
- 下一步：退出正在运行的 Windows 程序后重跑 Windows debug build；继续补编辑已有事件时加载既有提醒规则、删除/归档闭环，以及 Android 侧通知权限和 WorkManager 调度。

---

## 本次执行记录：Windows 提醒通知完整闭环

## 任务理解
- 故事卡片：M5-WIN-006 托盘菜单、M5-WIN-007 Windows 设置、M3-REMINDER-002 普通提醒调度、M6-QA-004 Windows 发布验收
- 本次目标：将 Windows 端提醒从“规则可展示”推进到“规则可调度、到点可触发系统通知”的可用闭环。
- 输入依据：用户明确要求 Windows 端提醒功能完整实现，并保证能正确触发通知。
- 涉及模块：Flutter Windows App、WindowsReminderScheduler、Windows 托盘 MethodChannel、Win32 runner、AppPaths、AnniversaryRepository、Seed/Windows repository、Windows reminder tests。
- 依赖检查：现有 Flutter Windows、Dart CalendarEngine、Windows 本地缓存、Win32 托盘桥均可用；不依赖 Android SDK、Gradle 或网络通知服务。
- 本次不做：不实现 Android WorkManager/通知权限/重启广播，不做 V1.0 默认准点 Exact Alarm，不做云同步、账号、商城或 Windows Widgets Board。
- 验收标准：应用启动后根据当前日期生成提醒计划；导入、刷新、新增保存后重建计划；提前 N 天和当天提醒按 occurrence 日期计算；到点调用 Windows 原生通知；已发送提醒持久去重，避免重启后重复弹同一条。

## 代码自查
- 是否满足故事卡片详情：是，Windows 端已完成本地普通提醒调度与通知触发；Android 普通提醒仍按独立 Android 原生桥任务推进。
- 是否违反首期范围：否。
- 是否保持模块边界：是，提醒调度在独立 scheduler 中，UI 仅触发保存/导入/刷新后的重建。
- 是否破坏日期模型：否，提醒基于 CalendarEngine 生成的 occurrence，不替代原始日期。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增 Windows reminder schedule 与到点投递去重测试。
- 是否存在未处理异常：否，native 通道缺失会容错；通知发送失败不会写入已发送记录。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M5-WIN-006、M5-WIN-007、M3-REMINDER-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：新增 `WindowsReminderScheduler`；新增 `ScheduledReminder`、`ReminderNotificationSender`、`WindowsReminderDeliveryStore`；按当前日期生成未来提醒计划并支持 2 小时补偿窗口；空 `advanceDays` 按当天提醒处理，负数提前天数跳过；应用启动、托盘刷新、备份导入、设置页刷新、新增保存后都会重建提醒计划；Win32 runner 新增 `showReminderNotification`，通过 `Shell_NotifyIcon(NIF_INFO)` 弹出 Windows 托盘通知；新增 UTF-8 到 UTF-16 转换，支持中文通知内容；新增已发送提醒持久记录 `windows-reminder-delivery-v1.json` 防重复。
- 修改文件：`anniversary_app/lib/src/reminders/windows_reminder_scheduler.dart`、`anniversary_app/lib/src/app/anniversary_app.dart`、`anniversary_app/lib/src/data/app_paths.dart`、`anniversary_app/lib/src/domain/anniversary_repository.dart`、`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/windows/runner/flutter_window.cpp`、`anniversary_app/windows/runner/flutter_window.h`、`anniversary_app/windows/runner/utils.cpp`、`anniversary_app/windows/runner/utils.h`、`anniversary_app/test/windows_reminder_scheduler_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过；`python tools/backup/validate_backup_schema.py` 通过；`python tools/calendar/run_calendar_checks.py` 通过；`flutter build windows --release` 通过；`flutter build windows --debug` 通过。
- 风险/阻塞：Windows 提醒需要应用或托盘进程处于运行状态；当前实现不是 Windows 任务计划程序级别的离线唤醒。Windows 通知表现还受系统“通知/专注助手/勿扰模式”设置影响。
- 下一步：补编辑已有事件时加载和修改提醒规则；补删除/归档时取消相关未来提醒；继续 Android 侧通知权限、WorkManager 调度和重启恢复。

---

## 本次执行记录：Windows 悬浮窗底部溢出修复

## 任务理解
- 故事卡片：M5-WIN-004 Windows 最近纪念日悬浮卡片、M6-QA-004 Windows 发布验收
- 本次目标：修复 Windows 悬浮窗首页在最近三条事件较多或窗口高度较小时出现底部 `BOTTOM OVERFLOWED` 的布局错误。
- 输入依据：用户截图显示 Windows 悬浮窗底部溢出 8.3 像素，最近列表第三条被底部裁切。
- 涉及模块：`WindowsHomeScreen`、Flutter widget 回归测试。
- 依赖检查：不涉及日期引擎、备份协议、Android SDK 或 Gradle。
- 本次不做：不改变日期计算、不改变提醒调度、不调整 Win32 窗口尺寸策略、不引入新的视觉风格。
- 验收标准：Windows 悬浮窗在紧凑高度下不再出现 Flutter overflow；最近三条仍可通过面板滚动访问；自动化测试覆盖紧凑窗口尺寸。

## 代码自查
- 是否满足故事卡片详情：是，Windows 悬浮卡片可在受限高度内稳定渲染。
- 是否违反首期范围：否。
- 是否保持模块边界：是，仅调整 UI 布局。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增紧凑窗口无溢出 widget 回归测试。
- 是否存在未处理异常：否。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M5-WIN-004、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：Windows 首页外层改为受限高度内 `SingleChildScrollView`；面板内容保持居中并在高度不足时可滚动；收紧悬浮窗内部垂直间距和最近条目 padding；新增 `windows card does not overflow in compact window` 回归测试。
- 修改文件：`anniversary_app/lib/src/features/windows/windows_home_screen.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过；`python tools/backup/validate_backup_schema.py` 通过；`flutter build windows --release` 通过；`flutter build windows --debug` 因运行中的 Debug `anniversary_app.exe` 锁定输出文件报 `LNK1168`，当前占用进程 PID 为 53404。
- 风险/阻塞：需要关闭正在运行的 Debug 版 Windows 应用后，才能覆盖构建 Debug exe。
- 下一步：关闭 PID 53404 或从托盘退出当前应用后重跑 `flutter build windows --debug` / `flutter run -d windows`。

---

## 任务理解
- 故事卡片：M2-UI-003 新增纪念日页面、M2-UI-007 纪念日详情页、M2-UI-008 编辑与删除流程、M3-REMINDER-002 普通提醒调度、M6-QA-004 Windows 发布验收
- 本次目标：让 Windows 端编辑页加载原事件名称和已有规则；提醒支持自定义时间与提前天数组合；详情页支持删除已有纪念日并刷新提醒计划。
- 输入依据：用户反馈提醒周期和时间需要自定义、已有纪念日需要删除、编辑页必须带上原来的名称。
- 涉及模块：AnniversaryRepository、WindowsAnniversaryRepository、SeedAnniversaryRepository、BackupImporter、EventEditScreen、EventDetailScreen、AnniversaryApp、Flutter widget/unit tests。
- 依赖检查：Windows 本地 JSON 缓存、提醒规则模型、WindowsReminderScheduler、Flutter 路由与备份 schema 已存在；不依赖 Android SDK 或 Gradle。
- 本次不做：不实现 Android WorkManager/通知权限；不实现归档/恢复；不补完整分类和备注编辑；不引入云同步、账号或商城。
- 验收标准：详情页进入编辑时名称、日期、重复和提醒规则预填；保存已有事件按 id 更新而不是新增；提醒可输入自定义提前天数并选择时间；删除确认后事件从列表消失并触发提醒重建；自动化测试和 Windows release 构建通过。

## 代码自查
- 是否满足故事卡片详情：部分满足，编辑/删除/提醒自定义闭环已实现，分类与备注仍是后续。
- 是否违反首期范围：否。
- 是否保持模块边界：是，UI 通过 Repository 读写草稿，日期仍走 CalendarEngine。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否，UI 仅组装 DatePayload。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，覆盖编辑预填、删除、Windows repository 更新/删除和提醒规则保存。
- 是否存在未处理异常：否，删除有确认，编辑 id 不存在时保持新增页兜底。
- 是否需要更新文档或故事卡片：是，追加本记录；相关故事仍保持进行中。

## 进度更新
- 故事卡片：M2-UI-003、M2-UI-007、M2-UI-008、M3-REMINDER-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：Repository 增加按 id 获取草稿与删除事件能力；Windows 本地缓存保存支持同 id 更新；编辑页可预填原名称、日期、重复规则和提醒规则；提醒编辑支持启停、自定义时间和逗号/空白分隔的提前天数；详情页新增删除确认；保存、删除后触发 Windows 提醒重新调度；导入事件保留原始 category 以便编辑回写。
- 修改文件：`anniversary_app/lib/src/domain/anniversary_repository.dart`、`anniversary_app/lib/src/data/backup_importer.dart`、`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/lib/src/features/detail/event_detail_screen.dart`、`anniversary_app/lib/src/app/anniversary_app.dart`、`anniversary_app/test/backup_importer_test.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过，21 项；`python tools/calendar/run_calendar_checks.py` 通过；`python tools/backup/validate_backup_schema.py` 通过；`flutter build windows --release` 通过，产物为 `build\windows\x64\runner\Release\anniversary_app.exe`。
- 风险/阻塞：Windows 系统通知仍要求应用/托盘进程运行；分类和备注编辑仍未完成；Android 侧提醒调度仍是后续范围。
- 下一步：补分类/备注编辑、导入报告持久展示；继续 Android 通知权限与普通提醒调度。

---

## 任务理解
- 故事卡片：M2-UI-003 新增纪念日页面、M2-UI-007 纪念日详情页、M2-UI-008 编辑与删除流程、M5-WIN-002 Android JSON 备份导入、M6-QA-004 Windows 发布验收
- 本次目标：补齐分类与备注的新增、编辑、保存、导入、详情展示闭环，让 Windows 端编辑流程更接近真实可用产品。
- 输入依据：上一轮进度遗留“分类和备注编辑仍未完成”；技术设计和备份 schema 均要求事件包含 `category` 与 `note`。
- 涉及模块：AnniversaryPreview、SeedAnniversaryRepository、WindowsAnniversaryRepository、EventEditScreen、EventDetailScreen、Flutter widget/unit tests。
- 依赖检查：备份 schema、Windows 本地 JSON 缓存、编辑/详情路由与测试框架均已具备；不依赖 Android SDK 或 Gradle。
- 本次不做：不做归档/恢复；不做 Android 原生提醒；不新增数据库方案；不引入云同步、账号或商城。
- 验收标准：新增/编辑页可选择分类并填写备注；编辑已有事件时分类/备注预填；保存后 Windows JSON 含正确分类/备注；详情页显示备注；测试和 Windows release 构建通过。

## 代码自查
- 是否满足故事卡片详情：部分满足，分类/备注编辑闭环已完成，归档/恢复仍未做。
- 是否违反首期范围：否。
- 是否保持模块边界：是，UI 只读写 draft，展示数据来自 repository preview。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，覆盖编辑预填备注、新增保存备注、Windows repository 分类/备注保存与更新。
- 是否存在未处理异常：否，未知分类会在 UI 编辑态回落为 OTHER，导入仍按 schema/Importer 校验。
- 是否需要更新文档或故事卡片：是，追加本记录；相关故事仍保持进行中。

## 进度更新
- 故事卡片：M2-UI-003、M2-UI-007、M2-UI-008、M5-WIN-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：`AnniversaryPreview` 增加 note；Seed/Windows repository 传递 note；Seed 草稿读取保留 category/note；编辑页新增分类下拉和备注多行输入，编辑已有事件时预填；保存草稿写入 category/note；详情页在备注非空时展示备注卡片；测试补充分类和备注持久化断言。
- 修改文件：`anniversary_app/lib/src/domain/anniversary_preview.dart`、`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/lib/src/features/detail/event_detail_screen.dart`、`anniversary_app/test/backup_importer_test.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过，21 项；`python tools/backup/validate_backup_schema.py` 通过；`python tools/calendar/run_calendar_checks.py` 通过；`flutter build windows --release` 通过，产物为 `anniversary_app\build\windows\x64\runner\Release\anniversary_app.exe`。
- 风险/阻塞：归档/恢复仍未实现；Android 通知权限与 WorkManager 调度仍待 Android SDK 恢复后推进。
- 下一步：补导入报告持久展示与关于/版本信息；继续梳理 Windows 发布验收剩余 P0/P1 缺口。

---

## 任务理解
- 故事卡片：M2-UI-010 视觉统一、M2-UI-003 新增纪念日页面、M3-REMINDER-002 普通提醒调度、M6-QA-004 Windows 发布验收
- 本次目标：修复 Windows 端提醒时间选择弹窗中默认钟面数字挤压、重叠的问题，让小窗口环境下的时间选择稳定可用。
- 输入依据：用户截图显示 `Select time` 弹窗右侧钟面数字重叠，影响提醒时间选择。
- 涉及模块：EventEditScreen 的提醒时间选择器。
- 依赖检查：提醒规则模型与保存流程已存在；本次只调整 UI 入口和 TimePicker 展示方式，不依赖 Android SDK 或 Gradle。
- 本次不做：不改提醒调度算法；不改备份协议；不做全局主题重绘。
- 验收标准：Windows/桌面端选择提醒时间时默认使用输入式 TimePicker，避免拨盘在紧凑窗口内重叠；中文按钮和字段文案可读；自动化测试和 Windows release 构建通过。

## 代码自查
- 是否满足故事卡片详情：是，修复了当前截图所示的时间选择视觉问题。
- 是否违反首期范围：否。
- 是否保持模块边界：是，仅修改 UI 选择器展示，不改 domain/repository。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，现有编辑页与保存流程 widget 测试继续通过。
- 是否存在未处理异常：否。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-010、M2-UI-003、M3-REMINDER-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：桌面平台提醒时间选择改为 `TimePickerEntryMode.inputOnly`；补充中文 `helpText`、取消/确定、小时/分钟和错误文案；通过 `MediaQuery.textScaler` 固定弹窗文本缩放，避免系统缩放导致布局挤压；增加局部 `TimePickerThemeData`，收敛输入框和分段形状。
- 修改文件：`anniversary_app/lib/src/features/edit/event_edit_screen.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过，21 项；`flutter build windows --release` 通过，产物为 `anniversary_app\build\windows\x64\runner\Release\anniversary_app.exe`。
- 风险/阻塞：移动端仍使用拨盘模式；后续 Android 真机阶段需要按设备缩放再验一次。
- 下一步：继续做设置页导入报告持久展示和关于/版本信息。

---

## 任务理解
- 故事卡片：M2-UI-010 视觉统一、M2-UI-003 新增纪念日页面、M3-REMINDER-002 普通提醒调度、M6-QA-004 Windows 发布验收
- 本次目标：提醒时间选择同时支持滚动选择和手动输入两种方式，并维持 Windows 小窗口下的稳定布局。
- 输入依据：用户要求“修改为支持滚动选择和手动输入两种方式”，上一版只保留输入式。
- 涉及模块：EventEditScreen 提醒时间弹窗、Widget tests。
- 依赖检查：提醒规则、保存、调度都已存在；本次只替换时间选择 UI，不改日期核心和备份协议。
- 本次不做：不改提醒调度算法；不做 Android 原生通知；不引入新依赖。
- 验收标准：点击提醒时间后出现自定义弹窗；可在“滚动选择”和“手动输入”间切换；确认后返回 `TimeOfDay` 并更新提醒时间；测试和 Windows release 构建通过。

## 代码自查
- 是否满足故事卡片详情：是，时间选择支持滚动与手动输入两种方式。
- 是否违反首期范围：否。
- 是否保持模块边界：是，仅替换 UI 弹窗，保存仍走既有 reminderRule。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增 widget 测试覆盖弹窗模式切换。
- 是否存在未处理异常：否，手动输入会校验小时 00-23、分钟 00-59。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-010、M2-UI-003、M3-REMINDER-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：移除默认 `showTimePicker`；新增 `_ReminderTimePickerDialog`；滚动模式使用小时/分钟双列 `ListWheelScrollView`；手动模式使用两个数字输入框；弹窗内提供“滚动选择 / 手动输入”分段切换；输入错误时展示可理解错误文案；新增 widget 测试覆盖两种模式。
- 修改文件：`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过，22 项；`flutter build windows --release` 通过，产物为 `anniversary_app\build\windows\x64\runner\Release\anniversary_app.exe`。
- 风险/阻塞：滚动选择为 Flutter 内建滚轮控件，Windows 触控板/鼠标滚轮体验后续仍建议做一次人工验收。
- 下一步：继续做设置页导入报告持久展示和关于/版本信息。

---

## 任务理解
- 故事卡片：M2-UI-003 新增纪念日页面、M2-UI-007 纪念日详情页、M2-UI-008 编辑与删除流程、M3-REMINDER-002 普通提醒调度、M6-QA-004 Windows 发布验收
- 本次目标：修复“未自定义提醒时详情页显示提醒未启用”的问题，让默认提醒/预设提醒与关闭提醒语义分离。
- 输入依据：用户反馈未自定义提醒时详情页显示“提醒未启用”；现有编辑页开关文案为“自定义提醒”，但实际控制 `reminderRule.enabled`，容易把“不自定义”保存成“关闭提醒”。
- 涉及模块：EventEditScreen、AnniversaryReminderRule 展示链路、Flutter widget tests。
- 依赖检查：提醒规则模型、详情页展示、Windows 保存链路均已存在；本次不依赖 Android SDK、Gradle 或系统通知调度改造。
- 本次不做：不改 WindowsReminderScheduler 调度算法；不实现 Android WorkManager/通知权限；不改备份协议；不做全局视觉重绘。
- 验收标准：新增事件不手动自定义提醒时仍保存默认启用提醒；详情页只有在用户明确关闭提醒时才显示“未启用”；编辑已有自定义提醒时下拉方案能正确显示“自定义”；测试和 Windows release 构建通过。

## 代码自查
- 是否满足故事卡片详情：是，本次修复提醒规则编辑与详情展示的可用性缺陷。
- 是否违反首期范围：否。
- 是否保持模块边界：是，UI 只生成 `AnniversaryReminderRule`，不直接参与日期 occurrence 或系统通知调度。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增保存默认提醒启用的回归断言。
- 是否存在未处理异常：否。
- 是否需要更新文档或故事卡片：是，追加本记录；相关故事仍保持进行中。

## 进度更新
- 故事卡片：M2-UI-003、M2-UI-007、M2-UI-008、M3-REMINDER-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：将编辑页提醒开关语义从“自定义提醒”改为“启用提醒”；提醒方案下拉新增“自定义”状态；加载已有提醒规则时反推关闭/预设/自定义状态；手动修改时间或提前天数后自动同步为自定义；新增事件未改提醒时保存默认“提前 7 天，当天 09:00”，详情页不再误显示“未启用”。
- 修改文件：`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过，22 项；`flutter build windows --release` 通过，产物为 `anniversary_app\build\windows\x64\runner\Release\anniversary_app.exe`。
- 风险/阻塞：真正 Windows 系统通知仍要求应用/托盘进程运行；Android 侧提醒调度仍待 Android SDK 恢复后推进。
- 下一步：继续做设置页导入报告持久展示、关于/版本信息，以及 Windows 发布验收剩余 P0/P1 缺口。

---

## 任务理解
- 故事卡片：M2-UI-001 Flutter 应用框架、M2-UI-010 年轻清新主题系统、M5-WIN-001 Flutter Windows 桌面组件项目、M6-QA-004 Windows 发布验收
- 本次目标：为项目确定更合适的中文名称，设计 logo，并替换 Windows 默认图标与可见品牌标题。
- 输入依据：用户要求“为项目起一个更合适的中文名称，之后进行 logo 设计并替换默认图标”；技术设计要求产品干净、准确、长期可用；UI 原型方向为年轻、清新、轻量。
- 涉及模块：Flutter 应用标题、首页/Windows 悬浮窗品牌露出、Windows runner 标题/托盘/版本资源、应用图标资产、README、Widget tests。
- 依赖检查：Flutter Windows 工程与资源脚本可用；Pillow 可用于本地生成 PNG/ICO；不依赖 Android SDK 或 Gradle。
- 本次不做：不迁移 `%APPDATA%/SameIdeaDays` 数据目录；不改二进制文件名 `anniversary_app.exe`；不恢复 Android 平台壳；不做品牌官网或完整视觉规范手册。
- 验收标准：中文名统一为“今念”；logo 源文件与运行时资产入库；Windows 标题、托盘提示、版本信息和默认图标更新；自动化测试与 Windows release 构建通过。

## 代码自查
- 是否满足故事卡片详情：是，完成应用品牌名、logo 与 Windows 图标替换。
- 是否违反首期范围：否。
- 是否保持模块边界：是，仅调整品牌/资源/原生窗口元数据，不触碰日期、备份或提醒核心。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，更新品牌标题 widget 断言。
- 是否存在未处理异常：否，Windows release 已验证资源编译成功。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-001、M2-UI-010、M5-WIN-001、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：项目中文名定为“今念”；新增 `product_brand.dart` 品牌常量；Flutter 应用标题、首页标题、Windows 悬浮窗标题改为“今念”；Windows 窗口标题、托盘提示、托盘菜单与 exe 版本资源更新；新增 logo 生成脚本；生成 `docs/brand/jinnian_logo.svg`、PNG 预览、Flutter 运行时 PNG 和 Windows `app_icon.ico`；README 更新为“今念 Flutter Shell”。
- 修改文件：`anniversary_app/lib/src/app/product_brand.dart`、`anniversary_app/lib/src/app/anniversary_app.dart`、`anniversary_app/lib/src/features/home/home_screen.dart`、`anniversary_app/lib/src/features/windows/windows_home_screen.dart`、`anniversary_app/pubspec.yaml`、`anniversary_app/windows/runner/main.cpp`、`anniversary_app/windows/runner/flutter_window.cpp`、`anniversary_app/windows/runner/Runner.rc`、`anniversary_app/windows/runner/resources/app_icon.ico`、`anniversary_app/assets/brand/jinnian_logo.png`、`docs/brand/jinnian_logo.svg`、`docs/brand/jinnian_logo_1024.png`、`docs/brand/jinnian_logo_256.png`、`tools/assets/generate_jinnian_logo.py`、`anniversary_app/test/widget_test.dart`、`anniversary_app/README.md`
- 测试结果：`dart format lib test` 通过；`flutter pub get` 通过；`flutter analyze` 通过；`flutter test` 通过，22 项；`flutter build windows --release` 通过；exe 版本信息确认 `FileDescription` 与 `ProductName` 为“今念”。
- 风险/阻塞：应用数据目录仍保留 `SameIdeaDays` 以避免现有缓存迁移风险；后续若要彻底品牌化目录名，需要做兼容迁移。
- 下一步：继续补设置页关于/版本信息时展示“今念”与 logo；Android 平台壳恢复后同步 Android launcher icon。

---

## 任务理解
- 故事卡片：M5-WIN-006 托盘菜单、M5-WIN-007 Windows 设置、M6-QA-004 Windows 发布验收
- 本次目标：修改 Windows 关闭按钮行为，让用户可选择“直接退出”或“隐藏到托盘”，并支持记住选择。
- 输入依据：用户截图指出右上角关闭按钮；要求关闭行为可选且可记住。
- 涉及模块：WindowsSettingsStore、AnniversaryApp MethodChannel、Win32 runner close 拦截、SettingsScreen、Windows settings tests、Widget tests。
- 依赖检查：Windows 托盘、设置持久化和 MethodChannel 已存在；不依赖 Android SDK 或 Gradle。
- 本次不做：不改提醒调度算法；不迁移 `SameIdeaDays` 数据目录；不新增 Windows Widgets Board；不改变备份协议。
- 验收标准：点击右上角关闭时由 Dart 决策；未记住时弹出选择；选择“记住我的选择”后写入设置；后续按偏好隐藏到托盘或退出；设置页可修改关闭行为；测试和 Windows release 构建通过。

## 代码自查
- 是否满足故事卡片详情：是，完成关闭按钮行为选择、持久化和设置页修改入口。
- 是否违反首期范围：否。
- 是否保持模块边界：是，原生层只拦截窗口消息并执行隐藏/退出，选择和持久化在 Flutter 设置层。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，覆盖关闭行为设置持久化、未知旧值兜底和设置页入口。
- 是否存在未处理异常：否；Dart 侧对 MissingPluginException 做了兜底；连续关闭请求不会叠加多个弹窗。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M5-WIN-006、M5-WIN-007、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：新增 `WindowsCloseBehavior` 枚举和 `closeBehavior` 设置字段；默认关闭行为为“每次询问”；Win32 `WM_CLOSE` 改为通过 MethodChannel 请求 Flutter 决策；Flutter 首次关闭弹出“关闭今念”对话框，支持“隐藏到托盘”“直接退出”“记住我的选择”；原生层新增 `hideWindow` 和 `exitApp`；设置页新增“关闭按钮”下拉项，可改回每次询问或指定行为；托盘退出仍保留直接退出。
- 修改文件：`anniversary_app/lib/src/data/windows_settings_store.dart`、`anniversary_app/lib/src/app/anniversary_app.dart`、`anniversary_app/lib/src/features/settings/settings_screen.dart`、`anniversary_app/windows/runner/flutter_window.cpp`、`anniversary_app/windows/runner/flutter_window.h`、`anniversary_app/test/windows_settings_store_test.dart`、`anniversary_app/test/widget_test.dart`
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过，23 项；`flutter build windows --release` 通过，产物为 `anniversary_app\build\windows\x64\runner\Release\anniversary_app.exe`。
- 风险/阻塞：真实点击右上角关闭的交互仍建议在 Windows 桌面上人工验收一次，包括记住选择后的再次关闭、托盘双击恢复和托盘菜单退出。
- 下一步：继续补设置页关于/版本信息和导入报告持久展示。

---

## 任务理解
- 故事卡片：M0-ENV-001 移除默认工程对 Android SDK 的硬依赖、M2-UI-001 搭建 Flutter 应用框架、M2-UI-010 年轻清新主题系统、M6-QA-002 Android 主流程验收
- 本次目标：在明确进入 Android 适配阶段后恢复 Android 平台壳，让 Android APK 能启动共享 Flutter 主应用，使用同一份农历运行时规则，并同步“今念”品牌与启动图标。
- 输入依据：用户要求“接下来进行安卓端的适配”；故事卡片说明 Android SDK 与设备矩阵可用后通过 `flutter create --platforms=android .` 恢复 Android 平台壳继续原生桥任务。
- 涉及模块：Flutter 启动入口、Dart CalendarEngine 规则加载、Android Gradle/Manifest/MainActivity、Android launcher icon、Flutter asset、自动化测试。
- 依赖检查：本机 Android SDK 目录可用；`flutter doctor` 仍提示缺少 `cmdline-tools` 且 license 状态未知，但当前 debug APK 构建已通过。
- 本次不做：不实现 Android Room 数据库、WorkManager 通知权限与调度、Glance 小组件、Android 备份导出；不引入云同步、账号、商城、iOS/Web/Mac。
- 验收标准：Android 平台目录恢复；Android 启动不再误用 Windows repository；农历规则可从 APK asset 加载且与 `shared/calendar` 一致；Android 应用名和 launcher icon 使用“今念”；`flutter analyze`、`flutter test`、`flutter build apk --debug`、`flutter build windows --release` 通过。

## 代码自查
- 是否满足故事卡片详情：部分满足，Android 平台壳和共享 Flutter 主应用启动闭环已恢复，原生提醒/小组件/数据库仍按后续故事推进。
- 是否违反首期范围：否。
- 是否保持模块边界：是，日期计算仍在 `calendar_core`；Android 平台壳只承载 Flutter Activity 与资源；UI 不直接读取规则 JSON。
- 是否破坏日期模型：否，新增 `RuntimeRulesCalendarEngine.fromJsonString/fromJsonObject` 只改变加载入口，不改变算法和模型。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否，本次未实现 Android 小组件。
- 是否有测试覆盖：是，新增 Flutter asset 与 `shared/calendar/calendar-runtime-rules-v1.json` 完全一致的回归测试。
- 是否存在未处理异常：否；Windows/Android 启动入口按平台选择 repository，Windows 导入参数仍只在 Windows repository 下执行。
- 是否需要更新文档或故事卡片：是，追加本记录；Android 原生提醒/小组件/数据库故事仍保持进行中。

## 进度更新
- 故事卡片：M0-ENV-001、M2-UI-001、M2-UI-010、M6-QA-002
- 状态变更：进行中 → 进行中
- 本次完成：恢复 `anniversary_app/android` 平台目录；Android 包名调整为 `com.sameidea.days.jinnian`；应用 label 改为“今念”；生成 mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi launcher icon；Flutter 启动入口改为平台感知，Windows 使用 `WindowsAnniversaryRepository`，Android 等非 Windows 平台使用 `SeedAnniversaryRepository`；农历规则改为从 Flutter asset 加载；复制 `calendar-runtime-rules-v1.json` 到 App asset 并新增一致性测试；Gradle wrapper 调整为本机可构建的 8.9，Android Gradle Plugin 调整为 8.7.3；Android Java/Kotlin 编译目标调整为 17。
- 修改文件：`calendar_core/lib/src/runtime_rules_calendar_engine.dart`、`anniversary_app/lib/main.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/pubspec.yaml`、`anniversary_app/assets/calendar/calendar-runtime-rules-v1.json`、`anniversary_app/android/**`、`anniversary_app/test/calendar_asset_test.dart`、`tools/assets/generate_jinnian_logo.py`。
- 测试结果：`python tools/calendar/run_calendar_checks.py` 通过；`dart analyze` 通过；`dart test` 通过 5 项；`flutter analyze` 通过；`flutter test` 通过 24 项；`flutter build apk --debug` 通过，产物为 `anniversary_app\build\app\outputs\flutter-apk\app-debug.apk`；`flutter build windows --release` 通过，产物为 `anniversary_app\build\windows\x64\runner\Release\anniversary_app.exe`。
- 风险/阻塞：`flutter doctor` 仍提示 Android SDK 缺少 `cmdline-tools`，license 状态未知；真机/模拟器运行、Android 13+ 通知权限、WorkManager 重启恢复、Glance 小组件兼容测试尚未执行。
- 下一步：安装或修复 Android `cmdline-tools` 并接受 licenses；连接模拟器/真机执行 `flutter run -d <device>`；随后推进 Android 本地持久化、普通提醒权限与调度、小组件快照和 Glance UI。

---

## 任务理解
- 故事卡片：M2-UI-003 新增纪念日页面、M2-UI-008 编辑与删除流程
- 本次目标：为纪念日名称增加唯一性检查，防止新增或编辑时保存同名纪念日。
- 输入依据：用户要求“纪念日名称保证作唯一性检查”；当前新增/编辑保存已经统一走 `AnniversaryRepository.saveEvent`。
- 涉及模块：AnniversaryRepository 领域契约、SeedAnniversaryRepository、WindowsAnniversaryRepository、EventEditScreen、Flutter widget/unit tests。
- 依赖检查：现有 repository 可作为保存边界；Windows 本地 JSON 保存与 Seed repository 均可同步校验；不依赖 Android 原生提醒、小组件或数据库迁移。
- 本次不做：不实现数据库唯一索引迁移；不处理云同步冲突；不改变备份 schema；不改变日期计算或提醒调度。
- 验收标准：新增重复名称失败并停留在编辑页；编辑同一事件保留原名称可保存；编辑成其他事件已有名称失败；重复判断会忽略首尾空格和英文大小写；测试和 Android/Windows 构建通过。

## 代码自查
- 是否满足故事卡片详情：是，新增/编辑流程已加入名称唯一性校验。
- 是否违反首期范围：否。
- 是否保持模块边界：是，唯一性检查在 repository 保存边界；UI 只捕获领域异常并展示提示。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，覆盖 Windows repository 重名拒绝、同 id 编辑允许、编辑页重名提示。
- 是否存在未处理异常：否，编辑页会捕获 `DuplicateAnniversaryTitleException` 并停留当前页。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-003、M2-UI-008
- 状态变更：进行中 → 进行中
- 本次完成：新增 `DuplicateAnniversaryTitleException` 与 `anniversaryTitleKey`；Seed/Windows repository 保存前检查同名事件，排除当前编辑 id；重复名称阻止保存；编辑页捕获重复名称异常并提示“已存在同名纪念日，请换一个名称”；新增 repository 和 widget 回归测试。
- 修改文件：`anniversary_app/lib/src/domain/anniversary_repository.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/lib/src/features/edit/event_edit_screen.dart`、`anniversary_app/test/backup_importer_test.dart`、`anniversary_app/test/widget_test.dart`。
- 测试结果：`dart format lib test` 通过；`flutter analyze` 通过；`flutter test` 通过 26 项；`flutter build apk --debug` 通过；`flutter build windows --release` 通过。
- 风险/阻塞：未来接入真实本地数据库时仍需要补数据库层唯一约束或事务级校验，避免并发写入绕过 repository。
- 下一步：继续推进 Android 本地持久化，落库时把名称唯一性同步到数据库约束和迁移测试。

---

## 任务理解
- 故事卡片：M2-UI-002 首页最近纪念日列表、M2-UI-007 纪念日详情页、M5-WIN-004 Windows 最近纪念日悬浮卡片、M6-QA-002 Android 主流程验收、M6-QA-004 Windows 发布验收
- 本次目标：落实“任意端都必须能查看所有纪念日”的验收要求，消除 Windows 悬浮窗只展示最近 3 条导致用户误以为只能保留 4 个纪念日的问题。
- 输入依据：用户要求“请进行调整”；上一轮计划已明确任意端不得因展示数量限制导致用户无法查看或管理已保存纪念日。
- 涉及模块：WindowsHomeScreen、HomeScreen widget tests、Windows widget tests、Seed/Windows 本地 id 生成。
- 依赖检查：Repository 已全量返回事件；Android 主首页已遍历全量列表；Windows 展示层存在 `take(3)` 截断，可直接移除。
- 本次不做：不改变 Android 小组件 4x2 展示最近 3 条的尺寸约束；不实现搜索、筛选或分页；不接入真实本地数据库；不改变日期计算。
- 验收标准：Android 主应用首页可查看并进入超过 4 个纪念日中的任意一条；Windows 悬浮窗可滚动查看并进入全部纪念日；紧凑窗口不 overflow；测试和双端构建通过。

## 代码自查
- 是否满足故事卡片详情：是，Android 主应用和 Windows 悬浮窗均可访问全量纪念日列表。
- 是否违反首期范围：否。
- 是否保持模块边界：是，Repository 保持全量数据源，展示层负责滚动访问；小组件仍不直接业务计算。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增超过 4 个事件的 Android 主首页和 Windows 悬浮窗访问测试。
- 是否存在未处理异常：否；同时修复 Seed/Windows 本地新增 id 仅用微秒时间戳导致极快连续保存可能覆盖的问题。
- 是否需要更新文档或故事卡片：是，追加本记录。

## 进度更新
- 故事卡片：M2-UI-002、M2-UI-007、M5-WIN-004、M6-QA-002、M6-QA-004
- 状态变更：进行中 → 进行中
- 本次完成：Windows 悬浮窗移除 `previews.take(3)` 截断；列表标题改为显示全部小日子和总数；全量事件通过现有外层滚动访问；新增主应用首页“8 个事件可滚动查看并进入第 8 个详情”测试；新增 Windows 悬浮窗“8 个事件可滚动查看并进入第 8 个详情”测试；Seed/Windows 本地新增 id 加入递增后缀，避免快速连续新增时 id 碰撞覆盖。
- 修改文件：`anniversary_app/lib/src/features/windows/windows_home_screen.dart`、`anniversary_app/lib/src/data/seed_anniversary_repository.dart`、`anniversary_app/lib/src/data/windows_anniversary_repository.dart`、`anniversary_app/test/widget_test.dart`。
- 测试结果：`dart format` 通过；`flutter analyze` 通过；`flutter test` 通过 28 项；`flutter build apk --debug` 通过；`flutter build windows --release` 通过。
- 风险/阻塞：Windows 悬浮窗事件很多时目前是完整滚动列表，后续真实数据量上来后建议增加搜索/分类/置顶过滤；真实数据库接入后仍需使用稳定 UUID 或数据库主键。
- 下一步：继续 Android 本地持久化，保证重启后全量纪念日保留，并把“全量可查看”纳入 Android 主流程验收。

---

## 任务理解
- 故事卡片：M2-UI-009 设置页面
- 本次目标：调整 Android 设置页面，去除未完整接入但会误导用户的功能入口，只保留真实可用的状态展示与信息入口。
- 输入依据：用户要求“调整 android 的设置页面，确保全部功能真实可用”；故事卡片验收要求“后置功能不可误导用户”。
- 涉及模块：SettingsScreen、产品品牌常量、Flutter widget tests。
- 依赖检查：Android 通知、桌面小组件、备份恢复原生能力仍未完整接入；本次不强行暴露这些入口。
- 本次不做：不实现 Android WorkManager/Notification、Glance 小组件、Android 备份导出/恢复、真实本地数据库迁移；不引入云同步/账号/商城。
- 验收标准：Android 设置页不再显示不可用菜单；关于与隐私入口可打开；外观/日期范围/数据策略为真实只读状态；Windows 设置页不回退；自动化测试通过。

## 代码自查
- 是否满足故事卡片详情：是，本次重点满足“后置功能不可误导用户”，关于、隐私、外观状态均可真实展示。
- 是否违反首期范围：否。
- 是否保持模块边界：是，仅调整 UI 与品牌常量，不触碰日期、提醒调度、备份协议。
- 是否破坏日期模型：否。
- 是否有 UI 层日期计算：否。
- 是否有小组件直接业务计算：否。
- 是否有测试覆盖：是，新增 Android 设置页 widget 回归测试。
- 是否存在未处理异常：否。
- 是否需要更新文档或故事卡片：是，M2-UI-009 状态更新为进行中并追加本记录。

## 进度更新
- 故事卡片：M2-UI-009 设置页面
- 状态变更：待开始 → 进行中
- 本次完成：Android 设置页移除通知提醒、小组件隐私模式、本地备份、恢复数据等未完整接入入口；新增真实可用的“关于今念”和“本地优先与隐私”弹窗入口；新增外观模式、日期范围、数据策略只读状态卡；补充版本号常量；新增测试确认 Android 设置页只暴露已实现入口。
- 修改文件：`anniversary_app/lib/src/features/settings/settings_screen.dart`、`anniversary_app/lib/src/app/product_brand.dart`、`anniversary_app/test/widget_test.dart`、`docs/anniversary_task_breakdown_story_cards_v1_2.md`
- 测试结果：`dart format` 通过；`flutter analyze` 通过；`flutter test` 通过 29 项；`flutter build windows --release` 通过；`flutter build apk --debug` 在当前 shell 因 `No Android SDK found` 未执行成功。
- 风险/阻塞：当前执行环境未配置 Android SDK，无法在本轮完成 APK 构建验证；Android 原生通知、小组件、备份恢复仍需后续故事接入后再回到设置页开放入口。
- 下一步：恢复当前 shell 的 Android SDK 环境后重跑 APK 构建；继续实现 Android 持久化、备份恢复、提醒与小组件后，再逐项把设置入口改为真实可用功能。
