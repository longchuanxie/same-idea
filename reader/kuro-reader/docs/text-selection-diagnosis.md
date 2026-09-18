# TextReader 文本选中功能诊断报告

> 诊断对象：`src/hooks/useTextSelection.ts`、`src/components/molecules/SelectionFloatingButton.tsx`、
> `src/pages/TextReader/index.tsx`（选区/批注链路）及 `MarkdownReaderContent` 的偏移锚点。
> 结论按「会不会让数据/高亮落错位置」排序，不按代码美观度排序。

---

## 0. 结论摘要

| 级别 | 数量 | 一句话 |
| --- | --- | --- |
| P0 | 2 | **TXT（纯文本）文件的选区偏移基准是错的**，划线/批注会落到错误位置或完全不显示；多章同屏时批注还会归到错误的章 |
| P1 | 6 | 动作条定位偏移、位置快照不跟随、遮罩吃掉工具栏点击与滚动、按钮按下时选区被收起、长按与原生选词竞态、翻页误弹 |
| P2 | 5 | 双路径重复的偏移修正、跨标题选区塌陷、渲染期写 ref、词边界吞标点、防抖与 rAF 双触发 |

Markdown / EPUB 路径的偏移锚点经实测是**正确**的（见 §1 探针 3）；问题集中在"没有 `data-source-start` 锚点"的纯文本兜底路径与浮层定位/手势冲突上。

---

## 0.1 实施进度（锚点层已替换落地）

采用的方案见 `docs/text-selection-prior-art.md`：Readium 的 Locator 模型 + Hypothesis 的多策略重挂，**不引入 overlay 渲染层**（会牺牲现有水彩笔笔触）。

| 项 | 状态 | 落点 |
| --- | --- | --- |
| P0-1 偏移基准错（TXT/多容器） | ✅ 已修 | 新增 `src/utils/selectionScope.ts`：只认 `[data-source-start]` 锚点，删除 `document.querySelector('[data-reader-content]')` 兜底；`renderTextWithRanges` 逐段补锚点，纯文本与 Markdown 同坐标系 |
| P0-2 批注归错章 | ✅ 已修 | `resolveSelectionScope` 从选区节点上溯 `[data-reader-article][data-chapter-index]`；`buildAnnotationFromSelection`/查词/翻译改用解析出的章；跨章选区直接不点亮浮层 |
| P2-9 重复的 trim 修正 | ✅ 已修 | 收敛为 `alignOffsetsWithTrimmedText` + 单一 `captureSelection`（鼠标/长按/selectionchange 三路共用） |
| P2-10 跨段/跨标题匹配失败 | ✅ 部分已修 | `findQuoteMatches` 三级通道（原文 → 折叠空白 → 忽略空白）并映射回源偏移；跨标题选区改为"不采信锚点、回退内容检索" |
| P2-11 渲染期写 ref | ⬜ 未做 | 低危，留待下一轮 |
| P1-3 ~ P1-8 浮层与手势 | ⬜ 未做 | 见 §4 任务清单 5-10 项；其中 P1-7「选区来源单一化」需要 Android 原生层配合（改 WebView 的 ActionMode），不宜在 Web 层盲改 |

回归测试：`src/utils/selectionScope.test.ts`（8）、`useTextSelection.test.tsx`（13）、`annotationAnchor.test.ts`（12）全绿；
`npx tsc --noEmit` 对本轮文件无报错（`src/services/tts/piperEngine.ts` 的 3 个报错为改前既存，属未提交的 WIP）。

---

## 0.2 Android 模拟器端到端复核

在**真实 WebView**（不是 jsdom）里跑完整链路：真实渲染 → 原生选区 → 浮动动作条 → `annotationRepo` 落库 → 重启重挂。
设备：`emulator-5554`（AVD `Kuro_API35`，Android API 35，x86_64）；应用 `com.kuro.reader` v1.18 (versionCode 19)；
素材：库中已导入的 8 章 TXT 书 `sample-novel`。驱动方式是 Capacitor WebView 的 Chrome DevTools Protocol
（`adb forward` → `Runtime.evaluate`），无需改动应用代码。

