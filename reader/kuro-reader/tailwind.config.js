/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* 「墨·纸·光·印」：src/index.css 的 CSS 变量是唯一真源，此处仅引用。
           保留旧键名（background/surface/primary…）以免全量改页面；新增 seal/lamp/wood 供新组件使用。 */
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'on-background': 'rgb(var(--color-on-background) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          dim: 'rgb(var(--color-surface-dim) / <alpha-value>)',
          bright: 'rgb(var(--color-surface-bright) / <alpha-value>)',
          variant: 'rgb(var(--color-surface-variant) / <alpha-value>)',
        },
        'on-surface': 'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'on-surface-faint': 'rgb(var(--color-on-surface-faint) / <alpha-value>)',
        'surface-container': {
          lowest: 'rgb(var(--color-surface-container-lowest) / <alpha-value>)',
          low: 'rgb(var(--color-surface-container-low) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-surface-container) / <alpha-value>)',
          high: 'rgb(var(--color-surface-container-high) / <alpha-value>)',
          highest: 'rgb(var(--color-surface-container-highest) / <alpha-value>)',
        },
        'surface-tint': 'rgb(var(--color-surface-tint) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        'on-tertiary-container': 'rgb(var(--color-on-tertiary-container) / <alpha-value>)',
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          container: 'rgb(var(--color-secondary-container) / <alpha-value>)',
        },
        outline: {
          DEFAULT: 'rgb(var(--color-outline) / <alpha-value>)',
          variant: 'rgb(var(--color-outline-variant) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
          container: 'rgb(var(--color-error-container) / <alpha-value>)',
        },
        'on-error': 'rgb(var(--color-on-error) / <alpha-value>)',
        'on-error-container': 'rgb(var(--color-on-error-container) / <alpha-value>)',
        /* 印：藏书印朱砂 —— 全应用唯一强调色（激活态/进度/批注/印章） */
        seal: {
          DEFAULT: 'rgb(var(--color-seal) / <alpha-value>)',
          deep: 'rgb(var(--color-seal-deep) / <alpha-value>)',
          soft: 'rgb(var(--color-seal-soft) / <alpha-value>)',
        },
        /* 光：琥珀 —— 仅生命力元素（今日之灯/炉火），禁作交互色 */
        lamp: 'rgb(var(--color-lamp) / <alpha-value>)',
        /* 木：仅结构性元素（侧边栏/书架线），禁用于按钮与文字 */
        wood: {
          DEFAULT: 'rgb(var(--color-wood) / <alpha-value>)',
          deep: 'rgb(var(--color-wood-deep) / <alpha-value>)',
        },
      },
      fontFamily: {
        /* 中文位补齐：拉丁字在前、中文字体紧随，避免中文回退系统默认 */
        display: ['Playfair Display', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'SimSun', 'serif'],
        body: ['Literata', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'SimSun', 'serif'],
        label: ['Inter', 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        /* 编目号/时间戳/页码等数据标点 */
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'Consolas', 'Noto Sans SC', 'monospace'],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '64px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '32px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '28px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        /* 图标三档：收编 text-[16px]/text-[20px]/text-[24px] 魔数 */
        'icon-sm': ['16px', { lineHeight: '1' }],
        'icon-md': ['20px', { lineHeight: '1' }],
        'icon-lg': ['24px', { lineHeight: '1' }],
      },
      spacing: {
        unit: '8px',
        gutter: '24px',
        'margin-mobile': '24px',
        'margin-desktop': '120px',
        'max-width-content': '720px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        card: '6px',
        'card-lg': '10px',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        /* 纸的叠放：暖调阴影（非纯黑），层级规范见建议书 2.6 */
        paper: '0 1px 2px rgba(33,30,27,.06), 0 2px 8px rgba(33,30,27,.04)',
        'paper-up': '0 4px 16px rgba(33,30,27,.10)',
        raised: '0 8px 32px rgba(33,30,27,.14)',
      },
      transitionTimingFunction: {
        instant: 'ease-out',
        flow: 'cubic-bezier(0.2, 0, 0, 1)',
        ritual: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      },
      transitionDuration: {
        instant: '120ms',
        flow: '200ms',
        ritual: '480ms',
      },
      zIndex: {
        /* 浮层层级协议（建议书 4.2）：菜单 < 抽屉 < 面板 < 弹窗 < Toast */
        menu: '30',
        drawer: '40',
        sheet: '50',
        dialog: '60',
        toast: '70',
      },
    },
  },
  plugins: [],
};
