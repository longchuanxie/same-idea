import React, { useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { COPY } from '@/constants/copy'
import { ROUTES, reviewPath } from '@/constants/routes'
import { vocabRepo } from '@/services/storage/vocabRepo'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type { VocabEntry } from '@/types'
import { downloadTextFile } from '@/utils/annotationExport'
import { toast } from '@/utils/toast'

/** 生词本导出分组：按书归组，组内按收录先后 */
function buildVocabMarkdown(entries: VocabEntry[], bookTitleOf: (bookId: string) => string): string {
  const lines = ['# 生词本', '']
  const groups = new Map<string, VocabEntry[]>()
  for (const entry of entries) {
    const list = groups.get(entry.bookId) ?? []
    list.push(entry)
    groups.set(entry.bookId, list)
  }
  for (const [bookId, list] of groups) {
    lines.push(`## 《${bookTitleOf(bookId)}》`, '')
    for (const entry of list) {
      const pron = entry.pronunciation ? `（${entry.pronunciation}）` : ''
      lines.push(`- **${entry.word}**${pron}：${entry.definition}`)
      if (entry.note) lines.push(`  - ${entry.note}`)
      if (entry.context) lines.push(`  - 语境：${entry.context}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

/**
 * 生词本：读外文书时划词查过的词。
 * 词按去重收录（重查刷新释义）；每张词卡都在复习席里排 SM-2 队列。
 */
export const VocabularyPage: React.FC = () => {
  const navigate = useNavigate()
  const { books, loadBooks } = useLibraryStore()
  const [entries, setEntries] = useState<VocabEntry[] | null>(null)

  useEffect(() => {
    loadBooks()
    let cancelled = false
    vocabRepo.getAll().then((all) => {
      if (!cancelled) setEntries(all)
    })
    return () => {
      cancelled = true
    }
  }, [loadBooks])

  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])

  const handleDelete = async (entry: VocabEntry) => {
    await vocabRepo.remove(entry.id)
    setEntries((prev) => prev?.filter((e) => e.id !== entry.id) ?? null)
    // 删除可撤销（判例 1-9）：词卡连带复习排期一起回来，原位复原
    toast(COPY.vocab.deletedToast, {
      durationMs: 5000,
      action: {
        label: '撤销',
        onAction: () => {
          void vocabRepo.save(entry).then(() => {
            setEntries((prev) => {
              if (!prev) return prev
              const next = [...prev]
              const origIndex = next.findIndex((e) => e.createdAt > entry.createdAt)
              if (origIndex < 0) next.push(entry)
              else next.splice(origIndex, 0, entry)
              return next
            })
          })
        },
      },
    })
  }

  const handleExport = () => {
    if (!entries || entries.length === 0) return
    const markdown = buildVocabMarkdown(entries, (bookId) => bookById.get(bookId)?.title ?? COPY.globalSearch.orphanBook)
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
    downloadTextFile(`生词本-${stamp}.md`, markdown)
    toast(COPY.vocab.exportedToast)
  }

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-8">
      {/* 头部：标题 + 统计 + 去复习 + 导出 */}
      <section className="flex flex-col gap-2 border-b border-outline-variant pb-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">
            {COPY.vocab.pageName}
          </h2>
          {entries != null && entries.length > 0 && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                className="font-label text-label-md text-primary hover:opacity-80 transition-opacity flex items-center gap-1"
                onClick={() => navigate(reviewPath())}
              >
                <span className="material-symbols-outlined text-icon-md">school</span>
                {COPY.vocab.goReview}
              </button>
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                onClick={handleExport}
                title={COPY.vocab.exportAll}
              >
                <span className="material-symbols-outlined text-icon-md">ios_share</span>
                导出
              </button>
            </div>
          )}
        </div>
        {entries != null && entries.length > 0 && (
          <p className="font-body text-body-md text-on-surface-variant">{COPY.vocab.pageIntro(entries.length)}</p>
        )}
      </section>

      {entries === null && (
        <div className="flex flex-col items-center py-16 text-on-surface-faint">
          <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_top</span>
        </div>
      )}

      {entries != null && entries.length === 0 && (
        <div className="flex flex-col items-center text-center py-16">
          <span className="material-symbols-outlined text-on-surface-faint text-5xl mb-4 block">translate</span>
          <p className="font-body text-body-md text-on-surface-variant mb-2">{COPY.vocab.emptyTitle}</p>
          <p className="font-label text-label-sm text-on-surface-faint mb-8">{COPY.vocab.emptyHint}</p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant rounded-card px-6 py-2 hover:bg-surface-variant transition-colors"
            onClick={() => navigate(ROUTES.LIBRARY)}
          >
            {COPY.vocab.goRead}
          </button>
        </div>
      )}

      {entries != null && entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="p-4 md:p-5 rounded-card-lg bg-surface-container-low border border-outline-variant"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                  <h3 className="font-display text-headline-sm text-primary">{entry.word}</h3>
                  {entry.pronunciation && (
                    <span className="font-label text-label-sm text-on-surface-variant">{entry.pronunciation}</span>
                  )}
                  {entry.lookupCount > 1 && (
                    <span className="font-label text-label-xs text-on-surface-faint">查过 {entry.lookupCount} 次</span>
                  )}
                </div>
                <button
                  aria-label={`删掉 ${entry.word}`}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-on-surface-variant hover:text-seal hover:bg-seal-soft/50 transition-colors"
                  onClick={() => void handleDelete(entry)}
                >
                  <span className="material-symbols-outlined text-icon-sm">delete</span>
                </button>
              </div>
              <p className="mt-1.5 font-body text-body-md text-on-surface leading-relaxed">{entry.definition}</p>
              {entry.note && (
                <p className="mt-1 font-label text-label-sm text-on-surface-variant">{entry.note}</p>
              )}
              {entry.context && (
                <p className="mt-2 font-body text-body-sm text-on-surface-variant italic leading-relaxed line-clamp-2 opacity-80">
                  …{entry.context}…
                </p>
              )}
              <p className="font-label text-label-sm text-on-surface-faint mt-2.5 truncate">
                ——《{bookById.get(entry.bookId)?.title ?? COPY.globalSearch.orphanBook}》
                {entry.chapterTitle ? ` · ${entry.chapterTitle}` : ''}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default VocabularyPage
