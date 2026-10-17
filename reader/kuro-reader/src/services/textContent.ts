import {
  computeSanitizeRev,
  resolveSanitizeOptions,
  sanitizeBookChapters,
  type SanitizeOptions,
  type SanitizeSummary,
} from '@/services/contentSanitizer';
import { loadEpubChapters } from '@/services/epubContent';
import { isMobiBlob, loadMobiChapters } from '@/services/mobiContent';
import type { ParsedTextChapter } from '@/services/parsers/types';
import {
  splitMarkdownIntoChapters,
  splitTextIntoChapters,
} from '@/services/parsers/utils';
import { bookFileRepo } from '@/services/storage/bookFileRepo';
import { bookRepo } from '@/services/storage/bookRepo';
import { textChapterCacheRepo } from '@/services/storage/textChapterCacheRepo';
import { useAppStore } from '@/stores/useAppStore';
import type { Chapter } from '@/types';
import { parseMarkdownDocument, type MarkdownDocument } from '@/utils/markdownDocument';

export interface TextChapter {
  id: string;
  title: string;
  content: string;
  markdownDocument?: MarkdownDocument;
}

/** 净化不接 Markdown 的固定 rev（章节另有结构文档渲染管线，text/content 双轨不走规则） */
const MARKDOWN_SANITIZE_REV = 'md';

