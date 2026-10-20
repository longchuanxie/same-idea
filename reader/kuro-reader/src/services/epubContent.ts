import JSZip from 'jszip';

import type { TextChapter } from '@/services/textContent';
import { readImageDimensions, registerImageDimensions } from '@/utils/imageSize';
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

function imageMimeTypeOf(zipPath: string): string {
  const ext = zipPath.slice(zipPath.lastIndexOf('.')).toLowerCase();
  return ext === '.png' ? 'image/png'
    : ext === '.gif' ? 'image/gif'
    : ext === '.webp' ? 'image/webp'
    : ext === '.svg' ? 'image/svg+xml'
    : 'image/jpeg';
}

function bytesToBase64(bytes: Uint8Array): string {
  // 分块防 String.fromCharCode 展开爆栈（大图/SVG）
  const CHUNK_SIZE = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}

/** zip 内图片 → base64 data URL（inline SVG 的 <image> 内联用；失败返回 null） */
async function zipImageToDataUrl(zip: JSZip, zipPath: string): Promise<string | null> {
  const entry = zip.file(zipPath);
  if (!entry) return null;
  try {
    const buffer = await entry.async('arraybuffer');
    return `data:${imageMimeTypeOf(zipPath)};base64,${bytesToBase64(new Uint8Array(buffer))}`;
  } catch {
    return null;
  }
}

/**
 * inline <svg> → data:image/svg+xml data URL。
 * SVG 以 <img> 方式加载时禁一切外部引用（blob:/相对路径都不加载）：
 * 内嵌 <image> 的 zip 引用预先取 bytes 内联为 data URL，取不到的移除（保矢量部分）。
 */
const XLINK_NS = 'http://www.w3.org/1999/xlink';
async function inlineSvgToDataUrl(svg: Element, zip: JSZip, baseDir: string): Promise<string | null> {
  try {
    const clone = svg.cloneNode(true) as Element;
    for (const image of Array.from(clone.querySelectorAll('image'))) {
      const href = image.getAttribute('href')
        || image.getAttributeNS(XLINK_NS, 'href')
        || image.getAttribute('xlink:href')
        || '';
      const dataUrl = href ? await zipImageToDataUrl(zip, zipReadPath(baseDir, href)) : null;
      if (dataUrl) {
        image.setAttribute('href', dataUrl);
        image.removeAttributeNS(XLINK_NS, 'href');
        image.removeAttribute('xlink:href');
      } else {
        image.remove();
      }
    }
    const xml = new XMLSerializer().serializeToString(clone);
    return `data:image/svg+xml;base64,${bytesToBase64(new TextEncoder().encode(xml))}`;
  } catch {
    return null;
  }
}

function zipReadPath(baseDir: string, src: string): string {
  const resolved = resolveZipPath(baseDir, src);
  return resolved.startsWith('/') ? resolved.slice(1) : resolved;
}

/** 转换器可选项：inline <svg> 的取图通道（EPUB 管线预生成 data URL，见 loadEpubChapters） */
export interface ConvertXhtmlOptions {
  /** 返回该 svg 元素的可渲染图片地址（data:image/svg+xml）；null 则丢弃（与旧行为一致） */
  resolveInlineSvg?: (svg: Element) => string | null;
}

/**
 * 将章节 XHTML 转换为 Markdown 文本（保真：结构 + 表格 + 图注 + 列表嵌套 + 链接 + 代码块）。
 * - h1-h6 → #；em/i、strong/b → *、**（递归保嵌套）；br → 换行；a → [text](href)
 * - img → ![alt](resolvedHref)；figure+figcaption → 图注文本并入 alt（渲染层显示为图注）
 * - sub/sup/kbd/mark/u/del 透传为行内 HTML（渲染层 span 渲染器已支持）
 * - inline <svg> 经 resolveInlineSvg 转 data URL 图片（未提供则丢弃）
 * - table → GFM 表格（colspan/rowspan 无载体按单元格展开）
 * - 列表带有序序号与嵌套层级；blockquote 递归转换（内部图片/强调/列表保留）
 * - script/style 及其余行内标签剥离文本；块级标签间补空行
 */
