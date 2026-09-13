/** 一对中/英方括号包裹的标签组，如【漫画】[MC] */
const BRACKET_GROUP_PATTERN = /[【[][^【】[\]]*[】\]]/g
/** 首部连续的标签组（可带分隔符）：发布组/来源标记，如 [MC]葬送的芙莉莲、【漫画】XX */
const LEADING_LABELS_PATTERN = /^(?:[【[][^【】[\]]*[】\]][\s_\-–—·.、]*)+/
/** 尾部残留的分隔符 */
const TRAILING_SEPARATORS_PATTERN = /[\s_\-–—·.、,，~～]+$/
/** 无 CJK 时按西文命名习惯把点分隔符还原为空格（Harry.Potter.Vol.1） */
const WORD_DOT_WORD_PATTERN = /([A-Za-z0-9])\.([A-Za-z0-9])/g
const CJK_PATTERN = /[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/
/** 首个标签组内容（全名都是标签时的兜底） */
const FIRST_BRACKET_PATTERN = /[【[]([^【】[\]]+)[】\]]/

export function extractTitleFromFileName(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, '')

  let title: string
  if (LEADING_LABELS_PATTERN.test(stem)) {
    // 首部是发布组/来源标签：标题取标签后的正文，并剔除正文中其余标签（[Vol.1][Digital] 等）
    title = stem.replace(LEADING_LABELS_PATTERN, '').replace(BRACKET_GROUP_PATTERN, '')
  } else {
    // 无标签前缀：仅剔除括号附注（【完结】(高清) 等），保留正文与卷号话数
    title = stem.replace(BRACKET_GROUP_PATTERN, '')
  }

  title = title
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(TRAILING_SEPARATORS_PATTERN, '')
    .trim()

  if (!CJK_PATTERN.test(title)) {
    title = title.replace(WORD_DOT_WORD_PATTERN, '$1 $2').replace(/\s+/g, ' ').trim()
  }

  if (!title) {
    // 整个文件名都是括号标签：退回第一组标签内容
    title = (stem.match(FIRST_BRACKET_PATTERN)?.[1] ?? stem).trim()
  }

  return title || fileName
}
