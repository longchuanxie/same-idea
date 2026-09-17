# 设计令牌手册（墨·纸·光·印）—— 全组件规范 v2

> **写任何 TSX 界面代码前，先读 §0 设计者原则与 §2 全组件配方。**
> 单一真源：`src/index.css` 的 CSS 变量（`:root` / `.dark`）。`tailwind.config.js` 仅引用变量，不改值。
> 组件配方沉淀在 `src/index.css` 的 `@layer components`。本文档是「什么能用、什么禁止、什么豁免」的裁定书；
> 守卫脚本 `npm run lint:tokens`（已并入 `npm run lint`）负责机器执行。

## 0. 设计者原则

写给在本仓库写 UI 代码的 LLM 与设计者。每条 = 可执行规则 + 本仓库真实案例（案例是判例：遇到同类情境按案例裁）。

**0.1 用户裁定即终审。** 设计意图与用户观感冲突时，废除意图，不是说服用户；用户指认"哪个是对的"，那个就升格为标准。
→ 判例：Button 组件的右下"书签切角"（clipPath 品牌母题）被用户判为"没对齐"，最终废除整个母题，全站按钮统一完整方角。

**0.2 一种控件，一种方言。** 控件只允许 §2 配方表里的唯一写法；禁止手拼 `bg-*/rounded-*/shadow-*` 组合发明新形态。要新形态，先沉淀配方类（0.8），再消费。
→ 判例：66 处主按钮出现过 4 种圆角方言（rounded-card/full/lg/无），就是手拼的后果。

**0.3 形守惯例，色承品牌。** 控件的"形"遵循平台肌肉记忆（开关=胶囊、按钮=方角矩形、焦点环=细线圈）；品牌感全部交给色板、衬线字与纸纹。在"形"上做创意（切角、异形、拟物）默认否决，除非用户主动要求。
→ 判例：书签切角被当成渲染残缺；圆形头像块被换成方形藏书印。

**0.4 颜色即语义，不是装饰。** 上色前先答语义，答不出就不上色：`seal`=激活/完成/馆藏强调（唯一强调色）；`lamp`=生命力（灯/炉火/荧光），**禁作交互色**；`wood`=结构线；`error`=危险。
→ 判例：焦点环误用 lamp、激活开关一度误用 primary，均被令牌审查纠正。

**0.5 圆角是层级语言。** `full` 只给"圆是功能语义"的元素（chip、开关、滑轨、印点、图标悬浮靶）；控件 6px（card）；面板 8px（lg）；弹层 10px（card-lg）。档位不混用、不新造。
→ 判例：胶囊形按钮被判为 iOS 方言；印格圆形底被判为模板残留。

**0.6 结构先于颜色。** 布局安全（flex 行内色块必须 `shrink-0`）、截断（`min-w-0`）、触达（≥44px）优先于上色。结构 bug 在暗色下会伪装成"错位的阴影"，像素排查极耗时。
→ 判例：设置页印格被长文本横向压扁成竖条，用户报"阴影没对齐"。

**0.7 豁免必须立项。** 守卫（`lint:tokens`）拦下的写法，若确属领域需要，先在 §5 豁免表登记位置与理由，再写代码；未登记即违规。豁免随功能删除而移除。

**0.8 先沉淀，后消费。** 第二次手写同一样式前，必须把它沉淀为 `@layer components` 配方类或原子组件，然后全部消费方改用沉淀物。
→ 判例：`.icon-tile`、`.btn-*`、`ToggleSwitch`、`.ink-slider` 均由此而来。

**0.9 亮暗双态，人眼验收。** DOM 断言与守卫绿查不出纸纹断层、合成残影、对比度失效；每个 UI 改动交付前必须亮/暗各截一图并排比对。守卫绿 ≠ 验收过。

**0.10 存量挂账，增量归零。** 旧代码的方言进 §4 迁移清单渐进偿还，不强求一次清零；新代码零容忍——`lint:tokens` 红了不合入。

**0.11 诚实装饰（Rams）。** 装饰不得假装功能；看起来像渲染残缺的装饰，等于渲染残缺。
→ 判例：即 0.1 的切角——它被至少三名用户/开发者读成 bug，按本条也必须废。

**0.12 文案是 UI 的一半。** 标题过具体性测试（有数字/具体名词/代价收益，三者全无则重写）；按钮写动词+对象；报错写原因+出路；用语走馆藏行话（去采编、归架、特藏室、问藏书），不用通用 SaaS 腔（赋能/体验/智能）。

### 新 UI 决策五步

1. 查 §2 配方表 → 有则直接用配方类/原子组件；
2. 没有配方 → 判定复用频率：出现第二次前，先沉淀配方类或原子组件（0.8）；
3. 需要越出令牌 → 先在 §5 豁免表立项（0.7）；
4. 交付前：亮/暗双截图人眼比对（0.9）+ `npm run lint:tokens` 绿（0.10）；
5. 完成后回写本文档：新配方进 §2、新豁免进 §5、新判例进 §0。

## 1. 色彩令牌（只准用这些，明暗主题自动换档）

| 语义 | 令牌 | 用途 | 禁区 |
|---|---|---|---|
| 纸 | `background` `surface` `surface-bright` `surface-container(low→highest)` | 页面底、卡片底、浮层底 | — |
| 墨 | `on-background` `on-surface` `on-surface-variant` `on-surface-faint` | 正文、次级文字、占位 | — |
| 墨（主操作） | `primary` / `on-primary` | 主按钮底、选中块（暗色自动反转） | 激活开关用 seal |
| 印（唯一强调色） | `seal` `seal-deep` `seal-soft` | 激活态、进度丝带、开关 ON、成功钤记、强调 CTA、格式章 | 禁大面积铺底 |
| 光 | `lamp` | 仅「生命力」元素：今日之灯/炉火/荧光标记 | **禁作交互色与按钮** |
| 木 | `wood` `wood-deep` | 仅结构性元素：书架层板线、侧边栏 | 禁按钮与文字 |
| 线 | `outline` `outline-variant`；结构线 `surface-tint/60` | 边框、分隔（后者暗色自动可见） | — |
| 危 | `error` 系 | 删除、错误、超限（危险确认由 ConfirmDialog 内部承载） | — |

**禁用**：Tailwind 原生色板（`blue-500` 之类）、`bg-white`、内联 hex（§6 豁免域色除外）。守卫拦截。

## 2. 全组件配方（每种控件只有一个写法）

配方类定义在 `index.css @layer components`，**色 / 形 / 字已收敛**，内边距与尺寸由使用处按密度自定。

### 2.1 按钮

| 配方 | 类 | 视觉 | 用途 |
|---|---|---|---|
| 主操作 | `<Button>`（atoms）或 `.btn-primary` | 墨底纸字 + 6px 圆角 | 页面级 CTA（去采编、开始生成、立即同步）；组件与类等价，组件优先 |
| 描边 | `.btn-secondary` | 透明底 + 细边 + 墨字 | 次操作（取消、导入恢复） |
| 幽灵 | `.btn-ghost` | 纯文字 + hover 纸灰 | 弹层内的低权重操作 |
| 朱砂强调 | `.btn-seal` | 朱砂底 + hover 加深 | 馆务强调 CTA（去采编）；**不做删除键** |
| 朱砂描边 | `.btn-outline-seal` | 朱砂细边 + 朱砂字 | 复习评分等带印章语义的并列动作 |
| 裸图标 | `.btn-icon` | 圆形悬浮靶，无底 | 工具条/行尾图标按钮（尺寸自定，w-9 h-9 起） |

规则：删除/危险语义走 ConfirmDialog；按钮**禁用 `rounded-full`**（胶囊是 iOS 方言）；禁自拼 `bg-primary … rounded-*`。
字号密度：配方默认 label-md，小字加 `.btn-sm`、大字加 `.btn-lg`（定义在基础配方之后，同特异性后者胜）。书签切角母题已废除（§0.1 判例）。

### 2.2 表单控件

