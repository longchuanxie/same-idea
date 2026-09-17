# kuro-reader 三维度体检报告（2026-09-17）

> 基线：`comics` 分支 `b949c04` + 工作区未提交改动（上一轮会话已验证的文本选区修复 9 文件 + 用户 WIP：`piperEngine.ts`、`android/app/build.gradle`）。
> 阶段一~三为纯诊断，全部改动统一收口到阶段四；问题编号 U-需求 / UX-动线 / E-工程全程沿用。
> 证据约定：`文件:行号` 均指基线时点代码。本文档自身为体检交付物，随阶段四/五追加实施与回归记录。

---

## 阶段〇：基线快照（诊断前状态）

| 检查项 | 结果 | 证据 |
|---|---|---|
| 自动化测试 | **834/834 全绿**（106 个测试文件，13.0s） | `npm test` |
| ESLint + 令牌守卫 | **3 错**，全部在 `piperEngine.ts`（用户 WIP） | `npm run lint` |
| TypeScript | **3 错**，全部在 `piperEngine.ts`（用户 WIP） | `npx tsc --noEmit` |
| 构建链 `npm run build`（tsc && vite build） | **失败**（被上述 WIP 类型错误挡下） | 同上 |
| 显式 any / console.log | 全仓 **0 处** | Explore 代理 grep |
| React.memo | 全仓 **0 处** | 同上 |
| 未提交改动 | 选区锚点层重构（33 例新测试绿 + 真机复核 5 项过，见 `docs/text-selection-diagnosis.md`、`docs/text-selection-verify/`）；piperEngine WIP 半成品 | `git status` |

---

## 阶段一：用户需求匹配度分析

### 1.1 功能清单（穷举，F1–F48）

路由 21 个（`src/constants/routes.ts:1-23`，注册于 `src/App.tsx:117-152`）。按模块列全：

**文本阅读核心**

| # | 功能 | 入口 | # | 功能 | 入口 |
|---|---|---|---|---|---|
| F1 | 继续阅读（多座位卡/隐藏/回想想） | Home 座位卡 `Home/index.tsx:276,361` | F9 | 划线/批注（3 样式+标签+笔记） | 选区浮层 `TextReader:2931-2991` |
| F2 | 4 种阅读模式（滚动/分页/双栏/翻书） | 底部设置·更多 `TextReaderBottomBar.tsx:69-74` | F10 | 选区复制 | 选区浮层 `TextReader:2945-2953` |
| F3 | 排版（字号/行距/字体/对齐/缩进/竖排） | 底部设置·排版 `TextReader:2833-2845` | F11 | 查词→生词本 | 选区浮层（≤30 字符）`TextReader:2935-2939` |
| F4 | 外观（纸张模拟/纸型/亮度/纹理/色温） | 底部设置·外观 `TextReader:2835-2840` | F12 | 选区翻译（AI） | 选区浮层（>30 字符）`TextReader:2940-2944` |
| F5 | 进度记忆（locator + 防抖落库） | `useTextProgressSaving.ts:9-59` | F13 | 批注管理（列表/编辑/删除/跳转/导出） | 顶栏手记按钮 `TextReader:2774,2910` |
| F6 | 章节目录跳转 | 顶栏目录抽屉 `TextReader:2769` | F14 | TTS 朗读（4 引擎/跟读/章续播/语速） | 底栏喇叭 `TextReader:838-845,855-873` |
| F7 | 书内检索 | 顶栏检索 `TextReader:2775` | F15 | 自动滚动（可调速度） | 底栏开关+速度 `TextReader:2787-2788` |
| F8 | 书签添加/移除 | 顶栏书签按钮 `TextReader:2770,1650-1694` | F16 | EPUB 内链跳转 | 正文内链 `TextReader:2300-2322` |

**图页阅读（PDF/漫画）**

