/**
 * 扫描代码重建 i18n keys 真源 + 生成 zh identity 资源。
 * 代码即真源：收集 src 下所有 t('...') 调用的 key（含 t("...") 形态），
 * 输出 scripts/i18n-keys.json 与 src/i18n/locales/zh.json（key===value）。
 * 用法：node scripts/collect-i18n-keys.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KEYS_FILE = path.join(__dirname, 'i18n-keys.json');
const ZH_FILE = path.join(ROOT, 'src', 'i18n', 'locales', 'zh.json');

const keys = new Set();

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  // t('...') / t("...")：项目内调用形态统一（extract 脚本产出 + 手写），简单正则足够；
  // 第二参数（插值绑定对象）可选，惰性匹配防跨调用吞噬
  const single = /(?<![A-Za-z0-9_$.])t\('((?:[^'\\\n]|\\.)*)'\s*(?:,\s*\{[\s\S]*?\})?\)/g;
  for (const m of text.matchAll(single)) keys.add(m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\').replace(/\\n/g, '\n'));
  const double = /(?<![A-Za-z0-9_$.])t\("((?:[^"\\\n]|\\.)*)"\s*(?:,\s*\{[\s\S]*?\})?\)/g;
  for (const m of text.matchAll(double)) keys.add(m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(name)) scanFile(p);
  }
}
walk(path.join(ROOT, 'src'));

const arr = [...keys].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
fs.writeFileSync(KEYS_FILE, JSON.stringify(arr, null, 2) + '\n', 'utf8');
const zh = {};
for (const k of arr) zh[k] = k;
fs.writeFileSync(ZH_FILE, JSON.stringify(zh, null, 2) + '\n', 'utf8');
console.log(`keys from code: ${arr.length} -> scripts/i18n-keys.json + src/i18n/locales/zh.json`);