| 场景 | 设备上的构造 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- | --- |
| 分页页基准（P0-1） | 单列分页翻到第 3 页，页锚点 `data-source-start=788`，选中页内 `[5,14)` | `793 / 802` | `startOffset=793, endOffset=802` | ✅ 旧实现会存 `5`——基准整整丢了 788 字 |
| 高亮落点（P0-1） | 同上，检查渲染出的 `<mark>` | 页内 `[5,14)` | `markLocalStart=5, markLocalEnd=14`，高亮文本 === 页面切片 | ✅ |
| 多章同屏归章（P0-2） | 滚动无缝续读，**2 个 `[data-reader-content]` 同时挂载**（1580 / 1556 字）；在第 2 章选中章内 `[20,32)` | `chapterIndex=1, 20/32` | `chapterIndex=1, startOffset=20, endOffset=32`；`<mark>` 只出现在第 2 章 article（`marksPerArticle=[0,1]`） | ✅ 旧实现会给 `chapterIndex=0, startOffset=1600` |
| 跨章选区 | 选区从章 0 末尾跨到章 1 开头（22 字） | 不点亮浮层、不落库 | 浮层按钮 0 个、批注数不变 | ✅ |
| 重启重挂 | 整包重启后重进阅读器 | 高亮仍在原位 | 三章同挂，`<mark>` 仍在第 2 章 `[20,32)`；锚点字段 `before/after/occurrence` | ✅ |
| **复制**（动作条） | 第 1 章章内 `[20,32)` 选中 → 点 `content_copy` | 弹「已复制到剪贴板」+ 系统剪贴板拿到这 12 字 | toast 出现；`navigator.clipboard.readText()` 被 WebView 拒（`NotAllowedError`），改用应用自带原生插件 `window.Capacitor.Plugins.Clipboard.read()` 读回 **12 字，码点逐一吻合**；库内批注数不变 | ✅ |
| **扩选**（拖手柄放大） | 第 1 章 `[20,32)` → 拖到 `[20,48)` → 划线 | 存 `20/48`，章 1 | `selectedLen 12 → 28`，动作条持续点亮，落库 `chapterIndex=1, start=20, end=48` | ✅ |
| **缩选**（拖手柄收回） | 在**已高亮**的 `[20,48)` 上重新选 `[20,38)` → 划线 | 存 `20/38`，章 1 | `selectedLen 18`，落库 `chapterIndex=1, start=20, end=38` | ✅ 见 §0.3 的 P0-3：这条在修复前 `locate()` 直接返回 `null`，落库失败 |
| **批注**（弹窗） | 第 1 章 `[60,72)` → 点「批注」→ 输注 14 字 → 选「下划线」 | 弹窗开、预览出选中文本、按钮由「仅划线」变「保存批注」 | `popupOpen=true`；`popupPreviewShown=true`；`textareaValue` 与输入一致；`保存标签 仅划线 → 保存批注`；`下划线` 样式钮存在 | ✅ |
| **批注**（落库） | 点「保存批注」 | 存 `chapterIndex=1, 60..72, style=underline`，含 note 与锚点 | `chapterIndex=1, startOffset=60, endOffset=72, style="underline"`，`noteMatches=true`，`selectedTextLen=12`，`anchor={before,after,occurrence}` | ✅ |
| **不变量**：命中断言的段仍带锚点 | 章 1 上已存在 3 个批注（2 划线 + 1 下划线批注） | 每个 `<mark>` 内部都该有 `span[data-source-start]` | `marksTotal=3`，`anchoredSpansInsideMarks=3`（修复前为 **0**） | ✅ |

界面证据：`docs/text-selection-verify/03-chapter2-highlight-verified.png`——第 2 章正文上正好 12 个字的水彩高亮
（即章内第 20 字起的「夜大雨，王五独自守在城」）；`05-annotate-verified.png`——批注落库后的阅读器整屏。

构建链路（模拟器上实测）：`npx vite build` → 资产镜像 → `gradlew assembleDebug` → `adb install -r`（Success）。
注意：`npm run build` 因 `tsc &&` 被既存 WIP 的 `piperEngine.ts` 类型错误挡下，故本轮直接调 `vite build` 出包。
**`npx cap sync android` 会无限期挂住**（实测 13+ 分钟、vite 早已完成但 Gradle/Java 一个都没起；根因是残留的 vitest worker 进程）。
绕行办法：先清掉残留 node 进程，再把 `dist/` 手动镜像进 `android/app/src/main/assets/public`——
但**不能整目录 `Remove-Item` + `Copy-Item`**（会中途失败，实测只拷到 155 个中的 27 个），
改用 `robocopy dist\assets <dst>\assets /MIR`、`robocopy dist\fonts <dst>\fonts /MIR` 分目录镜像，
根目录的 `index.html` / `icon.svg` / `manifest.json` 单独 `Copy-Item -Force`，
并**保留 `cordova.js` / `cordova_plugins.js`**（`cap sync` 生成、`dist/` 里没有，`/MIR` 根目录会误删）。

---

## 0.3 P0-3：已高亮段落丢失锚点（真机才会暴露）

**症状**：在已经划过线的文字上再选词，浮动动作条完全不出现，落库静默失败。

**根因**：`src/pages/TextReader/index.tsx` 的 `renderTextWithRanges` 里，命中批注的段被**替换**成了一个裸 `<mark>`：