| # | 功能 | 入口 |
|---|---|---|
| F17 | 条漫垂直滚动/水平翻页/双页/rtl | 阅读设置面板 `Reader/index.tsx:1486-1531` |
| F18 | 双击缩放 2x | 水平模式手势 `Reader:813-824` |
| F19 | PDF 文字选择与划线（rects 锚定） | 顶栏选择模式开关 `Reader:1387-1405` |
| F20 | PDF 全文检索 | 顶栏检索 `Reader:1376-1386` |
| F21 | 页级手记（长按菜单） | 长按 500ms `Reader:852-873` |
| F22 | OCR 识别本页文字（漫画） | 长按菜单·漫画专有 `Reader:1566-1577` |
| F23 | 页注 `?page=` 直达 | Notes/Search 直达 `Reader:102-107` |

**馆藏管理**

| # | 功能 | 入口 | # | 功能 | 入口 |
|---|---|---|---|---|---|
| F24 | 本地导入（7 格式/文件夹/剪报台） | 采编台 `Import/index.tsx:429-489` | F29 | 书籍档案（元数据/目录/标签） | `/book/:id` `BookDetail:240-547` |
| F25 | 书架（网格/列表/排序/筛选/收藏） | `/library` `Library:413-654` | F30 | 全库检索（馆藏+手记+知识件三路） | 顶栏放大镜 `Search:76-253` |
| F26 | 批量管理（删除/标已读/归库） | 书架·管理模式 `Library:497-911` | F31 | 手记导出（按书/按主题 Markdown） | Notes/BookDetail `Notes:202-238` |
| F27 | 特藏室（子书库 CRUD/定向导入） | 书架+`/library/:id` `SubLibrary:143-408` | F32 | 引用卡（引用导出） | BookDetail ⋯菜单 `BookDetail:201-210` |
| F28 | 标签体系（CRUD/按色归档） | 分类目录 `/tags` `Tags:78-270` | | | |

**知识库（AI）**

| # | 功能 | 入口 | # | 功能 | 入口 |
|---|---|---|---|---|---|
| F33 | 知识件生成（按内容类型分流 4 类） | 档案卡 KnowledgeSection `KnowledgeSection.tsx:99-110` | F35 | 跨书图谱（人物/概念/术语） | Hub·≥2 本书才亮 `Atlas:141-159` |
| F34 | 知识件查看+修订+已校验章 | `/knowledge/:bookId/:artifactId` `Knowledge:471-534` | F36 | AI 配置（服务商/地址/Key/模型/测连） | 设置·知识库组 `Settings:1044-1150` |
| F37 | 问藏书（跨书问答+引文回原文） | Hub→/ask `Ask:120-263` | | | |

**学习与回顾**

| # | 功能 | 入口 | # | 功能 | 入口 |
|---|---|---|---|---|---|
| F38 | 复习席（间隔重复/三档评分/Anki 导出） | `/review` `Review:31-275` | F40 | 阅读台账（目标/热力图/柱状图） | `/stats` `Stats:35-260` |
| F39 | 生词本（词卡/删除/导出） | `/vocabulary` `Vocabulary:39-168` | F41 | 回想想（前情提要 AI） | Home·离开≥7 天 `Home:341-352` |
| | | | F42 | 回望席（周年/久未读回访） | Home 回望席卡 `Home:583-590` |

**系统**

| # | 功能 | 入口 | # | 功能 | 入口 |
|---|---|---|---|---|---|
| F43 | 应用锁（手势/密保重置/自动锁定） | `/auth`+设置 `Settings:620-762` | F46 | 主题（light/dark/auto 循环） | 设置·外观 `Settings:767-786` |
| F44 | 云同步（WebDAV LWW 合并） | 设置·系统管理 `Settings:1180-1237` | F47 | 云端来源导入（6 协议+OPDS） | 采编→自定义云端 `CustomCloud:28-554` |
| F45 | 数据备份（JSON 导出/导入） | 设置·系统管理 `Settings:208-329` | F48 | 返回键统一协议（浮层逐层关） | `App.tsx:48-79`、`backHandler.ts:19-24` |

### 1.2 需求匹配度矩阵（按模块汇总）

轻度用户（<4 次/月，核心功能；关注上手成本/步数/可理解性）、重度用户（≥3 次/周；关注效率/批量/稳定/个性化）。

