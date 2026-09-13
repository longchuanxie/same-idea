import React, { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { TopAppBar } from '@/components/atoms/TopAppBar'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { CharacterGraphView } from '@/components/molecules/knowledge/CharacterGraphView'
import { GlossaryView } from '@/components/molecules/knowledge/GlossaryView'
import { KnowledgeEntryEditDialog, type EditFieldDef } from '@/components/molecules/knowledge/KnowledgeEntryEditDialog'
import { MindmapView } from '@/components/molecules/knowledge/MindmapView'
import { PaperBriefView } from '@/components/molecules/knowledge/PaperBriefView'
import { EntryReviseActions, VerifiedBadge } from '@/components/molecules/knowledge/ReviseControls'
import { COPY } from '@/constants/copy'
import { ROUTES, bookDetailPath, knowledgeSourcePath } from '@/constants/routes'
import { useHistoryBack } from '@/hooks/useHistoryBack'
import { isProviderConfigured } from '@/services/ai/aiClient'
import { getKnowledgeTask } from '@/services/ai/knowledgeTasks'
import { useAppStore } from '@/stores/useAppStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type {
  Book,
  CharacterEdge,
  CharacterGraphData,
  CharacterNode,
  GlossaryData,
  GlossaryTerm,
  KnowledgeArtifact,
  MindmapNodeData,
  PaperBriefData,
} from '@/types'
import {
  patchBriefEntryText,
  patchBriefTldr,
  patchGraphNode,
  patchGraphEdge,
  patchGlossaryTerm,
  patchMindmapNode,
  removeBriefEntry,
  removeGraphEdge,
  removeGraphNode,
  removeGlossaryTerm,
  removeMindmapNode,
  setBriefEntryVerified,
  setGraphEdgeVerified,
  setGraphNodeVerified,
  setGlossaryTermVerified,
  setMindmapNodeVerified,
  type BriefSection,
  type MindmapNodePath,
} from '@/utils/knowledgeEdit'
import { exportKnowledgeArtifactMarkdown } from '@/utils/knowledgeExport'
import { toast } from '@/utils/toast'

/**
 * 知识产物查看器：人物图谱 / 思维导图的全屏舞台。
 * 生成进度、重生成、导出 Markdown 与删除都从这里发起；
 * 修订模式下 AI 写错的条目可改可删，核对过的盖「已校验」章。
 */

const PERCENT_BASE = 100
/** 人物出现章节 chips 的展示上限（多余折叠为「等 N 处」） */
const CHAPTER_CHIPS_MAX = 6

/** 修订弹窗的目标（判别联合：一种条目一个分支） */
type EditState =
  | { kind: 'node'; node: CharacterNode }
  | { kind: 'edge'; index: number; edge: CharacterEdge }
  | { kind: 'term'; term: GlossaryTerm }
  | { kind: 'briefTldr' }
  | { kind: 'briefEntry'; section: BriefSection; index: number }
  | { kind: 'mindmap'; path: MindmapNodePath; node: MindmapNodeData }

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

/** 按路径取导图节点（修订弹窗初值用；路径失效返回 null） */
function mindmapNodeAt(root: MindmapNodeData, path: MindmapNodePath): MindmapNodeData | null {
  let node = root
  for (const index of path) {
    const child = node.children?.[index]
    if (!child) return null
    node = child
  }
  return node
}

/** 修订弹窗的表单形状（构造器：参数显式定型，分支字面量不漂成互斥联合） */
function editDialogInfo(
  title: string,
  fields: EditFieldDef[],
  values: Record<string, string>,
  removable: boolean
) {
  return { title, fields, values, removable }
}

export const KnowledgePage: React.FC = () => {
  const navigate = useNavigate()
  const historyBack = useHistoryBack()
  const { bookId, artifactId } = useParams<{ bookId: string; artifactId: string }>()
  const { books, loadBooks } = useLibraryStore()
  const { settings } = useAppStore()
  const {
    artifactsByBook,
    generation,
    loadArtifacts,
    generateArtifact,
    cancelGeneration,
    removeArtifact,
    updateArtifactData,
  } = useKnowledgeStore()

  // 选中节点只记 id：修订后数据整件换新，按 id 找回节点不致展示旧快照
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const [revising, setRevising] = useState(false)
  const [editState, setEditState] = useState<EditState | null>(null)

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
  const selectedNode = useMemo(
    () => graph?.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [graph, selectedNodeId]
  )
  const relationsOfSelected = useMemo(() => {
    if (!graph || !selectedNode) return []
    return graph.edges
      .map((edge, index) => ({ edge, index }))
      .filter(({ edge }) => edge.source === selectedNode.id || edge.target === selectedNode.id)
      .map(({ edge, index }) => {
        const counterpartId = edge.source === selectedNode.id ? edge.target : edge.source
        const counterpart = graph.nodes.find((node) => node.id === counterpartId)
        return {
          key: `${edge.source}-${edge.target}-${edge.relation}-${index}`,
          index,
          relation: edge.relation,
          description: edge.description,
          verified: edge.verified,
          counterpart: counterpart?.name ?? '？',
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
          <Button variant="secondary" onClick={() => historyBack(bookId && book ? bookDetailPath(book.id) : ROUTES.LIBRARY)}>
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
  const manualEdits = artifact.manualEditCount ?? 0

  /** 手工修订统一入口：纯函数变换 + 落库（store 负责计数与刷新） */
  const revise = (apply: (data: KnowledgeArtifact['data']) => KnowledgeArtifact['data']) => {
    void updateArtifactData(book.id, artifact.id, apply)
  }

  const doRegenerate = async () => {
    setSelectedNodeId(null)
    setRevising(false)
    const ok = await generateArtifact(book, artifact.type)
    if (ok) toast(`${task.label}已重新生成`)
  }

  const handleRegenerate = async () => {
    if (!aiReady) {
      toast('先到设置里配好知识库 AI 服务，再重新生成')
      navigate(ROUTES.SETTINGS)
      return
    }
    // 手工修订过 → 先确认再覆盖（修订是读者的劳动成果，不该被一键冲掉）
    if (manualEdits > 0) {
      setConfirmRegenerate(true)
      return
    }
    await doRegenerate()
  }

  const handleEditSave = (values: Record<string, string>) => {
    const target = editState
    setEditState(null)
    if (!target) return
    switch (target.kind) {
      case 'node':
        revise((data) =>
          patchGraphNode(data as CharacterGraphData, target.node.id, {
            name: values.name,
            role: values.role || undefined,
            description: values.description || undefined,
          })
        )
        break
      case 'edge':
        revise((data) =>
          patchGraphEdge(data as CharacterGraphData, target.index, {
            relation: values.relation,
            description: values.description || undefined,
          })
        )
        break
      case 'term':
        revise((data) =>
          patchGlossaryTerm(data as GlossaryData, target.term.id, {
            term: values.term,
            definition: values.definition || undefined,
          })
        )
        break
      case 'briefTldr':
        revise((data) => patchBriefTldr(data as PaperBriefData, values.tldr))
        break
      case 'briefEntry':
        revise((data) => patchBriefEntryText(data as PaperBriefData, target.section, target.index, values.text))
        break
      case 'mindmap':
        revise((data) =>
          patchMindmapNode(data as MindmapNodeData, target.path, {
            title: values.title,
            detail: values.detail || undefined,
          })
        )
        break
    }
    toast(COPY.knowledgeEdit.revisedToast)
  }

  const handleEditRemove = () => {
    const target = editState
    setEditState(null)
    if (!target) return
    switch (target.kind) {
      case 'node':
        setSelectedNodeId(null)
        revise((data) => removeGraphNode(data as CharacterGraphData, target.node.id))
        break
      case 'edge':
        revise((data) => removeGraphEdge(data as CharacterGraphData, target.index))
        break
      case 'term':
        revise((data) => removeGlossaryTerm(data as GlossaryData, target.term.id))
        break
      case 'briefEntry':
        revise((data) => removeBriefEntry(data as PaperBriefData, target.section, target.index))
        break
      case 'mindmap':
        revise((data) => removeMindmapNode(data as MindmapNodeData, target.path))
        break
      case 'briefTldr':
        break
    }
    toast(COPY.knowledgeEdit.removedToast)
  }

  // 修订弹窗的表单形状与初值（一种条目一套字段）
  const editDialog = (() => {
    if (!editState) return null
    switch (editState.kind) {
      case 'node':
        return editDialogInfo(
          `修订「${editState.node.name}」`,
          [
            { key: 'name', label: '名字', required: true },
            { key: 'role', label: '身份' },
            { key: 'description', label: '小传', multiline: true },
          ],
          {
            name: editState.node.name,
            role: editState.node.role ?? '',
            description: editState.node.description ?? '',
          },
          true
        )
      case 'edge':
        return editDialogInfo(
          `修订「${editState.edge.relation}」关系`,
          [
            { key: 'relation', label: COPY.knowledgeEdit.relationName, required: true },
            { key: 'description', label: COPY.knowledgeEdit.relationNote, multiline: true },
          ],
          {
            relation: editState.edge.relation,
            description: editState.edge.description ?? '',
          },
          true
        )
      case 'term':
        return editDialogInfo(
          `修订术语「${editState.term.term}」`,
          [
            { key: 'term', label: '术语', required: true },
            { key: 'definition', label: '书中定义', multiline: true },
          ],
          { term: editState.term.term, definition: editState.term.definition ?? '' },
          true
        )
      case 'briefTldr':
        return editDialogInfo(
          '修订一句话速览',
          [{ key: 'tldr', label: '速览', multiline: true, required: true }],
          { tldr: paperBrief?.tldr ?? '' },
          false
        )
      case 'briefEntry': {
        const entryText =
          paperBrief && editState.section !== 'questions'
            ? paperBrief[editState.section][editState.index]?.point
            : paperBrief?.questions[editState.index]?.question
        return editDialogInfo(
          '修订要点',
          [{ key: 'text', label: '内容', multiline: true, required: true }],
          { text: entryText ?? '' },
          true
        )
      }
      case 'mindmap':
        return editDialogInfo(
          `修订「${editState.node.title}」`,
          [
            { key: 'title', label: '标题', required: true },
            { key: 'detail', label: '补充', multiline: true },
          ],
          { title: editState.node.title, detail: editState.node.detail ?? '' },
          true
        )
    }
  })()

  return (
    <div className="paper-texture h-[100dvh] overflow-y-auto overscroll-contain">
      <div className="fixed inset-0 noise-overlay z-0" />
      <TopAppBar
        variant="detail"
        onBack={() => historyBack(bookDetailPath(book.id))}
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

        {/* 修订模式开关：AI 写错的地方自己修 */}
        {!isRunning && (
          <div className="mb-3 flex items-center justify-between gap-3">
            {revising ? (
              <p className="font-label text-label-sm text-seal-deep">{COPY.knowledgeEdit.reviseHint}</p>
            ) : (
              manualEdits > 0 && (
                <p className="font-label text-label-sm text-on-surface-faint">含 {manualEdits} 处手工修订</p>
              )
            )}
            <button
              aria-pressed={revising}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-label text-label-sm transition-colors ${
                revising
                  ? 'bg-seal-strong text-on-seal border-seal-strong'
                  : 'text-on-surface-variant border-outline-variant hover:text-primary hover:border-primary'
              }`}
              onClick={() => setRevising((v) => !v)}
            >
              <span className="material-symbols-outlined text-icon-sm">
                {revising ? 'task_alt' : 'edit_note'}
              </span>
              {revising ? '完成修订' : COPY.knowledgeEdit.revise}
            </button>
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
              selectedNodeId={selectedNodeId}
              onSelectNode={(node) => setSelectedNodeId(node?.id ?? null)}
              entityLabel={artifact.type === 'concept-graph' ? '概念' : '人物'}
            />
          ) : mindmap ? (
            <MindmapView
              data={mindmap}
              revising={revising}
              onEditNode={(path) => {
                const node = mindmapNodeAt(mindmap, path)
                if (node) setEditState({ kind: 'mindmap', path, node })
              }}
              onRemoveNode={(path) => {
                revise((data) => removeMindmapNode(data as MindmapNodeData, path))
                toast(COPY.knowledgeEdit.removedToast)
              }}
              onToggleNodeVerified={(path) =>
                revise((data) => {
                  const current = mindmapNodeAt(data as MindmapNodeData, path)
                  return setMindmapNodeVerified(data as MindmapNodeData, path, !current?.verified)
                })
              }
            />
          ) : glossary ? (
            <GlossaryView
              data={glossary}
              book={book}
              revising={revising}
              onEditTerm={(term) => setEditState({ kind: 'term', term })}
              onRemoveTerm={(termId) => {
                revise((data) => removeGlossaryTerm(data as GlossaryData, termId))
                toast(COPY.knowledgeEdit.removedToast)
              }}
              onToggleTermVerified={(termId) =>
                revise((data) => {
                  const current = (data as GlossaryData).terms.find((t) => t.id === termId)
                  return setGlossaryTermVerified(data as GlossaryData, termId, !current?.verified)
                })
              }
            />
          ) : paperBrief ? (
            <PaperBriefView
              data={paperBrief}
              book={book}
              revising={revising}
              onEditTldr={() => setEditState({ kind: 'briefTldr' })}
              onEditEntry={(section, index) => setEditState({ kind: 'briefEntry', section, index })}
              onRemoveEntry={(section, index) => {
                revise((data) => removeBriefEntry(data as PaperBriefData, section, index))
                toast(COPY.knowledgeEdit.removedToast)
              }}
              onToggleEntryVerified={(section, index) =>
                revise((data) => {
                  const list = (data as PaperBriefData)[section]
                  return setBriefEntryVerified(data as PaperBriefData, section, index, !list[index]?.verified)
                })
              }
            />
          ) : null}
        </div>

        {/* 人物侧卡（选中图谱节点后浮现） */}
        {selectedNode && (
          <section className="mt-4 rounded-card border border-outline-variant bg-surface-container-low p-4 animate-slide-up">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-headline-sm text-primary">{selectedNode.name}</h2>
                  {selectedNode.verified && <VerifiedBadge />}
                </div>
                {selectedNode.role && (
                  <p className="font-label text-label-sm text-on-surface-variant">{selectedNode.role}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {revising && (
                  <EntryReviseActions
                    verified={selectedNode.verified}
                    entryLabel={selectedNode.name}
                    onEdit={() => setEditState({ kind: 'node', node: selectedNode })}
                    onRemove={() => {
                      setSelectedNodeId(null)
                      revise((data) => removeGraphNode(data as CharacterGraphData, selectedNode.id))
                      toast(COPY.knowledgeEdit.removedToast)
                    }}
                    onToggleVerified={() =>
                      revise((data) =>
                        setGraphNodeVerified(data as CharacterGraphData, selectedNode.id, !selectedNode.verified)
                      )
                    }
                  />
                )}
                <button
                  aria-label="收起卡片"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                  onClick={() => setSelectedNodeId(null)}
                >
                  <span className="material-symbols-outlined text-icon-sm">close</span>
                </button>
              </div>
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
                        {relation.verified && <VerifiedBadge />}
                        {revising && (
                          <span className="shrink-0 self-center">
                            <button
                              aria-label={`改与${relation.counterpart}的关系`}
                              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors align-middle"
                              onClick={() => {
                                const edge = graph?.edges[relation.index]
                                if (edge) setEditState({ kind: 'edge', index: relation.index, edge })
                              }}
                            >
                              <span className="material-symbols-outlined text-icon-sm">edit</span>
                            </button>
                            <button
                              aria-label={`删与${relation.counterpart}的关系`}
                              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-seal hover:bg-seal-soft/50 transition-colors align-middle"
                              onClick={() => {
                                revise((data) => removeGraphEdge(data as CharacterGraphData, relation.index))
                                toast(COPY.knowledgeEdit.removedToast)
                              }}
                            >
                              <span className="material-symbols-outlined text-icon-sm">delete</span>
                            </button>
                            <button
                              aria-label={relation.verified ? COPY.knowledgeEdit.unverify : COPY.knowledgeEdit.verify}
                              className={`w-7 h-7 inline-flex items-center justify-center rounded-full transition-colors align-middle ${
                                relation.verified
                                  ? 'text-seal hover:bg-seal-soft/50'
                                  : 'text-on-surface-variant hover:text-seal hover:bg-seal-soft/50'
                              }`}
                              style={relation.verified ? { fontVariationSettings: "'FILL' 1" } : undefined}
                              onClick={() =>
                                revise((data) =>
                                  setGraphEdgeVerified(
                                    data as CharacterGraphData,
                                    relation.index,
                                    !relation.verified
                                  )
                                )
                              }
                            >
                              <span className="material-symbols-outlined text-icon-sm">verified</span>
                            </button>
                          </span>
                        )}
                        {target && !revising && (
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

      {/* 条目修订弹窗（改字/删除二合一：删走确认语义但不二次弹窗——修订模式里删是轻操作，重生成才会复活） */}
      {editDialog && (
        <KnowledgeEntryEditDialog
          isOpen={editState != null}
          title={editDialog.title}
          fields={editDialog.fields}
          values={editDialog.values}
          onSave={handleEditSave}
          onCancel={() => setEditState(null)}
        />
      )}
      {editState && editDialog?.removable && (
        <button
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-dialog flex items-center gap-2 px-5 py-2.5 rounded-full border border-seal/60 bg-surface-bright text-seal font-label text-label-md shadow-raised hover:bg-seal-soft/60 transition-colors"
          onClick={handleEditRemove}
        >
          <span className="material-symbols-outlined text-icon-sm">delete</span>
          删除这条
        </button>
      )}

      <ConfirmDialog
        isOpen={confirmRegenerate}
        title={COPY.knowledgeEdit.regenerateOverwriteTitle}
        message={COPY.knowledgeEdit.regenerateOverwriteMessage(manualEdits)}
        confirmLabel={COPY.knowledgeEdit.regenerateConfirm}
        cancelLabel={COPY.knowledgeEdit.regenerateCancel}
        variant="danger"
        onConfirm={() => {
          setConfirmRegenerate(false)
          void doRegenerate()
        }}
        onCancel={() => setConfirmRegenerate(false)}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`删除「${artifact.title}」？`}
        message="这个知识件会从馆藏中消失，可随时重新生成。"
        confirmLabel="删除"
        cancelLabel="留下"
        variant="danger"
        onConfirm={() => {
          setConfirmDelete(false)
          void removeArtifact(book.id, artifact.id).then(() => historyBack(bookDetailPath(book.id)))
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

export default KnowledgePage
