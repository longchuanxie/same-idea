# 纪念日 App 技术设计文档

版本：v1.2-flutter-transition  
更新日期：2026-06-19  
面向版本：Flutter Android 主应用 + Android 桌面小组件原生桥 + Flutter Windows 桌面悬浮组件  
产品方向：干净、准确、长期可用  
技术原则：本地优先、日期准确、提醒可解释、小组件轻量、跨端数据协议稳定  
状态：Flutter 主线架构已确认，可进入 Flutter 工程化与 Dart 日期核心迁移

---

## 0. CTO 决策写入说明

本版本在 v1.1 决策基础上补充 Flutter 主线迁移决策。若本文与 v1.1 中 WPF、Compose、Room 主线表述冲突，以本版本和 `docs/flutter_architecture_transition_v1.md` 为准。

| 决策编号 | 主题 | 最终结论 | 文档状态 |
|---|---|---|---|
| D-001 | 农历数据源 | GB/T 33661-2017 规则基线 + 内置农历数据表 + 独立 CalendarEngine，首期支持 1901-2100 | 已写入 |
| D-002 | Windows 日期核心 | v1.2 起由 Dart CalendarEngine 统一 Android 与 Windows 日期核心；原 C# 契约保留为历史参考 | 已替换 |
| D-003 | Android 小组件 | Glance 优先，RemoteViews 兜底 | 已写入 |
| D-004 | 精确提醒 | V1.0 不默认启用，作为 P1/Beta 高级开关 | 已写入 |
| D-005 | 日期回归测试 | M0 必须建设 golden 数据与场景回归集，未通过不得进入 UI 联调 | 已写入 |
| D-006 | Windows 形态 | Flutter Windows 桌面悬浮组件 + 托盘程序，不做 Windows Widgets Board | 已替换 |
| D-007 | 云同步 | V1.0 不做云同步，只做本地备份恢复与 Windows 导入 | 已写入 |
| D-008 | 首版范围 | Flutter Android 主应用 + Android 小组件原生桥 + Flutter Windows 桌面悬浮组件 | 已替换 |
| D-009 | Flutter 主线 | Flutter 承担 Android 主应用与 Windows 桌面悬浮组件；Android 小组件、提醒、托盘等系统能力通过原生桥接完成 | 已写入 |
| D-010 | 默认开发环境 | 当前仓库默认开发、测试、Windows 构建与日期门禁不依赖 Android SDK；Android 平台壳在 SDK 可用时再生成 | 已写入 |
| D-011 | Gradle 依赖 | 当前仓库默认开发、测试、Windows 构建与日期门禁不依赖 Gradle；Dart `calendar_core` 是唯一可执行日期核心基线 | 已写入 |

---

## 1. 文档目标

本文档用于指导纪念日 App 首期研发落地，覆盖：

1. Android 主应用技术架构。
2. Android 桌面小组件技术架构。
3. Flutter Windows 桌面悬浮组件技术架构。
4. 公历与中国农历日期引擎设计。
5. 本地提醒与小组件刷新机制。
6. 本地存储、备份、导入与迁移设计。
7. Android 与 Windows 数据一致性设计。
8. 日期回归测试、发布门禁、风险闭环。

本文档不覆盖首版以外的云同步、账号系统、家庭共享、iOS、Web、Mac、礼物商城、社交功能、复杂主题商城。

---

## 2. 首期范围冻结

### 2.1 V1.0 必做范围

| 端 | 范围 |
|---|---|
| Android 主应用 | Flutter 实现新增、编辑、删除、首页、详情、设置、本地提醒入口、备份恢复 |
| Android 小组件 | 原生桥实现单纪念日 2x2、最近纪念日 4x2、已过天数 2x2 |
| Windows | Flutter Windows 桌面悬浮组件、托盘程序、JSON 导入、最近/单日展示 |
| 日期能力 | 公历、农历、闰月、农历三十、除夕、2 月 29 日、未来 5 年预览 |
| 数据能力 | Flutter 本地数据库、JSON 备份、JSON 恢复、Windows 导入 Android 备份 |
| 测试能力 | golden 全量映射、场景回归、Flutter Android/Flutter Windows 一致性测试 |

### 2.2 V1.0 明确不做