| 模块 | 轻度 | 重度 | 依据与缺口 |
|---|---|---|---|
| 文本阅读核心（F1-F7、F10、F13-F17） | **满足** | **满足** | 一步续读（Home 座位卡）；4 模式+全排版个性化；批注/导出齐全。重度缺口见 1.3（层级深、性能） |
| F8 书签 | **部分满足（实为残缺）** | **部分满足** | 书签可添加（`TextReader:1650-1694`）但列表面板 `BookmarkPanel`（`TextReader:2900-2907`）无任何打开入口（`setIsBookmarkPanelOpen(true)` 全文不存在，已 grep 实锤）——加完书签无处可看 |
| F11/F12 查词/翻译（AI） | 部分满足 | 满足 | 功能完整（浮层/生词本落库去重 `TextReader:1911-1933`）；轻度缺口：依赖先行配置 AI，未配置时点击才被告知（`KnowledgeSection.tsx:39-50` 同类模式） |
| F19-F23 图页阅读 | 满足（漫画消费型） | 满足 | 手势完整；PDF 划线/检索/OCR 齐。待确认：Auth/Reader 页无测试文件 |
| F24-F32 馆藏管理 | 满足 | **满足（批量能力突出）** | 批量删除/标已读/归库、特藏室、标签、三路检索齐备；重度缺口：批量操作无键盘快捷键（桌面端） |
| F33-F37 知识库 | 部分满足 | 满足 | 生成/修订/回原文/问藏书/图谱完整；轻度缺口：必须先配 AI（地址+Key+模型三要素），且配完需返回原页重试（断点见动线 d） |
| F38-F42 学习回顾 | 满足 | 满足 | 间隔重复三档评分、生词本、摘抄墙 AI 提纲、台账；回想想/回望席自动触发零操作 |
| F43-F48 系统 | 满足 | 部分满足 | 应用锁/备份完整；重度缺口：F44 云同步仅手动触发（唯一入口 `Settings:1218-1232`），多设备用户需自觉手动 |

### 1.3 洞察清单

**轻度用户上手障碍 TOP3**

1. **书签加了看不了（F8 残缺）**：顶栏唯一书签按钮语义是"加/不加"，列表面板无入口（证据如上）。用户第一次加书签后找不到"我的书签"，直接损伤功能信任。
2. **AI 类功能（翻译/查词/知识库/问藏书/前情提要）配置门槛后知后觉**：入口全部可见可点，点击后才 toast 提示去设置（`KnowledgeSection.tsx:39-50`、`Ask:205-213`、`Knowledge:232`）；设置页需填服务商三要素且配完要自己找路返回。
3. **深层手势与第 3 层设置无引导**：长按书务（`Library:289-300`）、长按页动作菜单（`Reader:852-873`）、阅读模式/发音引擎藏在"点中央唤出 UI → tune → 更多 tab"第 3 层（`TextReader:2818-2865`）。无任何首次引导提示，轻度用户大概率停留在默认值。

**重度用户效率瓶颈 TOP3**

1. **云同步纯手动**：唯一触发点是设置页按钮（`Settings:390-458,1218-1232`），无周期/退出自动选项；多设备重度用户的进度/批注时效完全依赖自觉。
2. **高频阅读设置层级深且无记忆**：底部设置面板 tab 每次打开重置回「排版」（`TextReaderBottomBar.tsx:135` `useState<SettingsTab>('typography')`），重度用户每次调发音引擎/阅读模式都要重复走 3 层。
3. **大书性能三连**：书内检索主线程全书 `toLowerCase`（`textSearch.ts:48-70`）；分页测量单宏任务同步跑（`TextReader:1068-1385`，块间无让步）；全仓 0 个 `React.memo`，TextReader 3000 行组件任何 state 变化（含 toast/UI 显隐）全量重渲染。

---

## 阶段二：交互与用户动线升级方案（只出方案）

### 2.1 核心动线现状图（5 条）

**a) 首次启动 → 导入 → 阅读**
```
首启 → [Auth 手势设置|跳过] → Home 空态「去采编」 → Import「选择文件/文件夹/剪报」
  输入:文件    输出:导入成功卡
→ 成功卡「查看详情|去书架|开始阅读(云端路径)」 → BookDetail「立即开读」 → TextReader 首章
```
输入=本地文件；每步输出明确；空态有直接引导。✅ 无断点无折返。

