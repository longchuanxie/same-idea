import JSZip from 'jszip';

import type { TextChapter } from '@/services/textContent';
import { parseMarkdownDocument } from '@/utils/markdownDocument';

/** 图片对象 URL 注册表：阅读器卸载时统一 revoke，避免泄漏 */
const createdObjectUrls: string[] = [];

export function revokeEpubObjectUrls(): void {
  for (const url of createdObjectUrls.splice(0)) {
    URL.revokeObjectURL(url);
  }
}

/** 解析相对路径（EPUB 内部 zip 路径）：以 baseDir 为基准，处理 ./ 与 ../ */
export function resolveZipPath(baseDir: string, src: string): string {
  const decoded = safeDecode(src).trim();
  if (decoded.startsWith('/')) return normalize(decoded);
  const baseSegments = baseDir === '' ? [] : baseDir.split('/').filter(Boolean);
  const segments = [...baseSegments];
  for (const seg of decoded.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') segments.pop();
    else segments.push(seg);
  }
  return normalize(segments.join('/'));

  function normalize(p: string): string {
    return p.replace(/\/+/g, '/');
  }
  function safeDecode(v: string): string {
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }
}

function zipDirOf(filePath: string): string {
  const idx = filePath.lastIndexOf('/');
  return idx >= 0 ? filePath.slice(0, idx + 1) : '';
}

function zipReadPath(baseDir: string, src: string): string {
  const resolved = resolveZipPath(baseDir, src);
  return resolved.startsWith('/') ? resolved.slice(1) : resolved;
}

/**
 * 将章节 XHTML 转换为 Markdown 文本（保真第一阶段：结构 + 图片）。
 * - h1-h6 → #；em/i、strong/b → *、**；br → 换行
 * - img → ![alt](resolvedHref)，解析失败时跳过
 * - script/style 及其余行内标签剥离文本；块级标签间补空行
 */
export function convertXhtmlToMarkdown(
  html: string,
  resolveImageHref: (src: string, alt: string) => string | null
): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, head, nav').forEach((el) => el.remove());

  const out: string[] = [];
  const visit = (node: Node, listDepth: number): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').replace(/\s+/g, ' ');
      if (text.trim()) out.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
        const level = Number(tag[1]);
        out.push(`\n\n${'#'.repeat(level)} ${textOf(el)}\n\n`);
        return;
      }
      case 'p': case 'div': case 'section': case 'article': case 'header': case 'footer': {
        const inner = inlineOf(el);
        if (inner.trim()) out.push(`\n\n${inner.trim()}\n\n`);
        return;
      }
      case 'blockquote': {
        const inner = textOf(el).trim();
        if (inner) out.push(`\n\n${inner.split('\n').map((l) => `> ${l}`).join('\n')}\n\n`);
        return;
      }
      case 'ul': case 'ol': {
        for (const child of Array.from(el.children)) {
          if (child.tagName.toLowerCase() !== 'li') continue;
          const itemText = textOf(child).trim();
          if (itemText) out.push(`\n${'  '.repeat(listDepth)}- ${itemText}`);
        }
        out.push('\n\n');
        return;
      }
      case 'br':
        out.push('\n');
        return;
      case 'hr':
        out.push('\n\n---\n\n');
        return;
      case 'img': {
        const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
        const alt = el.getAttribute('alt') || '插图';
        const href = src ? resolveImageHref(src, alt) : null;
        if (href) out.push(`\n\n![${alt.replace(/[[\]]/g, '')}](${href})\n\n`);
        return;
      }
      case 'svg':
        return; // SVG 内嵌图（xlink:href）留待后续阶段
      case 'em': case 'i':
        out.push(`*${textOf(el)}*`);
        return;
      case 'strong': case 'b':
        out.push(`**${textOf(el)}**`);
        return;
      default: {
        // 行内/未知元素：继续下探
        for (const child of Array.from(el.childNodes)) visit(child, listDepth);
      }
    }
  };

  const textOf = (el: Element): string => {
    const clone = el.cloneNode(true) as Element;
    clone.querySelectorAll('img').forEach((img) => img.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  };
  const inlineOf = (el: Element): string => {
    el.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const alt = (img.getAttribute('alt') || '插图').replace(/[[\]]/g, '');
      const href = src ? resolveImageHref(src, alt) : null;
      img.replaceWith(document.createTextNode(href ? `![${alt}](${href})` : ''));
    });
    return inlineTextOf(el);
  };
  const inlineTextOf = (el: Element): string => {
    let result = '';
    const walk = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += (node.textContent || '').replace(/\s+/g, ' ');
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const childEl = node as Element;
      switch (childEl.tagName.toLowerCase()) {
        case 'em': case 'i':
          result += `*${(childEl.textContent || '').replace(/\s+/g, ' ').trim()}*`;
          return;
        case 'strong': case 'b':
          result += `**${(childEl.textContent || '').replace(/\s+/g, ' ').trim()}**`;
          return;
        case 'br':
          result += '\n';
          return;
        default:
          for (const child of Array.from(node.childNodes)) walk(child);
      }
    };
    for (const child of Array.from(el.childNodes)) walk(child);
    return result;
  };

  for (const child of Array.from(doc.body.childNodes)) visit(child, 0);

  return out
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function parseContainer(zip: JSZip): Promise<string | null> {
  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) return null;
  const match = containerXml.match(/full-path="([^"]+\.opf)"/);
  return match ? match[1] : null;
}