1. 云同步。
2. 账号登录。
3. 家庭共享。
4. 礼物商城。
5. 贺卡商城。
6. 复杂节气玩法。
7. Windows 完整编辑器。
8. Windows Widgets Board。
9. iOS、Web、Mac。
10. 主题商城与运营 Banner。

### 2.3 版本推进顺序

```text
M0 技术预研
  ↓
M1 Android 核心数据与日期引擎
  ↓
M2 Android 主应用 UI
  ↓
M3 Android 小组件与提醒
  ↓
M4 备份恢复
  ↓
M5 Flutter Windows 桌面组件
  ↓
M6 全量测试与发布
```

M0 是强制门禁阶段。M0 未通过，不允许进入完整 UI 联调和小组件联调。

---

## 3. 总体架构

```text
Anniversary Product
├── Shared Specification Assets
│   ├── calendar-runtime-rules-v1.json
│   ├── calendar-golden-1901-2100.json
│   ├── calendar-regression-scenarios-v1.json
│   └── anniversary-backup-v1.schema.json
│
├── Android App
│   ├── Flutter UI
│   ├── State Management / UseCase
│   ├── Local Database Repository
│   ├── Dart CalendarEngine
│   ├── OccurrenceGenerator
│   ├── ReminderScheduler
│   ├── WidgetSnapshotGenerator
│   ├── Android Native Widget Bridge
│   └── BackupManager
│
└── Flutter Windows Widget
    ├── Flutter Desktop Shell
    ├── Native Tray Bridge
    ├── Floating Widget Window
    ├── Local JSON Store
    ├── Dart CalendarEngine
    ├── OccurrenceGenerator
    ├── BackupImporter
    └── Settings Panel
```

### 3.1 核心原则

1. 日期引擎不依赖 UI，不依赖 Android Context，不依赖 Windows UI 控件。
2. 原始日期是业务真值，occurrence 只是缓存或计算结果。
3. Flutter Android 和 Flutter Windows 必须使用同一份规则数据、同一份 Dart 日期核心和同一份回归测试。
4. 小组件不直接计算复杂日期，只读取 `WidgetSnapshot`。
5. 提醒调度不直接拼 UI 文案，应使用标准化 occurrence 结果。
6. JSON 备份协议必须版本化。

---

## 4. 技术栈决策

### 4.1 Flutter 主应用技术栈

| 模块 | 决策 |
|---|---|
| 语言 | Dart，Android 原生桥使用 Kotlin |
| UI | Flutter Material 体系，按 HTML 原型收敛视觉 |
| 架构 | Presentation + UseCase + Repository，避免过重 Clean Architecture |
| 本地数据库 | Flutter 可用的 SQLite/Drift 类方案 |
| 异步 | Dart Future / Stream |
| 后台任务 | Android 原生桥使用 WorkManager |
| 通知 | Android 原生桥使用 Notification API |
| 普通提醒 | WorkManager + 非精确 Alarm 兜底 + App 启动校准，由平台桥调度 |
| 精确提醒 | P1/Beta，高级开关，V1.0 不默认启用 |
| 小组件 | Android 原生桥：Glance 优先，RemoteViews 兜底 |
| 备份 | JSON 文件导入导出 |

当前仓库默认不提交生成的 Flutter Android 平台目录，避免本地与 CI 的基础检查被 Android SDK 阻塞。默认开发、测试、Windows 构建与日期门禁也不依赖 Gradle；日期核心以 Dart `calendar_core` 为唯一可执行基线。Android 主应用、小组件和提醒仍是产品目标；进入 Android 原生桥任务前，需先恢复有效 Android SDK，并在 `anniversary_app` 下重新生成 Android 平台壳，届时 Kotlin 仅作为 Android 平台桥接实现。

### 4.2 Windows 技术栈

| 模块 | 决策 |
|---|---|
| UI 框架 | Flutter Windows |
| 语言 | Dart；必要系统能力使用 Windows 原生桥 |
| 产品形态 | 桌面悬浮组件 + 托盘程序 |
| 数据来源 | Android 导出的 `anniversary-backup-v1.json` |
| 本地存储 | JSON 本地副本 |
| 日期核心 | Dart CalendarEngine |
| 一致性 | 共享规则数据 + 共享 Dart 日期核心 + 共享回归场景 |
| 后续路线 | V1.5 后评估更深 Windows 原生能力或独立完整客户端 |