```tsx
// ❌ 修复前：node 被 mark 顶掉，[data-source-start] 随之消失
if (ann) node = <mark key={...} ...>{segmentText}</mark>;
```

`selectionScope` 是靠 `[data-source-start]` 把选区映射回「章内源文本偏移」的。
锚点一没，`locate()` 就返回 `null`，偏移无从算起——所以症状只在**已经存在高亮**的段上出现，
jsdom 里也不会自己冒出来（要真渲染 + 真存在一条批注才复现）。而 `MarkdownReaderContent.tsx`（234–268 行）
一直是**包住** `{node}` 的正确写法，纯文本这条路径跟它不一致。

**修复**：与 Markdown 路径对齐，`<mark>` 改为**包住**带锚点的 `span` 而不是替换它：

```tsx
// ✅ 修复后：mark 包住 node，锚点留在原位
let node = <span key={`src-${segStart}`} data-source-start={sourceBase + segStart}>{segmentText}</span>;
if (ann) node = <mark key={`ann-${ann.id}-${segStart}`} ...>{node}</mark>;
//                                                          ^^^^^^ 关键
```

**验证**：
1. 单测 `src/pages/TextReader/index.test.tsx::已高亮段落仍保留 [data-source-start] 锚点（在其上再选词取得到偏移）`
   —— mock 一条覆盖 `第一章` 的批注，断言 `<mark>` 内层 `span[data-source-start]` 的值 === 批注起点。**去掉修复即红，加上即绿**。
2. 真机 DOM 不变量：章 1 上有 3 条批注时 `marksTotal=3` 且 `anchoredSpansInsideMarks=3`（修复前该值为 0）。
3. 真机行为：§0.2 表的「缩选」一行——在已高亮段上重新选 `[20,38)` 现在能正常落库（修复前 `null`）。
4. **Markdown 路径补同款护栏**（此前只有纯文本路径被守）：
   `MarkdownReaderContent.test.tsx::批注用 mark 包住带锚点的 span，而不是把 span 替换成裸 mark`。
   已做红/绿双向验证——把 `{node}` 换成 `{segmentText}`（还原成有缺陷的裸 mark 写法）即精确在
   `mark.querySelector('[data-source-start]')` 处失败（`anchor` 为 null），改回即 17/17 绿。

### 同类模式全量扫描（同一 bug 类的其他落点）

P0-3 属于「装饰层命中后把带锚点的节点**替换**掉」这一类。按调用面把装饰层全集过了一遍：

| 落点 | 机制 | 判定 |
| --- | --- | --- |
| `TextReader/index.tsx:2196-2214`（纯文本/TXT 批注） | `<mark>{node}</mark>` | ✅ 本轮修复 |
| `MarkdownReaderContent.tsx:253-269`（Markdown/EPUB 批注） | `<mark>{node}</mark>` | ✅ 本就正确 |
| `MarkdownReaderContent.tsx:140`（Markdown `==mark==` 行内语法） | `<mark>{node}</mark>` | ✅ 包住 |
| `MarkdownCodeBlock` / `MarkdownMath` 的 `data-source-start` | 锚点在 `code` 元素自身，无外层替换 | ✅ |
| `Reader/index.tsx:1017-1027`（PDF 文字划线） | 存 rect 数组按页 overlay，**不走 DOM 锚点** | ✅ 机制无关 |
| `TextReader/index.tsx:1132-1163`（测量容器 `measureEl`） | 离屏草稿节点（`left:-99999px` + `visibility:hidden`），`textContent` 直写只影响它自己 | ✅ 机制无关 |
| `InBookSearchPanel.tsx:105`（搜索命中片段） | 面板内列表，不在正文锚点体系内 | ✅ |

关键设计要点：两条正文路径都保证**锚点 span 在最内层**（先建 `span[data-source-start]`，装饰层一律 `{node}` 外包），
所以 `selectionScope.sourceOffsetAt` 用 `closest('[data-source-start]')` 上溯时总能命中最内层锚点。
生产的解析逻辑只要求「端点在锚点内部」，不要求锚点首子节点是文本节点——探针里复刻的 `locate()` 更严格（只认 `span` 且要求文本子节点），
对纯文本路径等价，但不覆盖 `code` 锚点，后续写探针时别再照抄那个窄条件。

---

## 0.4 P0-4：移动端无法扩选（拖拽手柄整链缺失，真机实测定位）

**症状**：长按能选出（自绘的）一个字，但没有拖拽手柄，选区无法扩大/缩小；动作条出现后更是一切触摸都被吞掉。

**根因（三重叠加，缺一不现）**——全部在 Android 模拟器（API 35 WebView）上用 CDP + `adb input` 真实触摸实测复现：

