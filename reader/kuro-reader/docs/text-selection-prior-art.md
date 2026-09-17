# 主流阅读器如何处理「原生文本选中 + 批注」——方案对照与取舍

> 背景：`docs/text-selection-diagnosis.md` 里那 13 个问题，本质不是"代码写错了"，
> 而是缺少行业里早已收敛的三层模型。这份文档整理主流实现的共识、各自的锚点模型，
> 以及 kuro-reader 应该抄哪几条。所有实现细节均标注了来源，见 §6。

---

## 0. 一句话结论

主流阅读器**不试图调教原生选区**，而是把它拆成三层，各自有明确的归属：

| 层 | 职责 | 关键决策 | 谁来做 |
| --- | --- | --- | --- |
| **Selection 选区引擎** | 产生"一段被选中的内容" | **同一时刻只允许一种选区来源**：全原生，或全自绘 | 平台 / 自绘 |
| **Anchor 位置模型** | 把选区转成可持久化、与渲染无关的位置 | 选 CFI / XPointer / Locator / Quad / 偏移+引用文 | 阅读器核心 |
| **Decoration 装饰渲染** | 把位置列表画回去 | 声明式全量 apply，尽量不改内容 DOM | 渲染层 |

`docs/text-selection-diagnosis.md` 里的 P0 全部落在第二层缺失（偏移就是 DOM 偏移，没有独立位置模型），
P1 落在第一层（两套选区来源并行竞赛）。

---

## 1. 三个必须回答的问题

1. **选区所有权**：长按选词、拖柄扩选、双击/三击、划词菜单——谁提供？系统还是自己画？
   行业共识是**不能混用**。Readium 的选择很典型：选区引擎一律用平台原生（iOS 的 `UIMenuController` / Android 的 `ActionMode`），
   但通过 `SelectableNavigator` 的 `shouldShowMenuForSelection` 返回 `false` 把**菜单**接管掉，
   用 `selection.frame` 在任意位置画自己的浮层（[1]）。也就是：**手柄用原生的，菜单用自绘的。**
2. **位置模型**：批注存在数据库里的那个"位置"，必须与渲染方式无关。
   DOM 的 `Range`/XPath 是最差的锚点——结构一变就失效；这也是 Hypothesis 把 XPath 从"唯一锚点"降级为"四个候选策略之一"的原因（[2]）。
3. **装饰渲染**：高亮画在哪儿。三种做法（注入元素 / overlay 矩形 / CSS 自定义高亮），各自有明确的能力边界，见 §4。

---

## 2. 四个家族与代表实现

| 家族 | 代表 | 选区来源 | 菜单策略 | 位置模型 | 高亮渲染 |
| --- | --- | --- | --- | --- | --- |
| **A 平台原生容器** | Apple Books、Kindle iOS、Readium Swift/Kotlin（[1]） | 平台原生（WKWebView/WebView/UITextView） | 注入自定义菜单项（`EditingAction`）或接管自绘 | `Locator` = href + locations(progression) + text(highlight/quote) | 原生绘制 / navigator 装饰层 |
| **B Web 阅读器** | epub.js、Readium Web（r2-shared-web，[3]）、Hypothes.is | 浏览器原生 `selectionchange` | 自绘气泡（浏览器菜单不占主导） | **CFI**（epub.js）/ 多 selector 冗余（Hypothesis） | DOM 注入（epub.js）→ overlay（Hypothesis 已迁移） |
| **C 固定版式（PDF）** | PDF.js + Nutrient/PDFTron（[4]）、PDF.js Express | 原生选区 + 透明文字层 | 自绘 | **页内相对矩形 → PDF 坐标 QuadPoints** | overlay 矩形（可导出为标准 PDF 注释） |
| **D 自绘排版引擎** | KOReader/crengine（[5][6]）、多看、微信读书这类 | 完全自绘（命中测试自己算） | 自绘 dialog | **XPointer**（reflowable）+ `pboxes` 坐标（fixed） | 渲染时按 `page_boxes` 画矩形层 |

### A 家族：把"选区"和"菜单"分开对待
Readium 的接口设计值得整体抄：
- `SelectableNavigator`：选区 → `Selection { locator, frame }`。`locator.text.highlight` 直接给出选中文本，
  App 拿到就落库，**不需要自己算偏移**（[1]）。
- `DecorableNavigator.apply(decorations:in:)`：**声明式**——每次都提交某个 group 的完整列表，
  navigator 内部做 diff，"所以你可以在任何状态变化时无脑全量 apply，不用追踪单个增删"（[7]）。
  这直接消灭了"漏更新某一条高亮"这类 bug。
- 分组（group）按功能隔离：`highlights` / `search` / `tts` / `page-list` 各自独立，互不干扰。

