# AGENTS.md

本仓库面向 LLM 编码代理的协作约定。改界面代码前，以下三条是硬性前置：

1. **UI 唯一裁定书：[docs/design-tokens.md](docs/design-tokens.md)**。写任何 TSX 界面代码前先读其 §0 设计者原则（12 条判例式准则）与 §2 全组件配方（每种控件唯一写法）；配色语义查 §1，圆角/投影/动效/z 查 §3。
2. **令牌与配方的物理位置**：色板唯一真源 = `src/index.css` 的 CSS 变量；组件配方类 = 同文件 `@layer components`；统一按钮组件 = `src/components/atoms/Button.tsx`。禁止手拼 `bg-*/rounded-*/shadow-*` 发明控件新形态（判例见 §0.2）。
3. **合入门槛**：`npm run lint:tokens` 必须绿（已并入 `npm run lint`）；亮/暗双模式截图人眼验收；需要越出令牌的写法，先在 design-tokens.md §5 豁免表立项。