1. **`contextmenu preventDefault` 连根掐断原生选词管线**。文章区域里拦掉 contextmenu 后，WebView 的原生长按选词（选区+拖拽手柄）整链不再发生（对照实验：仅放行 contextmenu、其余不动，原生选词立即恢复）。原生层 `MainActivity` 只过滤 ActionMode 菜单项，不禁选区——凶手就是 Web 层这一行。
2. **JS `addRange` 写入的选区没有原生拖拽手柄**。自定义 500ms 定时器与原生选词竞速且总是抢跑（谁后写谁生效），用户拿到的是一份"死"选区。
3. **选区稳定 600ms 后挂载的全屏透明取消遮罩（z-68）拦截手柄拖拽**。A/B 实证：遮罩在 → 拖柄无效；移除遮罩 → 同一拖拽立即扩选。长按后立即拖（遮罩未挂载）也一直可用。

另有一个真机才有的衍生坑：**Chromium 对原生选区的 tap-collapse 会原地回滚**——外点取消时选区先被折叠，~84ms 后又被 Chromium 恢复（`selectionchange` 记录 `→C→C→复活`），表现为"点一下消不掉"。

**修复**：

| 项 | 落点 |
| --- | --- |
| contextmenu 分流：触摸长按放行（原生管线依赖它），鼠标右键（桌面）仍拦截 | `useTextSelection.ts` |
| 长按原生优先：兜底定时器 500→700ms，命中时若原生选区已就位则**绝不覆写**（保住手柄），只采样点亮动作条；JS 选词降级为原生未就位时的兜底 | `useTextSelection.ts` |
| 去全屏遮罩 → 文档级捕获 click 外点取消；选区矩形外扩 30px 邻域豁免（盖住手柄触摸）；UI 控件上的点击只取消选区、按钮照常生效（P1-5 顺带解决）；正文空白点击吞掉以免触发翻页/UI 切换 | `SelectionFloatingButton.tsx` |
| 原生浮动工具栏（Copy/Share/Select all）与自绘动作条叠屏：`onActionModeStarted` 对 `TYPE_FLOATING` 直接 `finish()`（finish 只收菜单不收选区，手柄保留） | `MainActivity.java` |
| 幽灵回滚清扫：外点取消后 +220ms 补一刀 `removeAllRanges`，以动作条文本为守卫（回滚恢复的是同一段选区；220ms 内不可能完成一次新长按） | `TextReader/index.tsx` |

**验收（模拟器端到端，`scripts/cdp-eval.mjs` 驱动 CDP + `adb input` 真实触摸）**：
长按 → 原生选区 + 双手柄 + 自绘动作条（系统工具栏不再出现）→ 拖右手柄扩选 `1→6` 字（动作条持续点亮）→ 点「划线」落库（`<mark>` 数 +1、位置正确）→ 点空白一次即取消（选区收起、动作条消失、滚动位置不动）。已知无害边界：行首标点（如"。"）单独被选中时其右手柄拖拽偶发无效，为 Chromium 对该选区边界的固有行为，换任一汉字即正常。

回归测试：`useTextSelection.test.tsx`（15）、`SelectionFloatingButton.test.tsx`（7）——覆盖原生优先不覆写、contextmenu 分流、无遮罩外点取消、选区邻域豁免、动作条内点击放行。全量 868 例绿；`tsc`/`eslint`/令牌守卫绿。

---

## 1. 验证方式（探针实测）

写了一个临时探针（`vitest` + jsdom，跑完已删除，代码见附录 A），直接对 hook 断言实际产出的 `contentOffset`：

| 探针 | 场景 | 实测 `contentOffset` | 正确值 | 判定 |
| --- | --- | --- | --- | --- |
| 1 | 无缝续读，2 章同挂（无 `markdownDocument`）；在第 2 章选中 2 字 | `38` | `0` | ❌ 偏移基准错 |
| 2 | 分页 TXT，DOM 中存在上一页与本页两个 `[data-reader-content]`；在本页选中 | `96` | `0`（页内）/ 需再 `+pageStartOffset` 才是章内 | ❌ 基准错且缺少页起点 |
| 3 | Markdown 路径（`<span data-source-start="500">`）选中 2 字 | `500 / 502` | `500 / 502` | ✅ 正确 |

另：`npm run lint:tokens` 通过，本报告不涉及令牌体系合规问题。

---

## 2. 现状链路（问题定位用的最小地图）

