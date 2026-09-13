#!/usr/bin/env node
/** 令牌守卫：扫 tsx 里的「体系外」样式写法，命中即退出 1。
 *  规则与豁免清单须与 docs/design-tokens.md 保持同步；新增豁免要先在文档立项。 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(process.cwd(), 'src');
const EXTRA_allowlist = [
  // 全屏图片查看器的白字浮层：媒体之上恒用白，不随主题（见 design-tokens.md §豁免）
  'components/molecules/FullscreenViewer.tsx',
];

/** [正则, 说明] —— 只拦 className 里可避免的体系外写法 */
const RULES = [
  [/\b(?:bg|text|border|ring|stroke|fill|from|to|via)-(?:blue|red|green|emerald|indigo|purple|violet|amber|sky|teal|pink|orange|yellow|cyan|rose|lime|fuchsia|slate|gray|zinc|neutral|stone)-\d{2,3}\b/, 'Tailwind 原生色板（用「墨·纸·光·印」令牌或文档豁免域色）'],
  [/\bbg-white\b(?!\/)/, '纯白底块（用 surface 系令牌）'],
  [/\brounded-(?:xl|2xl|3xl)\b/, '体系外圆角档（用 rounded-card / rounded-card-lg / rounded-lg）'],
  [/\bshadow-(?:md|lg|xl|2xl)\b/, '体系外投影（用 shadow-paper / shadow-paper-up / shadow-raised）'],
  [/text-\[(?:16|20|24)px\]/, '图标魔数字号（用 text-icon-sm / text-icon-md / text-icon-lg）'],
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.tsx') && !name.endsWith('.test.tsx')) yield p;
  }
}

const violations = [];
for (const file of walk(ROOT)) {
  const rel = relative(process.cwd(), file).replaceAll('\\', '/');
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [re, why] of RULES) {
      if (re.test(line)) {
        violations.push(`${rel}:${i + 1}  ${line.trim().slice(0, 110)}\n    → ${why}`);
      }
    }
  });
}

const filtered = violations.filter((v) => !EXTRA_allowlist.some((a) => v.startsWith(`src/${a}`)));
if (filtered.length > 0) {
  console.error(`✗ 令牌守卫命中 ${filtered.length} 处体系外写法：\n`);
  console.error(filtered.join('\n'));
  process.exit(1);
}
console.log('✓ 令牌守卫通过：未发现体系外样式写法');
