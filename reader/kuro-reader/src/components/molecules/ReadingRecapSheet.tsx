import React, { useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { COPY } from '@/constants/copy'
import { knowledgePath, readerPathForBook } from '@/constants/routes'
import { isProviderConfigured } from '@/services/ai/aiClient'
import { generateRecap, recapUnitLabel, type RecapResult } from '@/services/ai/readingRecap'
import { getPdfPageTexts } from '@/services/pdfText'
import { knowledgeRepo } from '@/services/storage/knowledgeRepo'
import { loadTextContent } from '@/services/textContent'
import { useAppStore } from '@/stores/useAppStore'
import type { Annotation, Book, KnowledgeArtifact, ReadingProgress } from '@/types'
import {
  currentChapterIndexOf,
  daysSinceLastRead,
  pickTracedAnnotations,
  priorChapterWindow,
} from '@/utils/readingRecap'
import { toast } from '@/utils/toast'

interface ReadingRecapSheetProps {
  book: Book
  progress?: ReadingProgress
  /** 该书的手记（痕迹） */
  annotations: Annotation[]
  onContinue: () => void
  onClose: () => void
}

type RecapState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'notice'; message: string }
  | { status: 'error'; message: string }
  | { status: 'done'; result: RecapResult; range: string }

/**
 * 欢迎回来卡：久别续读的定向仪。
 * 进度与离开时长（本地即时）→ 你留下的痕迹（手记回跳）→ 人物图谱入口 →
 * AI 前情提要（当前章之前的内容，文本书 3 章 / PDF 10 页）→ 直接继续读。
 */