const NORMALIZE_CHAPTER_TITLE_PATTERN = /[\s\u3000:：,，.。!！?？;；、\-—_《》<>[\]【】()（）"'“”‘’]/g;

/** 解析结果缓存的并发写去重：同书解析在途时跳过重复落库 */
const pendingCacheWrites = new Set<string>();

/** 把拆章产物映射为阅读器消费的 TextChapter（Markdown 章附带上解析文档） */
export const buildTextChapters = (
  parsedChapters: ParsedTextChapter[],
  isMarkdown: boolean
): TextChapter[] =>
  parsedChapters.map((ch, idx) => {
    const markdownDocument = isMarkdown ? parseMarkdownDocument(ch.content) : undefined;
    return {
      id: `ch${idx + 1}`,
      title: ch.title || `第${idx + 1}章`,
      content: markdownDocument?.text ?? ch.content,
      markdownDocument,
    };
  });

/**
 * 异步预热解析结果缓存（不阻塞调用方；失败静默——下次开书重走解析路径再试）。
 * 供导入完成点与 loadTextContent 未命中后的回填共用。
 * TXT 预热应传净化信息（rev+summary）：净后章节与摘要一并物化，首次开书即命中。
 * fileType：源文件 MIME 指纹——非 text/* 一律不缓存（EPUB 章节带运行期 object URL
 * 本就不可缓存；判例：EPUB 曾借导入预热落库无图纯文本，开书命中后图片永久消失）。
 */
export const warmTextChapterCache = (
  bookId: string,
  chapters: TextChapter[],
  isMarkdown: boolean,
  sanitize?: { rev: string; summary?: SanitizeSummary },
  fileType?: string
): void => {
  if (chapters.length === 0 || pendingCacheWrites.has(bookId)) return;
  if (!fileType || !fileType.startsWith('text/')) return;
  pendingCacheWrites.add(bookId);
  void textChapterCacheRepo
    .save({
      bookId,
      isMarkdown,
      totalChars: chapters.reduce((sum, ch) => sum + ch.content.length, 0),
      chapters,
      cachedAt: Date.now(),
      fileType,
      ...(sanitize ? { sanitizeRev: sanitize.rev, sanitizeSummary: sanitize.summary } : {}),
    })
    .catch(() => {
      // 存储配额不足等写入失败不致命：缓存仅是加速层
    })
    .finally(() => {
      pendingCacheWrites.delete(bookId);
    });
};

/**
 * 汇总该书当前生效的净化选项：全局设置 × 按书门槛。
 * 书记录缺失（极早期直链竞态）时按不净化处理——净化配置无落点，宁可跳过。
 */
async function resolveBookSanitizeOptions(
  bookId: string
): Promise<{ options: SanitizeOptions; rev: string; adsState: 'pending' | 'on' | 'off' | undefined }> {
  // 测试替身的 getState 可能缺 settings：按未配置处理（resolveSanitizeOptions 对 undefined 走全关）
  const settings = useAppStore.getState().settings?.contentSanitize;
  const book = await bookRepo.get(bookId).catch(() => undefined);
  const adsState = book?.format === 'text' ? book.contentSanitize?.ads : undefined;
  const options = book ? resolveSanitizeOptions(settings, adsState) : { typography: false, ads: 'off' as const, customKeywords: [] };
  return { options, rev: computeSanitizeRev(options), adsState };
}

/** 净化在读层的对外状态：确认门（pending 命中）与样例 */
export interface TextSanitizeStatus {
  /** detect 模式下的待确认广告命中数（>0 时阅读器弹「一键净化」确认门） */
  pendingAdHitCount: number
  /** 命中样例（封顶 20 条，确认弹窗展示） */
  adSamples: string[]
}

const EMPTY_SANITIZE_STATUS: TextSanitizeStatus = { pendingAdHitCount: 0, adSamples: [] }

export interface TextContentDetail {
  chapters: TextChapter[]
  isEpub: boolean
  isMarkdown: boolean
  sanitize: TextSanitizeStatus
}

/**
 * 从 bookFileRepo 加载文本内容（净化增强版）。
 * - text/plain blob → 直接读取（使用常见文本章节规则拆分 + A/B 类净化）
 * - text/markdown blob → 直接读取（Markdown 标题拆分；净化不接 MD）
 * - application/epub+zip blob → 提取 XHTML/HTML 章节（不缓存、不净化）
 *
 * TXT/Markdown 走解析结果缓存（textChapterCache）：命中即免整本解码+拆章+逐章
 * Markdown 解析——长网文开书从秒级降到一次 IDB 结构化克隆。未命中（首次/旧数据/
 * 净化 rev 变化）走原解析路径并异步回填缓存。EPUB 不缓存（图片 object URL 跨会话失效）。
 */
export async function loadTextContentDetailed(bookId: string): Promise<TextContentDetail> {
  const { options, rev } = await resolveBookSanitizeOptions(bookId);

  // 缓存探测先于 blob 读取：命中时连原始文件都不必读。书籍文件导入后不可变
  // （重复导入按标题拦截/替换流、bookId 唯一），缓存漂移的唯一来源是净化配置——
  // 以 sanitizeRev 判等：旧记录无 rev 或 rev 不匹配都重算。
  // fileType 指纹缺失的记录（历史全部 + 曾被 EPUB 导入预热投毒的无图纯文本）
  // 一律不信任：忽略后从原件重算，EPUB 书就此回到保真管线（图片恢复）。
  const cached = await textChapterCacheRepo.get(bookId).catch(() => undefined);
  const cacheTrusted = !!cached
    && cached.chapters.length > 0
    && !!cached.fileType?.startsWith('text/');
  if (cacheTrusted && cached) {
    const revMatched = cached.isMarkdown ? cached.sanitizeRev === MARKDOWN_SANITIZE_REV : cached.sanitizeRev === rev;
    if (revMatched) {
      const summary = cached.sanitizeSummary;
      return {
        chapters: cached.chapters,
        isEpub: false,
        isMarkdown: cached.isMarkdown,
        sanitize:
          !cached.isMarkdown && options.ads === 'detect'
            ? { pendingAdHitCount: summary?.adHitCount ?? 0, adSamples: summary?.adSamples ?? [] }
            : EMPTY_SANITIZE_STATUS,
      };
    }
  }

  const blob = await bookFileRepo.get(bookId);
  if (!blob) {
    // blob 缺失但缓存还在（理论不该发生）：退回缓存内容，不把用户晾在空书里
    if (cacheTrusted && cached) {
      return { chapters: cached.chapters, isEpub: false, isMarkdown: cached.isMarkdown, sanitize: EMPTY_SANITIZE_STATUS };
    }
    return { chapters: [], isEpub: false, isMarkdown: false, sanitize: EMPTY_SANITIZE_STATUS };
  }

  // blob.type 防御：测试环境（jsdom Blob × fake-indexeddb 克隆）会丢 type，真实浏览器不会
  const blobType = blob.type ?? '';
  const isEpub = blobType === 'application/epub+zip';
  // MOBI 靠魔数探测（BOOKMOBI @60）：安卓选择器对 .mobi/.azw3 常给 octet-stream，
  // 沿用 EPUB 的 MIME 判别不可靠；EPUB 已按 MIME 命中的不必再读字节
  const isMobi = !isEpub && (await isMobiBlob(blob));
  const isMarkdown = blobType.startsWith('text/markdown') || blobType.startsWith('text/x-markdown');

  if (!isEpub && !isMobi) {
    // 纯文本：使用共享的章节拆分函数
    const text = await blob.text();
    const parsedChapters = isMarkdown
      ? splitMarkdownIntoChapters(text)
      : splitTextIntoChapters(text);
    const built = buildTextChapters(parsedChapters, isMarkdown);

    if (isMarkdown) {
      // MD 不净化：rev 固定，缓存稳定
      warmTextChapterCache(bookId, built, true, { rev: MARKDOWN_SANITIZE_REV }, blobType);
      return { chapters: built, isEpub: false, isMarkdown: true, sanitize: EMPTY_SANITIZE_STATUS };
    }

    // TXT：净化在唯一出口应用——渲染/TTS/搜索/知识语料/分页全部吃这里的产物
    const { chapters, summary } = sanitizeBookChapters(built, options);
    warmTextChapterCache(bookId, chapters, false, { rev, summary }, blobType);
    return {
      chapters,
      isEpub: false,
      isMarkdown: false,
      sanitize:
        options.ads === 'detect'
          ? { pendingAdHitCount: summary.adHitCount, adSamples: summary.adSamples }
          : EMPTY_SANITIZE_STATUS,
    };
  }

  // EPUB/MOBI：走保真管线（XHTML → Markdown + 图片 object URL），复用 Markdown 分页/渲染
  try {
    const chapters = isMobi ? await loadMobiChapters(blob) : await loadEpubChapters(blob);
    return { chapters, isEpub: true, isMarkdown: false, sanitize: EMPTY_SANITIZE_STATUS };
  } catch {
    const label = isMobi ? 'MOBI 解析失败' : 'EPUB 解析失败';
    return { chapters: [{ id: 'ch1', title: '正文', content: label }], isEpub: true, isMarkdown: false, sanitize: EMPTY_SANITIZE_STATUS };
  }
}

/**
 * 兼容包装：只要章节内容的老签名（内容类型启发式等消费方）。
 * 新消费方（阅读器）用 loadTextContentDetailed 拿净化状态。
 */
export async function loadTextContent(
  bookId: string
): Promise<{ chapters: TextChapter[]; isEpub: boolean; isMarkdown: boolean }> {
  const detail = await loadTextContentDetailed(bookId);
  return { chapters: detail.chapters, isEpub: detail.isEpub, isMarkdown: detail.isMarkdown };
}

/**
 * 将 URL 中的 chapterId 解析为 textChapters 中的下标。
 * 依次尝试：精确 id 匹配 → 归一化标题匹配 → 旧版 `${bookId}-chN` 编号回退 → bookChapters 下标对齐。
 * 找不到时返回 -1。
 */
export const resolveTextChapterIndex = (
  textChapters: TextChapter[],
  bookChapters: Chapter[] | undefined,
  bookId: string,
  chapterId: string
): number => {
  const textChapterIndex = textChapters.findIndex((chapter) => chapter.id === chapterId);
  if (textChapterIndex >= 0) {
    return textChapterIndex;
  }

  const targetBookChapter = bookChapters?.find((chapter) => chapter.id === chapterId);
  const normalizedTargetTitle = targetBookChapter
    ? targetBookChapter.title.trim().toLowerCase().replace(NORMALIZE_CHAPTER_TITLE_PATTERN, '')
    : '';
  if (normalizedTargetTitle) {
    const titleMatchedIndex = textChapters.findIndex((chapter) =>
      chapter.title.trim().toLowerCase().replace(NORMALIZE_CHAPTER_TITLE_PATTERN, '') === normalizedTargetTitle
    );
    if (titleMatchedIndex >= 0) {
      return titleMatchedIndex;
    }
  }

  const legacyChapterPrefix = `${bookId}-ch`;
  if (chapterId.startsWith(legacyChapterPrefix)) {
    const chapterNumber = Number(chapterId.slice(legacyChapterPrefix.length));
    const textChapterIdIndex = textChapters.findIndex((chapter) => chapter.id === `ch${chapterNumber}`);
    if (textChapterIdIndex >= 0) {
      return textChapterIdIndex;
    }

    const index = chapterNumber - 1;
    if (Number.isInteger(index) && index >= 0 && index < textChapters.length) {
      return index;
    }
  }

  const bookChapterIndex = bookChapters?.findIndex((chapter) => chapter.id === chapterId) ?? -1;
  if (bookChapterIndex >= 0 && bookChapterIndex < textChapters.length) {
    return bookChapterIndex;
  }

  return -1;
};
