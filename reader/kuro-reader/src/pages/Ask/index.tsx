import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { COPY } from '@/constants/copy'
import { settingsPath, knowledgeSourcePath } from '@/constants/routes';
import { isProviderConfigured } from '@/services/ai/aiClient'
import { LibraryQaError, askLibrary, type QaResult } from '@/services/ai/libraryQA'
import { useAppStore } from '@/stores/useAppStore'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type { Book } from '@/types'

/** 单次提问的回合（会话内保存；刷新即散——问藏书的答案是过程不是藏品） */
interface AskTurn {
  id: string
  query: string
  status: 'searching' | 'done' | 'error'
  result?: QaResult
  error?: string
  noHits?: boolean
}

const TURN_ID_RADIX = 36
const TURN_ID_SLICE_START = 2
const TURN_ID_SLICE_END = 8

function makeTurnId(): string {
  return `qa-${Date.now()}-${Math.random().toString(TURN_ID_RADIX).slice(TURN_ID_SLICE_START, TURN_ID_SLICE_END)}`
}

/** 示例问题：空态里给个起手式 */
const EXAMPLE_QUERIES = ['哪本书讲过……', '作者是怎么论证……的', '书里对……的定义是什么']

/**
 * 问藏书：跨书检索相关选段 → AI 基于选段作答 → 引文逐字校验、可回原文。
 * 与知识库生成同一套用户自配 AI 服务；没有命中就不硬答。
 */
export const AskLibraryPage: React.FC = () => {
  const navigate = useNavigate()
  const { books, loadBooks } = useLibraryStore()
  const { settings } = useAppStore()
  const [turns, setTurns] = useState<AskTurn[]>([])
  const [input, setInput] = useState('')
  const [scopeBookId, setScopeBookId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  useEffect(() => {
    if (turns.length > 0) bottomRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
  }, [turns])

  /** 可问的书：有文本层的（文本书 + PDF）；漫画无文本层不参与 */
  const searchableBooks = useMemo(
    () => books.filter((b) => b.format === 'text' || b.format === 'pdf'),
    [books]
  )
  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])

  const ask = async (rawQuery: string) => {
    const query = rawQuery.trim()
    if (!query) return
    const config = {
      baseUrl: settings.knowledgeAiUrl,
      apiKey: settings.knowledgeAiKey,
      model: settings.knowledgeAiModel,
    }
    if (!isProviderConfigured(config)) {
      setTurns((prev) => [
        ...prev,
        { id: makeTurnId(), query, status: 'error', error: COPY.askLibrary.notConfigured },
      ])
      setInput('')
      return
    }

    const turnId = makeTurnId()
    setTurns((prev) => [...prev, { id: turnId, query, status: 'searching' }])
    setInput('')

    const scope: Book[] = scopeBookId
      ? searchableBooks.filter((b) => b.id === scopeBookId)
      : searchableBooks
    try {
      const result = await askLibrary(config, query, scope)
      setTurns((prev) =>
        prev.map((turn) => (turn.id === turnId ? { ...turn, status: 'done', result } : turn))
      )
    } catch (e) {
      const noHits = e instanceof LibraryQaError && e.code === 'no-hits'
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId
            ? {
                ...turn,
                status: 'error',
                noHits,
                error: noHits ? COPY.askLibrary.noHits : e instanceof Error ? e.message : '问答失败',
              }
            : turn
        )
      )
    }
  }

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-8 flex flex-col">
      {/* 头部 */}
      <section className="border-b border-outline-variant pb-6 mb-6">
        <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">
          {COPY.askLibrary.pageName}
        </h2>
        <p className="font-body text-body-md text-on-surface-variant mt-1">{COPY.askLibrary.pageHint}</p>
      </section>

      {/* 范围 + 提问框 */}
      <section className="mb-6 flex flex-col gap-3">
        {searchableBooks.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="font-label text-label-sm text-on-surface-faint">范围</span>
            <select
              value={scopeBookId}
              onChange={(e) => setScopeBookId(e.target.value)}
              aria-label="检索范围"
              className="px-2 py-1 rounded-full font-label text-label-xs bg-surface-container-low text-on-surface-variant border border-outline-variant focus:outline-none focus:border-primary max-w-[60%]"
            >
              <option value="">{COPY.askLibrary.scopeAllBooks}（{searchableBooks.length} 本）</option>
              {searchableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  《{book.title}》
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2 bg-surface-container-low rounded-card-lg px-3 py-2 border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">forum</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) void ask(input)
            }}
            placeholder={COPY.askLibrary.placeholder}
            className="flex-1 bg-transparent text-on-surface font-body text-body-sm focus:outline-none placeholder:text-on-surface-variant/40"
          />
          <button
            className="btn-primary btn-sm px-3 py-1"
            disabled={!input.trim()}
            onClick={() => void ask(input)}
          >
            {COPY.askLibrary.askAction}
          </button>
        </div>
      </section>

      {/* 空态 */}
      {turns.length === 0 && (
        <div className="flex flex-col items-center text-center py-12">
          <span className="material-symbols-outlined text-on-surface-faint text-5xl mb-4 block">psychology_alt</span>
          <p className="font-body text-body-md text-on-surface-variant mb-2">{COPY.askLibrary.emptyTitle}</p>
          <p className="font-label text-label-sm text-on-surface-faint mb-6 max-w-sm">{COPY.askLibrary.emptyHint}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                className="chip px-3 py-1.5 hover:text-primary"
                onClick={() => setInput(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 回合列表 */}
      <div className="flex flex-col gap-6">
        {turns.map((turn) => (
          <article key={turn.id} className="flex flex-col gap-3">
            {/* 问 */}
            <div className="self-end max-w-[85%] px-4 py-2.5 rounded-card-lg rounded-br-sm bg-primary/15 border border-primary/30">
              <p className="font-body text-body-md text-on-surface text-right break-words">{turn.query}</p>
            </div>

            {/* 答 */}
            {turn.status === 'searching' && (
              <div className="self-start flex items-center gap-2 px-4 py-3 rounded-card-lg bg-surface-container-low border border-outline-variant">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant animate-pulse">
                  hourglass_top
                </span>
                <span className="font-label text-label-sm text-on-surface-variant">
                  {scopeBookId ? COPY.askLibrary.phaseAsking : COPY.askLibrary.phaseSearching}
                </span>
              </div>
            )}
            {turn.status === 'error' && (
              <div className="self-start max-w-full px-4 py-3 rounded-card-lg bg-seal-soft/40 border border-seal/40">
                <p className="font-label text-label-sm text-seal-deep">{turn.error}</p>
                {turn.noHits && (
                  <p className="font-label text-label-xs text-seal-deep/70 mt-1">{COPY.askLibrary.noHitsHint}</p>
                )}
                {turn.error === COPY.askLibrary.notConfigured && (
                  <button
                    className="mt-2 font-label text-label-md text-primary hover:opacity-80"
                    onClick={() => navigate(settingsPath('ai'))}
                  >
                    {COPY.askLibrary.goSettings} →
                  </button>
                )}
              </div>
            )}
            {turn.status === 'done' && turn.result && (
              <div className="self-start w-full px-4 py-3.5 rounded-card-lg bg-surface-container-low border border-outline-variant">
                <p className="font-body text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                  {turn.result.answer}
                </p>
                {turn.result.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/60">
                    <p className="font-label text-label-xs text-on-surface-faint mb-2">
                      {COPY.askLibrary.sourcesLabel} · {COPY.askLibrary.searched(turn.result.searchedBookCount)}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {turn.result.citations.map((citation, index) => {
                        const book = citation.location ? bookById.get(citation.location.bookId) : undefined
                        const target =
                          citation.location && book
                            ? knowledgeSourcePath(book, citation.location.chapterIndex, citation.location.offsetRatio)
                            : null
                        return (
                          <li key={`${turn.id}-${index}`} className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="shrink-0 px-1.5 py-0.5 rounded-full border border-outline-variant font-label text-label-xs text-on-surface-variant">
                                [{citation.excerptIndex}]
                              </span>
                              <span className="font-label text-label-sm text-on-surface-variant truncate">
                                《{citation.location?.bookTitle ?? '？'}》
                              </span>
                              {citation.location ? (
                                <button
                                  className="shrink-0 flex items-center gap-1 font-label text-label-sm text-primary hover:opacity-80 transition-opacity"
                                  onClick={() => target && navigate(target)}
                                >
                                  <span className="material-symbols-outlined text-icon-sm">book_open</span>
                                  {COPY.askLibrary.backToSource}
                                </button>
                              ) : (
                                <span className="shrink-0 font-label text-label-xs text-on-surface-faint">
                                  {COPY.askLibrary.unlocated}
                                </span>
                              )}
                            </div>
                            <p className="pl-1 border-l-2 border-seal/60 px-2 font-body text-label-md text-on-surface-variant italic line-clamp-2">
                              「{citation.quote}」
                            </p>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default AskLibraryPage