### 4.3 禁止的首版技术路线

1. 首版不引入云同步服务端。
2. Windows 首版不引入 Electron。
3. Windows 首版不引入 Kotlin/JVM 或 Gradle 作为运行时、构建时依赖。
4. 不调用在线农历 API。
5. 不使用系统农历结果作为业务真值。
6. 不在 Android 小组件中直接访问主业务数据库做复杂业务计算。
7. 不把 Flutter UI 层作为日期计算真值。

---

## 5. 日期模型设计

### 5.1 基础枚举

```kotlin
enum class CalendarType {
    GREGORIAN,
    CHINESE_LUNAR
}

enum class RepeatType {
    NONE,
    YEARLY
}

enum class MainDisplayType {
    COUNTDOWN,
    ELAPSED_DAYS,
    ANNIVERSARY_YEAR
}
```

### 5.2 日期保存原则

必须保存用户输入的原始日期。

错误做法：

```json
{
  "title": "妈妈生日",
  "date": "2026-09-14"
}
```

正确做法：

```json
{
  "title": "妈妈生日",
  "calendarType": "CHINESE_LUNAR",
  "datePayload": {
    "lunarYear": 1968,
    "lunarMonth": 8,
    "lunarDay": 3,
    "isLeapMonth": false
  }
}
```

### 5.3 本地数据库表设计

Flutter 主线使用本地 SQLite/Drift 类方案承载以下表语义。字段命名可按 Dart/SQL 风格落地，但备份协议与跨端枚举值必须保持稳定。

#### event 表

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | UUID |
| title | TEXT | 纪念日名称 |
| category | TEXT | birthday / family / love / anniversary / life / other |
| calendar_type | TEXT | GREGORIAN / CHINESE_LUNAR |
| gregorian_year | INTEGER NULL | 公历年 |
| gregorian_month | INTEGER NULL | 公历月 |
| gregorian_day | INTEGER NULL | 公历日 |
| lunar_year | INTEGER NULL | 农历年；生日类可为空或保存原始出生农历年 |
| lunar_month | INTEGER NULL | 农历月 1-12 |
| lunar_day | INTEGER NULL | 农历日 1-30 |
| is_leap_month | INTEGER NULL | 0/1 |
| repeat_type | TEXT | NONE / YEARLY |
| main_display | TEXT | COUNTDOWN / ELAPSED_DAYS / ANNIVERSARY_YEAR |
| note | TEXT | 备注 |
| is_pinned | INTEGER | 0/1 |
| is_archived | INTEGER | 0/1 |
| created_at | TEXT | ISO-8601 |
| updated_at | TEXT | ISO-8601 |

#### reminder_rule 表

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | UUID |
| event_id | TEXT | 关联 event |
| enabled | INTEGER | 0/1 |
| reminder_time | TEXT | HH:mm |
| advance_days_json | TEXT | 如 `[7,0]` |
| timezone_mode | TEXT | DEVICE / FIXED |
| fixed_timezone | TEXT NULL | 如 Asia/Shanghai |

#### policy_rule 表

| 字段 | 类型 | 说明 |
|---|---|---|
| event_id | TEXT | 关联 event |
| leap_day_policy | TEXT | FEB_28 / MAR_01 / SKIP |
| missing_lunar_day_policy | TEXT | LAST_DAY_OF_MONTH / NEXT_MONTH_FIRST_DAY / SKIP / ASK |
| leap_month_policy | TEXT | NORMAL_MONTH_FALLBACK / ONLY_LEAP_MONTH / ASK |

#### occurrence_cache 表

| 字段 | 类型 | 说明 |
|---|---|---|
| event_id | TEXT | 关联 event |
| target_year | INTEGER | 目标年份 |
| occurrence_date | TEXT | 公历日期 yyyy-MM-dd |
| source_display | TEXT | 原始日期展示 |
| status | TEXT | VALID / SKIPPED / NEED_CONFIRM / OUT_OF_RANGE |
| engine_version | TEXT | 农历引擎版本 |
| rule_version | TEXT | 规则数据版本 |
| generated_at | TEXT | 生成时间 |

#### widget_snapshot 表