**b) 选区 → 划线/批注 → 查看**
```
正文长按/拖选 → 浮层[划线|复制|查词|翻译|批注] → 批注弹窗(样式+标签+笔记) → 保存落库(锚点)
→ 正文 <mark> 点击 → 详情弹窗[查看|编辑|删除|回到原句]
→ 顶栏手记按钮 → AnnotationList → 点条目跳回原句
→ 墙外入口: Home 摘抄墙/Notes/Search 带 ?ann= 直达
```
⚠ **断点**：书签列表面板不可达（F8）；其余闭环完整、多入口回流设计良好。

**c) TTS 朗读 → 控制**
```
底栏喇叭 → resolveEngine(设置 ttsEngine) → 悬浮 SpeechBadge[语速|暂停|停止]
→ 章播完自动下一章；跟读高亮滚动/翻页
⚠ 引擎切换: 点中央唤出 UI → tune → 「更多」tab → 听书发音 4 选 1（第 3 层）；neural 首次有 60-80MB 下载确认+进度
```
⚠ 断点：引擎选择层级过深（重度高频操作）。

**d) 首页 → 知识库 → 完成使用**
```
底栏「知识库」 → Hub[问藏书|跨书图谱(≥2书)|按书分组知识件]
分支1: Hub 空态「去书库挑一本书」 → 档案卡任务卡「生成」 → 进度条 → 查看器[修订|已校验|回原文]
分支2: /ask 输入问题 → 回答卡+引文「回到原文」 → ?goto= 直达 TextReader
分支3: /atlas 切类型 → 侧卡章节 chips 回原文
⚠ 断点: 未配置 AI 时,任务卡点击 → toast → 跳设置 → 配置(3 字段) → 手动返回重试(无状态保持引导)
```

**e) 云同步**
```
设置 → 系统管理 → 填 WebDAV 三元组(即输即存 localStorage) → 「立即同步」
→ runCloudSync(远端 404→PUT / 有→LWW 合并→落本地) → 结果计数消息 + 上次同步时间
⚠ 断点: 唯一触发点在设置页深处,无自动周期;结果反馈明确 ✅
```

### 2.2 动线四原则检查汇总

| 原则 | 结论 |
|---|---|
| ① 方向感 | ✅ 良好：顶栏四变体按路由切换（`MainLayout.tsx:33-71`）；阅读器浮层返回键逐层关（`TextReader:784-796`）；深链返回兜底落档案卡 |
| ② 无死角与折返 | ⚠ 4 处死角：书签面板不可达；CustomCloud 帮助按钮无 onClick（`CustomCloud:569-571`）；AI 配置往返折返；同步无自动触发 |
| ③ 步数最少化 | ⚠ 2 处：阅读设置第 3 层且 tab 无记忆；桌面侧栏无搜索入口（非首页→搜索需先回首页，2 步） |
| ④ 终点反馈 | ✅ 良好：导入成功卡四去向、同步计数消息、生成进度+取消、复习评分即时出队 |

### 2.3 优化方案清单

| 编号 | 优先级 | 层级 | 方案描述 | 预期收益 | 实施成本 | 风险与影响范围 |
|---|---|---|---|---|---|---|
| UX-001 | **P1** | Ⅱ | 书签列表可达化：手记列表面板升级为「手记/书签」双 tab（复用现有 `BookmarkPanel` 数据与列表内容，`TextReader:2910-2919` 打开处传入书签数据） | 书签查看 0 步不可达 → 2 步可达（顶栏→书签 tab） | 小（1-2 文件，复用现成组件） | 低：新增 tab 不动既有手记列表行为 |
| UX-002 | P2 | Ⅰ | CustomCloud 帮助按钮实装：点击弹出 6 协议说明 sheet（用途/地址示例/可见性提示） | 消除视觉死角（有按钮无响应） | 小 | 低：纯新增 |
| UX-003 | P2 | Ⅰ | 阅读设置面板记忆上次 tab：`TextReaderBottomBar.tsx:135` 初值改为读 localStorage、切换时写入 | 重复调整 3 层→2 层（免每次点「更多」） | 极小 | 低：仅初始值来源变化 |
| UX-004 | P2 | Ⅰ | 桌面侧栏补「检索台」入口（与移动端顶栏放大镜对齐） | 非首页→搜索 2 步→1 步 | 小 | 低：`DesktopSideBar.tsx:26-45` 加一项 |
| UX-005 | P3 | Ⅱ | AI 未配置引导深链：跳设置带锚点定位+高亮知识库组 | 配置往返 4 步→2 步 | 中 | 低-中：路由参数约定 |
| UX-006 | P3 | Ⅲ | 云同步自动触发（可关开关：退出阅读器后防抖同步） | 进度跨设备时效 小时级→分钟级 | 中 | 中：合并冲突频率上升、电量；**列入遗留，本次不实施** |

