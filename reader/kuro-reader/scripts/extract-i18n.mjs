/**
 * M-i18n.1 文案抽取脚本 v3（位置补丁法：不重排格式，原文件字节级手术）
 *
 * 用法：node scripts/extract-i18n.mjs <目录或文件...>
 * 默认范围：src/pages src/components src/App.tsx
 *
 * 原理：AST 仅用于分析——收集「替换区间(pos,end) + 替换文本」，按 start 降序
 * 在原文上 splice。不经 printer，未触碰的字节一个不动（git diff 最小化）。
 *
 * 替换形态：
 *  - JSX 文本（含「文本 {表达式} 文本」混合序列聚合）：区间 → {t('共 {{n}} 本', { n })}
 *  - 字符串/无插值模板（含 JSX attribute）：'文案' → t('文案') / attr={t('文案')}
 *  - 含插值模板串：`挂在 ${n} 本上` → t('挂在 {{n}} 本上', { n })——key 原样保留空格不 trim
 *  - 有替换的文件在首个 import 前注入 `import { t } from '@/i18n';`
 *
 * 排除（比较/协议/类型语义，替换即 bug）：console.* 子树、switch-case、===/!==等、
 * 对象字面量 name、x['键']、enum 值、import 说明符、new RegExp()、LiteralType（类型位置）。
 * 测试文件(*.test.*)不在收集范围。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const targets = args.length ? args : ['src/pages', 'src/components', 'src/App.tsx'];

const HAS_CN = /[\u4e00-\u9fff]/;
const KEYS_FILE = path.join(ROOT, 'scripts', 'i18n-keys.json');

const collapseWs = (s) => s.replace(/\s+/g, ' ');
const hasCn = (s) => HAS_CN.test(s);

const RESERVED = new Set(['true', 'false', 'null', 'undefined', 'this', 'new', 'delete', 'typeof', 'void', 'in', 'of', 'if', 'else', 'for', 'while', 'return', 'var', 'let', 'const', 'function', 'class', 'extends', 'super', 'import', 'export', 'default', 't', 'i18n']);

function identFromExpr(text) {
  const t = text.trim();
  if (/^[a-zA-Z_$][\w$]*$/.test(t) && !RESERVED.has(t)) return t;
  const m = /^([a-zA-Z_$][\w$]*)\.[\w$]+$/.test(t) ? t : null;
  if (m) {
    const seg = m.split('.').pop();
    if (!RESERVED.has(seg)) return seg;
  }
  return null;
}

function makeBinder() {
  const used = new Set(['t', 'i18n']);
  return (exprText) => {
    const want = identFromExpr(exprText);
    if (want && !used.has(want)) {
      used.add(want);
      return want;
    }
    let i = 1;
    while (used.has(`arg${i}`)) i++;
    used.add(`arg${i}`);
    return `arg${i}`;
  };
}

const BINDABLE_KINDS = new Set([
  ts.SyntaxKind.Identifier, ts.SyntaxKind.PropertyAccessExpression, ts.SyntaxKind.CallExpression,
  ts.SyntaxKind.ElementAccessExpression, ts.SyntaxKind.ConditionalExpression, ts.SyntaxKind.BinaryExpression,
  ts.SyntaxKind.PrefixUnaryExpression, ts.SyntaxKind.PostfixUnaryExpression, ts.SyntaxKind.AsExpression,
  ts.SyntaxKind.NonNullExpression, ts.SyntaxKind.ParenthesizedExpression, ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.StringLiteral, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword,
]);

function isBindableExpr(node) {
  if (!node) return false;
  if (!BINDABLE_KINDS.has(node.kind)) return false;
  if (hasCn(node.getText())) return false;
  let safe = true;
  node.forEachChild((c) => { if (!isBindableExpr(c)) safe = false; });
  return safe;
}

/** 字符串是否处于「比较/协议/类型」语义位置 */
function isComparisonPosition(node) {
  const p = node.parent;
  if (!p) return false;
  if (p.kind === ts.SyntaxKind.CaseClause || p.kind === ts.SyntaxKind.DefaultClause) return true;
  if (p.kind === ts.SyntaxKind.BinaryExpression) {
    const op = p.operatorToken.getText().trim();
    if (['===', '==', '!==', '!='].includes(op)) return true;
  }
  if (p.kind === ts.SyntaxKind.PropertyAssignment && p.name === node) return true;
  if (p.kind === ts.SyntaxKind.ElementAccessExpression && p.argumentExpression === node) return true;
  if (p.kind === ts.SyntaxKind.EnumMember) return true;
  if (p.kind === ts.SyntaxKind.ImportDeclaration || p.kind === ts.SyntaxKind.ExportDeclaration ||
    p.kind === ts.SyntaxKind.ExternalModuleReference) return true;
  if (p.kind === ts.SyntaxKind.NewExpression && p.expression.getText() === 'RegExp') return true;
  if (p.kind === ts.SyntaxKind.LiteralType) return true;
  return false;
}