export const ReadingRecapSheet: React.FC<ReadingRecapSheetProps> = ({
  book,
  progress,
  annotations,
  onContinue,
  onClose,
}) => {
  const navigate = useNavigate()
  const [graphArtifact, setGraphArtifact] = useState<KnowledgeArtifact | null>(null)
  const [recap, setRecap] = useState<RecapState>({ status: 'idle' })

  const days = daysSinceLastRead(book)
  const pct = progress ? Math.round(progress.percentage) : 0
  const chapterLabel = useMemo(() => {
    if (!progress?.chapterId) return null
    const index = book.chapters.findIndex((ch) => ch.id === progress.chapterId)
    if (index < 0) return null
    return book.chapters[index].title || `第${index + 1}章`
  }, [book.chapters, progress?.chapterId])
  const traces = useMemo(
    () => pickTracedAnnotations(annotations, currentChapterIndexOf(book, progress, book.chapters.length)),
    [annotations, book, progress]
  )
  const canAiRecap = book.format === 'text' || book.format === 'pdf'

  useEffect(() => {
    let cancelled = false
    knowledgeRepo.getByBookId(book.id).then((artifacts) => {
      if (cancelled) return
      setGraphArtifact(
        artifacts.find((a) => a.type === 'character-graph' || a.type === 'concept-graph') ?? null
      )
    })
    return () => {
      cancelled = true
    }
  }, [book.id])

  const handleGenerate = async () => {
    const { settings } = useAppStore.getState()
    const config = {
      baseUrl: settings.knowledgeAiUrl,
      apiKey: settings.knowledgeAiKey,
      model: settings.knowledgeAiModel,
    }
    if (!isProviderConfigured(config)) {
      toast(COPY.recap.aiNotConfigured)
      return
    }
    if (!canAiRecap) {
      setRecap({ status: 'notice', message: COPY.recap.unsupported })
      return
    }
    setRecap({ status: 'loading' })
    try {
      const unitLabel = recapUnitLabel(book)
      let unitTexts: { label: string; text: string }[] = []
      let currentIndex = 0
      if (book.format === 'pdf') {
        const pages = await getPdfPageTexts(book.id)
        currentIndex = currentChapterIndexOf(book, progress, pages.length)
        const window = priorChapterWindow('pdf', pages.length, currentIndex)
        if (!window) {
          setRecap({ status: 'notice', message: COPY.recap.noPriorContent })
          return
        }
        unitTexts = pages
          .slice(window.from, window.to + 1)
          .map((text, i) => ({ label: `第${window.from + i + 1}页`, text }))
        const range = `第${window.from + 1}–${window.to + 1}页`
        const result = await generateRecap(config, {
          bookTitle: book.title,
          unitLabel,
          nextUnitNumber: currentIndex + 1,
          unitTexts,
        })
        setRecap({ status: 'done', result, range })
      } else {
        const { chapters } = await loadTextContent(book.id)
        const idx = progress?.chapterId
          ? chapters.findIndex((c) => c.id === progress.chapterId)
          : -1
        currentIndex =
          idx >= 0
            ? idx
            : currentChapterIndexOf(book, progress, chapters.length)
        const window = priorChapterWindow('text', chapters.length, currentIndex)
        if (!window) {
          setRecap({ status: 'notice', message: COPY.recap.noPriorContent })
          return
        }
        unitTexts = chapters
          .slice(window.from, window.to + 1)
          .map((c, i) => ({ label: c.title || `第${window.from + i + 1}章`, text: c.content }))
        const range = `${unitTexts[0]?.label ?? ''}–${unitTexts[unitTexts.length - 1]?.label ?? ''}`
        const result = await generateRecap(config, {
          bookTitle: book.title,
          unitLabel,
          nextUnitNumber: currentIndex + 1,
          unitTexts,
        })
        setRecap({ status: 'done', result, range })
      }
    } catch (e) {
      setRecap({
        status: 'error',
        message: e instanceof Error ? e.message : COPY.recap.failed,
      })
    }
  }

  return (
    <div
      className="fixed inset-0 z-dialog flex items-center justify-center bg-on-background/40 animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={COPY.recap.sheetTitle}
        className="bg-surface-bright border border-outline-variant rounded-card-lg shadow-raised p-6 mx-margin-mobile max-w-md w-full max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部：回来多久、停在哪 */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-headline-md text-primary">{COPY.recap.sheetTitle}</h3>
          <button
            aria-label={COPY.annotation.close}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-icon-sm">close</span>
          </button>
        </div>
        <p className="font-label text-label-sm text-on-surface-variant mb-4">
          {days != null && days > 0 ? `${COPY.recap.awayDays(days)} · ` : ''}
          《{book.title}》
        </p>
        <p className="font-body text-body-md text-on-surface mb-5">
          {chapterLabel
            ? COPY.recap.stoppedAt(chapterLabel, pct)
            : COPY.recap.stoppedAtPct(pct)}
        </p>

        {/* 你留下的痕迹 */}
        {traces.length > 0 && (
          <section className="mb-5">
            <p className="font-label text-label-xs text-on-surface-faint mb-2">{COPY.recap.tracesLabel}</p>
            <div className="flex flex-col gap-2">
              {traces.map((ann) => (
                <button
                  key={ann.id}
                  className="text-left px-3 py-2 rounded-card border-l-2 border-seal/70 bg-surface-container-low font-body text-label-md text-on-surface-variant italic line-clamp-2 hover:text-on-surface transition-colors"
                  onClick={() => {
                    onClose()
                    navigate(readerPathForBook(book, book.chapters[ann.chapterIndex]?.id, ann.id))
                  }}
                >
                  「{ann.selectedText.slice(0, 60)}」
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 前情提要 */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-label text-label-xs text-on-surface-faint">{COPY.recap.recapLabel}</p>
            {canAiRecap && recap.status === 'idle' && (
              <button
                className="font-label text-label-sm text-primary hover:opacity-80 transition-opacity"
                onClick={() => void handleGenerate()}
              >
                {COPY.recap.generateAction}
              </button>
            )}
          </div>

          {recap.status === 'loading' && (
            <p className="font-label text-label-sm text-on-surface-variant flex items-center gap-2 py-2">
              <span className="material-symbols-outlined text-[18px] animate-pulse">hourglass_top</span>
              {COPY.recap.generating}
            </p>
          )}
          {recap.status === 'notice' && (
            <p className="font-label text-label-sm text-on-surface-faint py-1">{recap.message}</p>
          )}
          {recap.status === 'error' && (
            <div className="flex items-center justify-between gap-2">
              <p className="font-label text-label-sm text-seal-deep">{recap.message}</p>
              <button
                className="shrink-0 font-label text-label-sm text-primary hover:opacity-80"
                onClick={() => void handleGenerate()}
              >
                {COPY.askLibrary.retry}
              </button>
            </div>
          )}
          {recap.status === 'done' && (
            <div className="rounded-card border border-outline-variant bg-surface-container-low p-3">
              <p className="font-label text-label-xs text-on-surface-faint mb-2">
                {COPY.recap.basedOn(recap.range)}
              </p>
              <ul className="flex flex-col gap-1.5 mb-2">
                {recap.result.recap.map((line, index) => (
                  <li key={index} className="font-body text-body-sm text-on-surface leading-relaxed flex gap-2">
                    <span className="text-on-surface-faint shrink-0">{index + 1}.</span>
                    {line}
                  </li>
                ))}
              </ul>
              {recap.result.resumeHint && (
                <p className="font-label text-label-sm text-seal-deep">
                  {COPY.recap.nowLabel}：{recap.result.resumeHint}
                </p>
              )}
            </div>
          )}
          {!canAiRecap && (
            <p className="font-label text-label-sm text-on-surface-faint">{COPY.recap.unsupported}</p>
          )}
        </section>

        {/* 图谱入口 + 继续读 */}
        <div className="flex items-center justify-between gap-3">
          {graphArtifact ? (
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => {
                onClose()
                navigate(knowledgePath(book.id, graphArtifact.id))
              }}
            >
              <span className="material-symbols-outlined text-icon-sm">hub</span>
              {COPY.recap.graphLink}
            </button>
          ) : (
            <span />
          )}
          <button
            className="btn-primary px-5 py-2"
            onClick={() => {
              onClose()
              onContinue()
            }}
          >
            {COPY.recap.continueReading}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReadingRecapSheet
