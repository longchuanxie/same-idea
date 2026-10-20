/**
 * MOBI/AZW 阅读期保真管线：foliate-js（Foliate 阅读器核心，MIT）解析 BOOKMOBI
 * 容器（mobi6 + KF8/AZW3），逐节取已解析图片的 HTML（foliate 把 recindex 资源
 * 替换成运行期 object URL），再复用 EPUB 管线的 XHTML→Markdown 转换器产出章节。
 *
 * 与 epubContent 同构：章节带 markdownDocument 走 Markdown 分页/渲染；
 * 章节内容含运行期 object URL，跨会话失效——同样不可进 textChapterCache
 * （fileType 源指纹门禁天然拦截非 text/* 源）。
 */

import { MOBI, isMOBI } from 'foliate-js/mobi.js'

import { convertXhtmlToMarkdown } from '@/services/epubContent'
import type { TextChapter } from '@/services/textContent'
import { registerBlobImageDimensions } from '@/utils/imageSize'
import { parseMarkdownDocument } from '@/utils/markdownDocument'

/** foliate 的字体解压回调：zlib 流用浏览器原生 DecompressionStream，
 *  失败回退原字节（字体非必需资源，坏了不挡正文） */
const unzlib = async (bytes: Uint8Array): Promise<Uint8Array> => {
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return bytes;
  }
};

/** MOBI 魔数探测（BOOKMOBI @ offset 60）：不依赖 MIME——
 *  安卓选择器对 .mobi/.azw3 常给 octet-stream，EPUB 靠 MIME 的老路走不通 */
export async function isMobiBlob(blob: Blob): Promise<boolean> {
  try {
    return await isMOBI(blob);
  } catch {
    return false;
  }
}

/** 打开 MOBI（mobi6 或 KF8），失败抛错由调用方兜底 */
export async function openMobiBook(blob: Blob): Promise<MobiBook> {
  return new MOBI({ unzlib }).open(blob) as Promise<MobiBook>;
}

/** foliate MOBI/KF8 书实例的最小结构面（避免整包类型导入） */
export interface MobiSection {
  id: number;
  /** 解析好的 Document（KF8 的 kindle:embed/mobi6 的 recindex 图片需另行替换，见 replaceMobiImages） */
  createDocument: () => Promise<Document>;
  size: number;
}
interface Mobi6Like {
  /** mobi6：recindex（1 基资源号）→ object URL */
  loadRecindex?: (recindex: string) => Promise<string>;
}
interface Kf8Like {
  /** KF8：'kindle:embed:0001' 形式的资源引用 → object URL */
  loadResource?: (str: string) => Promise<string>;
}
export interface MobiBook extends Mobi6Like, Kf8Like {
  sections: MobiSection[];
  metadata: {
    title?: string;
    author?: string[];
    language?: string;
  };
  getCover: () => Promise<Blob | undefined>;
}

/** foliate 产物里可放行的图片链接形态 */
const SAFE_IMAGE_PATTERN = /^(blob:|data:image\/)/i;
const KINDLE_EMBED_PATTERN = /^kindle:embed:/i;

/**
 * 把节文档里的图片引用替换成 object URL：
 * - mobi6：<img recindex="0001"> → loadRecindex
 * - KF8：<img src="kindle:embed:0001"> → loadResource（含 inline 图）
 * 解析失败的图移除（不留破图标）；其余 blob:/data: 直通
 */
async function replaceMobiImages(doc: Document, book: MobiBook): Promise<void> {
  for (const img of Array.from(doc.querySelectorAll('img'))) {
    const src = img.getAttribute('src') ?? '';
    let url: string | null = null;
    try {
      const recindex = img.getAttribute('recindex');
      if (recindex && book.loadRecindex) {
        url = await book.loadRecindex(recindex);
      } else if (KINDLE_EMBED_PATTERN.test(src) && book.loadResource) {
        url = await book.loadResource(src);
      } else if (SAFE_IMAGE_PATTERN.test(src)) {
        url = src;
      }
    } catch {
      url = null;
    }
    if (url) {
      img.setAttribute('src', url);
      // 尺寸预读注册（PNG/JPEG 头）：渲染层加载前占正确高度，分页不等图
      registerBlobImageDimensions(url, await fetch(url).then((r) => r.blob()).catch(() => null));
    } else {
      img.remove();
    }
  }
}

/** 读取一节并解析图片，返回替换完成的 Document */
async function loadSectionDocument(section: MobiSection, book: MobiBook): Promise<Document | null> {
  try {
    const doc = await section.createDocument();
    await replaceMobiImages(doc, book);
    return doc;
  } catch {
    // 单节损坏不拖垮整书：跳过该节继续
    return null;
  }
}

/**
 * 把 MOBI 全书转成阅读器章节（与 loadEpubChapters 产物同构）。
 * 章节标题按「第 N 章」编号兜底——foliate 的 toc 依赖 INDX/guide，老 mobi 常缺，
 * 与 EPUB 无 NCX 标题时的行为一致。
 */
export async function loadMobiChapters(blob: Blob): Promise<TextChapter[]> {
  const book = await openMobiBook(blob);
  const chapters: TextChapter[] = [];
  for (const section of book.sections) {
    const doc = await loadSectionDocument(section, book);
    if (!doc) continue;
    const html = new XMLSerializer().serializeToString(doc);
    const markdown = convertXhtmlToMarkdown(html, (src) =>
      SAFE_IMAGE_PATTERN.test(src) ? src : null);
    if (!markdown.trim()) continue;
    const chapterIndex = chapters.length + 1;
    chapters.push({
      id: `ch${chapterIndex}`,
      title: `第${chapterIndex}章`,
      content: markdown,
      markdownDocument: parseMarkdownDocument(markdown),
    });
  }
  if (chapters.length === 0) throw new Error('MOBI 内容为空');
  return chapters;
}