| 字段 | 类型 | 说明 |
|---|---|---|
| widget_id | TEXT | AppWidgetId 或内部 ID |
| widget_type | TEXT | SINGLE / UPCOMING_LIST / ELAPSED |
| event_id | TEXT NULL | 关联事件 |
| title | TEXT | 展示标题 |
| main_text | TEXT | 主数字，如“还有 7 天” |
| sub_text | TEXT | 副文案 |
| target_date | TEXT NULL | 目标日期 |
| privacy_mode | INTEGER | 0/1 |
| updated_at | TEXT | 更新时间 |

---

## 6. 农历数据源与 CalendarEngine

### 6.1 决策

首版使用：

```text
GB/T 33661-2017 规则基线 + 内置农历数据表 + 独立 CalendarEngine
```

支持范围：

```text
1901-01-01 至 2100-12-31
```

超出范围返回 `OUT_OF_RANGE`，UI 层展示可理解提示。

数据源与授权边界已在 `docs/calendar_data_source_decision_v1.md` 归档。首期规则语义以 GB/T 33661-2017《农历的编算和颁行》为基线；公开对照数据仅可作为离线生成或交叉校验输入，不得作为运行时在线换算依赖。所有实现必须显式保存闰月标记，不能只用月份数字表达农历月份。

### 6.2 规则数据文件

#### calendar-runtime-rules-v1.json

用于运行时转换与 occurrence 生成。

```json
{
  "version": "lunar-rules-1.0.0",
  "range": {
    "start": "1901-01-01",
    "end": "2100-12-31"
  },
  "years": [
    {
      "gregorianYear": 2026,
      "lunarNewYear": "2026-02-17",
      "leapMonth": null,
      "months": [
        { "month": 1, "isLeap": false, "days": 29 },
        { "month": 2, "isLeap": false, "days": 30 }
      ]
    }
  ]
}
```

#### calendar-golden-1901-2100.json

用于测试，不直接进入 UI。

```json
{
  "gregorian": "2026-09-14",
  "lunarYear": 2026,
  "lunarMonth": 8,
  "lunarDay": 4,
  "isLeapMonth": false,
  "lunarMonthDays": 29,
  "lunarDisplay": "农历八月初四"
}
```

#### calendar-regression-scenarios-v1.json

用于业务场景测试，最低 120 条。

```json
{
  "id": "LUNAR_BIRTHDAY_001",
  "title": "妈妈生日",
  "event": {
    "calendarType": "CHINESE_LUNAR",
    "datePayload": {
      "lunarMonth": 8,
      "lunarDay": 3,
      "isLeapMonth": false
    },
    "repeatRule": {
      "type": "YEARLY",
      "calendarBasis": "CHINESE_LUNAR"
    }
  },
  "fromDate": "2026-06-19",
  "expected": {
    "nextOccurrence": "2026-09-13",
    "display": "农历八月初三"
  }
}
```

### 6.3 历史跨语言接口

冻结版跨端接口契约见 `shared/calendar/calendar-engine-contract-v1.md`。Kotlin 草案位于 `shared/calendar/contracts/kotlin/CalendarEngine.kt`，C# 草案位于 `shared/calendar/contracts/csharp/ICalendarEngineAdapter.cs`，二者在 v1.2 起作为历史契约与语义参考，不进入默认构建链路。Flutter 主线以 Dart `calendar_core`、同一份规则数据与回归测试作为验收真值。下方代码块保留为核心能力摘要，具体实现必须以冻结契约和 Flutter 迁移决策为准。

```kotlin
data class LunarDate(
    val lunarYear: Int,
    val lunarMonth: Int,
    val lunarDay: Int,
    val isLeapMonth: Boolean,
    val monthDays: Int
)

data class Occurrence(
    val eventId: String,
    val occurrenceDate: LocalDate?,
    val sourceDisplay: String,
    val status: OccurrenceStatus,
    val reason: String? = null
)

enum class OccurrenceStatus {
    VALID,
    SKIPPED,
    NEED_CONFIRM,
    OUT_OF_RANGE
}

interface CalendarEngine {
    val engineVersion: String
    val ruleVersion: String

    fun gregorianToLunar(date: LocalDate): LunarDate

    fun lunarToGregorian(
        lunarYear: Int,
        lunarMonth: Int,
        lunarDay: Int,
        isLeapMonth: Boolean
    ): LocalDate?

    fun getLunarMonthDays(
        lunarYear: Int,
        lunarMonth: Int,
        isLeapMonth: Boolean
    ): Int?

    fun getLeapMonth(lunarYear: Int): Int?
}
```