---

## 阶段三：工程质量测试与诊断

### 3.1 动态验证基线（测试经理）

- **全量自动化**：`npm test` → **834/834 通过**（106 文件）。覆盖：utils/services/stores 全主力模块、19/21 页面（**Auth、Reader、KnowledgeHub 无页面级测试**）、5/6 stores（**useReviewStore 无测试**）、6/21 hooks。
- **静态门禁**：`npm run lint`（含 `lint:tokens`）3 错；`tsc --noEmit` 3 错——**全部集中在 piperEngine.ts 用户 WIP**（详见 E-001），除该文件外门禁全绿。
- **真机复核**（上一轮会话，Capacitor WebView + CDP，证据 `docs/text-selection-verify/`）：分页页基准、多章归章、跨章弃用、重启重挂 4 类 5 项全过。
- 归类说明：以下 E 清单中「复现步骤」对可自动化项即测试断言口径；UI 类以静态证据+实施后截图验收。

### 3.2 问题清单与修复方案（技术架构师 + 测试经理会签）

| 编号 | 级别 | 问题与证据 | 根因 | 影响范围 | 修复方案 |
|---|---|---|---|---|---|
| E-001 | **P1** | `npm run build` 失败：`tsc` 3 错（`piperEngine.ts:31` 未使用常量、`:163/:167` 调用点少参）+ eslint 3 错（import 顺序×2、未使用变量×1）。复现：`npx tsc --noEmit` | 上次提交 b949c04 的后续 WIP 半成品：`fetchModelFile` 增加 `onIndeterminate` 第三参（CapacitorHttp 兜底通道无细粒度进度通知），调用点未同步；约定 `PROGRESS_INDETERMINATE=-2` 已声明未接线 | 构建链、音色包 CORS 兜底下载 | 完成 WIP：两调用点补回调（发 `-2`）；import 排序修复；消费端 `TextReader:852` 把 `-2` 呈现为不确定态进度（当前负数一律隐藏进度条→兜底下载期间数分钟无反馈） |
| E-002 | **P1** | `aiClient.ts:154-156` `listModels` 的 fetch **无超时/AbortSignal**（同文件 `chatCompletionJson` 有 120s 对照）。复现：对无响应端点「测试连接」→ 永久挂起 | 漏加 | 设置页连接测试、模型下拉 | `AbortSignal.timeout()`（15s，列表请求轻量） |
| E-003 | **P1** | `useLibraryStore.ts:471-473` 批量压缩包导入单包失败 `catch { continue; }` 静默跳过。复现：混入坏 zip 的多包导入 → 部分书无声消失，仅全失败才报错（`:477`） | 对照 `:565` 起 subLibrary 分支已有失败/去重记账，此分支漏 | `importArchivesAsBook` | 收集失败文件名，结束时 toast 汇总「N 个压缩包解析失败：xxx、yyy」 |
| E-004 | P2 | `cloudSync.ts:85-86` username 有而 password 空时仍发 `Basic user:`，把"没填密码"伪装成鉴权失败 | 无前置校验 | 云同步 | 密码缺失时提前报错提示 |
| E-005 | P2 | 备份导出泄漏 AI Key：`Settings/index.tsx:220` `settings` 整体进备份 JSON，含 `knowledgeAiKey`（`useAppStore.ts:63` persist）。已核实 CLOUD_SYNC 凭据为独立 localStorage key 不在备份内 | 导出未脱敏 | 数据备份 | 导出时剔除 `knowledgeAiKey`（导入兼容缺失=保持现值） |
| E-006 | P2 | `fileTransfer.ts:43-56` 原生下载 base64→`charCodeAt` 循环转 Uint8Array，两份全量拷贝，百 MB 书内存翻倍卡顿 | 一次性转换 | 原生文件下载 | 分块转换（每块 0x8000） |
| E-007 | P2 | `pageRepo.ts:31-44` `deleteAllPages` 全表游标扫描前缀匹配，复杂度∝所有书总页数 | 未用 key range | 删书性能 | `IDBKeyRange.bound(\`${bookId}/\`, \`${bookId}0\`)` |
| E-008 | P2 | 手写 mousedown-external-close 监听 ×5 模板雷同：`BookDetail:85-92`、`Home:127-134`、`SubLibraryMenu:27-34`、`TopAppBar:59-66`、`DropdownSelect:92-99` | 无共享 hook | 5 文件 | 抽 `useClickOutside(ref, onOutside)` 逐一替换（机械重构+行为等价） |
| E-009 | P2 | 色温滑轨 `linear-gradient(... #ffffff, #ffcc80)` 硬编码 hex ×2 复制：`ReaderBottomBar.tsx:254`、`TextReaderBottomBar.tsx:394`；inline hex 逃过 `check-tokens.mjs`（只扫 className） | 违反 AGENTS.md「色板唯一真源=index.css 变量」 | 令牌体系 | `index.css` 定义 `--paper-temperature-ramp` 变量两处引用；check-tokens 增强 inline hex 检查 |
| E-010 | P2 | 全仓 console=0：线上 Android WebView 异常不可观测（所有 catch 静默或 set error） | 无日志通道设计 | 可观测性 | **遗留**：需先定 debug 日志约定（dev 开/release 关），避免夹带 |
| E-011 | P2 | 上帝文件：`TextReader/index.tsx` 3025 行（20 useState、分页引擎内嵌）、`useLibraryStore.ts` 1125 行（4 个导入 action 近复制）、`useVerticalVirtualWindow.ts` 917 行 | 功能持续堆叠 | 可维护性 | **遗留**：高风险重构需专项（拆分方案见 Explore 报告） |
| E-012 | P2 | 分页测量单宏任务同步阻塞 UI（`TextReader:1068-1385`，每次探测强制重排）；全仓 React.memo=0 大组件全量重渲染 | 性能债 | 大书翻页/交互流畅度 | **遗留**：分块让步+memo 试点需真机回归（有自校准分页既有逻辑，改动敏感） |
| E-013 | P3 | `textSearch.ts:48-70` 书内检索主线程全书 `toLowerCase` 逐次重建 | 无缓存 | 大书检索 | 遗留：预计算缓存/Worker |
| E-014 | P3 | `@capacitor/cli` 在 dependencies（构建工具链进生产依赖） | 归类错误 | 依赖树 | 移至 devDependencies |
| E-015 | P3 | `types/index.ts:123` `cloudSync: boolean` 设置字段无任何 UI/逻辑引用（待确认死字段） | 疑似遗留 | 类型卫生 | 实施期 grep 核查后处置 |
| E-016 | P3 | 依赖双栈：axios+fetch 两套 HTTP；jszip+libarchive.js 双解压（互为回退） | 历史演进 | 包体积 | 遗留：收敛需回归 OPDS/云同步/解压全链 |
| E-017 | P3 | 测试缺口：Auth/Reader/KnowledgeHub 页面、useReviewStore、15 个 hooks 无测试 | — | 质量护栏 | 本次补 useReviewStore 基础测试，其余遗留 |

