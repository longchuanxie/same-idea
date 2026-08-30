import type { Annotation, AnnotationStyle } from '@/types'

const CONTEXT_HEADER_SEPARATOR = '---';

/** 导出文件名清理后的最大长度 */
const FILE_NAME_MAX_CHARS = 50;

const STYLE_LABELS: Record<AnnotationStyle, string> = {
  highlight: '高亮',
  underline: '下划线',
  wavy: '波浪线',
};

function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 将引用文本转为 Markdown blockquote（多行逐行加前缀） */
function toBlockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line.trim()}`)
    .join('\n');
}

/**
 * 单书正文段（无书级标题）：按章节分组、按阅读位置排序输出批注。
 * 供单书导出与整墙导出复用。
 */
function renderAnnotationSections(
  annotations: Annotation[],
  tagNames?: ReadonlyMap<string, string>
): string[] {
  const lines: string[] = [];

  const sorted = [...annotations].sort((a, b) => {
    if (a.chapterIndex !== b.chapterIndex) return a.chapterIndex - b.chapterIndex;
    if (a.startOffset !== b.startOffset) return a.startOffset - b.startOffset;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  let lastChapterIndex = -1;
  for (const ann of sorted) {
    if (ann.chapterIndex !== lastChapterIndex) {
      if (lastChapterIndex !== -1) lines.push('', CONTEXT_HEADER_SEPARATOR, '');
      lines.push(`## ${ann.chapterTitle}`, '');
      lastChapterIndex = ann.chapterIndex;
    }

    lines.push(toBlockquote(ann.selectedText), '');
    if (ann.note.trim()) {
      lines.push(`**笔记**：${ann.note.trim()}`, '');
    }
    // Obsidian/Notion 兼容标签行
    const tags = (ann.tagIds ?? [])
      .map((id) => tagNames?.get(id))
      .filter((name): name is string => Boolean(name));
    if (tags.length > 0) {
      lines.push(tags.map((name) => `#${name}`).join(' '), '');
    }
    lines.push(`\`${STYLE_LABELS[ann.style ?? 'highlight']}\` · ${formatDateTime(new Date(ann.updatedAt))}`, '');
  }

  return lines;
}

/**
 * 将某本书的全部批注构建为 Markdown 文本（按章节分组、按阅读位置排序），
 * 便于导入 Obsidian / Notion 等笔记工具。
 * tagNames：手记标签 id → 名称映射（打标签的手记会输出 #标签 行）。
 */
export function buildAnnotationMarkdown(
  bookTitle: string,
  author: string | undefined,
  annotations: Annotation[],
  exportedAt: Date = new Date(),
  tagNames?: ReadonlyMap<string, string>
): string {
  const lines: string[] = [`# 《${bookTitle}》批注`, ''];

  const metaParts = [
    author ? `作者：${author}` : undefined,
    `导出时间：${formatDateTime(exportedAt)}`,
    `批注数量：${annotations.length}`,
  ].filter(Boolean);
  lines.push(`> ${metaParts.join(' · ')}`, '');

  lines.push(...renderAnnotationSections(annotations, tagNames));

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** 整墙导出条目：一本书的手记集合（书可能已移出——title 由调用方兜底） */
export interface MultiBookEntry {
  bookTitle: string;
  annotations: Annotation[];
}

/**
 * 跨书整墙导出：`# 摘抄墙` 总标题 + 每书 `## 《书名》` + 现有章节分组结构。
 * 各书按手记更新时间倒序（最近动过的墙段在前）。
 */
export function buildMultiBookMarkdown(
  entries: MultiBookEntry[],
  exportedAt: Date = new Date(),
  tagNames?: ReadonlyMap<string, string>
): string {
  const meaningful = entries.filter((e) => e.annotations.length > 0);
  const totalCount = meaningful.reduce((sum, e) => sum + e.annotations.length, 0);
  const lines: string[] = [
    '# 摘抄墙 · 全部手记',
    '',
    `> 导出时间：${formatDateTime(exportedAt)} · 书目 ${meaningful.length} · 手记 ${totalCount}`,
    '',
  ];

  const sortedEntries = [...meaningful].sort(
    (a, b) => newestUpdatedAt(b.annotations) - newestUpdatedAt(a.annotations)
  );

  for (const entry of sortedEntries) {
    lines.push(`## 《${entry.bookTitle}》`, '');
    lines.push(...renderAnnotationSections(entry.annotations, tagNames));
    // 书与书之间留分隔（章节分隔已含 ---，书级再加一个空行即可由后续折叠规整）
    lines.push('');
  }

  return lines.join('\n').replace(/\n{4,}/g, '\n\n\n').trim() + '\n';
}

/** 该组手记中最新的更新时间（整墙排序键） */
function newestUpdatedAt(annotations: Annotation[]): number {
  return Math.max(0, ...annotations.map((a) => +new Date(a.updatedAt)));
}

/** 一站式整墙导出：构建 Markdown 并触发下载 */
export function exportMultiBookMarkdown(entries: MultiBookEntry[], tagNames?: ReadonlyMap<string, string>): void {
  const markdown = buildMultiBookMarkdown(entries, new Date(), tagNames);
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  downloadTextFile(`摘抄墙-${stamp}.md`, markdown);
}

/** 清理文件名中的非法字符并限制长度 */
export function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, FILE_NAME_MAX_CHARS) || 'untitled';
}

/** 触发浏览器下载文本文件 */
export function downloadTextFile(filename: string, content: string, mime = 'text/markdown'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 一站式导出：构建 Markdown 并触发下载 */
export function exportAnnotationsToMarkdown(
  bookTitle: string,
  author: string | undefined,
  annotations: Annotation[],
  tagNames?: ReadonlyMap<string, string>
): void {
  const markdown = buildAnnotationMarkdown(bookTitle, author, annotations, new Date(), tagNames);
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  downloadTextFile(`《${sanitizeFileName(bookTitle)}》批注-${stamp}.md`, markdown);
}