```
mousedown(记录) ─┐
mouseup ─→ rAF ──┤
touchstart(长按 500ms) ─→ caretRangeFromPoint 选词 ─┤
selectionchange(稳定 600ms) ────────────────────┤
                                                ↓
                    useTextSelection: setSelectionInfo({ text, position, contentOffset, contentEndOffset })
                                                ↓
                    SelectionFloatingButton（透明遮罩 z-68 + 动作条 z-69）
                                                ↓
              划线/复制/查词|翻译/批注 → buildAnnotationFromSelection(章内偏移 → 落库)
                                                ↓
                      渲染时 resolveAnnotationOffsets（指纹 → 原偏移 → indexOf 兜底）
```

关键脆弱点：**偏移来源有两套**——Markdown 走 `data-source-start` 绝对锚点，纯文本走"`document.querySelector('[data-reader-content]')` 的 Range 长度"兜底。第二套在容器不唯一时必然算错。

---

## 3. 问题清单

### P0-1 纯文本（TXT）路径的偏移基准错误

**证据**
- `useTextSelection.ts:401` 兜底用 `document.querySelector('[data-reader-content]')` —— 返回**文档中第一个**内容容器。
- `useTextSelection.ts:426-432` 以该容器为起点、以选区末端为终点算 `Range.toString().length`。
- 而 DOM 里 `[data-reader-content]` 并不唯一：
  - 滚动模式 + 无缝续读：每章一个（`TextReader/index.tsx:2323`，多章同时挂载见 `:2521-2535`）。默认配置就是打开状态——`textReadingMode: 'scroll'`（`useAppStore.ts:55`）+ `autoAdvanceTextChapter: true`（`:53`）→ `isSeamlessReading = true`（`TextReader/index.tsx:401`）。
  - 分页/翻页/双栏：前一页与当前页、左栏与右栏同时存在（`TextReader/index.tsx:2392-2407` 双页、`:2595-2645` 翻页动画期）。
  - 分页 TXT 的 `content` 是章节切片（`renderArticleContent(textPages[pageIndex], pageIndex)`），页内偏移还必须叠加 `getPageStartOffset(pageIndex)`（`:2229`）——兜底路径没有叠加。
- TXT 是唯一不生成 `markdownDocument` 的格式（`textContent.ts:83/92`：`isMarkdown` 才解析），因此 TXT 必然走兜底路径；Markdown/EPUB 有锚点（`epubContent.ts:320`）不受影响。

**后果**
`buildAnnotationFromSelection`（`TextReader/index.tsx:1794-1799`）把这些数字当作**章内偏移**写进 `startOffset/endOffset` 并据此生成锚点指纹（`:1811-1814`）。落库后渲染时 `resolveAnnotationOffsets`（`utils/annotationAnchor.ts:67-95`）三条路径依次失效：指纹来自错误的上下文切片、原偏移 `content.slice()` 对不上文本、最后 `indexOf` 首个匹配——**文本重复时会划到更早的同类句子上**；文本唯一或跨段时直接返回 `null`，表现为「批注保存成功、正文里没有高亮」。

**修复方向**
1. 给纯文本渲染也补锚点：`renderTextWithRanges`（`TextReader/index.tsx:2144-2192`）本来就按边界切段，逐段包 `<span data-source-start={base + segStart}>` 即可，`base` 由调用方传入（滚动模式=0，分页模式=`pageStartOffset`）。
2. 兜底路径改为"从选区祖先容器自身上溯"，不要用 `document.querySelector`；取不到锚点时**宁可不给偏移**，让 `buildAnnotationFromSelection` 回退到 `content.indexOf(text)`，也不要给出一个错的数字。

---

### P0-2 多章同屏时批注会记到错误的章

**证据**
- 归属章固定取 `chapterIndex: currentChapterIndex`（`TextReader/index.tsx:1804`），偏移取的是"选区所在那个渲染实例"的局部偏移。
- `currentChapterIndex` 由 scrollTop 追踪（`useSeamlessScrollTracking.ts:112-137`：取"最后一个 `geo.start <= anchor` 的已渲染章"），即**视口顶部所在的章**。
- 预留窗口最多 6 章（`SCROLL_WINDOW_AHEAD = 1`、`SCROLL_WINDOW_MAX = 6`，`useSeamlessScrollTracking.ts:6-7`），窗口内相邻章的文字是可选的。

**后果**
视口顶部还在第 N-1 章、但用户选的是屏幕中下部的第 N 章文字时，写入的是 `chapterIndex = N-1` + 第 N 章的局部偏移 → 高亮错位；用户在第 N-1 章尾部选字同理。跨章选择（从 N-1 尾部拖到 N 开头）必然错。

**修复方向**
滚动模式已经给每个 article 打了 `data-chapter-index`（`TextReader/index.tsx:2525`）。hook 内新增统一的选区作用域解析：从 `range.startContainer`/`endContainer` 向上找最近的 `[data-reader-article][data-chapter-index]`，把 `chapterIndex` 与容器起点一起回传给页面，`buildAnnotationFromSelection` 用它替换 `currentChapterIndex`；若选区跨了两个 article，直接提示"跨章选区不支持"或按起始章裁剪。

