import React, { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { TopAppBar } from '@/components/atoms/TopAppBar'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { CharacterGraphView } from '@/components/molecules/knowledge/CharacterGraphView'
import { GlossaryView } from '@/components/molecules/knowledge/GlossaryView'
import { MindmapView } from '@/components/molecules/knowledge/MindmapView'
import { PaperBriefView } from '@/components/molecules/knowledge/PaperBriefView'
import { ROUTES, bookDetailPath, knowledgeSourcePath } from '@/constants/routes'
import { isProviderConfigured } from '@/services/ai/aiClient'
import { getKnowledgeTask } from '@/services/ai/knowledgeTasks'
import { useAppStore } from '@/stores/useAppStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type { Book, CharacterGraphData, CharacterNode, GlossaryData, MindmapNodeData, PaperBriefData } from '@/types'
import { exportKnowledgeArtifactMarkdown } from '@/utils/knowledgeExport'
import { toast } from '@/utils/toast'

/**
 * 知识产物查看器：人物图谱 / 思维导图的全屏舞台。
 * 生成进度、重生成、导出 Markdown 与删除都从这里发起。
 */

const PERCENT_BASE = 100
/** 人物出现章节 chips 的展示上限（多余折叠为「等 N 处」） */
const CHAPTER_CHIPS_MAX = 6

function formatTimestamp(value: Date | string): string {
  const date = new Date(value)
  return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 章节徽标文案：文本书按章节序号，PDF 按页码 */
function chapterLabelOf(book: Book, chapterIndex: number): string {
  if (book.format === 'pdf') return `第${chapterIndex + 1}页`
  const chapter = book.chapters?.[chapterIndex]
  return chapter ? `第${chapter.number}章` : `第${chapterIndex + 1}章`
}

export const KnowledgePage: React.FC = () => {
  const navigate = useNavigate()
  const { bookId, artifactId } = useParams<{ bookId: string; artifactId: string }>()
  const { books, loadBooks } = useLibraryStore()
  const { settings } = useAppStore()
  const { artifactsByBook, generation, loadArtifacts, generateArtifact, cancelGeneration, removeArtifact } =
    useKnowledgeStore()

  const [selectedNode, setSelectedNode] = useState<CharacterNode | null>(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (books.length === 0) loadBooks()
  }, [books.length, loadBooks])

  useEffect(() => {
    if (bookId) void loadArtifacts(bookId)
  }, [bookId, loadArtifacts])

  const book = books.find((b) => b.id === bookId)
  const artifact = useMemo(
    () => (bookId ? (artifactsByBook[bookId] ?? []).find((a) => a.id === artifactId) : undefined),
    [artifactsByBook, bookId, artifactId]
  )
  const graph = useMemo(
    () =>
      artifact?.type === 'character-graph' || artifact?.type === 'concept-graph'
        ? (artifact.data as CharacterGraphData)
        : null,
    [artifact]
  )
  const mindmap = useMemo(
    () => (artifact?.type === 'mindmap' ? (artifact.data as MindmapNodeData) : null),
    [artifact]
  )
  const glossary = useMemo(
    () => (artifact?.type === 'glossary' ? (artifact.data as GlossaryData) : null),
    [artifact]
  )
  const paperBrief = useMemo(
    () => (artifact?.type === 'paper-brief' ? (artifact.data as PaperBriefData) : null),
    [artifact]
  )
  const relationsOfSelected = useMemo(() => {
    if (!graph || !selectedNode) return []
    return graph.edges
      .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
      .map((edge) => {
        const counterpartId = edge.source === selectedNode.id ? edge.target : edge.source
        const counterpart = graph.nodes.find((node) => node.id === counterpartId)
        return {
          key: `${edge.source}-${edge.target}-${edge.relation}`,
          relation: edge.relation,
          counterpart: counterpart?.name ?? '？',
          description: edge.description,
          // 回原文：证据定位成功走章内坐标，否则章级回退（边的第一个出现章节）
          evidence: edge.evidence,
          fallbackChapterIndex: edge.chapters?.[0] ?? edge.evidence?.chapterIndex,
        }
      })
  }, [graph, selectedNode])

  /** 人物出现章节 chips（至多展示 6 个，多余折叠计数） */
  const selectedNodeChapterList = useMemo(() => selectedNode?.chapters ?? [], [selectedNode])

  if (!book || !artifact) {
    return (
      <div className="paper-texture min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">search_off</span>
          <p className="font-body text-body-md text-on-surface-variant">这个知识件不存在，或已随书本移出馆藏</p>
          <Button variant="secondary" onClick={() => navigate(bookId && book ? bookDetailPath(book.id) : ROUTES.LIBRARY)}>
            返回
          </Button>
        </div>
      </div>
    )
  }

  const task = getKnowledgeTask(artifact.type)
  const generationState = generation[`${book.id}:${artifact.type}`]
  const isRunning = generationState?.status === 'running'
  const aiReady = isProviderConfigured({
    baseUrl: settings.knowledgeAiUrl,
    apiKey: settings.knowledgeAiKey,
    model: settings.knowledgeAiModel,
  })

  const handleRegenerate = async () => {
    if (!aiReady) {
      toast('先到设置里配好知识库 AI 服务，再重新生成')
      navigate(ROUTES.SETTINGS)
      return
    }
    setSelectedNode(null)
    const ok = await generateArtifact(book, artifact.type)
    if (ok) toast(`${task.label}已重新生成`)
  }

  return (
    <div className="paper-texture min-h-screen pb-0">
      <div className="fixed inset-0 noise-overlay z-0" />
      <TopAppBar
        variant="detail"
        onBack={() => navigate(bookDetailPath(book.id))}
        onMore={() => setShowMoreMenu((v) => !v)}
      />
      {showMoreMenu && (
        <div className="fixed top-[76px] right-4 z-menu w-52 bg-surface-bright border border-outline-variant rounded-card shadow-paper-up py-1 animate-scale-in origin-top-right">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
            onClick={() => {
              setShowMoreMenu(false)
              exportKnowledgeArtifactMarkdown(book.title, artifact)
              toast('已导出 Markdown')
            }}
          >
            <span className="material-symbols-outlined text-icon-md">ios_share</span>
            <span className="font-label text-label-md">导出 Markdown</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary disabled:opacity-40"
            disabled={isRunning}
            onClick={() => {
              setShowMoreMenu(false)
              void handleRegenerate()
            }}
          >
            <span className="material-symbols-outlined text-icon-md">refresh</span>
            <span className="font-label text-label-md">重新生成</span>
          </button>
          <div className="border-t border-outline-variant my-1" />
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-seal-soft transition-colors text-seal"
            onClick={() => {
              setShowMoreMenu(false)
              setConfirmDelete(true)
            }}
          >
            <span className="material-symbols-outlined text-icon-md">delete</span>
            <span className="font-label text-label-md">删除此知识件</span>
          </button>
        </div>
      )}

      <main className="relative z-10 max-w-max-width-content mx-auto px-margin-mobile py-4 pb-16">
        {/* 元信息条：覆盖率对账（已分析 N/M 章）——分析完整性一眼可判 */}
        <div className="flex items-center justify-between mb-3 font-label text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-icon-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {task.icon}
            </span>
            {task.label} ·{' '}
            {artifact.meta?.bookChapterCount != null && artifact.meta.chapterCount < artifact.meta.bookChapterCount
              ? `已分析 ${artifact.meta.chapterCount}/${artifact.meta.bookChapterCount} 章`
              : `覆盖 ${artifact.meta?.chapterCount ?? '—'} 章`}
            {artifact.meta?.scope && (
              <span>
                （第 {(artifact.meta.scope.from ?? 0) + 1}-{(artifact.meta.scope.to ?? 0) + 1} 章）
              </span>
            )}
            {artifact.meta?.detail === 'core' && <span>· 核心版</span>}
            {artifact.meta?.detail === 'rich' && <span>· 详尽版</span>}
          </span>
          <span>{formatTimestamp(artifact.updatedAt)} 生成</span>
        </div>

        {/* 完整性告警：块被体量护栏截断时，分析不覆盖全书，必须显性提示 */}
        {artifact.meta?.totalChunkCount != null &&
          artifact.meta.totalChunkCount > (artifact.meta.analyzedChunkCount ?? 0) && (
            <div className="mb-3 rounded-card border border-seal/40 bg-seal-soft/40 p-3">
              <p className="font-label text-label-sm text-seal-deep">
                ⚠ 本次分析触达体量护栏：仅覆盖 {artifact.meta.analyzedChunkCount}/{artifact.meta.totalChunkCount} 块
                （约 {artifact.meta.chapterCount} 章），不是完整分析。可回到档案卡用「起止章」分批生成其余部分。
              </p>
            </div>
          )}

        {/* 生成进度 / 错误 */}
        {isRunning && (
          <div className="mb-3 rounded-card border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-label-md text-on-surface">
                正在通读全书（{generationState.done}/{generationState.total} 段）…
              </span>
              <button
                className="font-label text-label-sm text-on-surface-variant hover:text-seal transition-colors"
                onClick={() => cancelGeneration(book.id, artifact.type)}
              >
                取消
              </button>
            </div>
            <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.round(
                    (generationState.done / Math.max(generationState.total, 1)) * PERCENT_BASE
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
        {generationState?.status === 'error' && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-card border border-seal/40 bg-seal-soft/40 p-4">
            <span className="font-label text-label-sm text-seal-deep">{generationState.error}</span>
            <button
              className="shrink-0 font-label text-label-md text-primary hover:opacity-80"
              onClick={() => void handleRegenerate()}
            >
              重试
            </button>
          </div>
        )}

        {/* 舞台 */}
        <div className="rounded-card border border-outline-variant bg-surface-container-lowest overflow-hidden">
          {graph ? (
            <CharacterGraphView
              data={graph}
              selectedNodeId={selectedNode?.id ?? null}
              onSelectNode={setSelectedNode}
              entityLabel={artifact.type === 'concept-graph' ? '概念' : '人物'}
            />
          ) : mindmap ? (
            <MindmapView data={mindmap} />
          ) : glossary ? (
            <GlossaryView data={glossary} book={book} />
          ) : paperBrief ? (
            <PaperBriefView data={paperBrief} book={book} />
          ) : null}
        </div>

        {/* 人物侧卡（选中图谱节点后浮现） */}
        {selectedNode && (
          <section className="mt-4 rounded-card border border-outline-variant bg-surface-container-low p-4 animate-slide-up">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h2 className="font-display text-headline-sm text-primary">{selectedNode.name}</h2>
                {selectedNode.role && (
                  <p className="font-label text-label-sm text-on-surface-variant">{selectedNode.role}</p>
                )}
              </div>
              <button
                aria-label="收起卡片"
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                onClick={() => setSelectedNode(null)}
              >
                <span className="material-symbols-outlined text-icon-sm">close</span>
              </button>
            </div>
            {selectedNode.description && (
              <p className="font-body text-body-md text-on-surface leading-relaxed mb-3">
                {selectedNode.description}
              </p>
            )}

            {/* 出现章节：点击回原文 */}
            {selectedNodeChapterList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="font-label text-label-sm text-on-surface-faint">出现</span>
                {selectedNodeChapterList.slice(0, CHAPTER_CHIPS_MAX).map((chapterIndex) => (
                  <button
                    key={chapterIndex}
                    className="px-2 py-0.5 rounded-full border border-outline-variant font-label text-label-sm text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                    onClick={() => navigate(knowledgeSourcePath(book, chapterIndex))}
                  >
                    {chapterLabelOf(book, chapterIndex)}
                  </button>
                ))}
                {selectedNodeChapterList.length > CHAPTER_CHIPS_MAX && (
                  <span className="font-label text-label-sm text-on-surface-faint">
                    等 {selectedNodeChapterList.length} 处
                  </span>
                )}
              </div>
            )}

            {relationsOfSelected.length > 0 && (
              <ul className="flex flex-col gap-2">
                {relationsOfSelected.map((relation) => {
                  const target = relation.evidence
                    ? knowledgeSourcePath(book, relation.evidence.chapterIndex, relation.evidence.offsetRatio)
                    : relation.fallbackChapterIndex != null
                      ? knowledgeSourcePath(book, relation.fallbackChapterIndex)
                      : null
                  return (
                    <li key={relation.key} className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-2 font-label text-label-md">
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-seal-soft text-seal-deep text-label-sm">
                          {relation.relation}
                        </span>
                        <span className="text-on-surface">{relation.counterpart}</span>
                        {relation.description && (
                          <span className="text-on-surface-variant text-label-sm truncate flex-1">
                            {relation.description}
                          </span>
                        )}
                        {target && (
                          <button
                            aria-label={`回到${relation.counterpart}相关原文`}
                            title="回到原文"
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                            onClick={() => navigate(target)}
                          >
                            <span className="material-symbols-outlined text-icon-sm">book_open</span>
                          </button>
                        )}
                      </div>
                      {relation.evidence && (
                        <button
                          className="self-start text-left max-w-full px-2.5 py-1 rounded-card border-l-2 border-seal bg-surface-container-low font-body text-label-md text-on-surface-variant italic truncate hover:text-on-surface transition-colors"
                          onClick={() => target && navigate(target)}
                          title={relation.evidence.quote}
                        >
                          「{relation.evidence.quote}」
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`删除「${artifact.title}」？`}
        message="这个知识件会从馆藏中消失，可随时重新生成。"
        confirmLabel="删除"
        cancelLabel="留下"
        variant="danger"
        onConfirm={() => {
          setConfirmDelete(false)
          void removeArtifact(book.id, artifact.id).then(() => navigate(bookDetailPath(book.id)))
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

export default KnowledgePage