function parseManifestAndSpine(opfContent: string): {
  spine: string[];
  manifestHref: Map<string, string>;
  manifestProps: Map<string, string[]>;
} {
  const spine = [...opfContent.matchAll(/<itemref[^>]+idref="([^"]+)"/g)].map((m) => m[1]);
  const manifestHref = new Map<string, string>();
  const manifestProps = new Map<string, string[]>();
  for (const m of opfContent.matchAll(/<item\s+([^>]+)>/g)) {
    const attrs = m[1];
    const id = attrs.match(/id="([^"]+)"/)?.[1];
    const href = attrs.match(/href="([^"]+)"/)?.[1];
    const props = attrs.match(/properties="([^"]+)"/)?.[1];
    if (id && href) {
      manifestHref.set(id, href);
      if (props) manifestProps.set(id, props.split(/\s+/));
    }
  }
  return { spine, manifestHref, manifestProps };
}

async function extractNcxTitles(
  zip: JSZip,
  opfDir: string,
  opfContent: string
): Promise<Map<string, string>> {
  const titleMap = new Map<string, string>();
  const ncxHref = opfContent.match(/<item[^>]+href="([^"]+\.ncx)"[^>]+/i)?.[1];
  if (!ncxHref) return titleMap;
  const ncxContent = await zip.file(zipReadPath(opfDir, ncxHref))?.async('string');
  if (!ncxContent) return titleMap;
  for (const m of ncxContent.matchAll(
    /<navPoint[^>]*>[\s\S]*?<navLabel>\s*<text>([^<]+)<\/text>[\s\S]*?<content\s+src="([^"]+)"/g
  )) {
    const src = (m[2] ?? '').split('#')[0];
    titleMap.set(zipReadPath(opfDir, src), m[1].trim());
  }
  return titleMap;
}

async function extractNavTitles(zip: JSZip, opfDir: string, navHref: string): Promise<Map<string, string>> {
  const titleMap = new Map<string, string>();
  const navContent = await zip.file(zipReadPath(opfDir, navHref))?.async('string');
  if (!navContent) return titleMap;
  const doc = new DOMParser().parseFromString(navContent, 'text/html');
  for (const a of Array.from(doc.querySelectorAll('a[href]'))) {
    const href = a.getAttribute('href') || '';
    const docPath = zipReadPath(opfDir, href.split('#')[0]);
    if (!docPath) continue;
    if (!titleMap.has(docPath)) titleMap.set(docPath, (a.textContent || '').trim());
  }
  return titleMap;
}

