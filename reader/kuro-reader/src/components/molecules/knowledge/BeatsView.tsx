import React, { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'

import { EntryReviseActions, VerifiedBadge } from '@/components/molecules/knowledge/ReviseControls'
import { knowledgeSourcePath } from '@/constants/routes'
import { recordUsageSignal } from '@/services/telemetry/usageSignals'
import type { Book, StoryBeat, StoryBeatsData } from '@/types'
import { beatRoleMeta, beatRoleTint, beatRulerRatio } from '@/utils/beatRoles'

/**
 * 叙事节拍查看器：结构导航件。
 * 上半是贯穿全书的节拍尺（点距即节奏感：间隔宽=铺垫长），下半是节拍清单；
 * 点节拍回原文。修订模式下每条可改/删/盖校验章。
 */

interface BeatsViewProps {
  data: StoryBeatsData
  book: Book
  /** 原书总章数（骨架生成时记录）——节拍尺的刻度总长 */
  bookChapterCount: number
  revising?: boolean
  onEditBeat?: (beat: StoryBeat) => void
  onRemoveBeat?: (beatId: string) => void
  onToggleBeatVerified?: (beatId: string) => void
}

function chapterLabelOf(book: Book, chapterIndex: number): string {
  if (book.format === 'pdf') return `第${chapterIndex + 1}页`
  const chapter = book.chapters?.[chapterIndex]
  return chapter ? `第${chapter.number}章` : `第${chapterIndex + 1}章`
}

export const BeatsView: React.FC<BeatsViewProps> = ({
  data,
  book,
  bookChapterCount,
  revising = false,
  onEditBeat,
  onRemoveBeat,
  onToggleBeatVerified,
}) => {
  const navigate = useNavigate()

  const beats = useMemo(
    () =>
      data.beats.map((beat) => {
        const ratio = beatRulerRatio(beat.chapterIndex, bookChapterCount)
        const sourcePath = knowledgeSourcePath(book, beat.chapterIndex)
        return { beat, ratio, sourcePath }
      }),
    [data.beats, book, bookChapterCount]
  )

  if (beats.length === 0) {
    return (
      <div className="p-8 text-center font-label text-label-md text-on-surface-variant">
        这份节拍卡是空的——重新生成或换一本长篇试试
      </div>
    )
  }

  return (
    <div className="max-h-[68vh] overflow-y-auto overscroll-contain p-4">
      {/* 节拍尺：标签上下交错排布，密集节拍不易相撞（上标签需要顶部余量） */}
      <div className="relative mb-5 h-28 pt-6" role="list" aria-label="全书节拍尺">
        <div className="absolute left-0 right-0 top-1/2 border-t border-outline-variant" aria-hidden="true" />
        {beats.map(({ beat, ratio }, index) => {
          const meta = beatRoleMeta(beat.role)
          const labelAbove = index % 2 === 1
          return (
            <button
              key={beat.id}
              role="listitem"
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center p-1.5 group"
              style={{ left: `${ratio * 100}%` }}
              onClick={() => {
                recordUsageSignal('knowledge-beat-tap', { bookId: book.id })
                navigate(knowledgeSourcePath(book, beat.chapterIndex))
              }}
              title={`${meta.label}·${beat.title} · ${chapterLabelOf(book, beat.chapterIndex)}（点击回原文）`}
            >
              <span
                className="block w-3 h-3 rounded-full ring-2 ring-surface-container-lowest group-hover:scale-125 transition-transform"
                style={{ backgroundColor: meta.color }}
                aria-hidden="true"
              />
              {/* 尺上只挂角色短标（事件名进清单与 tooltip）：430px 宽度下长标签必然相撞 */}
              <span
                className={`absolute whitespace-nowrap font-label text-label-xs text-on-surface-variant group-hover:text-on-surface transition-colors ${
                  labelAbove ? 'bottom-full mb-0.5' : 'top-full mt-0.5'
                }`}
              >
                {meta.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 节拍清单 */}
      <ul className="flex flex-col gap-2">
        {beats.map(({ beat }) => {
          const meta = beatRoleMeta(beat.role)
          return (
            <li
              key={beat.id}
              className="rounded-card border border-outline-variant bg-surface-container-lowest p-3"
              data-beat={beat.title}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="shrink-0 px-2 py-0.5 rounded-full font-label text-label-sm"
                  style={{ backgroundColor: beatRoleTint(beat.role), color: meta.color }}
                >
                  {meta.label}
                </span>
                <h3 className="font-label text-label-md text-on-surface">{beat.title}</h3>
                {beat.verified && <VerifiedBadge />}
                <span className="font-label text-label-sm text-on-surface-faint ml-auto">
                  {chapterLabelOf(book, beat.chapterIndex)}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {revising && onEditBeat && onRemoveBeat && onToggleBeatVerified && (
                    <EntryReviseActions
                      verified={beat.verified}
                      entryLabel={beat.title}
                      onEdit={() => onEditBeat(beat)}
                      onRemove={() => onRemoveBeat(beat.id)}
                      onToggleVerified={() => onToggleBeatVerified(beat.id)}
                    />
                  )}
                  {!revising && (
                    <button
                      aria-label={`回到${beat.title}相关原文`}
                      title="回到原文"
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                      onClick={() => {
                        recordUsageSignal('knowledge-beat-tap', { bookId: book.id })
                        navigate(knowledgeSourcePath(book, beat.chapterIndex))
                      }}
                    >
                      <span className="material-symbols-outlined text-icon-sm">book_open</span>
                    </button>
                  )}
                </div>
              </div>
              {beat.detail && (
                <p className="mt-1 font-body text-body-sm text-on-surface-variant leading-relaxed">{beat.detail}</p>
              )}
              {beat.evidence && (
                <button
                  className="mt-1.5 block max-w-full text-left px-2.5 py-1 rounded-card border-l-2 border-seal bg-surface-container-low font-body text-label-md text-on-surface-variant italic truncate hover:text-on-surface transition-colors"
                  onClick={() => {
                    recordUsageSignal('knowledge-back-to-source', { bookId: book.id })
                    navigate(knowledgeSourcePath(book, beat.evidence!.chapterIndex, beat.evidence!.offsetRatio))
                  }}
                  title={beat.evidence.quote}
                >
                  「{beat.evidence.quote}」
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default BeatsView