function isInConsoleCall(node) {
  let cur = node.parent;
  while (cur && cur.kind !== ts.SyntaxKind.SourceFile) {
    if (cur.kind === ts.SyntaxKind.CallExpression) {
      const e = cur.expression;
      return e.kind === ts.SyntaxKind.PropertyAccessExpression &&
        e.expression.kind === ts.SyntaxKind.Identifier && e.expression.text === 'console';
    }
    cur = cur.parent;
  }
  return false;
}

// ---------- key 收集 ----------

const keyStats = new Map();
function recordKey(key, file) {
  if (!keyStats.has(key)) keyStats.set(key, new Set());
  keyStats.get(key).add(file);
}

/** 生成 t(...) 调用文本（绑定值直接复用源码切片，不经 printer） */
function tCallText(key, bindings, file) {
  recordKey(key, file);
  const keyLit = `'${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  if (!bindings.length) return `t(${keyLit})`;
  const args = bindings.map((b) => `${b.name}: ${b.src}`).join(', ');
  return `t(${keyLit}, { ${args} })`;
}

// ---------- 单文件处理 ----------

function transformFile(filePath, fileLabel) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const isTsx = /\.tsx$/.test(filePath);
  const sf = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  ts.setParentRecursive(sf, true);

  /** @type {{start:number, end:number, text:string}[]} */
  const patches = [];
  let firstImportStart = -1;
  let hasI18nImport = false;

  const slice = (node) => sourceText.slice(node.getStart(sf), node.getEnd());

  function collectJsxRuns(children) {
    let run = [];
    const flush = () => {
      if (!run.length) return;
      // run 内首尾的纯空白 JSXText 不纳入区间（保留 > 与 < 边缘空格）
      while (run.length && run[0].type === 'text' && !hasCn(run[0].text.trim())) run.shift();
      while (run.length && run[run.length - 1].type === 'text' && !hasCn(run[run.length - 1].text.trim())) run.pop();
      if (!run.length) { run = []; return; }
      const first = run[0];
      const last = run[run.length - 1];
      const alloc = makeBinder();
      let key = '';
      const bindings = [];
      for (const piece of run) {
        if (piece.type === 'text') key += piece.text;
        else {
          const src = slice(piece.expr);
          const name = alloc(src);
          bindings.push({ name, src });
          key += `{{${name}}}`;
        }
      }
      key = collapseWs(key).trim();
      if (!key || !hasCn(key)) { run = []; return; }
      // 区间取物理范围（node.pos 起，含被 TS scanner 剥离的首尾空白），
      // 与 React/babel 的 JSX 渲染空白语义一致
      patches.push({
        start: first.node.pos,
        end: last.node.end,
        text: `{${tCallText(key, bindings, fileLabel)}}`,
      });
      run = [];
    };
    for (const child of children) {
      if (child.kind === ts.SyntaxKind.JsxText) {
        // 物理区间切片：TS scanner 会剥离 JsxText 首尾空白（getText 丢空格），
        // 而 React 渲染保留——必须用 pos..end 切原文
        const raw = sourceText.slice(child.pos, child.end);
        if (hasCn(raw)) run.push({ type: 'text', text: raw, node: child });
        else flush();
      } else if (child.kind === ts.SyntaxKind.JsxExpression && isBindableExpr(child.expression)) {
        // 表达式无条件可进 run（含「{n} 本」表达式开头形态）；
        // flush 时若整段无中文则丢弃——bindable 表达式内部无中文无 JSX，无需回退 walk
        run.push({ type: 'expr', expr: child.expression, node: child });
      } else {
        flush();
        walk(child);
      }
    }
    flush();
  }

  function walk(node) {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        if (firstImportStart < 0) firstImportStart = node.getStart(sf);
        const spec = node.moduleSpecifier;
        if (ts.isStringLiteral(spec) && spec.text === '@/i18n') hasI18nImport = true;
        break;
      }
      case ts.SyntaxKind.JsxElement:
      case ts.SyntaxKind.JsxFragment: {
        collectJsxRuns(node.children);
        // children 成员已由 collectJsxRuns 处理（或递归 walk 过），跳过防止二次 patch
        node.forEachChild((c) => {
          if (node.children && node.children.includes(c)) return;
          walk(c);
        });
        return;
      }
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
        if (hasCn(node.text) && !isComparisonPosition(node) && !isInConsoleCall(node)) {
          const inAttr = node.parent?.kind === ts.SyntaxKind.JsxAttribute;
          const call = tCallText(node.text, [], fileLabel);
          patches.push({
            start: node.getStart(sf),
            end: node.getEnd(),
            text: inAttr ? `{${call}}` : call,
          });
        }
        return; // 字面量无子节点
      }
      case ts.SyntaxKind.TemplateExpression: {
        if (hasCn(node.getText(sf))) {
          const alloc = makeBinder();
          let key = node.head.text; // 模板串空格原样保留（拼接语义，不 trim）
          const bindings = [];
          for (const span of node.templateSpans) {
            const src = slice(span.expression);
            const name = alloc(src);
            bindings.push({ name, src });
            key += `{{${name}}}` + span.literal.text;
          }
          if (hasCn(key)) {
            patches.push({
              start: node.getStart(sf),
              end: node.getEnd(),
              text: tCallText(key, bindings, fileLabel),
            });
          }
        }
        return;
      }
      case ts.SyntaxKind.CallExpression: {
        const e = node.expression;
        if (e.kind === ts.SyntaxKind.PropertyAccessExpression &&
          e.expression.kind === ts.SyntaxKind.Identifier && e.expression.text === 'console') {
          return; // console.* 整棵子树跳过
        }
        break;
      }
    }
    node.forEachChild(walk);
  }

  walk(sf);

  if (!patches.length) return false;

  // import 注入：插在首个 import 前（注释后）；无 import 则文件头
  if (!hasI18nImport) {
    const insertAt = firstImportStart >= 0 ? firstImportStart : 0;
    patches.push({ start: insertAt, end: insertAt, text: `import { t } from '@/i18n';\n` });
  }

  // 从后往前 splice（start 降序），区间重叠防御
  patches.sort((a, b) => b.start - a.start || b.end - a.end);
  let output = sourceText;
  let lastStart = Infinity;
  for (const p of patches) {
    if (p.end > lastStart) throw new Error(`patch overlap at ${p.start}-${p.end} in ${filePath}`);
    output = output.slice(0, p.start) + p.text + output.slice(p.end);
    lastStart = p.start;
  }
  fs.writeFileSync(filePath, output, 'utf8');
  return true;
}

// ---------- 文件收集 ----------

function collectFiles(target) {
  const abs = path.resolve(ROOT, target);
  const st = fs.statSync(abs);
  if (st.isFile()) return [abs];
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const s = fs.statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.[jt]sx?$/.test(name)) out.push(p);
    }
  };
  walk(abs);
  return out;
}

const files = [...new Set(targets.flatMap(collectFiles))];

// 增量合并旧 keys（翻译阶段防丢）
if (fs.existsSync(KEYS_FILE)) {
  for (const k of JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'))) {
    if (!keyStats.has(k)) keyStats.set(k, new Set(['(previous-run)']));
  }
}

let touched = 0;
for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  try {
    if (transformFile(f, rel)) {
      touched++;
      console.log(`[extracted] ${rel}`);
    }
  } catch (err) {
    console.error(`[FAILED] ${rel}: ${err.message}`);
  }
}

const keys = [...keyStats.keys()].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');
console.log(`\nfiles touched: ${touched}/${files.length}`);
console.log(`unique keys total: ${keys.length} (scripts/i18n-keys.json)`);
