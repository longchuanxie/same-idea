# 图文排版方案调研（Kuro Reader）

> 用途：图文排版能力补强的方案依据 ｜ 调研日期 2026-10-20，失效期 2027-01-20 ｜ 事实与解读分栏，[解读] 标注处为判断

## 一句话结论

**业界图文排版的的事实标准是"保真渲染 + CSS 多栏分页"（Readium CSS / foliate-js / epub.js 同源策略），而 Kuro 走的是"归一化 Markdown + 自研字符流分页"路线——二维排版语义（绕排/表格/SVG/图注）在源头就塌缩成一维。** 换引擎会连坐划线锚点/净化/TTS/知识库全家桶（全部依赖一维字符坐标），因此建议三档走：先做**档一**（不动架构的图文短板补强，多数改动是接通已有组件），**档二**做转换层保真升级，**档三**（双引擎 foliate-js 保真渲染模式）仅在档一/二之后仍有诉求时立项。

## 1. 现状与不足（代码侦察结论，2026-10-20）

管线全貌：EPUB/MOBI → `convertXhtmlToMarkdown`（有损单趟 DOM 遍历，图片预取为 blob URL）→ 自研 markdown 文档模型 → 自研 React 渲染器 → 自研块级分页 + 屏外整章 DOM 实测（`src/pages/TextReader/index.tsx:1388-1607`）。漫画/PDF 是独立管线（每页一张图），**图文排版短板范围仅限文本管线**。

不足分三层（编号对应侦察清单，全文见调研过程，代码证据以 file:line 略）：

**A. 转换层丢语义（天花板根源）**：
- float/图文绕排在源头即丢失——转换只读标签不解析 CSS，`<img>` 只取 src/data-src/alt，width/height/style 全弃
- 内嵌 `<svg>` 直接 `return` 丢弃（svg 文件引用能活，丢的是 inline 形态）
- **表格打碎成连排文字**（`<td>A</td><td>B</td>`→"AB"）——渲染层明明有完整表格渲染器（含横滚/对齐），EPUB 表格根本到不了
- `pre`/`code` 退化为普通段落（空白折叠毁缩进）；blockquote/列表项内图片被整体删除、强调拍平；有序列表变无序、嵌套拍平；链接 href 丢弃；figcaption 与图分离成裸文本
- `data:image/svg+xml` 被 `isSafeMarkdownImageSource` 拒收（渲染成"图片加载失败"）

**B. 渲染层无混排无缩放**：
- 只有块级串行流，图片实际是"占一行的 inline-block"，左对齐不居中，文字永不可能绕排
- `max-h-[70vh]` 硬顶无放大查看（FullscreenViewer 只挂在漫画 Reader，TextReader 未接）——细节图物理不可读
- 无尺寸预留/占位（img 不带 width/height/aspect-ratio）——讽刺的是项目已有 PNG/JPEG 头部尺寸快读工具 `readImageDimensions`（`src/utils/imageSize.ts:44`）但只用在漫画解析
- 无 caption 语义；图片在文本坐标里是 `[图片：alt]` 占位串（TTS/搜索/批注锚）

**C. 分页器视图片为原子障碍物**：
- 含图块永远不可内部切分（`canSplitInside` 排除 containsImage）；段落混一张行内图就整段原子化，超高时只能被 overflow-hidden 裁掉
- 大图块强制独占一页且前一页留白（无回填）
- 图片对分页是同步阻塞依赖（等全部 img complete，超时 3s；图晚到→整章缓存作废+全章重排——图多书首开慢的根因）
- 测量是整章全量 DOM + 全部图 eager（图密集章 O(章) 内存）
- 70vh 图高顶 vs 页高预算可能失配（桌面 padding 大时页高 < 70vh，超高图底部被裁）

## 2. 业界方案格局

### 2.1 保真渲染 + CSS 多栏分页（事实标准）

