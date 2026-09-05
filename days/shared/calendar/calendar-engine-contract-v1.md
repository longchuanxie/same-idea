# CalendarEngine Contract v1

版本：v1.0  
对应故事卡片：M0-CALENDAR-004 冻结 CalendarEngine 接口  
状态：已冻结

---

## 1. 目标

CalendarEngine 是纯业务日期核心，负责公历、中国农历、节日和纪念日 occurrence 计算。它不得依赖 Android Context、Compose、Room、WPF UI、系统农历 API 或在线农历接口。

Android 与 Windows 可以使用不同语言实现，但必须遵守同一语义、加载同一份 `shared/calendar/calendar-runtime-rules-v1.json`，并通过同一份 `shared/calendar/calendar-golden-1901-2100.json` 与场景回归测试。

---

## 2. 支持范围

| 项 | 值 |
|---|---|
| 公历范围 | 1901-01-01 至 2100-12-31 |
| 规则版本 | lunar-rules-1.0.0 |
| 运行时规则 | shared/calendar/calendar-runtime-rules-v1.json |
| golden 数据 | shared/calendar/calendar-golden-1901-2100.json |

超出范围必须返回 `OUT_OF_RANGE`，不得抛给 UI 层裸异常。

---

## 3. 统一枚举

```text
CalendarType = GREGORIAN | CHINESE_LUNAR
RepeatType = NONE | YEARLY
OccurrenceStatus = VALID | SKIPPED | NEED_CONFIRM | OUT_OF_RANGE | INVALID
LeapDayPolicy = FEB_28 | MAR_01 | SKIP
MissingLunarDayPolicy = LAST_DAY_OF_MONTH | NEXT_MONTH_FIRST_DAY | SKIP | ASK
LeapMonthPolicy = NORMAL_MONTH_FALLBACK | ONLY_LEAP_MONTH | ASK
FestivalKind = SOLAR | LUNAR | DERIVED_LUNAR
```

备份 JSON、Room 枚举文本、Windows 导入协议和测试场景必须使用上面的稳定字符串值。具体语言里的枚举命名可以遵守本语言习惯，但序列化时必须映射到同一组字符串。

---

## 4. 统一数据结构

### 4.1 日期载荷

公历载荷：

```json
{
  "year": 2026,
  "month": 9,
  "day": 13,
  "timezone": "Asia/Shanghai"
}
```

农历载荷：

```json
{
  "lunarYear": 2026,
  "lunarMonth": 8,
  "lunarDay": 3,
  "isLeapMonth": false,
  "timezoneBasis": "Asia/Shanghai"
}
```

农历载荷必须保存 `isLeapMonth`。普通月与闰月同月同日不是同一个业务日期。

### 4.2 事件输入

```json
{
  "id": "event_001",
  "title": "妈妈生日",
  "calendarType": "CHINESE_LUNAR",
  "datePayload": {
    "lunarYear": 1968,
    "lunarMonth": 8,
    "lunarDay": 3,
    "isLeapMonth": false
  },
  "repeatRule": {
    "type": "YEARLY",
    "leapDayPolicy": "FEB_28",
    "missingLunarDayPolicy": "LAST_DAY_OF_MONTH",
    "leapMonthPolicy": "NORMAL_MONTH_FALLBACK"
  }
}
```

### 4.3 Occurrence 输出

```json
{
  "eventId": "event_001",
  "targetYear": 2026,
  "occurrenceDate": "2026-09-13",
  "sourceDisplay": "农历八月初三",
  "status": "VALID",
  "reason": null,
  "ruleVersion": "lunar-rules-1.0.0",
  "engineVersion": "calendar-engine-1.0.0"
}
```

---

## 5. 必须提供的方法

### 5.1 基础转换

```text
getSupportedRange(): DateRange
gregorianToLunar(date): CalendarResult<LunarDate>
lunarToGregorian(lunarDate): CalendarResult<LocalDate>
getLunarMonthDays(lunarYear, lunarMonth, isLeapMonth): CalendarResult<Int>
getLeapMonth(lunarYear): CalendarResult<Int?>
```

### 5.2 Occurrence

```text
generateOccurrenceForYear(event, targetYear): Occurrence
getNextOccurrence(event, fromDate): Occurrence
getFutureOccurrences(event, fromDate, count): List<Occurrence>
```

要求：

1. `NONE` 事件只在原始日期不早于 `fromDate` 时返回一次。
2. `YEARLY` 公历事件按目标年生成，2 月 29 日按 `leapDayPolicy` 处理。
3. `YEARLY` 农历事件按目标农历年生成，闰月按 `leapMonthPolicy` 处理。
4. 农历三十遇小月按 `missingLunarDayPolicy` 处理。
5. 除夕按农历腊月最后一天计算，不能固定为腊月三十。
6. 任一结果日期超出 1901-01-01 至 2100-12-31 必须返回 `OUT_OF_RANGE`。

### 5.3 节日解析

```text
resolveFestivals(date): List<FestivalInfo>
```

首期至少覆盖：

```text
春节、元宵、端午、七夕、中秋、重阳、腊八、小年、除夕
```

节日解析不得改变 occurrence 计算结果，只作为展示能力。

---

## 6. 异常语义

| 场景 | 状态 |
|---|---|
| 日期超出支持范围 | OUT_OF_RANGE |
| 输入字段缺失或非法 | INVALID |
| 策略为 SKIP 且当年无有效日期 | SKIPPED |
| 策略为 ASK 且需要用户确认 | NEED_CONFIRM |
| 计算出有效公历日期 | VALID |

业务层应使用状态处理 UI 和导入报告，不得依赖异常文本。

---

## 7. 代码草案位置

| 语言 | 文件 |
|---|---|
| Kotlin | shared/calendar/contracts/kotlin/CalendarEngine.kt |
| C# | shared/calendar/contracts/csharp/ICalendarEngineAdapter.cs |