| 配方 | 类/组件 | 要点 |
|---|---|---|
| 开关 | `<ToggleSwitch>`（atoms） | ON=朱砂轨道+浮纸钮；禁手写 toggle |
| 滑杆 | `.ink-slider` | 墨钮浮纸边；禁裸 `accent-*` |
| 输入框 | `.input-field` | 浮纸描边框；占位=ink-faint；禁再手写边框输入 |
| 下拉 | `<DropdownSelect>`（atoms） | 弹层自绘；原生 select 系统蓝与主题不符，禁用 |

### 2.3 容器与浮层

| 配方 | 类 | 用途 |
|---|---|---|
| 外层分组面板 | `.panel` | 设置页/表单的分组壳（纸面 + 细边 + 8px 圆角） |
| 组内卡片 | `.card-inner` | 面板内的行卡/内容卡（纸灰底 + 6px 圆角） |
| 选择块（可选中选项） | `.option` + `.option-active` | 方向/字号/视图切换等选中态控件；形状与内边距随使用处，选中=墨底 |
| 行首图标「印格」 | `.icon-tile` | 方形 6px + 纸灰底 + **`shrink-0`**；禁圆形 icon 容器。坑：无 `shrink-0` 时长文本会把色块压成竖条，暗色下像"错位的阴影"（2026-09 实案） |
| 可点卡片 | `.card-link` | 内容卡 + 点击动线（导航卡/行卡） |
| 浮层菜单 | `.menu-surface` | 下拉/弹出菜单面（浮纸 + 细边 + 纸影） |
| 底部抽屉 | `rounded-t-card-lg animate-slide-up` + `z-sheet` | 移动端 bottom sheet |
| 弹窗 | `bg-surface-bright rounded-card-lg shadow-raised` + `z-dialog` | 模态框统一走 ConfirmDialog / BookEditDialog 形制 |
| 章末/悬浮提示条 | `rounded-full bg-surface/90 backdrop-blur-md` | 阅读器 chrome 悬浮条（豁免域，见 §6） |

### 2.4 标签与徽标

| 配方 | 类/组件 | 要点 |
|---|---|---|
| 标签 chip | `.chip` + `.chip-active` | 胶囊形；内边距随使用处；激活=墨底；分类色底用令牌对（用户标签色配 `text-on-primary`，禁 `text-white`） |
| 格式章 | `<FormatBadge>` | PDF=error 容器对、文本=secondary 容器对、漫画=seal 对；禁原生色板 |
| 书籍生命态 | — | 在读=书脊丝带（seal 竖条）；读完=归架印点（seal 圆点） |

### 2.5 导航

| 部位 | 形制 |
|---|---|
| 顶栏 | 纸底 `bg-background/85 backdrop-blur-md` + 细线；左=个人中心藏书印（`ProfileSealButton`），中=衬线页名，右=操作 |
| 底栏（移动） | 纸底毛玻璃 + `border-t border-surface-tint/60`（木质层板线）；激活=图标 FILL 填充 + 2px 书脊线 |
| 侧栏（桌面） | 木色结构线；激活指示 `bg-lamp` 仅限此处灯语义 |

### 2.6 页面骨架

| 部位 | 形制 |
|---|---|
| 页头 | `font-display text-headline-md text-primary`（衬线大标）+ `font-body text-body-sm text-on-surface-variant` 副题 |
| 分组标题 | `font-label text-label-sm text-secondary uppercase tracking-widest` |
| 列表行 | 左 `.icon-tile` → 中标题+描述（`min-w-0` 截断）→ 右控件/chevron；行卡用 `.card-inner` |
| 空态 | 居中图标（`text-on-surface-faint`）+ `font-label text-label-lg` 标题 + `text-label-sm` 说明 + `.btn-primary`；禁引导性废话文案 |
| Tab | `font-label` + 激活态墨块（`bg-primary text-on-primary` 圆角块） |

## 3. 形 / 影 / 动 / 层

**圆角角色表**（`full` 只给"圆是功能语义"的东西）：

