import React from 'react'

import { useNavigate } from 'react-router-dom'

import { EntryReviseActions, VerifiedBadge } from '@/components/molecules/knowledge/ReviseControls'
import { knowledgeSourcePath } from '@/constants/routes'
import { t } from '@/i18n';
import { recordUsageSignal } from '@/services/telemetry/usageSignals'
import type { Book, ChapterSummaryData } from '@/types'

/**
 * 章节总结查看器：分段要点列表。
 * 每段头带覆盖章 chip（点击回原文），段身是要点清单；收尾一句「此刻处境」。
 * 修订模式下每条要点可改/删/盖校验章。
 */

interface SummaryViewProps {
  data: ChapterSummaryData
  book: Book
  revising?: boolean
  onEditPoint?: (sectionIndex: number, pointIndex: number) => void
  onRemovePoint?: (sectionIndex: number, pointIndex: number) => void
  onTogglePointVerified?: (sectionIndex: number, pointIndex: number) => void
}

function chapterLabelOf(book: Book, chapterIndex: number): string {
  if (book.format === 'pdf') return t('第{{arg1}}页', { arg1: chapterIndex + 1 })
  const chapter = book.chapters?.[chapterIndex]
  return chapter ? t('第{{number}}章', { number: chapter.number }) : t('第{{arg1}}章', { arg1: chapterIndex + 1 })
}

/** 段头覆盖章 chips（至多 6 个，多余折叠计数——与图谱侧卡同款） */
const CHAPTER_CHIPS_MAX = 6
/** 修订按钮组的条目名截断长度（无障碍标签用） */
const ENTRY_LABEL_MAX_CHARS = 12

export const SummaryView: React.FC<SummaryViewProps> = ({
  data,
  book,
  revising = false,
  onEditPoint,
  onRemovePoint,
  onTogglePointVerified,
}) => {
  const navigate = useNavigate()
  // 携带原始索引过滤（修订回调按 data.sections 定位，渲染序与数据序不能错位）
  const sections = data.sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.points.length > 0)

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center font-label text-label-md text-on-surface-variant">
        {t('这份总结是空的——重新生成或换个章节范围试试')}
      </div>
    )
  }

  return (
    <div className="max-h-[68vh] overflow-y-auto overscroll-contain p-4">
      <ol className="flex flex-col gap-3">
        {sections.map(({ section, index: sectionIndex }) => {
          const chapterList = section.chapters ?? []
          return (
            <li
              key={`${section.label}-${sectionIndex}`}
              className="rounded-card border border-outline-variant bg-surface-container-lowest p-3"
              data-summary-section={section.label}
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-label text-label-md text-primary">{section.label}</h3>
                {chapterList.slice(0, CHAPTER_CHIPS_MAX).map((chapterIndex) => (
                  <button
                    key={chapterIndex}
                    className="px-2 py-0.5 rounded-full border border-outline-variant font-label text-label-sm text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                    onClick={() => {
                      recordUsageSignal('knowledge-back-to-source', { bookId: book.id })
                      navigate(knowledgeSourcePath(book, chapterIndex))
                    }}
                  >
                    {chapterLabelOf(book, chapterIndex)}
                  </button>
                ))}
                {chapterList.length > CHAPTER_CHIPS_MAX && (
                  <span className="font-label text-label-sm text-on-surface-faint">
                    {t('等 {{length}} 处', { length: chapterList.length })}
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-1.5">
                {section.points.map((point, pointIndex) => (
                  <li
                    key={pointIndex}
                    className="flex items-start gap-2 font-body text-body-sm text-on-surface leading-relaxed"
                  >
                    <span className="text-on-surface-faint shrink-0 mt-0.5">{pointIndex + 1}.</span>
                    <span className="min-w-0 flex-1">{point.text}</span>
                    {point.verified && <VerifiedBadge />}
                    {revising && onEditPoint && onRemovePoint && onTogglePointVerified && (
                      <EntryReviseActions
                        verified={point.verified}
                        entryLabel={point.text.slice(0, ENTRY_LABEL_MAX_CHARS)}
                        onEdit={() => onEditPoint(sectionIndex, pointIndex)}
                        onRemove={() => onRemovePoint(sectionIndex, pointIndex)}
                        onToggleVerified={() => onTogglePointVerified(sectionIndex, pointIndex)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
      {data.closing && (
        <p className="mt-3 px-3 py-2 rounded-card border-l-2 border-seal/70 bg-surface-container-low font-label text-label-md text-seal-deep">
          {t('此刻处境')}：{data.closing}
        </p>
      )}
    </div>
  )
}

export default SummaryView