### B 家族：锚点必须冗余，并且失败要优雅
Hypothesis 存**三个** selector，重挂时按四级策略依次尝试（[2]）：
1. `RangeSelector`：start/end 的 XPath + 文本内偏移（结构未变时最快）；
2. `TextPositionSelector`：全文归一化字符偏移（结构变了但文本没变）；
3. `TextQuoteSelector`：`exact` + 前后各 32 字上下文，在上下文里做**模糊匹配**；
4. 简单模糊匹配兜底；都不中就进"孤儿批注"视图，**而不是删掉**。

同时它明确记录了教训：**CFI 对元素结构变化敏感**，所以团队正在把"往文档里注入标签"的高亮器
换成 **overlay highlighter**（不改内容 DOM）（[8]）。

### C 家族：坐标型锚点，因为 PDF 规范本身就是坐标
PDF 的文本标记注释（Highlight/Underline/StrikeOut）用的就是 **QuadPoints**，
所以"存矩形"不是妥协，而是唯一能导出成标准注释的方案（[4][9]）。
做法固定五步：监听 `pointerup` → 定位选中跨界页 → `range.getClientRects()` 减去页容器 rect 得到**页内相对**矩形
→ `viewport.convertToPdfPoint()` 转 PDF 坐标（注意原点在左下）→ 存 `location[]`，用 overlay div 渲染（[4]）。

### D 家族：不用 DOM 选区，因为坐标系本来就在自己手里
KOReader 把选区做成状态机 `onHold → onHoldPan → onHoldRelease`（[5]，`readerhighlight.lua:1052-1171`）：
- 长按取坐标处的词，拖动把选区扩展到更多 word boxes / XPointer；
- 高亮不是标记文本，而是渲染时按缓存的 `page_boxes[page]` 直接画矩形（`readerview.lua:93-103`）；
- 锚点同时存 `pos0/pos1`（XPointer，如 `/body/DocFragment/body/div/p[12]/text()[1].73`）、`pageno`、`pboxes`——
  **一套数据里冗余了三种锚点**，reflowable 与 fixed 版式都能重定位（[6]）。
- 手势优先级用"zone 覆盖"显式声明（`overrides`），让链接/高亮能在翻页之前拦截点击（[5]），
  而不是靠散落各处的"抑制标志位"。

顺带一个和我们同源的教训：KOReader 为了"智能选中整句"而处理标点，直接导致中文标点选不中/多选一字的问题（issue #9219），
最后给用户的建议是"二次手动校准"（[10]）。**选词粒度永远会有例外，所以必须提供"选中后微调"的出口。**

---

## 3. 共识清单（可以直接当评审清单用）

1. **一种选区来源**。要么全原生 + 接管菜单，要么全自绘。两套并行必然竞态。
2. **选区 → 锚点 → 渲染 三分离**。锚点里不出现 DOM 结构信息（或只作为最低优先级候选）。
3. **锚点冗余 + 分级重挂**，失败时展示"孤儿批注"而不是静默丢弃。
4. **装饰渲染尽量不碰内容 DOM**；必须碰时，保证"分段边界"稳定、可重建。
5. **位置模型带 progression**（章节 + 章内比例 + 引用文），这样跨设备、跨字号、跨版式都能跳。
6. **装饰列表声明式全量同步**，diff 交给渲染层。
7. **手势冲突用显式优先级**（zone/overrides/claim 机制）解决，不靠时序标志位。

### 对照：kuro-reader 当前的反模式
| 反模式 | 在本项目的位置 |
| --- | --- |
| 两套选区来源并行 | 自定义 500ms 长按选词 + 浏览器原生选词，靠 `selectionchange` 事后收敛 |
| 锚点 = DOM 偏移 | `contentOffset` 直接来自 Range 长度；`data-source-start` 只在 Markdown 路径存在 |
| 无 progression | 批注只存 `chapterIndex + 偏移`，字号/版式变化后只能靠指纹救 |
| 靠时序抑制位解决冲突 | `isSelectingTextRef` / `touchMovedRef` / `lastTouchEndTimeRef` 三处标志位协同 |
| 装饰渲染改动内容 DOM | `<mark>` 包裹 + 边界集合分段，导致跨容器选区与"标题外文本"无法表达 |

---

## 4. 标准能力盘点（Web 端）

| 能力 | 状态 | 对我们的意义 |
| --- | --- | --- |
| `Selection` / `selectionchange` | 全平台 | 原生选区的唯一稳定入口；拖动期间会高频触发，需 debounce |
| `document.caretRangeFromPoint` | Chrome/Safari 系 | 坐标 → 文本位置；Firefox 用 `caretPositionFromPoint`（返回 node+offset） |
| `Range.getClientRects()` | 全平台 | 拿到每行矩形 → overlay 高亮 / 锚点坐标 |
| **CSS Custom Highlight API**（`::highlight()`） | Baseline 2026：Chrome 105+ / Edge 105+ / Safari 17.2+，Firefox 2025 年后版本补齐（[11]） | **不改 DOM 就能画高亮**，可用 `priority` 处理重叠；但**只支持** `color`/`background-color`/`text-decoration`/`text-shadow`，**`background-image` 被忽略**；DOM 变化后 Range 失效需重建 |
| PDF QuadPoints | PDF 规范（TextMarkup 注释） | 导出/互操作的事实标准（[9]） |