---

### P0-3 已高亮段落丢失 `[data-source-start]` 锚点（已修复）

**证据**
- 纯文本路径 `renderTextWithRanges`（`TextReader/index.tsx`，命中批注的段）把带锚点的 `span` **替换**成裸 `<mark>`，`[data-source-start]` 消失。
- 对照 `MarkdownReaderContent.tsx:234-268`：同一件事是**包住** `{node}` 做的，锚点保留。

**后果**
`selectionScope` 依赖 `[data-source-start]` 把选区映射回章内偏移；锚点缺失 → `locate()` 返回 `null` → 在已划线的文字上再选词时动作条不亮 / 落库静默失败。只在**真机且该段已存在批注**时复现，jsdom 单测不会自发触发。

**修复**：改为 `<mark ...>{node}</mark>` 包住锚点 span，与 Markdown 路径写法对齐；并补一条回归测试锁死该不变量（详见 §0.3）。

---

### P1-3 动作条相对选区中心系统性右偏

**证据**：`SelectionFloatingButton.tsx:5-10`
```ts
const BUTTON_OFFSET_X_PX = 48;      // 当作"半个动作条宽度"用
const BUTTON_MAX_WIDTH_PX = 330;    // 4 键 + 3 条分隔线的量级
...
left: position.x - BUTTON_OFFSET_X_PX   // position.x = rect.left + rect.width / 2
```
实际宽度接近 300px（图标 18px + 2 字标签 + 内边距，4 键），却按"半个 96px"回退 → 动作条整体相对选区中心**右偏约 90-100px**；靠近左右边缘时被 clamp 到 8px，会盖住选区本身。

**修复方向**：用 `translateX(-50%)`（配合 `left = clamp(8, position.x, innerWidth - 8)`）或 `useLayoutEffect` 量一次实际宽度，删除 48 这个魔数。

---

### P1-4 位置是"选区时刻的快照"，不跟随滚动/尺寸变化

**证据**：`useTextSelection.ts:116-121 / 162-167` 只在采样那一刻算一次 `rect`；随后没有任何 `resize`/`orientationchange`/`scroll` 监听去重算；批注弹窗、查词、翻译弹层都基于同一组坐标（`TextReader/index.tsx:2926-2933`、`:1866-1869`、`:1925-1928`）。

**后果**：旋屏、桌面端窗口 resize、竖排（`writingMode: vertical-rl`，横向滚动）之后动作条/弹层悬空于旧坐标。另外多行选区取的是并集矩形的 `top` 与水平中点，长选区时动作条贴在选区左上角远处；`top - 52` 在贴近顶部时被 clamp 到 8px，会压住正文首行/顶栏。

**修复方向**：把定位改造成"锚点元素 + 实时测量"（保留 `range.cloneRange()` 的起始 rect 作为锚，用 `ResizeObserver` + `scroll` 节流重算）；至少补 `resize`/`orientationchange` 时重算或直接收起动作条。

---

### P1-5 透明遮罩层级高于导航栏，吃掉工具栏点击与滚动

**证据**：遮罩 `fixed inset-0 z-[68]`（`SelectionFloatingButton.tsx:40`），动作条 `z-[69]`（`:43`），而导航栏容器是 `z-50`（`TextReader/index.tsx:2725`）。

**后果**：动作条可见时点顶栏/底栏任何按钮，命中的都是遮罩 → 只是取消选区，按钮要**点两次**才生效；触屏上遮罩遮住了滚动容器（`main` 是遮罩的兄弟节点，滚动链不传递），选区存在期间滚不动页面，必须先把选区点掉。

**修复方向**：遮罩只在"点选区外空白处"取消——例如遮罩降到导航栏之下并只覆盖正文区域，或改用 `pointerdown` 命中测试而非全屏拦截层。

---

### P1-6 按钮按下瞬间浏览器会收起 DOM 选区

**证据**：`SelectionFloatingButton.tsx:55-126` 四个按钮只有 `onClick`，没有 `onMouseDown/onTouchStart` 上的 `preventDefault()`。

**后果**：按下时选区被浏览器收起 → 选区高亮、选区手柄（部分机型）先消失再执行动作；查词/翻译/划线虽然读的是 state（`selectionInfoRef`）不受影响，但视觉上"点下去选区就没了"，并且会额外触发一次 `selectionchange` 流程。

**修复方向**：按钮容器上加 `onMouseDown={(e) => e.preventDefault()}`（保留 click 逻辑），触屏加 `onTouchStart` 同类处理。

---

### P1-7 自定义长按选词与原生选词是并发竞态

