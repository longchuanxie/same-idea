/**
 * HTML 目录列表页解析（rclone serve http/webdav、nginx autoindex、caddy file_server 等通用）
 *
 * 为什么不用 PROPFIND：App 原生 HTTP 栈（HttpURLConnection）的 method 白名单不含
 * PROPFIND，而 WebView 内 XHR 又被无 CORS 头的服务器拦死；GET 目录返回的 HTML
 * 列表页是这些文件服务器共同保底的浏览通道。
 */

export interface HtmlListingEntry {
  /** 解码态文件名（无尾斜杠），取链接文本节点——服务器对 href 做百分号编码时文本仍是原文 */
  name: string;
  isDirectory: boolean;
  /** 字节数；目录与未知为 0 */
  size: number;
  /** 修改时间原样字符串（展示用，不解析） */
  modifiedTime: string;
}

/** href 属于列表条目：相对路径、非锚点/查询/脚本/上级 */
function isListingHref(href: string): boolean {
  if (!href || href.startsWith('?') || href.startsWith('#')) return false;
  if (/^(javascript:|mailto:|tel:)/i.test(href)) return false;
  if (href === '..' || href === '../' || href === '.' || href === './') return false;
  // 绝对 URL（他站）与站内绝对路径（无目录上下文可拼）都不收
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//') || href.startsWith('/')) return false;
  return true;
}

function entryName(linkText: string): string | null {
  const trimmed = linkText.replace(/\s+/g, ' ').trim().replace(/\/+$/, '');
  return trimmed || null;
}

/** 解析 rclone 列表页（div.listing 结构）；非 rclone 页返回 null。空目录页返回 []（合法状态） */
function parseRcloneListing(doc: Document): HtmlListingEntry[] | null {
  if (!doc.querySelector('.listing')) return null;
  const entries: HtmlListingEntry[] = [];
  for (const link of Array.from(doc.querySelectorAll<HTMLAnchorElement>('span.name a'))) {
    const href = link.getAttribute('href') || '';
    const name = entryName(link.textContent || '');
    if (!name || !isListingHref(href)) continue;
    const isDirectory = href.endsWith('/');
    const row = link.closest('tr');
    const sizeOrder = row?.querySelector('[data-order]')?.getAttribute('data-order');
    const size = isDirectory ? 0 : parseInt(sizeOrder || '', 10) || 0;
    const modifiedTime = row?.querySelector('time')?.getAttribute('datetime') || '';
    entries.push({ name, isDirectory, size, modifiedTime });
  }
  return entries;
}

/** 通用 autoindex 启发式（nginx/caddy/python http.server）：朴素 <a href> 相对链接列表 */
function parseGenericListing(doc: Document): HtmlListingEntry[] | null {
  const entries: HtmlListingEntry[] = [];
  for (const link of Array.from(doc.querySelectorAll<HTMLAnchorElement>('body a'))) {
    const href = link.getAttribute('href') || '';
    const name = entryName(link.textContent || '');
    if (!name || !isListingHref(href)) continue;
    entries.push({ name, isDirectory: href.endsWith('/'), size: 0, modifiedTime: '' });
  }
  // 一条有效条目都没有视为「不是列表页」（普通网页误判防线）
  return entries.length > 0 ? entries : null;
}

/**
 * 解析 HTML 目录列表页。
 * @returns 条目数组（空目录为 []）；不是可识别的列表页时返回 null
 */
export function parseHtmlFileListing(html: string): HtmlListingEntry[] | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return parseRcloneListing(doc) ?? parseGenericListing(doc);
}

/** 响应是否值得按 HTML 列表页解析（content-type 判定 + 体内特征嗅探兜底） */
export function looksLikeHtmlListing(contentType: string | undefined, body: string): boolean {
  if (contentType && !/text\/html/i.test(contentType)) return false;
  return /<a\s[^>]*href=/i.test(body);
}