### 6.4 历史 C# 适配接口

```csharp
public interface ICalendarEngineAdapter
{
    string EngineVersion { get; }
    string RuleVersion { get; }

    LunarDate GregorianToLunar(DateOnly date);

    DateOnly? LunarToGregorian(
        int lunarYear,
        int lunarMonth,
        int lunarDay,
        bool isLeapMonth);

    int? GetLunarMonthDays(
        int lunarYear,
        int lunarMonth,
        bool isLeapMonth);

    int? GetLeapMonth(int lunarYear);
}
```

v1.2 Flutter 主线不再要求 Windows V1.0 实现 C# 适配层；Windows 侧复用 Dart `calendar_core`。该接口保留用于追溯早期 Windows/WPF 方案和跨语言契约设计。

### 6.5 禁止事项

1. 禁止 UI 层直接解析农历数据文件。
2. 禁止业务使用系统农历 API 作为真值。
3. 禁止 Android 和 Windows 使用不同版本的 `calendar-runtime-rules-v1.json`。
4. 禁止 occurrence_cache 作为唯一日期来源。
5. 禁止缺失 `isLeapMonth`。

---

## 7. OccurrenceGenerator 设计

### 7.1 职责

OccurrenceGenerator 负责把原始事件转换为指定年份或指定日期后的下一次发生日期。

输入：

```text
Event + RepeatRule + PolicyRule + fromDate
```

输出：

```text
Occurrence
```

### 7.2 处理流程

```text
读取 Event
  ↓
判断 calendar_type
  ↓
生成目标年份候选日期
  ↓
处理异常策略
  ↓
转换为公历 occurrence_date
  ↓
计算 display 文案
  ↓
返回 Occurrence
```

### 7.3 下次纪念日算法

```kotlin
fun getNextOccurrence(event: Event, fromDate: LocalDate): Occurrence {
    val currentYear = fromDate.year
    val candidates = listOf(currentYear, currentYear + 1, currentYear + 2)

    for (year in candidates) {
        val occurrence = generateOccurrenceForYear(event, year)
        if (occurrence.status == VALID && occurrence.occurrenceDate != null) {
            if (!occurrence.occurrenceDate.isBefore(fromDate)) {
                return occurrence
            }
        }
    }

    return Occurrence(
        eventId = event.id,
        occurrenceDate = null,
        sourceDisplay = event.sourceDisplay,
        status = OUT_OF_RANGE,
        reason = "No valid occurrence found in supported range"
    )
}
```

### 7.4 特殊日期策略

#### 公历 2 月 29 日

| policy | 非闰年结果 |
|---|---|
| FEB_28 | 2 月 28 日 |
| MAR_01 | 3 月 1 日 |
| SKIP | 跳过该年 |

#### 农历闰月

| policy | 无对应闰月年份结果 |
|---|---|
| NORMAL_MONTH_FALLBACK | 普通同月同日 |
| ONLY_LEAP_MONTH | 跳过该年 |
| ASK | NEED_CONFIRM |

#### 农历三十遇小月

| policy | 结果 |
|---|---|
| LAST_DAY_OF_MONTH | 当月最后一天 |
| NEXT_MONTH_FIRST_DAY | 下月初一 |
| SKIP | 跳过该年 |
| ASK | NEED_CONFIRM |

#### 除夕

除夕必须按“腊月最后一天”计算，不能固定为腊月三十。

---

## 8. Flutter Android 主应用架构

### 8.1 分层

```text
UI Layer
├── HomeScreen
├── EventEditScreen
├── EventDetailScreen
└── SettingsScreen

Domain Layer
├── EventUseCase
├── OccurrenceUseCase
├── ReminderUseCase
├── BackupUseCase
└── WidgetUseCase

Data Layer
├── Local Database DAO
├── Dart CalendarEngine
├── ReminderScheduler
├── WidgetSnapshotRepository
└── BackupManager

Platform Bridge Layer
├── AndroidReminderBridge
├── AndroidWidgetBridge
├── AndroidPermissionBridge
└── AndroidBootAndDateChangeBridge
```

