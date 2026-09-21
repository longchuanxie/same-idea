import React, { useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { CharacterGraphView } from '@/components/molecules/knowledge/CharacterGraphView'
import { VerifiedBadge } from '@/components/molecules/knowledge/ReviseControls'
import { COPY } from '@/constants/copy'
import { ROUTES, knowledgeSourcePath } from '@/constants/routes'
import { knowledgeRepo } from '@/services/storage/knowledgeRepo'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type { KnowledgeArtifact } from '@/types'
import { booksHavingKind, mergeGlossaries, mergeGraphs } from '@/utils/crossBookGraph'

type AtlasKind = 'character' | 'concept' | 'glossary'

const KIND_ARTIFACT_TYPE: Record<AtlasKind, KnowledgeArtifact['type']> = {
  character: 'character-graph',
  concept: 'concept-graph',
  glossary: 'glossary',
}

/** 出现章节 chips 的展示上限（与知识件查看器一致） */
const CHAPTER_CHIPS_MAX = 6

/**
 * 跨书图谱：把多本书的同类知识件并成一张网——
 * 人物网/概念网（同名实体归一、侧卡按书展开回原文）与术语对照（同术语跨书并排）。
 */
export const AtlasPage: React.FC = () => {
  const navigate = useNavigate()
  const { books, loadBooks } = useLibraryStore()
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[] | null>(null)
  const [kind, setKind] = useState<AtlasKind>('character')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    loadBooks()
    let cancelled = false
    knowledgeRepo.getAll().then((all) => {
      if (!cancelled) setArtifacts(all)
    })
    return () => {
      cancelled = true
    }
  }, [loadBooks])

  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])

  // 只统计馆内现存书的产物（书已移出的知识件不进跨书网）
  const liveArtifacts = useMemo(
    () => (artifacts ?? []).filter((a) => bookById.has(a.bookId)),
    [artifacts, bookById]
  )

  const availableKinds = useMemo(() => {
    const kinds: AtlasKind[] = []
    for (const candidate of Object.keys(KIND_ARTIFACT_TYPE) as AtlasKind[]) {
      if (booksHavingKind(liveArtifacts, KIND_ARTIFACT_TYPE[candidate]).length >= 2) {
        kinds.push(candidate)
      }
    }
    return kinds
  }, [liveArtifacts])

  const effectiveKind = availableKinds.includes(kind) ? kind : availableKinds[0]

  useEffect(() => {
    setSelectedNodeId(null)
  }, [effectiveKind])

  const kindArtifacts = useMemo(
    () => liveArtifacts.filter((a) => a.type === KIND_ARTIFACT_TYPE[effectiveKind]),
    [liveArtifacts, effectiveKind]
  )

  const merged = useMemo(
    () => (effectiveKind === 'glossary' ? null : mergeGraphs(kindArtifacts)),
    [effectiveKind, kindArtifacts]
  )
  const glossary = useMemo(
    () => (effectiveKind === 'glossary' ? mergeGlossaries(kindArtifacts) : null),
    [effectiveKind, kindArtifacts]
  )

  const sharedTerms = glossary?.filter((t) => t.bookCount >= 2) ?? []
  const singleBookTermCount = glossary?.filter((t) => t.bookCount < 2).length ?? 0

  const selectedSources = merged && selectedNodeId ? merged.nodeBooks.get(selectedNodeId) ?? [] : []
  /** 选中实体在某书里的关系（该书产物内两端任一为该实体） */
  const relationsInBook = (artifactId: string, nodeId: string) => {
    const artifact = kindArtifacts.find((a) => a.id === artifactId)
    if (!artifact) return []
    const graph = artifact.data as { nodes: { id: string; name: string }[]; edges: { source: string; target: string; relation: string }[] }
    return graph.edges
      .filter((edge) => edge.source === nodeId || edge.target === nodeId)
      .map((edge) => {
        const counterpartId = edge.source === nodeId ? edge.target : edge.source
        return {
          relation: edge.relation,
          counterpart: graph.nodes.find((n) => n.id === counterpartId)?.name ?? '？',
        }
      })
  }

  const selectedNode = merged?.graph.nodes.find((n) => n.id === selectedNodeId)

  const tabLabel = (candidate: AtlasKind, count: number): string =>
    candidate === 'character'
      ? COPY.atlas.tabCharacters(count)
      : candidate === 'concept'
        ? COPY.atlas.tabConcepts(count)
        : COPY.atlas.tabGlossary(count)

  if (artifacts === null) {
    return (
      <div className="flex flex-col items-center py-16 text-on-surface-faint">
        <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_top</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-3 pb-8">
      {/* 头部 + 视图切换 */}
      <section className="border-b border-outline-variant pb-5 mb-5">
        <h2 className="font-display text-display-lg-mobile text-primary">{COPY.atlas.pageName}</h2>
        <p className="font-body text-body-md text-on-surface-variant mt-1">{COPY.atlas.pageHint}</p>
      </section>

      {availableKinds.length === 0 ? (
        <div className="rounded-card border border-outline-variant bg-surface-container-low p-8 text-center">
          <span className="material-symbols-outlined text-[44px] text-on-surface-faint">hub</span>
          <p className="font-label text-label-lg text-on-surface-variant mt-3">{COPY.atlas.emptyTitle}</p>
          <p className="font-label text-label-sm text-on-surface-faint mt-1 max-w-sm mx-auto">
            {COPY.atlas.emptyHint}
          </p>
          {/* 直链/书签落到空态时不给死路：原路返回聚合页 */}
          <button
            className="btn-secondary px-6 py-2 mt-6"
            onClick={() => navigate(ROUTES.KNOWLEDGE_HUB)}
          >
            回知识库
          </button>
        </div>
      ) : (
        <>
          {/* 视图切换（有跨书数据的类型才出现） */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
            {availableKinds.map((candidate) => {
              const count = booksHavingKind(liveArtifacts, KIND_ARTIFACT_TYPE[candidate]).length
              return (
                <button
                  key={candidate}
                  aria-pressed={candidate === effectiveKind}
                  className={`chip px-3 py-1.5 whitespace-nowrap ${
                    candidate === effectiveKind
                      ? 'chip-active'
                      : ''
                  }`}
                  onClick={() => setKind(candidate)}
                >
                  {tabLabel(candidate, count)}
                </button>
              )
            })}
          </div>

          {/* 图谱网：合并图 + 侧卡按书展开 */}
          {merged && (
            <>
              <div className="rounded-card border border-outline-variant bg-surface-container-lowest overflow-hidden mb-4">
                <CharacterGraphView
                  data={merged.graph}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(node) => setSelectedNodeId(node?.id ?? null)}
                  entityLabel={effectiveKind === 'concept' ? '概念' : '人物'}
                />
              </div>

              {selectedNode && (
                <section className="rounded-card border border-outline-variant bg-surface-container-low p-4 animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-display text-headline-sm text-primary">{selectedNode.name}</h3>
                    {selectedNode.verified && <VerifiedBadge />}
                    <span className="font-label text-label-xs text-on-surface-faint">
                      {COPY.atlas.inBooks(selectedSources.length)}
                    </span>
                    <button
                      aria-label="收起"
                      className="ml-auto w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                      onClick={() => setSelectedNodeId(null)}
                    >
                      <span className="material-symbols-outlined text-icon-sm">close</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {selectedSources.map((source) => {
                      const book = bookById.get(source.bookId)
                      if (!book) return null
                      const relations = relationsInBook(source.artifactId, source.node.id)
                      return (
                        <div key={source.artifactId} className="rounded-card border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="font-label text-label-md text-primary mb-1">《{book.title}》</p>
                          {source.node.role && (
                            <p className="font-label text-label-sm text-on-surface-variant">{source.node.role}</p>
                          )}
                          {source.node.description && (
                            <p className="font-body text-body-sm text-on-surface leading-relaxed mt-1">
                              {source.node.description}
                            </p>
                          )}
                          {relations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {relations.map((relation, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 rounded-full bg-seal-soft text-seal-deep font-label text-label-xs"
                                >
                                  {relation.relation} · {relation.counterpart}
                                </span>
                              ))}
                            </div>
                          )}
                          {(source.node.chapters?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="font-label text-label-xs text-on-surface-faint">出现</span>
                              {(source.node.chapters ?? []).slice(0, CHAPTER_CHIPS_MAX).map((chapterIndex) => (
                                <button
                                  key={chapterIndex}
                                  className="chip px-2 py-0.5 text-label-xs hover:text-primary"
                                  onClick={() => navigate(knowledgeSourcePath(book, chapterIndex))}
                                >
                                  {book.format === 'pdf' ? `第${chapterIndex + 1}页` : `第${chapterIndex + 1}章`}
                                </button>
                              ))}
                              {(source.node.chapters?.length ?? 0) > CHAPTER_CHIPS_MAX && (
                                <span className="font-label text-label-xs text-on-surface-faint">
                                  等 {source.node.chapters?.length} 处
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </>
          )}

          {/* 术语对照：跨书术语并排，分歧即信息 */}
          {glossary && (
            <>
              <p className="font-label text-label-sm text-on-surface-variant mb-3">
                {COPY.atlas.sharedTerms(sharedTerms.length)}
              </p>
              <div className="flex flex-col gap-3">
                {sharedTerms.map((term) => (
                  <article
                    key={term.termId}
                    className="rounded-card border border-outline-variant bg-surface-container-low p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display text-headline-sm text-primary">{term.term}</h3>
                      <span className="font-label text-label-xs text-on-surface-faint">
                        {COPY.atlas.inBooks(term.bookCount)}
                      </span>
                    </div>
                    {new Set(term.entries.map((e) => e.definition)).size > 1 && (
                      <p className="font-label text-label-xs text-seal-deep mb-2">{COPY.atlas.disagreeHint}</p>
                    )}
                    <div className="flex flex-col gap-2">
                      {term.entries.map((entry) => {
                        const book = bookById.get(entry.bookId)
                        return (
                          <div key={entry.artifactId} className="rounded-card border border-outline-variant bg-surface-container-lowest p-3">
                            <p className="font-label text-label-sm text-primary mb-0.5">《{book?.title ?? '？'}》</p>
                            <p className="font-body text-body-sm text-on-surface leading-relaxed">
                              {entry.definition ?? '—'}
                            </p>
                            {entry.evidence && book && (
                              <button
                                className="mt-1.5 flex items-center gap-1 font-label text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                                onClick={() =>
                                  navigate(
                                    knowledgeSourcePath(book, entry.evidence!.chapterIndex, entry.evidence!.offsetRatio)
                                  )
                                }
                              >
                                <span className="material-symbols-outlined text-icon-sm">book_open</span>
                                回到原文
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </article>
                ))}
              </div>
              {singleBookTermCount > 0 && (
                <p className="font-label text-label-xs text-on-surface-faint mt-4">
                  {COPY.atlas.singleBookTerms(singleBookTermCount)}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default AtlasPage
