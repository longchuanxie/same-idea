/**
 * i18n 守门检查（并入 npm run lint）：
 *  1. 代码 t() keys 与 en/ja/ko 资源全覆盖校验（en 是回退语言，缺 key = 海外用户看到中文）
 *  2. zh.json identity 同步校验（keys 与代码一致）
 *  3. 裸中文 UI 文案检测：白名单目录中含中文字符串且不在 t() 调用内的行（防回潮）
 *
 * 内容逻辑豁免（数据/检索语义不随 UI 语言走，M-i18n.4 另行处理）：
 *   parsers / ai / tts / ocr / pagination / textContent / archiveParser / epubContent / pdfText* / widget
 *   qaRetrieval / comicChapterSplit / knowledgeMerge / textReaderFonts / i18n 目录本身 / 所有 *.test.*
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const LOCALES = path.join(SRC, 'i18n', 'locales');

const HAS_CN = /[\u4e00-\u9fff]/;

// ---------- 收集代码 t() keys（与 collect-i18n-keys 同逻辑） ----------
const codeKeys = new Set();
const bareChinese = [];

const EXEMPT_DIRS = [
  'services/parsers', 'services/ai', 'services/tts', 'services/ocrService',
  'services/pagination', 'services/telemetry',
  'services/textContent', 'services/archiveParser', 'services/epubContent',
  'services/pdfText', 'services/pdfTextLayer', 'services/storage', 'i18n',
  'test',
];
const EXEMPT_FILES = [
  'utils/qaRetrieval.ts', 'utils/comicChapterSplit.ts', 'utils/knowledgeMerge.ts',
  'constants/textReaderFonts.ts', 'constants/routes.ts', 'constants/storage.ts',
];

function isExempt(rel) {
  const p = rel.replace(/\\/g, '/');
  if (/\.test\.[jt]sx?$/.test(p)) return true;
  if (EXEMPT_DIRS.some((d) => p.startsWith(d + '/') || p.startsWith(d + '.'))) return true;
  if (EXEMPT_FILES.includes(p)) return true;
  return false;
}

function scanFile(file) {
  const rel = path.relative(SRC, file).replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');

  const single = /(?<![A-Za-z0-9_$.])t\('((?:[^'\\\n]|\\.)*)'\s*(?:,\s*\{[\s\S]*?\})?\)/g;
  for (const m of text.matchAll(single)) codeKeys.add(m[1]);
  const double = /(?<![A-Za-z0-9_$.])t\("((?:[^"\\\n]|\\.)*)"\s*(?:,\s*\{[\s\S]*?\})?\)/g;
  for (const m of text.matchAll(double)) codeKeys.add(m[1]);

  // 裸中文检测（豁免文件跳过）：含中文字符串字面量、且该处不是 t() 调用
  if (isExempt(rel)) return;
  const lines = text.split(/\r?\n/);
  let inBlockComment = false;
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (inBlockComment) {
      if (trimmed.includes('*/')) inBlockComment = false;
      return;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) inBlockComment = true;
      return;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (trimmed.includes('i18n-exempt')) return; // 行级豁免：数据/协议语义，语言随内容走
    if (/\{\/\*/.test(line) && !/\*\/\s*\}/.test(line.split('{/*')[1] ?? '')) return; // JSX 注释起止同行过滤
    if (trimmed.startsWith('{/*')) return;

    // 找出所有含中文的字符串字面量片段
    for (const m of line.matchAll(/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g)) {
      const literal = m[2];
      if (!HAS_CN.test(literal)) continue;
      // 该字面量是否已在 t() 调用里（t('...') 直接形态）
      const callPattern = new RegExp(`t\\(\\s*${m[1]}${literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
      if (callPattern.test(line)) continue;
      bareChinese.push(`${rel}:${i + 1}: ${trimmed.slice(0, 100)}`);
    }
    // JSX 文本中文（>中文<形态，行内无 t(）
    if (HAS_CN.test(line) && !/\bt\(/.test(line)) {
      const jsx = />[^<>{}]*[\u4e00-\u9fff][^<>{}]*</.exec(line);
      if (jsx) bareChinese.push(`${rel}:${i + 1}: ${trimmed.slice(0, 100)}`);
    }
  });
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(name)) scanFile(p);
  }
}
walk(SRC);

// ---------- 资源校验 ----------
let failed = false;
const en = JSON.parse(fs.readFileSync(path.join(LOCALES, 'en.json'), 'utf8'));
const ja = JSON.parse(fs.readFileSync(path.join(LOCALES, 'ja.json'), 'utf8'));
const ko = JSON.parse(fs.readFileSync(path.join(LOCALES, 'ko.json'), 'utf8'));
const zh = JSON.parse(fs.readFileSync(path.join(LOCALES, 'zh.json'), 'utf8'));
const zhHant = JSON.parse(fs.readFileSync(path.join(LOCALES, 'zh-Hant.json'), 'utf8'));

for (const [lang, res] of [['en', en], ['ja', ja], ['ko', ko], ['zh-Hant', zhHant]]) {
  const missing = [...codeKeys].filter((k) => res[k] === undefined || res[k] === null);
  if (missing.length) {
    failed = true;
    console.error(`[i18n] ${lang}.json missing ${missing.length} keys:`);
    for (const k of missing.slice(0, 10)) console.error(`  - ${JSON.stringify(k)}`);
  }
}

// zh identity：代码 keys 与 zh.json 完全一致
const zhKeys = Object.keys(zh);
const zhDrift = [
  ...[...codeKeys].filter((k) => zh[k] !== k),
  ...zhKeys.filter((k) => !codeKeys.has(k)),
];
if (zhDrift.length) {
  failed = true;
  console.error(`[i18n] zh.json out of sync (${zhDrift.length}) — run: node scripts/collect-i18n-keys.mjs`);
}

// 裸中文（信息性提示，不阻断——存量清理与豁免清单持续收敛）
if (bareChinese.length) {
  console.warn(`[i18n] ${bareChinese.length} lines with bare Chinese strings (informational):`);
  for (const l of bareChinese.slice(0, 60)) console.warn(`  ${l}`);
  if (bareChinese.length > 60) console.warn(`  ... and ${bareChinese.length - 60} more`);
}

if (failed) {
  console.error('[i18n] check FAILED');
  process.exit(1);
}
console.log(`[i18n] OK — ${codeKeys.size} keys covered in en/ja/ko/zh-Hant, zh identity in sync`);
