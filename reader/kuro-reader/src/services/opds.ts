import axios from 'axios';

/** OPDS 目录条目 */
export interface OpdsEntry {
  id: string;
  title: string;
  content?: string;
  /** true = 导航目录（可继续下钻）；false = 出版物（可下载导入） */
  isCatalog: boolean;
  /** 子目录地址（isCatalog 时有效，已解析为绝对 URL） */
  subsectionHref?: string;
  /** 下载地址列表（acquisition 链接，已解析为绝对 URL） */
  acquisitions: { href: string; type?: string }[];
  /** 封面缩略图地址（可选） */
  imageHref?: string;
}

export interface OpdsFeed {
  title: string;
  entries: OpdsEntry[];
  /** 下一页地址（rel="next"，可选） */
  nextHref?: string;
}

export interface OpdsCredentials {
  username?: string;
  password?: string;
}

const ACQUISITION_REL_PREFIX = 'http://opds-spec.org/acquisition';
const IMAGE_REL = 'http://opds-spec.org/image';

/** MIME 类型 → 书籍文件扩展名（下载命名与 parser 分派依赖扩展名） */
const MIME_EXTENSIONS: Record<string, string> = {
  'application/epub+zip': '.epub',
  'application/pdf': '.pdf',
  'application/zip': '.cbz',
  'application/x-cbz': '.cbz',
  'application/vnd.rar': '.rar',
  'text/plain': '.txt',
  'text/markdown': '.md',
};

function elementsByLocalName(root: Document | Element, name: string): Element[] {
  return Array.from(root.getElementsByTagNameNS('*', name));
}

function firstElementByLocalName(root: Document | Element, name: string): Element | null {
  return elementsByLocalName(root, name)[0] ?? null;
}

function textOfElement(el: Element | null): string | undefined {
  const text = el?.textContent?.trim();
  return text ? text : undefined;
}

/** 解析相对/绝对地址为绝对 URL；解析失败返回原值 */
function resolveHref(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function authHeader(credentials?: OpdsCredentials): Record<string, string> {
  if (!credentials?.username) return {};
  try {
    const token = btoa(`${credentials.username}:${credentials.password ?? ''}`);
    return { Authorization: `Basic ${token}` };
  } catch {
    return {};
  }
}

/**
 * 解析 OPDS 目录（Atom XML）。
 * - 子目录：rel="subsection"
 * - 下载：rel 以 http://opds-spec.org/acquisition 开头
 * - 封面：rel="http://opds-spec.org/image"
 * - 下一页：feed 级 rel="next"
 */
export function parseOpdsFeed(xml: string, baseUrl: string): OpdsFeed {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('OPDS 目录格式错误');
  }

  const feedTitle = textOfElement(firstElementByLocalName(doc, 'title')) ?? 'OPDS 目录';

  const entries: OpdsEntry[] = elementsByLocalName(doc, 'entry').map((entry) => {
    const title = textOfElement(firstElementByLocalName(entry, 'title')) ?? '未命名';
    const id = textOfElement(firstElementByLocalName(entry, 'id')) ?? title;
    const content =
      textOfElement(firstElementByLocalName(entry, 'content')) ??
      textOfElement(firstElementByLocalName(entry, 'summary'));

    let subsectionHref: string | undefined;
    const acquisitions: { href: string; type?: string }[] = [];
    let imageHref: string | undefined;

    for (const link of elementsByLocalName(entry, 'link')) {
      const rel = link.getAttribute('rel') ?? '';
      const href = link.getAttribute('href');
      const type = link.getAttribute('type') ?? undefined;
      if (!href) continue;
      if (rel === 'subsection') {
        subsectionHref = resolveHref(href, baseUrl);
      } else if (rel.startsWith(ACQUISITION_REL_PREFIX)) {
        acquisitions.push({ href: resolveHref(href, baseUrl), type });
      } else if (rel === IMAGE_REL) {
        imageHref = resolveHref(href, baseUrl);
      }
    }

    return {
      id,
      title,
      content,
      isCatalog: subsectionHref != null,
      subsectionHref,
      acquisitions,
      imageHref,
    };
  });

  const nextHref = elementsByLocalName(doc, 'link')
    .filter((link) => link.getAttribute('rel') === 'next')
    .map((link) => link.getAttribute('href'))
    .map((href) => (href ? resolveHref(href, baseUrl) : ''))[0];

  return { title: feedTitle, entries, nextHref: nextHref || undefined };
}

/** 拉取并解析 OPDS 目录 */
export async function fetchOpdsFeed(url: string, credentials?: OpdsCredentials): Promise<OpdsFeed> {
  const response = await axios.get<string>(url, {
    responseType: 'text',
    headers: { Accept: 'application/atom+xml', ...authHeader(credentials) },
    timeout: 30000,
  });
  return parseOpdsFeed(typeof response.data === 'string' ? response.data : String(response.data), url);
}

/** 从 OPDS 链接推断书籍文件名（标题 + 扩展名） */
export function buildOpdsFileName(title: string, href: string, mimeType?: string): string | null {
  let ext = mimeType ? MIME_EXTENSIONS[mimeType.split(';')[0].trim().toLowerCase()] : undefined;
  if (!ext) {
    const pathExt = href.split(/[?#]/)[0].match(/(\.[a-z0-9]+)$/i)?.[1]?.toLowerCase();
    ext = pathExt && MIME_EXTENSIONS[Object.keys(MIME_EXTENSIONS).find((k) => MIME_EXTENSIONS[k] === pathExt) ?? ''] ? pathExt : undefined;
    if (!ext) ext = pathExt;
  }
  if (!ext || !Object.values(MIME_EXTENSIONS).includes(ext)) return null;
  const safeTitle = title.replace(/[\\/:*?"<>|]/g, ' ').trim() || 'book';
  return `${safeTitle}${ext}`;
}

/** 下载 OPDS 出版物为 File（供 importFile 导入） */
export async function downloadOpdsBook(
  entry: OpdsEntry,
  credentials?: OpdsCredentials
): Promise<File> {
  const link = entry.acquisitions[0];
  if (!link) throw new Error('该条目没有可下载的文件');
  const fileName = buildOpdsFileName(entry.title, link.href, link.type);
  if (!fileName) throw new Error('不支持的文件格式');

  const response = await axios.get<Blob>(link.href, {
    responseType: 'blob',
    headers: authHeader(credentials),
    timeout: 120000,
  });
  const type = link.type || response.data.type || '';
  return new File([response.data], fileName, { type });
}