### 8.2 页面与用例映射

| 页面 | 关键用例 |
|---|---|
| 首页 | 获取今日/即将到来/置顶事件，生成主展示文案 |
| 新增/编辑 | 保存事件、校验日期、生成未来 5 年预览 |
| 详情 | 展示原始日期、下次日期、未来预览、提醒规则 |
| 设置 | 通知权限、备份恢复、隐私模式、深浅色 |

### 8.3 UI 原则

1. 主页面不暴露复杂农历术语。
2. 特殊日期才出现策略选择。
3. 保存前展示本年度对应公历日期。
4. 农历未来预览替代复杂规则解释。
5. 隐私模式影响 App 卡片和小组件。

---

## 9. Android 提醒设计

### 9.1 决策

V1.0 默认提醒采用：

```text
WorkManager + Notification + App 启动校准 + BOOT_COMPLETED 重建调度
```

精确提醒不作为默认能力，P1/Beta 高级开关后置。

### 9.2 模块

```text
ReminderScheduler
├── scheduleEventReminders(eventId)
├── cancelEventReminders(eventId)
├── rescheduleAll()
├── checkNotificationPermission()
└── buildNotificationPayload()
```

### 9.3 调度时机

| 时机 | 行为 |
|---|---|
| 新增事件 | 生成 occurrence，注册提醒 |
| 编辑事件 | 取消旧提醒，注册新提醒 |
| 删除事件 | 取消提醒 |
| App 启动 | 校准未来提醒 |
| 系统重启 | 重建未来提醒 |
| 日期变化 | 小组件与提醒数据校准 |

### 9.4 权限处理

1. Android 13+ 检查通知权限。
2. 未授权时在提醒设置页提示。
3. 用户拒绝后不反复打扰。
4. 开启提醒时解释权限价值。
5. 精确提醒权限不在 V1.0 默认请求。

### 9.5 用户文案约束

禁止承诺：

```text
一定准点提醒
```

允许表达：

```text
我们会在你设置的日期提醒你。受系统省电策略影响，提醒时间可能存在轻微延迟。
```

---

## 10. Android 小组件设计

### 10.1 技术决策

```text
Glance 优先，RemoteViews 兜底
```

### 10.2 首版小组件冻结

| 类型 | 尺寸 | 内容 |
|---|---|---|
| 单纪念日 | 2x2 | 名称、主数字、日期说明 |
| 最近纪念日 | 4x2 | 最近 3 个事件 |
| 已过天数 | 2x2 | 名称、第 N 天、开始日期 |

### 10.3 数据流

```text
Local Event Store
  ↓
OccurrenceGenerator
  ↓
WidgetSnapshotGenerator
  ↓
widget_snapshot 表 / Android 原生桥快照
  ↓
Glance Widget UI
```

小组件只读取 `WidgetSnapshot`，不得直接执行业务计算。

### 10.4 刷新策略

| 场景 | 策略 |
|---|---|
| 新增/编辑/删除事件 | 立即刷新相关快照与小组件 |
| 零点跨日 | WorkManager 尝试刷新；App 打开时强校准 |
| 系统重启 | 重建快照并刷新小组件 |
| 隐私模式切换 | 刷新所有小组件 |
| 规则数据升级 | 失效所有 occurrence 与 snapshot |

### 10.5 兼容性验收

最低覆盖：

1. Android 10、11、12、13、14、15。
2. Pixel、三星、小米、OPPO、vivo。
3. 深色模式、浅色模式、省电模式。
4. 2x2 与 4x2 尺寸。
5. 编辑后 5 秒内刷新。
6. 打开 App 后跨日校准成功。

如 Glance 在目标机型表现不稳定，允许对应小组件回退 RemoteViews。

---

## 11. 备份、恢复与跨端协议

### 11.1 备份文件

文件名建议：

```text
anniversary-backup-v1.json
```

### 11.2 备份结构