**机制**（foliate-js `paginator.js` 源码逐行分析，~1000 行零依赖，查于 2026-10-20）：
- 内容在 **sandbox iframe + shadow DOM 里以原始 XHTML 渲染**（不转中间格式，作者 CSS 保留）
- 分页 = CSS multi-column：`column-width = (视口/栏数) - gap`、`column-fill: auto`、容器固定 `height` + `overflow: hidden`；**页数 = ceil(内容总宽 ÷ 栏宽)**，iframe 撑大平铺所有栏，翻页就是滚动
- **图片处理没有"等待策略"**：注入 `setImageSize()`（保留原 max 尺寸、`object-fit: contain`、`break-inside: avoid`），然后用 **ResizeObserver 观察整个 body + `document.fonts.ready`**——任何内容尺寸变化（图到了、字加载了）就整体重算页数。二分法（`bisectNode`）只用于找视口内可见字符偏移（进度锚/搜索定位用）
- 竖排 vertical-rl 一等公民（测量轴切换 + 矩形映射 `({top,bottom})=>({left,right})`）
- 滚动/分页由 `flow` 属性切换；表格/超宽元素无专门处理，靠 `overflow-wrap: break-word` 兜底

**Readium CSS**（EDR 的阅读系统样式规范，BSD-3，查于 2026-10-20）——十年沉淀的"防溢出安全网"，可直接抄的规则：
- `safeguards.css`：`img/svg/video { max-width: 100%; max-height: 95vh !important; object-fit: contain; break-inside: avoid; }`——**95vh 而非 100vh，注释明说"figures might have a figcaption, which is why 95vh"（给图注留 5vh）**；长词 `word-wrap: break-word`；table `box-sizing + max-width`
- `pagination.css`：:root 上 column-count/width/gap + `column-fill:auto` + 固定视口高；body `max-width` 控制行长居中；**注释明言"想要精确控制两页 spread 就得 JS 动态更新 colWidth/colGap——大量阅读系统这么干"**
- 有 **CJK 横排/竖排专版样式**（`cjk-vertical/ReadiumCSS-*.css`）、RTL 专版——多语言排版的参考真源

**代表产品**：Thorium Reader（EDR 桌面）、Foliate（Linux）、**Koodo Reader（Credits 页确认用 foliate-js）**、epub.js 生态（老牌，同策略，EpubCFI 定位体系）。微信读书/Apple Books 闭源无取证。

### 2.2 归一化中间格式 + 自研分页（Kuro 现状流派）

把任意格式转成统一中间表示（Kuro 是 Markdown 字符流），自研分页器切页。**业界成品阅读器几乎没有公开走这条路的**——[解读] 因为排版引擎成本极高（浏览器 CSS 免费给了排版能力，自己重造等于重写半个排版引擎，Kuro 历史上 v1.28/1.29/1.30 三版分页缺陷修复就是这个代价的实证）。但 Kuro 选这条路换来的东西也是真实的：**全书一维字符坐标**——划线批注的稳定锚点与回位、净化替换流四级回退、书内搜索、TTS 逐句、LLM 知识库语料、翻译/生词本全部同构地建立在这个坐标系上。这是差异化全家桶的根基，不是失误。

## 3. 方案建议（三档）

### 档一：不动架构的图文短板补强（快赢，多数是"接通已有组件"）

| 改动 | 解决的不足 | 依据 |
|---|---|---|
| 转换层：`table`→GFM 表格 Markdown（渲染器已有完整表格组件）；`figcaption`→与相邻 img 绑定的 caption 语义；blockquote/li 改用 `inlineOf`（图片/强调不再删）；放行 `data:image/svg+xml`；`ol` 有序化+嵌套层级；`a`→`[text](href)` | A 组大部分 | 渲染层能力已备齐，缺的只是转换器产出 |
| 渲染层：EPUB 独立段落图居中（`mx-auto`）；figcaption 小字号绑定样式；**图片点击放大接 FullscreenViewer**（组件已存在，只是没挂 TextReader） | B 组 | 漫画 Reader 已验证的交互 |
| 图片尺寸预留：导入期用已有 `readImageDimensions` 预读 PNG/JPEG 头 → img 带 `width/height`（或 aspect-ratio）→ 分页测量不再需要"等图 complete"，3s 超时与图晚到重排的根源同时消灭 | B+C 组 | Readium CSS/浏览器 CLS 最佳实践同方向 |
| 图片高上限参照 Readium CSS `95vh`（给 caption 留量），且改为**相对页高预算的动态值**（`min(95vh, 页高-安全余量)`）——超高图参与页高协商而非硬顶冲突 | C 组 70vh 失配 | ReadiumCSS-safeguards 规则 |
| 分页器：超高图块允许"按页高预算整体缩放"（CSS 层 max-height 后测量天然感知）；图块与文字同页判定放宽（图+图注高度 ≤ 剩余页高即可同页） | C 组独占页留白 | foliate-js break-inside:avoid + 容器协商同思路 |