/**
 * 加载 EPUB 并转换为保真章节：XHTML → Markdown（含图片 object URL）。
 * 目录来源优先级：NCX → EPUB3 nav。
 */
export async function loadEpubChapters(blob: Blob): Promise<TextChapter[]> {
  const arrayBuffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const opfPath = await parseContainer(zip);
  if (!opfPath) return fallbackChapter('无法解析 EPUB 包结构');
  const opfContent = await zip.file(opfPath)?.async('string');
  if (!opfContent) return fallbackChapter('无法读取 OPF 内容');

  const opfDir = zipDirOf(opfPath);
  const { spine, manifestHref, manifestProps } = parseManifestAndSpine(opfContent);

  const navId = [...manifestProps.entries()].find(([, props]) => props.includes('nav'))?.[0];
  const navHref = navId ? manifestHref.get(navId) : undefined;

  const [ncxTitles, navTitles] = await Promise.all([
    extractNcxTitles(zip, opfDir, opfContent),
    navHref ? extractNavTitles(zip, opfDir, navHref) : Promise.resolve(new Map<string, string>()),
  ]);
  const titles = ncxTitles.size > 0 ? ncxTitles : navTitles;

  // 读取全部 spine 文档（保持顺序）
  const docs: { docPath: string; html: string }[] = [];
  for (const spineId of spine) {
    const href = manifestHref.get(spineId);
    if (!href) continue;
    const docPath = zipReadPath(opfDir, href);
    const html = await zip.file(docPath)?.async('string');
    if (html) docs.push({ docPath, html });
  }

  // 第一遍：收集全部图片 zip 路径
  const imageZipPaths = new Set<string>();
  for (const { docPath, html } of docs) {
    const docDir = zipDirOf(docPath);
    const dom = new DOMParser().parseFromString(html, 'text/html');
    for (const img of Array.from(dom.querySelectorAll('img'))) {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (!src) continue;
      imageZipPaths.add(zipReadPath(docDir, src));
    }
  }

  // 第二遍：异步预取图片 → object URL（同一 zip 路径复用）
  const imageUrlByZipPath = new Map<string, string>();
  await Promise.all(
    [...imageZipPaths].map(async (zipPath) => {
      const entry = zip.file(zipPath);
      if (!entry) return;
      const ext = zipPath.slice(zipPath.lastIndexOf('.')).toLowerCase();
      const type =
        ext === '.png' ? 'image/png'
        : ext === '.gif' ? 'image/gif'
        : ext === '.webp' ? 'image/webp'
        : ext === '.svg' ? 'image/svg+xml'
        : 'image/jpeg';
      const buffer = await entry.async('arraybuffer');
      const url = URL.createObjectURL(new Blob([buffer], { type }));
      createdObjectUrls.push(url);
      imageUrlByZipPath.set(zipPath, url);
    })
  );

  // 第三遍：转换为 Markdown 章节
  const chapters: TextChapter[] = [];
  for (const { docPath, html } of docs) {
    const docDir = zipDirOf(docPath);
    const markdown = convertXhtmlToMarkdown(html, (src) => {
      const zipPath = zipReadPath(docDir, src);
      return imageUrlByZipPath.get(zipPath) ?? null;
    });
    if (!markdown.trim()) continue;
    const chapterIndex = chapters.length + 1;
    const title = titles.get(docPath) || titles.get(docPath.replace(/^\//, '')) || `第${chapterIndex}章`;
    chapters.push({
      id: `ch${chapterIndex}`,
      title,
      content: markdown,
      markdownDocument: parseMarkdownDocument(markdown),
    });
  }

  if (chapters.length === 0) return fallbackChapter('EPUB 内容为空');
  return chapters;
}

function fallbackChapter(message: string): TextChapter[] {
  return [{ id: 'ch1', title: '正文', content: message }];
}