**关键权衡（对本项目最要命的一条）**：`::highlight()` 的能力集**装不下**你们现在的"水彩笔 mask"笔触
（那套 `.annotation-marker-v0..v2` 依赖 mask / background-image 类效果）。
所以三选一：
- 保留笔触 → 走 **overlay 矩形层**（`getClientRects()` 画绝对定位 div，能力不受限，但要处理滚动/旋转同步）；
- 走 `::highlight()` → 放弃 mask，改用 `background-color` + `text-decoration` 组合做视觉（Hypothesis 的 overlay 迁移思路同理）；
- 保留 `<mark>` 注入 → 必须先把"分段边界"变成纯函数（输入 = 渲染树 + 锚点列表，输出 = 纯 DOM），否则 §3 的反模式永远修不干净。

---

## 5. 建议 kuro-reader 采纳的四条

1. **建立独立的锚点模型**（对应诊断报告 P0-1/P0-2）：
   `Annotation { chapterId, progression, startOffset, endOffset, quote: {exact, prefix32, suffix32}, rects?: Quad[] }`。
   字符偏移保留，但**必须带 quote 兜底**，且偏移的坐标系定义为"章节源文本"，与渲染方式解耦。
   这等价于把 KOReader 的 XPointer + Hypothesis 的 TextQuoteSelector 合成一个轻量版。
2. **落库前把渲染层信息解析成 chapterId**（对应 P0-2）：从选区节点上溯 `[data-reader-article][data-chapter-index]`，
   而不是取页面级的 `currentChapterIndex`。这是 Readium `Locator` 的 href 那一维。
3. **选区来源二选一**（对应 P1-7）：Capacitor Android 上建议保留原生选区引擎，
   转而用**原生层手段**屏蔽菜单（`WebView`/`ActionMode` 层，或 `-webkit-touch-callout: none` 组合），
   而不是靠 `contextmenu` 的 `preventDefault`（它的行为随 WebView 版本/ROM 漂移，见 [12][13]）。
4. **装饰渲染改成声明式全量同步**（对应 P1-4 与"漏更新"类 bug）：
   把"当前章的全部批注 → 高亮段列表"做成纯函数，每次渲染重建；增量维护留给分页/滚动层，
   而不是散在 `useMemo` + `mark` 的边界集合逻辑里。

---

## 6. 参考

1. Readium Swift Toolkit — Implementing Highlights / `currentSelection`、`clearSelection`：https://readium.org/swift-toolkit/3.11.0/documentation/readium/highlights
2. Hypothesis — Fuzzy Anchoring（三个 selector + 四级重挂策略）：https://web.hypothes.is/blog/fuzzy-anchoring/
3. Readium Web（r2-shared-web）— Navigator / Decorator / Recognizer 模块划分：https://github.com/Jellybooks/r2-shared-web
4. Nutrient — How to build text highlight annotations with PDF.js and React（getClientRects → convertToPdfPoint → overlay）：https://www.nutrient.io/blog/pdfjs-text-highlight-annotations
5. KOReader — Highlight and Annotation System（onHold/onHoldPan、zone overrides、page_boxes）：https://deepwiki.com/koreader/koreader/6.1-highlight-and-annotation-system
6. KOReader — Annotation 数据模型（pos0/pos1 XPointer + pboxes + pageno）：同上
7. Readium — Decoration API（声明式 apply + group + template 的 layout/width 组合）：https://readium.org/swift-toolkit/3.9.0/documentation/readium/decorations
8. Hypothesis — EPUB 注释合作（明确提到从注入标签转向 overlay highlighter，以及 CFI 对结构变化敏感）：https://dev-web.hypothes.is/blog/epub-annotation
9. W3C Web Annotations Workshop Report（PDF.js 懒锚定、EPUB CFI、note-first 交互）：https://www.w3.org/2014/04/annotation/report.html
10. KOReader issue #9219 — 中文标点选不中（选词粒度的固有例外）：https://github.com/koreader/koreader/issues/9219
11. MDN — `::highlight()`（Baseline 2026、支持的属性集、`background-image` 被忽略）：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Selectors/::highlight
12. Readium discussion #385 — 原生选区菜单不可改样式，只能 `shouldShowMenuForSelection = false` 自绘：https://github.com/readium/swift-toolkit/discussions/385
13. Stack Overflow — WKWebView 中"保留选区手柄但隐藏系统菜单"没有干净解法（只有全禁式方案）：https://stackoverflow.com/q/76509995