### 档二：转换层结构保真升级（管线内的深水区）

- `convertXhtmlToMarkdown` 从"单趟 DOM 遍历"升级为结构保真转换：嵌套列表/有序列表/链接/sup-sub-kbd-mark/u/fenced code/内联 SVG（转 data URL 或独立资源）/figure-figcaption 整体语义。渲染层 span 渲染器（sub/sup/kbd/mark/underline）与代码块渲染器已存在，改造集中在转换器
- 图文绕排（float）[解读]：在字符流坐标系里无法真绕排，最多做到"class 降级"——float 图渲染为居中/左对齐小块+上下文流过，视觉上近似而非真绕排。要真绕排只有档三
- 图片占位串 `[图片：alt]` 与批注/TTS 坐标维持现状（改它会连坐锚点体系）

### 档三：双引擎——EPUB/MOBI 增加 foliate-js 保真渲染模式（长期可选，大活）

- **项目已依赖 foliate-js@1.0.1（mobi.js）**，同库引入 `paginator.js`/`view.js` 依赖成本极低；作为设置项"原版式阅读"开关，EPUB/MOBI 可切到保真渲染（作者 CSS/绕排/SVG/表格全保留，CSS 多栏分页）
- **代价（为什么不能轻上）**：批注/划线锚点要 Range/CFI 化（与现有字符偏移锚点双坐标系并存）；净化、书内搜索、TTS、知识库语料、主题注入都要为 iframe 内 DOM 适配第二套实现；图注/分页主题要与现有 UI 统一。Koodo Reader 没有 Kuro 这套深度文本系统所以切换无痛，Kuro 不是
- [解读] 立项判据：档一/二落地后，若"排版保真"仍是用户流失理由（尤其日文竖排轻小说/带图技术书客群），再启动；否则不碰

## 4. 决策速查

| 档 | 解决 | 工作量 | 风险 | 连坐锚点体系 |
|---|---|---|---|---|
| 档一 | A 组大半 + B/C 组高频痛点 | 小-中（多为接通已有组件） | 低 | 否 |
| 档二 | A 组全部（除真绕排） | 中-大 | 中（转换器回归面广，需夹具护航） | 否（坐标系不变） |
| 档三 | 全部（含真绕排/作者 CSS） | 大 | 高（双坐标系维护） | 是（Range/CFI 并存） |

## 5. 证据与日期戳

- 现状侦察：本项目代码（`src/services/epubContent.ts`、`mobiContent.ts`、`src/services/pagination/markdownBlockPagination.ts`、`src/components/molecules/MarkdownReaderContent.tsx`、`src/pages/TextReader/index.tsx`、`src/utils/imageSize.ts`），2026-10-20
- foliate-js paginator.js 源码分析：https://github.com/johnfactotum/foliate-js （blob/main/paginator.js，查于 2026-10-20；CSS multi-column + bisect + ResizeObserver 重排 + vertical-rl）
- Readium CSS 模块原文：https://github.com/readium/css （safeguards.css 95vh/figcaption 注释、pagination.css 动态 colWidth 注释、cjk-vertical 专版，查于 2026-10-20）
- Koodo Reader 引擎确认：https://github.com/koodo-reader （Credits 页列 foliate-js，查于 2026-10-20）
- epub.js 机制：https://github.com/futurepress/epub.js （CSS 多栏 + EpubCFI，查于 2026-10-20）
- CSS 多栏图片最佳实践：MDN [Handling content breaks in multi-column layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Multicol_layout/Handling_content_breaks)、Smashing Magazine（figure+caption 用 break-inside:avoid 绑定）（查于 2026-10-20）
- Readium 导航器设计文档：https://readium.org/technical/r2-navigator-design-dilemmas （分页策略讨论，查于 2026-10-20）
