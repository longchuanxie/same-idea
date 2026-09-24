# 桌面小组件：继续阅读 · 阅读统计（2026-09-24 落地）

> 裁定：桌面存在感是阅读 App 的天然入口——回到上次位置应该是「一步」，而不是
> 解锁→找图标→开 App→找书四步。小组件的数据永远是「最近一次阅读状态的影子」，
> 不做任何需要唤醒 App 才能成立的交互。

## 两个小组件

| 小组件 | 信息 | 点击去向 | 数据源 |
|---|---|---|---|
| 继续阅读（3×1/4×1） | 封面 + 书名 + 章节名 + 朱砂进度条 + 百分比 | `readerPathForBook` 对应的阅读器路由（文本书带章节直达） | `useLibraryStore`（最近在读） |
| 阅读统计（3×1/4×1） | 今日分钟数 + 连续天数 + 每日目标进度条 | `/stats` | `useStatsStore` |

无书/无数据时渲染指路空态（「打开一本书，从这里继续」「到设置里定个每日目标」），
首次添加、设备重启后无 App 介入也体面（onUpdate 读落盘载荷渲染）。

## 架构

- **数据流（单向）**：JS 订阅 store 变化（`useDesktopWidgets` 挂在 Router 内——
  `useNavigate` 必须有路由上下文，挂在 App 根会启动即崩，实测抓到过）→ 防抖 1.5s →
  `WidgetBridge` 插件推送载荷 → 原生落盘（SharedPreferences）+ 立即渲染全部实例。
- **落盘即渲染**：载荷（含封面路径）存 SharedPreferences，`onUpdate`（添加/重启）
  直接读盘重绘；封面按书落盘 96px JPEG（换书才重传，进度推送保持轻量）。
- **深链两条通道**：冷启动（App 未运行时点击）路由先落盘，JS 就绪后
  `consumePendingRoute` 取走；暖启动走 `widgetRoute` 事件实时导航。路由字符串由
  JS 按书格式拼好随载荷下发，原生只透传。
- **配色**：`values/` + `values-night/` 双份 `widget_colors`，与「墨·纸·光·印」
  色板同源（纸面卡底、暖墨文字、朱砂进度丝带——唯一强调色语义不变），
  跟随系统夜间模式自动换档。

## Android 实现备忘

- `RemoteViews.setProgress(viewId, max, value)` 三参版是 API 31+；minSdk 24 用
  `setInt(viewId, "setMax"/"setProgress", ...)` 反射式赋值。
- 插件方法收到的 `call.getData()` 就是 JS 传参对象本身（含 `payload` 包装层），
  落盘前必须解包，否则小组件读不到字段（实测抓到过）。
- 点击 PendingIntent：每实例独立 `requestCode` + 独立 action，防 extras 合并；
  `FLAG_IMMUTABLE` 必带。

## 验证（Kuro_API35 模拟器实测）

两枚小组件经启动器选择器添加上屏；继续阅读显示书名/章节/42% 进度条，
点击直达 `/text-reader/:bookId/ch-4`；阅读统计显示今日分钟/连击/目标进度，
点击落 `/stats`；夜间模式配色自动换档人眼验收通过。
