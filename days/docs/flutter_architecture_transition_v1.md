# Flutter 架构迁移决策记录

版本：v1.0  
确认日期：2026-06-19  
对应故事卡片：M0-ARCH-001 冻结 Flutter 主线架构  
状态：已确认

---

## 1. 结论

首期技术主线调整为：

```text
Flutter 主应用 + Flutter Windows 桌面悬浮组件 + Android 原生桥接小组件/提醒
```

本次调整不改变首期产品范围：仍然只做 Android 主应用、Android 桌面小组件、Windows 桌面悬浮组件、本地优先数据、公历与中国农历支持、普通提醒、JSON 备份恢复和跨端日期一致性。

---

## 2. 架构边界

```text
Flutter App
├── Dart calendar_core
├── Dart domain/usecase
├── Flutter Android 主应用 UI
├── Flutter Windows 悬浮组件 UI
├── Local database
├── BackupManager
└── WidgetSnapshotGenerator

Android Native Bridge
├── Home Widget: Glance 或 RemoteViews
├── WorkManager / Notification
├── Boot receiver / date change receiver
└── Android permission bridge

Windows Native Bridge
├── Tray bridge
├── Always-on-top floating window behavior
├── Launch at startup
└── Local file import bridge
```

关键约束：

1. Flutter UI 不直接计算复杂农历日期。
2. Android 小组件仍只读取 `WidgetSnapshot`。
3. Android 小组件和提醒允许使用 Kotlin 原生桥接。
4. Windows 桌面形态由 Flutter Windows 实现，不再以 WPF 作为 V1.0 主线。
5. 跨端真值仍是同一份 `calendar-runtime-rules-v1.json`、`calendar-golden-1901-2100.json` 和 `calendar-regression-scenarios-v1.json`。
6. 当前仓库默认开发链路不依赖 Android SDK；Android 平台目录和原生桥在 Android SDK 与设备矩阵可用时再生成/接入。
7. 当前仓库默认开发链路不依赖 Gradle；日期核心以 Dart `calendar_core` 作为唯一可执行基线。

---

## 3. 日期核心迁移策略

Flutter 主线以 Dart `calendar_core` 作为当前唯一可执行日期核心。早期 Kotlin/JVM 预研原型已在 Dart 核心通过全量回归后移除，不再进入默认开发、测试或 CI 链路：

1. Dart 实现加载同一份 `calendar-runtime-rules-v1.json`。
2. Dart 实现必须通过同一份 golden 与 regression scenarios。
3. Android 原生桥后续如需 Kotlin 代码，只作为平台桥接实现，不作为日期核心默认构建入口。
4. Windows 不再需要 C# `CalendarEngineAdapter`；Flutter Windows 直接复用 Dart `calendar_core`。

---

## 4. 本地数据策略

原 Room 主线调整为 Flutter 本地数据库主线：

1. 主应用本地数据使用 Flutter 可用的 SQLite/Drift 类方案。
2. 表结构语义沿用技术设计中的 event、reminder_rule、policy_rule、occurrence_cache、widget_snapshot。
3. 数据库字段和备份 JSON 字段必须继续保存原始日期类型，不能只保存转换后的公历日期。
4. Android 原生小组件不直接查复杂业务表；它读取由 Flutter 侧生成并同步给原生桥的 `WidgetSnapshot`。

---

## 5. 小组件与提醒

Flutter 负责事件编辑、occurrence 计算、快照生成和设置入口。Android 原生桥负责系统能力：

1. 桌面小组件：Glance 优先，RemoteViews 兜底。
2. 小组件数据：只读 `WidgetSnapshot`，不得直接农历计算。
3. 普通提醒：WorkManager / Notification / Boot receiver 由 Android 原生桥实现。
4. 通知权限：Flutter UI 展示状态和引导，权限请求经平台桥执行。
5. 精确提醒：仍为 P1/Beta 后置，V1.0 不默认启用。

---

## 6. Windows 策略

Windows V1.0 改为 Flutter Windows 桌面悬浮组件：

1. 支持导入 Android 导出的 `anniversary-backup-v1.json`。
2. 使用 Dart `calendar_core` 重算 nextOccurrence 与未来 5 年预览。
3. 支持托盘、显示/隐藏、置顶、开机启动、手动刷新、深浅色。
4. 不做 Windows Widgets Board。
5. 不做 Windows 完整编辑器。

---

## 7. 验收门禁

Flutter 主线必须新增并通过：

1. Dart calendar_core golden 全量测试。
2. Dart calendar_core regression scenarios 全量测试。
3. Flutter 备份 schema 校验测试。
4. Android 原生 WidgetSnapshot 桥接测试。
5. Android 提醒权限与普通提醒桥接测试。
6. Flutter Android 与 Flutter Windows 同源数据一致性测试。

任一日期核心测试失败，禁止进入 UI 联调和发布。