**证据**：`useTextSelection.ts:248-275` 用 500ms 定时器 + `caretRangeFromPoint` 自行 `addRange`；`touchstart/touchmove/touchend` 全部 `{ passive: true }`（`:365-367`）无法 `preventDefault`；原生菜单只靠 `contextmenu` 的 `preventDefault` 屏蔽（`:356-361`）。

**后果**：Chrome/WebView 的长按选词（SelectWord + 选区手柄）与自定义选词几乎同时发生，谁后写谁生效；紧随其后的 `selectionchange`（600ms 防抖）又会以**原生结果**覆盖一次 → 选中的范围可能与首帧不一致（原生按 ICU 分词，自定义按正则），并可能出现双浮层/闪断。屏蔽原生 ActionMode 的效果在不同 WebView 版本与厂商 ROM 上并不一致。

**修复方向**：二选一，别做双头马车。倾向"完全托管"：在文章区域内对 `touchstart` 用非 passive 监听并在长按计时器命中时 `preventDefault` 吃掉原生选词；或倾向"完全交给原生"：删掉 `selectWordAtPoint`，只保留 `selectionchange` 单一入口（顺带解决 P2-12 的双触发）。

---

### P1-8 翻页/翻书模式：斜拖翻页会顺带选字并弹条

**证据**：翻页容器 `touch-none`（`TextReader/index.tsx:2558`）但正文 article 上是 `WebkitUserSelect: 'text'`（`:2359-2360`）；`onTouchMove` 只接 `handleFlipTouchMove`，没有 `preventDefault`（`:2570-2573`）。`touchMovedRef` 只挡住了"主动选词"这一路（`useTextSelection.ts:310`），挡不住浏览器自身的拖选，也挡不住 `selectionchange` 稳定路径（`:337-351`）。

**后果**：翻页拖拽跨过文字 → 浏览器产生原生选区 → 停止拖动 600ms 后动作条弹出（"翻页误弹"）。此条需真机复现确认（触屏上 `touch-action` 对选字的影响因内核而异）。

**修复方向**：翻页/翻书模式下拖动超过阈值即主动 `range` 清空选区，或在 `selectionchange` 稳定路径上加"最近是否发生翻页手势"的抑制位。

---

### P2-9 偏移 trim 修正逻辑写了两遍

`useTextSelection.ts:107-114` 与 `:153-160` 是逐字重复的同一段规则（`rawSelText.indexOf(text)` / `trailingTrim`）。两处一旦漂移，鼠标路径与 selectionchange 路径就会给出不同偏移。抽成一个函数。

### P2-10 跨章节标题的选区会塌陷，且批注永远不显示

章节标题 `<h2>` 在 `[data-reader-content]` **之外**且无 `data-source-start`（`TextReader/index.tsx:2246-2250`、`:2318-2322`）。`computeSelectionOffsets` 要求首尾**两端**都能拿到锚点（`:422`），否则整体退回兜底；此时终点在标题里，`startRange` 会被 Range 归一化成内容起点 → `startOffset ≈ 0`，而 `selectedText` 含标题文本（不在 `content` 里）→ `resolveAnnotationOffsets` 三条路径全失败返回 `null` → 批注出现在批注列表里但正文无高亮、无法定位。修复：跨容器选区要么明确拒绝并提示，要么把标题也纳入锚点体系。

### P2-11 渲染期直接写 ref

`useTextSelection.ts:50-51` 的 `selectionInfoRef.current = selectionInfo`、`TextReader/index.tsx:226` 的 `selectionPopupRef.current = selectionPopup` 都在渲染体内赋值。并发渲染下未提交的渲染也会写 ref。建议移到 `useEffect`/`useLayoutEffect`，或用 `useRef` + `useSyncExternalStore` 之外的惯用写法。

### P2-12 `mouseup` 的 rAF 与 `selectionchange` 的 600ms 双路触发

桌面拖选后两条路径都会 `setSelectionInfo`（`useTextSelection.ts:116-121` 与 `:162-167`），0.6s 后有一次无意义的重算/闪烁；拖拽选区手柄扩选期间动作条最多滞后 600ms 才跟随（`SELECTION_STABLE_DELAY = 600`，`:333`）。建议统一为单一入口 + `requestAnimationFrame` 节流。

### P2-13 词边界规则会把标点吞进"词"

`useTextSelection.ts:182`：`isWordChar = (ch) => !/\s/.test(ch)` —— 西文左右扩展会跨过逗号、引号、括号，查词/翻译可能拿到 `"hello,"` 这类脏词（中日韩走单字分支不受影响）。建议用 `Intl.Segmenter`（可按语言回退），或把标点列入终止集。

---

## 4. 修复任务清单（建议执行顺序）

