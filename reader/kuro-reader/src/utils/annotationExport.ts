import type { Annotation, AnnotationStyle } from '@/types'

const CONTEXT_HEADER_SEPARATOR = '---';

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
 * 将某本书的全部批注构建为 Markdown 文本（按章节分组、按阅读位置排序），
 * 便于导入 Obsidian / Notion 等笔记工具。
 */
export function buildAnnotationMarkdown(
  bookTitle: string,
  author: string | undefined,
  annotations: Annotation[],
  exportedAt: Date = new Date()
): string {
  const lines: string[] = [`# 《${bookTitle}》批注`, ''];

  const metaParts = [
    author ? `作者：${author}` : undefined,
    `导出时间：${formatDateTime(exportedAt)}`,
    `批注数量：${annotations.length}`,
  ].filter(Boolean);
  lines.push(`> ${metaParts.join(' · ')}`, '');

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
    lines.push(`\`${STYLE_LABELS[ann.style ?? 'highlight']}\` · ${formatDateTime(new Date(ann.updatedAt))}`, '');
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** 清理文件名中的非法字符并限制长度 */
export function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, 50) || 'untitled';
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
  annotations: Annotation[]
): void {
  const markdown = buildAnnotationMarkdown(bookTitle, author, annotations);
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  downloadTextFile(`《${sanitizeFileName(bookTitle)}》批注-${stamp}.md`, markdown);
}