export function convertXhtmlToMarkdown(
  html: string,
  resolveImageHref: (src: string, alt: string) => string | null,
  options?: ConvertXhtmlOptions
): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, head, nav').forEach((el) => el.remove());

  const out: string[] = [];
  // 输出栈：块级容器（blockquote/li 等）递归转换时切到子缓冲收集，完毕弹回拼装
  const outStack: string[][] = [out];
  const emit = (chunk: string): void => {
    outStack[outStack.length - 1].push(chunk);
  };
  /** 收集 el 子节点的转换结果（块级容器递归用） */
  const childrenMarkdownOf = (el: Element, listDepth: number): string => {
    outStack.push([]);
    for (const child of Array.from(el.childNodes)) visit(child, listDepth);
    return outStack.pop()!.join('');
  };

  const escapeLinkHref = (href: string): string =>
    href.replace(/\\/g, '%5C').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/ /g, '%20');

  const imageMarkdownOf = (img: Element, altOverride?: string): string | null => {
    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    const rawAlt = altOverride !== undefined ? altOverride : img.getAttribute('alt') || '';
    const alt = rawAlt.replace(/[[\]]/g, '').trim();
    const href = src ? resolveImageHref(src, alt) : null;
    return href ? `![${alt}](${href})` : null;
  };

  /** GFM 表格：首行作表头（有 thead 时用 thead），嵌套表格的行归嵌套表自己 */
  const tableMarkdownOf = (table: Element): string | null => {
    const rows = Array.from(table.querySelectorAll('tr'))
      .filter((tr) => tr.closest('table') === table);
    if (rows.length === 0) return null;
    const cellOf = (cell: Element): string =>
      inlineOf(cell).replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim() || ' ';
    const lineOf = (tr: Element): string =>
      `| ${Array.from(tr.children).map(cellOf).join(' | ')} |`;
    return [
      lineOf(rows[0]),
      `| ${Array.from(rows[0].children).map(() => '---').join(' | ')} |`,
      ...rows.slice(1).map(lineOf),
    ].join('\n');
  };

  const visit = (node: Node, listDepth: number): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').replace(/\s+/g, ' ');
      if (text.trim()) emit(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
        const level = Number(tag[1]);
        emit(`\n\n${'#'.repeat(level)} ${textOf(el)}\n\n`);
        return;
      }
      case 'p': case 'div': case 'section': case 'article': case 'header': case 'footer': {
        const inner = inlineOf(el);
        if (inner.trim()) emit(`\n\n${inner.trim()}\n\n`);
        return;
      }
      case 'figure': {
        // 图片 + 图注绑定：figcaption 文本并入 alt（渲染层显示为图注），
        // 其余内容（多段说明等）按普通块递归补出
        const caption = (el.querySelector('figcaption')?.textContent || '').replace(/\s+/g, ' ').trim();
        const img = el.querySelector('img');
        if (img) {
          const md = imageMarkdownOf(img, caption || img.getAttribute('alt') || '');
          if (md) emit(`\n\n${md}\n\n`);
        }
        const rest = el.cloneNode(true) as Element;
        rest.querySelectorAll('img, svg, figcaption').forEach((n) => n.remove());
        const restMd = childrenMarkdownOf(rest, listDepth);
        if (restMd.trim()) emit(`${restMd}`);
        return;
      }
      case 'table': {
        const md = tableMarkdownOf(el);
        if (md) emit(`\n\n${md}\n\n`);
        return;
      }
      case 'pre': {
        const code = (el.textContent || '').replace(/\n+$/, '');
        if (code.trim()) {
          const fence = code.includes('```') ? '~~~~' : '```';
          emit(`\n\n${fence}\n${code}\n${fence}\n\n`);
        }
        return;
      }
      case 'blockquote': {
        // 行内化整段（保图片/强调/链接）：图片的块级 \n\n 在引用内会产生
        // 「>」空行把一句话撕成多段，单行形态最贴近原意；嵌套块随之拍平
        const inner = inlineOf(el).trim();
        if (inner) emit(`\n\n> ${inner.replace(/\n+/g, ' ')}\n\n`);
        return;
      }
      case 'ul': case 'ol': {
        const ordered = tag === 'ol';
        const start = Number(el.getAttribute('start') || '1') || 1;
        let itemIndex = 0;
        for (const child of Array.from(el.children)) {
          if (child.tagName.toLowerCase() !== 'li') continue;
          itemIndex += 1;
          const marker = ordered ? `${start + itemIndex - 1}. ` : '- ';
          // li 内容 = 除嵌套列表外的行内化（保图片/强调/链接）
          const clone = child.cloneNode(true) as Element;
          clone.querySelectorAll('ul, ol').forEach((n) => n.remove());
          const itemText = inlineOf(clone).trim();
          // 缩进 4 空格：必须 ≥ 有序 marker 宽（"10. " 也宽 4），2 空格会被 marked
          // 并进父列表（序号延续、层级拍平）；且须 < 父内容列+4 防成代码块续行
          const indent = '    '.repeat(listDepth);
          if (itemText) emit(`\n${indent}${marker}${itemText}`);
          // 本 li 直接拥有的嵌套列表递归降层（孙列表由其所属 li 自己处理）
          for (const nested of Array.from(child.querySelectorAll('ul, ol'))) {
            if (nested.closest('li') !== child) continue;
            visit(nested, listDepth + 1);
          }
        }
        emit('\n\n');
        return;
      }
      case 'br':
        emit('\n');
        return;
      case 'hr':
        emit('\n\n---\n\n');
        return;
      case 'img': {
        const md = imageMarkdownOf(el);
        if (md) emit(`\n\n${md}\n\n`);
        return;
      }
      case 'svg': {
        // inline SVG：管线预生成 data URL 时成为真图（<title> 作图注 alt），否则丢弃
        const href = options?.resolveInlineSvg?.(el) ?? null;
        if (href) {
          const title = (el.querySelector('title')?.textContent || '')
            .replace(/\s+/g, ' ').trim().replace(/[[\]]/g, '');
          emit(`\n\n![${title}](${href})\n\n`);
        }
        return;
      }
      case 'em': case 'i':
        emit(`*${inlineTextOf(el)}*`);
        return;
      case 'strong': case 'b':
        emit(`**${inlineTextOf(el)}**`);
        return;
      default: {
        // 行内/未知元素：继续下探
        for (const child of Array.from(el.childNodes)) visit(child, listDepth);
      }
    }
  };

  const textOf = (el: Element): string => {
    const clone = el.cloneNode(true) as Element;
    clone.querySelectorAll('img, svg').forEach((n) => n.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  };
  const inlineOf = (el: Element): string => {
    el.querySelectorAll('img').forEach((img) => {
      const md = imageMarkdownOf(img);
      img.replaceWith(document.createTextNode(md ?? ''));
    });
    return inlineTextOf(el);
  };
  const inlineTextOf = (el: Element): string => {
    let result = '';
    // 行内语义标签透传为 HTML（渲染层的 span 渲染器认 kbd/sub/sup/mark/u/del）：
    // marked 把它们切成 inline html token，markdownDocument 的 htmlStack 配对成 span
    const passthroughTag = (childEl: Element): string | null => {
      const name = childEl.tagName.toLowerCase();
      return name === 'u' || ['sub', 'sup', 'kbd', 'mark', 'del'].includes(name) ? name : null;
    };
    const walk = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += (node.textContent || '').replace(/\s+/g, ' ');
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const childEl = node as Element;
      switch (childEl.tagName.toLowerCase()) {
        case 'em': case 'i':
          result += `*${inlineTextOf(childEl).trim()}*`;
          return;
        case 'strong': case 'b':
          result += `**${inlineTextOf(childEl).trim()}**`;
          return;
        case 'br':
          result += '\n';
          return;
        case 'a': {
          const href = (childEl.getAttribute('href') || '').trim();
          const inner = inlineTextOf(childEl).trim();
          if (href && href !== '#' && inner) {
            result += `[${inner.replace(/([[\]])/g, '\\$1')}](${escapeLinkHref(href)})`;
          } else {
            result += inner;
          }
          return;
        }
        default: {
          const tag = passthroughTag(childEl);
          if (tag) {
            const inner = inlineTextOf(childEl).trim();
            if (inner) result += `<${tag}>${inner}</${tag}>`;
            return;
          }
          for (const child of Array.from(node.childNodes)) walk(child);
        }
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

  // 第一遍：收集全部图片 zip 路径 + inline SVG（outerHTML 片段，供第二遍半生成 data URL，
  // 免去对全书 XHTML 的又一次 DOMParser——多图书开书解析次数直接关系首屏耗时）
  const imageZipPaths = new Set<string>();
  const svgFragments: { outerHtml: string; baseDir: string }[] = [];
  for (const { docPath, html } of docs) {
    const docDir = zipDirOf(docPath);
    const dom = new DOMParser().parseFromString(html, 'text/html');
    for (const img of Array.from(dom.querySelectorAll('img'))) {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (!src) continue;
      imageZipPaths.add(zipReadPath(docDir, src));
    }
    for (const svg of Array.from(dom.querySelectorAll('svg'))) {
      svgFragments.push({ outerHtml: svg.outerHTML, baseDir: docDir });
    }
  }

  // 第二遍：异步预取图片 → object URL（同一 zip 路径复用）
  const imageUrlByZipPath = new Map<string, string>();
  await Promise.all(
    [...imageZipPaths].map(async (zipPath) => {
      const entry = zip.file(zipPath);
      if (!entry) return;
      const type = imageMimeTypeOf(zipPath);
      const buffer = await entry.async('arraybuffer');
      const url = URL.createObjectURL(new Blob([buffer], { type }));
      createdObjectUrls.push(url);
      imageUrlByZipPath.set(zipPath, url);
      // PNG/JPEG 头部尺寸预读注册：渲染层 <img> 加载前即占正确高度，
      // 分页测量摆脱「等图 complete」时序依赖（webp/gif 头格式各异，注册表缺省无占位）
      registerImageDimensions(url, readImageDimensions(new Uint8Array(buffer)));
    })
  );

  // 第二遍半：inline SVG → data URL（同 outerHTML 复用；转换器按 outerHTML 匹配取回）。
  // 只解析收集到的 SVG 片段本身——正常书无 SVG 时这里是零解析零开销
  const svgDataUrlByOuterHtml = new Map<string, string>();
  for (const { outerHtml, baseDir } of svgFragments) {
    if (svgDataUrlByOuterHtml.has(outerHtml)) continue;
    const frag = new DOMParser().parseFromString(outerHtml, 'image/svg+xml');
    const svgEl = frag.documentElement;
    if (!svgEl || svgEl.nodeName === 'parsererror' || svgEl.tagName.toLowerCase() !== 'svg') continue;
    const url = await inlineSvgToDataUrl(svgEl, zip, baseDir);
    if (url) svgDataUrlByOuterHtml.set(outerHtml, url);
  }

  // 第三遍：转换为 Markdown 章节
  const chapters: TextChapter[] = [];
  for (const { docPath, html } of docs) {
    const docDir = zipDirOf(docPath);
    const markdown = convertXhtmlToMarkdown(html, (src) => {
      const zipPath = zipReadPath(docDir, src);
      return imageUrlByZipPath.get(zipPath) ?? null;
    }, {
      resolveInlineSvg: (svg) => svgDataUrlByOuterHtml.get(svg.outerHTML) ?? null,
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