**核实为干净、无需处理**：marked 渲染全链消毒（白名单+安全链接/图片过滤，`markdownDocument.ts:178-205,499`）；KaTeX `trust:false`；mermaid `strict`；手势锁 SHA-256+盐+timing-safe（`gestureAuth.ts:9-44`）；axios 调用均有 timeout；idb 写入已事务批量；定时器/监听器清理完备；utils 未反向依赖上层。

### 3.3 待确认项（信息不足，不臆测）

1. `types/index.ts:123` `cloudSync` 字段是否死字段（E-015 实施期核查）。
2. Settings「馆容量」禁用占位（`Settings:1155-1172`「筹备中」）——判定为有意的产品节奏，不计问题。
3. Auth/Reader 页缺测试是否因真机手势难以 jsdom 模拟——实施期按可行性决定补测范围。

---

## 阶段四：统一实施

### 4.1 基线与队列

- **分支**：`optimize-2026-09-17`（自 `comics` @ `b949c04` 切出）。基线标识 = `b949c04`（可整体回滚：`git checkout comics && git branch -D optimize-2026-09-17`）。
- **收编提交**：`c922320` 上一轮已验证的选区锚点修复（独立成提交，保证后续队列项 commit 干净）。用户 WIP（`android/app/build.gradle` 版本号 1.18、`piperEngine.ts` 半成品）不入收编提交——piperEngine 由 E-001 完成后随其提交，build.gradle 保留在工作区不动。
- **确认点**：默认关闭，直接实施到底。