| 档位 | 值 | 只用于 |
|---|---|---|
| `rounded-full` | 9999 | chip、开关、进度条/滑轨、徽标、`.btn-icon` 悬浮靶、印章印点 |
| `rounded-card` | 6px | 按钮、内卡、印格、小控件 |
| `rounded-lg` | 8px | 外层面板、输入框、菜单面 |
| `rounded-card-lg` | 10px | 大卡、抽屉头、弹窗 |

**投影三档**（暖调黑）：`shadow-paper`（贴纸）→ `shadow-paper-up`（浮起菜单/提示条）→ `shadow-raised`（弹窗/抽屉）；`shadow-sm` 仅排版装饰（kbd）。

**动效**：`duration-instant`(120ms)/`duration-flow`(200ms)/`duration-ritual`(480ms)；开关弹性 `toggle-spring`；必须可中断、响应 `prefers-reduced-motion`。

**z 协议**：菜单 30 < 抽屉 40 < 面板 50 < 弹窗 60 < Toast 70。

**字阶**：`font-display`（衬线标题）/ `font-body`（正文）/ `font-label`（控件文字）/ `font-mono`（数据标点）；图标尺寸只用 `text-icon-sm/md/lg`。

## 4. 迁移清单（存量债务，渐进偿还）

- [x] 全站按钮收编：65 处动作按钮 → `.btn-*`/`.btn-seal`；42 处描边/幽灵 → `.btn-secondary`/`.btn-ghost`；选择块 → `.option/.option-active`；筛选 chip → `.chip/.chip-active`；复习评分 → `.btn-outline-seal`（2026-09）。
- [x] `Button.tsx` 已修：切角废除、补 `rounded-card`、焦点环 `outline-primary`、secondary 对齐 `.btn-secondary`（2026-09）。
- [x] 全站输入框收编：39 处 → `.input-field`（含 CustomCloud 下划线款、TTS 框、7 个 textarea）；豁免 2 处裸输入：Notes 内嵌过滤字段、Search 无框大搜索（2026-09）。
- [x] knowledge-hub / GenerationOptionsSheet / Settings / Auth / ChapterEndPrompt 已收编（2026-09）。
- [ ] `text-[10px]/[11px]/[14px]/[18px]` 微字号暂属默许档（徽章/密集 UI），新增界面禁用。
- [ ] 硬编码 `z-50` 浮层未全量对齐 z 协议，改动浮层时顺手归档。
- [x] 色温渐变两处内联 hex 收编为 `.temperature-ramp` 配方类；守卫新增 inline hex 规则（2026-09）。

## 5. 豁免清单（先立项再豁免，守卫脚本同步放行）

| 位置 | 写法 | 理由 |
|---|---|---|
| `FullscreenViewer.tsx` | `bg-white/10 text-white` | 媒体之上恒用白，不随主题 |
| 亮度/色温条（两 Reader 底栏） | `.temperature-ramp` 配方类（`linear-gradient(#ffffff, #ffcc80)` 渐变本体） | 色温功能演示渐变（光源本体）；2026-09 由两处内联复制沉淀为 index.css 配方类 |
| `MindmapView.tsx` `BRANCH_COLORS` | 8 色域数组 | 思维导图分支分类色，域调色板 |
| `MarkdownReaderContent` mark | `bg-lamp/30` | 荧光标记=琥珀（lamp 立项豁免：非交互） |
| `Home` 今日之灯 | `drop-shadow(lamp)` | lamp 光晕即元素本体 |
| 阅读器全屏 chrome | 圆钮 FAB、白色浮层 | 沉浸层自有语言，不入馆内体系 |

## 6. 新组件自查清单

1. 色值全部来自 §1 令牌（`npm run lint:tokens` 必须绿）；
2. 按钮用 §2.1 配方类，不手拼 `bg-*/rounded-*`；圆角查 §3 角色表；
3. 控件（开关/滑杆/输入/下拉/chip）直接复用 §2 配方，不手写；
4. flex 行内的色块一律 `shrink-0`（印格挤压事故，见 §2.3）；
5. 亮暗两态都截图看过；强调/激活语义是否该用 seal；
6. 新增高频模式 → 先沉淀成 `@layer components` 配方类或原子组件，再消费。