| # | 任务 | 关联 | 验收 |
| --- | --- | --- | --- |
| 1 | hook 内新增 `resolveSelectionScope()`：从选区起止节点上溯最近的 `[data-reader-article][data-chapter-index]`，返回 `{ chapterIndex, containerStart }`；`useTextSelection` 对外暴露它 | P0-2 | 新增单测：两章同挂时选第 2 章 → 返回 `chapterIndex: 1` |
| 2 | 纯文本路径补锚点：`renderTextWithRanges` 逐段输出 `<span data-source-start={base + segStart}>`，`base` = 0（滚动）/ `pageStartOffset`（分页） | P0-1 | TXT 分页任一页划线，高亮位置正确；探针 1/2 的期望从 38/96 变为 0 |
| 3 | 兜底路径去掉 `document.querySelector`：改为容器相对定位；拿不到锚点时**不下发** `contentOffset`（让保存回退 `indexOf`） | P0-1 | 无声明的魔法数字；TXT 单章单容器场景偏移仍正确 |
| 4 | `buildAnnotationFromSelection` 改用作用域解析出的 `chapterIndex` / 偏移，`content` 也取对应章 | P0-2 | 跨章选择被拒绝或正确归属；批注在正确章可见 |
| 5 | 动作条定位改 `translateX(-50%)` + 实际宽度测量，删掉 48/330 魔数 | P1-3 | 左/中/右三处选区的动作条都居中于选区 |
| 6 | 补 `resize`/`orientationchange` 重算或收起；长选区的锚点改为选区**末端**行 rect（而非并集矩形） | P1-4 | 旋屏后动作条仍贴合选区；长选区不再贴左上角 |
| 7 | 遮罩层级/命中范围调整，导航栏在选区态仍可点；触屏允许滚动 | P1-5 | 选区存在时点底栏按钮一次生效；上下滑动可滚动 |
| 8 | 动作条按钮加 `onMouseDown/onTouchStart` 的 `preventDefault()` | P1-6 | 点击按钮时选区高亮不闪退 |
| 9 | 长按选词与原生选词二选一（建议保留 `selectionchange` 单入口），删除重复路径与重复 trim 修正 | P1-7 / P2-9 / P2-12 | 真机长按：只出现一套选区 UI；桌面拖选 0.6s 内无二次闪动 |
| 10 | 翻页手势超过阈值时清空选区 + `selectionchange` 加翻页抑制位 | P1-8 | 翻页拖动不再弹出动作条（真机验证） |
| 11 | 跨标题选区显式处理（拒绝并提示，或把标题纳入锚点） | P2-10 | 跨标题划线不再"保存成功但无高亮" |
| 12 | 词边界改用 `Intl.Segmenter` 或标点终止集 | P2-13 | 西文查词不携带标点 |
| 13 | ref 写入移出渲染体 | P2-11 | 无渲染期副作用；`typecheck`/`lint` 绿 |

---

## 附录 A：探针代码（可直接转成回归测试）

```tsx
// 关键：探针 1 —— 多章同挂时，第 2 章的选区应当报出"章内偏移 0"
const root = document.createElement('div')
root.innerHTML = `
  <main>
    <article data-reader-article data-chapter-index="0">
      <div data-reader-content>第一章正文内容开头</div>
    </article>
    <article data-reader-article data-chapter-index="1">
      <div data-reader-content>第二章节的正文内容</div>
    </article>
  </main>`
document.body.appendChild(root)

const ch1Node = root.querySelectorAll('[data-reader-content]')[1].firstChild as Text
const hook = renderHook(() => useTextSelection({
  selectionPopupRef: { current: null },
  scrollContainerRef: { current: root.querySelector('main') as HTMLDivElement },
}))

vi.spyOn(window, 'getSelection').mockReturnValue(makeSelection(ch1Node, 0, 2)) // 选中「第二」
act(() => { document.dispatchEvent(new Event('mouseup')) })
await nextFrame()

expect(hook.result.current.selectionInfo?.contentOffset).toBe(0) // 现状：38（失败）
```

（`makeSelection` / `nextFrame` / `mockRect` 直接复用 `src/hooks/useTextSelection.test.tsx` 里的辅助函数。）

## 附录 B：受影响文件

- `src/hooks/useTextSelection.ts`（核心，全部偏移与手势逻辑）
- `src/components/molecules/SelectionFloatingButton.tsx`（定位、遮罩、按钮事件）
- `src/pages/TextReader/index.tsx`（偏移消费、批注落库、渲染容器、遮罩层级上下文）
- `src/components/molecules/MarkdownReaderContent.tsx`（`data-source-start` 锚点来源，正确路径的参照）
- `src/services/textContent.ts` / `src/utils/fileType.ts`（说明 TXT 为什么没有锚点）