### 4.2 实施队列表（主序 P0→P3，同级先 E 后 UX，E 按影响小→大，UX 按层级 Ⅰ→Ⅱ）

| # | 编号 | 内容摘要 | 类型 | 优先级 | 层级 | 依赖 | 影响文件 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 1 | E-001 | 完成 piperEngine CapacitorHttp 兜底 WIP：调用点补 `onIndeterminate`、import 排序、`-2` 不确定态 UI 呈现 | E | P1 | — | 无 | `piperEngine.ts`、`TextReader/index.tsx` | 待实施 |
| 2 | E-002 | `listModels` 加 15s 超时（AbortSignal） | E | P1 | — | 无 | `ai/aiClient.ts` | 待实施 |
| 3 | E-003 | 批量压缩包导入失败文件名汇总提示 | E | P1 | — | 无 | `useLibraryStore.ts` | 待实施 |
| 4 | UX-001 | 手记列表面板升级「手记/书签」双 tab，书签列表可达 | UX | P1 | Ⅱ | 无 | `AnnotationList.tsx`、`TextReader/index.tsx` | 待实施 |
| 5 | E-004 | WebDAV 密码缺失前置校验，不再发空鉴权 | E | P2 | — | 无 | `cloudSync.ts` | 待实施 |
| 6 | E-005 | 备份导出剔除 `knowledgeAiKey` | E | P2 | — | 无 | `Settings/index.tsx` | 待实施 |
| 7 | E-006 | fileTransfer base64 分块转换 | E | P2 | — | 无 | `fileTransfer.ts` | 待实施 |
| 8 | E-007 | `deleteAllPages` 改 IDBKeyRange | E | P2 | — | 无 | `pageRepo.ts` | 待实施 |
| 9 | E-009 | 色温渐变入令牌变量 + check-tokens 增强 | E | P2 | Ⅰ | 无 | `index.css`、两 BottomBar、`check-tokens.mjs` | 待实施 |
| 10 | E-008 | 抽 `useClickOutside` 替换 5 处手写外点关闭 | E | P2 | — | 无 | 新 hook + 5 文件 | 待实施 |
| 11 | UX-002 | CustomCloud 帮助按钮实装协议说明 | UX | P2 | Ⅰ | 无 | `CustomCloud/index.tsx` | 待实施 |
| 12 | UX-003 | 阅读设置面板记忆上次 tab | UX | P2 | Ⅰ | 无 | `TextReaderBottomBar.tsx` | 待实施 |
| 13 | UX-004 | 桌面侧栏补检索台入口 | UX | P2 | Ⅰ | 无 | `DesktopSideBar.tsx` | 待实施 |
| 14 | E-014 | `@capacitor/cli` 移至 devDependencies | E | P3 | — | 无 | `package.json` | 待实施 |
| 15 | E-015 | 核查 `types/index.ts` `cloudSync` 死字段并处置 | E | P3 | — | 无 | `types/index.ts` | 待实施 |
| 16 | E-017 | 补 `useReviewStore` 基础测试 | E | P3 | — | 无 | `useReviewStore.test.ts` | 待实施 |

**遗留清单（本次不实施）**：UX-005（AI 配置深链）、UX-006（自动同步）、E-010（日志通道）、E-011（上帝文件拆分）、E-012（分页分帧+memo）、E-013（检索缓存/Worker）、E-016（依赖双栈收敛）、页面级测试缺口（Auth/Reader/KnowledgeHub）。

### 4.3 实施记录

（逐项追加）
