import React, { useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { COPY } from '@/constants/copy'
import { ROUTES } from '@/constants/routes'
import { useLibraryStore } from '@/stores/useLibraryStore'
import { useReviewStore } from '@/stores/useReviewStore'
import type { ReviewCard } from '@/types'
import { downloadTextFile, sanitizeFileName } from '@/utils/annotationExport'
import { buildReviewQueue } from '@/utils/reviewCatalog'
import { toast } from '@/utils/toast'

/**
 * 复习席 · 间隔重复队列（术语卡 + 批注手记派生）。
 * 进门先对账（新卡入列、孤儿清列），然后翻卡：
 * 看答案 → 忘了/记得/熟了 三档评分，忘了的十分钟后回来再见一面。
 */

const SOURCE_LABELS: Record<ReviewCard['source'], string> = {
  'glossary-term': COPY.review.sourceGlossary,
  annotation: COPY.review.sourceAnnotation,
  vocab: COPY.review.sourceVocab,
}

/** Anki TSV 字段消毒：制表符/换行压成空格 */
function ankiField(text: string): string {
  return text.replace(/[\t\r\n]+/g, ' ')
}

export const ReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { books, loadBooks } = useLibraryStore()
  const { cards, sync, grade, dismiss } = useReviewStore()

  /** 当场队列：进门时一次性组好，评分只动本地顺序（中途不重算，节奏不乱） */
  const [queue, setQueue] = useState<ReviewCard[] | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [metCount, setMetCount] = useState(0)

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  useEffect(() => {
    let cancelled = false
    void sync().then(() => {
      if (cancelled) return
      setQueue(buildReviewQueue(useReviewStore.getState().cards))
    })
    return () => {
      cancelled = true
    }
  }, [sync])

  const current = queue != null ? queue[0] : undefined

  useEffect(() => {
    setRevealed(false)
  }, [current?.id])

  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])

  /** 下一张到期卡的时间（今天清空时给个盼头） */
  const nextDueText = useMemo(() => {
    const upcoming = cards
      .filter((card) => !card.dismissed)
      .sort((a, b) => a.dueAt - b.dueAt)[0]
    if (!upcoming) return null
    return new Date(upcoming.dueAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }, [cards])

  const handleGrade = (card: ReviewCard, value: 'again' | 'good' | 'easy') => {
    void grade(card.id, value)
    setMetCount((n) => n + 1)
    // 「忘了」不弃卡：排到队尾，靠 AGAIN_STEP 十分钟后自然再见面
    setQueue((q) => (value === 'again' && q ? [...q.slice(1), card] : q?.slice(1) ?? []))
  }

  const handleSkip = (card: ReviewCard) => {
    setQueue((q) => (q && q.length > 1 ? [...q.slice(1), card] : []))
  }

  const handleDismiss = (card: ReviewCard) => {
    void dismiss(card.id)
    setQueue((q) => q?.slice(1) ?? [])
    toast(COPY.review.dismissedToast)
  }

  const handleExportAnki = () => {
    const rows = cards
      .filter((card) => !card.dismissed)
      .map((card) => {
        const bookTitle = bookById.get(card.bookId)?.title ?? COPY.globalSearch.orphanBook
        const tag = `kuro::${sanitizeFileName(bookTitle).replace(/\s+/g, '_')}::${SOURCE_LABELS[card.source]}`
        return [ankiField(card.front), ankiField(card.back), tag].join('\t')
      })
    if (rows.length === 0) {
      toast(COPY.toast.noAnnotations)
      return
    }
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
    downloadTextFile(`kuro-复习卡-${stamp}.tsv`, rows.join('\n'), 'text/tab-separated-values')
    toast(COPY.review.exportedToast)
  }

  const totalPlanned = (queue?.length ?? 0) + metCount

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-8">
      {/* 头部：标题 + 进度 + Anki 导出 */}
      <section className="flex items-end justify-between gap-4 border-b border-outline-variant pb-6 mb-8">
        <div>
          <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">
            {COPY.review.sectionTitle}
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            {queue != null && totalPlanned > 0
              ? `已见 ${metCount} 张 · 还剩 ${queue.length} 张`
              : COPY.review.homeEntryHint}
          </p>
        </div>
        {cards.length > 0 && (
          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 flex-shrink-0"
            onClick={handleExportAnki}
            title={COPY.review.exportAnki}
          >
            <span className="material-symbols-outlined text-icon-md">ios_share</span>
            Anki
          </button>
        )}
      </section>

      {/* 载入中 */}
      {queue == null && (
        <div className="flex flex-col items-center py-16 text-on-surface-faint">
          <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_top</span>
        </div>
      )}

      {/* 馆里无卡：指路 */}
      {queue != null && cards.filter((c) => !c.dismissed).length === 0 && (
        <div className="flex flex-col items-center text-center py-16">
          <span className="material-symbols-outlined text-on-surface-faint text-5xl mb-4 block">school</span>
          <p className="font-body text-body-md text-on-surface-variant mb-2">{COPY.review.emptyNoCardsTitle}</p>
          <p className="font-label text-label-sm text-on-surface-faint mb-8">{COPY.review.emptyNoCardsHint}</p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant rounded-card px-6 py-2 hover:bg-surface-variant transition-colors"
            onClick={() => navigate(ROUTES.LIBRARY)}
          >
            去书库挑一本
          </button>
        </div>
      )}

      {/* 今天没有到期卡 */}
      {queue != null && queue.length === 0 && metCount === 0 && cards.filter((c) => !c.dismissed).length > 0 && (
        <div className="flex flex-col items-center text-center py-16">
          <span className="material-symbols-outlined text-on-surface-faint text-5xl mb-4 block">task_alt</span>
          <p className="font-body text-body-md text-on-surface-variant">{COPY.review.emptyTodayTitle}</p>
          {nextDueText && (
            <p className="font-label text-label-sm text-on-surface-faint mt-2">下一张 {nextDueText} 到期</p>
          )}
        </div>
      )}

      {/* 收工 */}
      {queue != null && queue.length === 0 && metCount > 0 && (
        <div className="flex flex-col items-center text-center py-16">
          <span className="material-symbols-outlined text-seal text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspace_premium
          </span>
          <p className="font-display text-headline-md text-primary mb-2">{COPY.review.doneTitle}</p>
          <p className="font-label text-label-sm text-on-surface-variant">{COPY.review.doneHint(metCount)}</p>
        </div>
      )}

      {/* 翻卡流 */}
      {current && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between font-label text-label-sm text-on-surface-faint">
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full border border-outline-variant">
                {SOURCE_LABELS[current.source]}
              </span>
              《{bookById.get(current.bookId)?.title ?? COPY.globalSearch.orphanBook}》
            </span>
            <span>
              {metCount + 1}/{totalPlanned}
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label={revealed ? '答案已显示' : '显示答案'}
            className="min-h-[240px] rounded-card-lg border border-outline-variant bg-surface-container-low paper-texture p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer select-none"
            onClick={() => setRevealed(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setRevealed(true)
              }
            }}
          >
            <p className="font-display text-title-md md:text-display-sm text-on-surface leading-relaxed">
              {current.front}
            </p>
            {revealed ? (
              <>
                <div className="w-12 border-t border-outline-variant" />
                <p className="font-body text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {current.back}
                </p>
              </>
            ) : (
              <p className="font-label text-label-md text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-icon-sm">touch_app</span>
                {COPY.review.showAnswer}
              </p>
            )}
          </div>

          {/* 评分 / 看答案 */}
          {revealed ? (
            <div className="flex items-center gap-3">
              <button
                className="flex-1 py-3 rounded-full border border-seal/60 text-seal font-label text-label-lg hover:bg-seal-soft/50 transition-colors"
                onClick={() => handleGrade(current, 'again')}
                title={COPY.review.againHint}
              >
                {COPY.review.again}
              </button>
              <button
                className="btn-primary btn-lg flex-1 py-3"
                onClick={() => handleGrade(current, 'good')}
              >
                {COPY.review.good}
              </button>
              <button
                className="flex-1 py-3 rounded-full border border-outline-variant text-on-surface-variant font-label text-label-lg hover:bg-surface-container transition-colors"
                onClick={() => handleGrade(current, 'easy')}
              >
                {COPY.review.easy}
              </button>
            </div>
          ) : (
            <button
              className="btn-primary btn-lg w-full py-3"
              onClick={() => setRevealed(true)}
            >
              {COPY.review.showAnswer}
            </button>
          )}

          <div className="flex items-center justify-between">
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => handleSkip(current)}
            >
              {COPY.review.skip}
            </button>
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-seal transition-colors"
              onClick={() => handleDismiss(current)}
            >
              {COPY.review.dismiss}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default ReviewPage