```json
{
  "schemaVersion": "1.0.0",
  "exportedAt": "2026-06-19T10:00:00+08:00",
  "appVersion": "1.0.0",
  "calendarRuleVersion": "lunar-rules-1.0.0",
  "events": [
    {
      "id": "event_001",
      "title": "妈妈生日",
      "category": "family_birthday",
      "calendarType": "CHINESE_LUNAR",
      "datePayload": {
        "lunarYear": 1968,
        "lunarMonth": 8,
        "lunarDay": 3,
        "isLeapMonth": false
      },
      "repeatRule": {
        "type": "YEARLY",
        "calendarBasis": "CHINESE_LUNAR",
        "leapMonthPolicy": "NORMAL_MONTH_FALLBACK",
        "missingLunarDayPolicy": "LAST_DAY_OF_MONTH",
        "leapDayPolicy": "FEB_28"
      },
      "reminderRule": {
        "enabled": true,
        "time": "09:00",
        "advanceDays": [7, 0],
        "timezone": "device"
      },
      "displayRule": {
        "mainDisplay": "COUNTDOWN",
        "showLunar": true,
        "showGregorian": true
      },
      "note": "",
      "isPinned": false,
      "isArchived": false,
      "createdAt": "2026-06-19T10:00:00+08:00",
      "updatedAt": "2026-06-19T10:00:00+08:00"
    }
  ]
}
```

### 11.3 导入策略

| 情况 | 处理 |
|---|---|
| schemaVersion 支持 | 正常导入 |
| schemaVersion 更高 | 拒绝导入并提示版本过新 |
| event id 冲突 | 保留本地，导入项生成新 id；报告冲突 |
| 日期超范围 | 导入但标记 OUT_OF_RANGE，或由用户确认 |
| 字段缺失 | 使用默认值并写入导入报告 |

### 11.4 Windows 数据来源

Windows V1.0 只支持：

1. 导入 Android JSON。
2. 保存本地副本。
3. 手动重新导入。
4. 使用本地 Dart CalendarEngine 重算 occurrence。

不支持云端自动同步。

---

## 12. Flutter Windows 桌面组件设计

### 12.1 产品形态

```text
Flutter Windows 桌面悬浮组件 + 托盘程序
```

不是 Windows Widgets Board，不是完整 Windows 客户端。

### 12.2 架构

```text
Windows Anniversary Widget
├── Flutter Desktop Shell
├── WindowsTrayBridge
├── FloatingWindowController
├── WidgetModeController
├── BackupImporter
├── LocalJsonStore
├── Dart CalendarEngine
├── OccurrenceGenerator
└── SettingsPanel
```

### 12.3 功能冻结

必须做：

1. 导入 Android 备份 JSON。
2. 最近纪念日列表。
3. 单个纪念日卡片。
4. 极简角标模式。
5. 托盘显示/隐藏。
6. 开机启动开关。
7. 深浅色模式。
8. 手动刷新。
9. 本地缓存。
10. 与 Android 日期结果一致。

不做：

1. Windows 端完整新增农历事件。
2. Windows 端完整编辑所有字段。
3. 自动云同步。
4. 多账号。
5. 家庭共享。

### 12.4 一致性要求

同一个 `anniversary-backup-v1.json` 在 Android 与 Windows 上必须计算出一致的：

1. nextOccurrence。
2. future 5 occurrences。
3. sourceDisplay。
4. status。

CI 或手工门禁必须执行 Flutter Android/Flutter Windows 共享场景测试。

---

## 13. 测试设计

### 13.1 测试资产

| 文件 | 用途 | 门禁 |
|---|---|---|
| calendar-golden-1901-2100.json | 全量公历农历映射测试 | 必须通过 |
| calendar-regression-scenarios-v1.json | 业务 occurrence 场景测试 | 必须通过 |
| anniversary-backup-v1.schema.json | 备份协议测试 | 必须通过 |

### 13.2 calendar-regression-scenarios-v1.json 分布

最低 120 条场景。

| 类别 | 最低数量 |
|---|---:|
| 普通公历每年重复 | 15 |
| 公历 2 月 29 日 | 10 |
| 普通农历生日 | 20 |
| 农历闰月 | 20 |
| 农历三十 / 小月缺失 | 15 |
| 除夕 | 10 |
| 春节前后农历年边界 | 10 |
| 未来 5 年预览 | 10 |
| 备份恢复后重算 | 5 |
| Android / Windows 一致性 | 5 |

### 13.3 Android 测试

1. CalendarEngine 单元测试。
2. OccurrenceGenerator 单元测试。
3. Local database DAO 测试。
4. BackupManager 测试。
5. ReminderScheduler 测试。
6. WidgetSnapshotGenerator 测试。
7. Flutter 页面冒烟测试。
8. 小组件刷新测试。
9. 通知权限测试。

