import React, { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'

import { knowledgeSourcePath } from '@/constants/routes'
import type { Book, GlossaryData } from '@/types'

/**
 * 概念术语卡视图：学术向知识件。
 * 每个术语一张卡：定义 + 定义原文引用（点击回原文）+ 定义所在章节。
 * 按首现章节排序（生成端已排好），纵向列表即可，无需缩放画布。
 */

interface GlossaryViewProps {
  data: GlossaryData
  book: Book
}

function chapterLabelOf(book: Book, chapterIndex: number): string {
  if (book.format === 'pdf') return `第${chapterIndex + 1}页`
  const chapter = book.chapters?.[chapterIndex]
  return chapter ? `第${chapter.number}章` : `第${chapterIndex + 1}章`
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ data, book }) => {
  const navigate = useNavigate()

  const terms = useMemo(
    () =>
      data.terms.map((term) => {
        const sourcePath = term.evidence
          ? knowledgeSourcePath(book, term.evidence.chapterIndex, term.evidence.offsetRatio)
          : term.chapters && term.chapters.length > 0
            ? knowledgeSourcePath(book, term.chapters[0])
            : null
        return { ...term, sourcePath }
      }),
    [data.terms, book]
  )

  if (terms.length === 0) {
    return (
      <div className="p-8 text-center font-label text-label-md text-on-surface-variant">
        这份术语卡是空的——重新生成或切换内容类型试试
      </div>
    )
  }

  return (
    <div className="max-h-[68vh] overflow-y-auto overscroll-contain p-4 flex flex-col gap-3">
      {terms.map((term) => (
        <article
          key={term.id}
          className="rounded-card border border-outline-variant bg-surface-container-lowest p-4"
          data-term={term.term}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-headline-sm text-primary">{term.term}</h3>
            {term.chapters && term.chapters.length > 0 && (
              <span className="shrink-0 font-label text-label-sm text-on-surface-faint">
                {chapterLabelOf(book, term.chapters[0])}定义
              </span>
            )}
          </div>
          {term.definition && (
            <p className="mt-1.5 font-body text-body-md text-on-surface leading-relaxed">{term.definition}</p>
          )}
          {term.evidence && (
            <button
              className="mt-2 block max-w-full text-left px-2.5 py-1 rounded-card border-l-2 border-seal bg-surface-container-low font-body text-label-md text-on-surface-variant italic truncate hover:text-on-surface transition-colors"
              onClick={() => term.evidence && navigate(knowledgeSourcePath(book, term.evidence.chapterIndex, term.evidence.offsetRatio))}
              title={term.evidence.quote}
            >
              「{term.evidence.quote}」
            </button>
          )}
          {term.sourcePath && (
            <button
              className="mt-2 flex items-center gap-1 font-label text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => navigate(term.sourcePath ?? '')}
            >
              <span className="material-symbols-outlined text-icon-sm">book_open</span>
              回到原文
            </button>
          )}
        </article>
      ))}
    </div>
  )
}

export default GlossaryView