### 13.4 Windows 测试

1. JSON 导入测试。
2. CalendarEngineAdapter 测试。
3. OccurrenceGeneratorAdapter 测试。
4. 托盘操作测试。
5. 悬浮窗稳定性测试。
6. 开机启动测试。
7. 长时间运行资源占用测试。
8. Flutter Android/Flutter Windows 一致性测试。

### 13.5 CI 阻断条件

任何以下测试失败，禁止合并：

1. CalendarEngine unit test。
2. OccurrenceGenerator unit test。
3. calendar-regression-scenarios-v1.json。
4. 备份 schema 测试。
5. Flutter Android/Flutter Windows shared scenario test。

---

## 14. 发布门禁

### 14.1 日期门禁

必须通过：

```text
calendar-golden-1901-2100.json 全量测试
calendar-regression-scenarios-v1.json 全量测试
Android / Windows occurrence 一致性测试
```

任何日期核心测试失败，禁止发布。

### 14.2 Android 门禁

1. 可以新增公历纪念日。
2. 可以新增农历纪念日。
3. 农历未来 5 年预览正确。
4. 本地提醒可触发。
5. 通知权限状态提示正确。
6. 小组件显示正确。
7. 小组件跨日刷新或 App 打开校准正确。
8. 备份恢复正确。
9. 深色模式正确。
10. 隐私模式正确。

### 14.3 Windows 门禁

1. 可以导入 Android JSON。
2. 与 Android 日期结果一致。
3. 桌面悬浮窗稳定。
4. 托盘显示/隐藏正常。
5. 开机启动正常。
6. 深浅色模式正常。
7. 长时间运行无明显 CPU 占用异常。
8. 重启后数据不丢失。

---

## 15. 风险与应对

| 风险 | 等级 | 应对 |
|---|---|---|
| 农历计算错误 | 高 | M0 建 golden 数据和回归测试，日期失败禁止进入 UI 联调 |
| Flutter Android/Flutter Windows 日期不一致 | 高 | 共享 JSON 规则、Dart 日期核心与回归测试，Windows 不可自行定义规则 |
| 小组件不刷新 | 高 | WidgetSnapshot + WorkManager + App 启动校准 + 编辑后主动刷新 |
| 提醒漏发 | 高 | 权限检测、启动校准、重启恢复、普通提醒不承诺绝对准点 |
| 备份协议后期不兼容 | 中高 | schemaVersion、导入报告、迁移器 |
| Windows 范围失控 | 中高 | 首版只做 Flutter Windows 悬浮组件，不做完整编辑器 |
| 云同步拖垮首版 | 高 | V1.0 冻结为本地优先，云同步后置 |
| UI 过度装饰影响长期使用 | 中 | 小组件清晰、克制、年轻清新但不信息过载 |

---

## 16. 后续扩展边界

### V1.5 可考虑

1. 可选云同步。
2. 精确提醒高级开关。
3. 更多小组件尺寸。
4. Windows 简单编辑能力。
5. 日历订阅导出。
6. 节气提醒。

### V2.0 可考虑

1. 家庭共享。
2. 多端实时同步。
3. iOS。
4. Mac。
5. Web。
6. 更完整的桌面客户端。

---

## 17. 技术设计自审核

| 检查项 | 结论 |
|---|---|
| CTO 决策是否全部写入 | 通过 |
| 首版范围是否冻结 | 通过 |
| 农历数据源是否明确 | 通过 |
| 农历支持范围是否明确 | 通过，1901-2100 |
| 是否避免依赖系统农历 | 通过 |
| Flutter Android/Flutter Windows 一致性机制是否明确 | 通过 |
| Windows 技术栈是否明确 | 通过，Flutter Windows |
| Glance 风险是否处理 | 通过，RemoteViews 兜底 |
| 精确提醒是否后置 | 通过 |
| 测试资产是否明确 | 通过 |
| 发布门禁是否阻断高风险 | 通过 |
| 云同步是否后置 | 通过 |
| 是否适配需求文档“干净、准确、长期可用” | 通过 |

最终结论：本文档已完成 Flutter 主线迁移更新，可作为 v1.2 技术基线。
