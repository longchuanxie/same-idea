import React, { useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { GenerationOptionsSheet } from '@/components/molecules/knowledge/GenerationOptionsSheet'
import { COPY } from '@/constants/copy'
import { settingsPath, knowledgePath } from '@/constants/routes'
import { isProviderConfigured } from '@/services/ai/aiClient'
import { KNOWLEDGE_TASKS, getKnowledgeTasksForKind } from '@/services/ai/knowledgeTasks'
import { getPdfPageTexts } from '@/services/pdfText'
import { loadTextContent } from '@/services/textContent'
import { useAppStore } from '@/stores/useAppStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type { Book, ContentKind, ContentKindPreference, KnowledgeArtifact, KnowledgeArtifactType, KnowledgeGenerationOptions } from '@/types'
import { detectBookContentKind } from '@/utils/contentKind'
import { toast } from '@/utils/toast'

/**
 * 档案卡「知识库」区块：按内容类型分流生成入口。
 * 小说 → 人物图谱 + 情节导图；学术 → 论证导图 + 概念术语卡。
 * 内容类型自动检测（启发式），档案卡上一键切换并随书记忆；
 * 已生成的其他类型产物仍可直达查看。
 */

const PERCENT_BASE = 100

const KIND_OPTIONS: { value: ContentKindPreference; label: string }[] = [
  { value: 'auto', label: '自动' },
  { value: 'fiction', label: '小说' },
  { value: 'academic', label: '学术' },
]

const KIND_BADGE: Record<ContentKind, string> = {
  fiction: '小说视角',
  academic: '学术视角',
}

function formatTimestamp(value: Date | string): string {
  return new Date(value).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

function ensureAiConfiguredOrHint(navigate: (path: string) => void): boolean {
  const { settings } = useAppStore.getState()
  const ready = isProviderConfigured({
    baseUrl: settings.knowledgeAiUrl,
    apiKey: settings.knowledgeAiKey,
    model: settings.knowledgeAiModel,
  })
  if (!ready) {
    toast('先到设置里配好知识库 AI 服务（服务地址 + 模型），再来点亮知识库')
    navigate(settingsPath('ai'))
  }
  return ready
}

interface TaskCardProps {
  book: Book
  type: KnowledgeArtifactType
  label: string
  icon: string
  hint: string
  artifact?: KnowledgeArtifact
  running: boolean
  done: number
  total: number
  error?: string
  /** 原书章数（未知 null）——增量补充的时机判断 */
  totalChapters: number | null
}

const TaskCard: React.FC<TaskCardProps> = ({
  book,
  type,
  label,
  icon,
  hint,
  artifact,
  running,
  done,
  total,
  error,
  totalChapters,
}) => {
  const navigate = useNavigate()
  const generateArtifact = useKnowledgeStore((s) => s.generateArtifact)
  const cancelGeneration = useKnowledgeStore((s) => s.cancelGeneration)
  const [optionsOpen, setOptionsOpen] = useState(false)
  /** 覆盖式生成前的「盖掉手工修订」确认（增量补充不需要——旧件数据是合并基底） */
  const [pendingOptions, setPendingOptions] = useState<KnowledgeGenerationOptions | null>(null)
  const manualEdits = artifact?.manualEditCount ?? 0

  const handleCardClick = () => {
    if (running) return
    if (artifact) {
      navigate(knowledgePath(book.id, artifact.id))
      return
    }
    if (!ensureAiConfiguredOrHint(navigate)) return
    void generateArtifact(book, type)
  }

  const runGenerate = (options?: KnowledgeGenerationOptions) => {
    if (!ensureAiConfiguredOrHint(navigate)) return
    void generateArtifact(book, type, options)
  }

  const requestGenerate = (options?: KnowledgeGenerationOptions) => {
    if (!options?.incremental && manualEdits > 0) {
      setPendingOptions(options ?? {})
      return
    }
    runGenerate(options)
  }

  const startWithOptions = (options: KnowledgeGenerationOptions) => {
    setOptionsOpen(false)
    requestGenerate(options)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={artifact ? `查看${label}` : `生成${label}`}
      className="relative p-4 rounded-card border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer text-left"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="flex items-center gap-3 mb-1.5">
        <span className="material-symbols-outlined text-icon-md text-primary">{icon}</span>
        <span className="font-label text-label-md text-primary flex-1">{label}</span>
        {artifact && !running && (
          <button
            aria-label={`重新生成${label}`}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              requestGenerate()
            }}
          >
            <span className="material-symbols-outlined text-icon-sm">refresh</span>
          </button>
        )}
        {!running && (
          <button
            aria-label={`自定义生成${label}`}
            title="自定义范围与详细度"
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setOptionsOpen(true)
            }}
          >
            <span className="material-symbols-outlined text-icon-sm">tune</span>
          </button>
        )}
      </div>
      <p className="font-label text-label-sm text-on-surface-variant">{hint}</p>

      {/* 范围/增量的产物态摘要：让"这份图谱覆盖了什么"一眼可见 */}
      {artifact && !running && artifact.meta?.scope && (
        <p className="font-label text-label-xs text-on-surface-faint mt-1">
          覆盖第 {(artifact.meta.scope.from ?? 0) + 1}-{(artifact.meta.scope.to ?? 0) + 1} 章
          {artifact.meta.detail === 'core' ? ' · 核心版' : artifact.meta.detail === 'rich' ? ' · 详尽版' : ''}
        </p>
      )}
      {/* 分析完整性对账：块被体量护栏截断时必须显性告警，不能静默丢章节 */}
      {artifact && !running &&
        artifact.meta?.totalChunkCount != null &&
        artifact.meta.totalChunkCount > (artifact.meta.analyzedChunkCount ?? 0) && (
          <p className="font-label text-label-xs text-seal mt-1">
            ⚠ 体量护栏：仅分析 {artifact.meta.analyzedChunkCount}/{artifact.meta.totalChunkCount} 块——
            可用 tune 按起止章分批生成完整分析
          </p>
        )}
      {artifact && !running && !artifact.meta?.scope && hasNewChaptersHint(totalChapters, artifact) && (
        <p className="font-label text-label-xs text-seal mt-1">
          书有更新——点 tune 图标可只补新章节
        </p>
      )}

      {artifact && !running && !error && (
        <p className="font-label text-label-sm text-on-surface-faint mt-2">
          已生成 · {formatTimestamp(artifact.updatedAt)}
        </p>
      )}

      {running && (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label text-label-sm text-on-surface">
              通读中 {done}/{total} 段
            </span>
            <button
              className="font-label text-label-sm text-on-surface-variant hover:text-seal transition-colors"
              onClick={() => cancelGeneration(book.id, type)}
            >
              取消
            </button>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round((done / Math.max(total, 1)) * PERCENT_BASE)}%` }}
            />
          </div>
        </div>
      )}

      {error && !running && (
        <p className="font-label text-label-sm text-seal mt-2 line-clamp-2">{error}</p>
      )}

      <GenerationOptionsSheet
        book={book}
        type={type}
        label={label}
        artifact={artifact}
        totalChapters={totalChapters}
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onStart={startWithOptions}
      />

      <ConfirmDialog
        isOpen={pendingOptions != null}
        title={COPY.knowledgeEdit.regenerateOverwriteTitle}
        message={COPY.knowledgeEdit.regenerateOverwriteMessage(manualEdits)}
        confirmLabel={COPY.knowledgeEdit.regenerateConfirm}
        cancelLabel={COPY.knowledgeEdit.regenerateCancel}
        variant="danger"
        onConfirm={() => {
          const options = pendingOptions
          setPendingOptions(null)
          runGenerate(options ?? undefined)
        }}
        onCancel={() => setPendingOptions(null)}
      />
    </div>
  )
}

/** 书在产物生成之后又长出了新章节（连载场景：增量补充的时机提示；章数来自正文实况） */
function hasNewChaptersHint(totalChapters: number | null, artifact: KnowledgeArtifact): boolean {
  const base = artifact.meta?.bookChapterCount ?? artifact.meta?.chapterCount
  return totalChapters != null && base != null && totalChapters > base
}

export const KnowledgeSection: React.FC<{ book: Book }> = ({ book }) => {
  const { artifactsByBook, generation, loadArtifacts } = useKnowledgeStore()
  const updateBook = useLibraryStore((s) => s.updateBook)
  const preference: ContentKindPreference = book.contentKind ?? 'auto'
  const [effectiveKind, setEffectiveKind] = useState<ContentKind>(
    preference === 'auto' ? 'fiction' : preference
  )
  // 真实章数：book.chapters 对文本书不可靠（可能是整书单章），
  // 完整性提示（增量时机/起止章上限）必须基于正文实际章数
  const [totalChapters, setTotalChapters] = useState<number | null>(null)

  useEffect(() => {
    void loadArtifacts(book.id)
  }, [book.id, loadArtifacts])

  useEffect(() => {
    let cancelled = false
    if (book.format === 'text') {
      void loadTextContent(book.id).then((result) => {
        if (!cancelled) setTotalChapters(result.chapters.length)
      })
    } else if (book.format === 'pdf') {
      void getPdfPageTexts(book.id).then((pages) => {
        if (!cancelled) setTotalChapters(pages.length)
      })
    }
    return () => {
      cancelled = true
    }
  }, [book])

  // 自动模式：后台读正文采样检测内容类型（显式指定则直接采用）
  useEffect(() => {
    if (preference !== 'auto') {
      setEffectiveKind(preference)
      return
    }
    let cancelled = false
    void detectBookContentKind(book).then((kind) => {
      if (!cancelled) setEffectiveKind(kind)
    })
    return () => {
      cancelled = true
    }
  }, [book, preference])

  const artifacts = useMemo(() => artifactsByBook[book.id] ?? [], [artifactsByBook, book.id])
  const supported = book.format === 'text' || book.format === 'pdf'

  // 当前视角的任务 + 其他视角已生成的产物（保证旧件可达）
  const tasks = useMemo(() => {
    const kindTasks = getKnowledgeTasksForKind(effectiveKind)
    const extras = Object.values(KNOWLEDGE_TASKS).filter(
      (task) => !task.kinds.includes(effectiveKind) && artifacts.some((a) => a.type === task.type)
    )
    return [...kindTasks, ...extras]
  }, [effectiveKind, artifacts])

  return (
    <section className="py-8 border-t border-outline-variant animate-fade-in stagger-3">
      <div className="flex justify-between items-baseline mb-2">
        <h2 className="font-display text-headline-md text-primary">知识库</h2>
        <span className="font-label text-label-sm text-on-surface-variant">
          {KIND_BADGE[effectiveKind]} · 由 AI 通读本书生成
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <p className="font-label text-label-sm text-on-surface-variant">
          {effectiveKind === 'academic'
            ? '论点织成导图，术语汇成卡片——都能一点回原文。'
            : '人物一图看全，情节织成导图——生成后可导出 Markdown 嫁接 Obsidian。'}
        </p>
        {supported && (
          <div className="flex items-center gap-1 p-1 rounded-full border border-outline-variant bg-surface-container-low">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-pressed={preference === option.value}
                className={`chip px-3 py-1 ${
                  preference === option.value
                    ? 'chip-active'
                    : ''
                }`}
                onClick={() => void updateBook(book.id, { contentKind: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {supported ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const state = generation[`${book.id}:${task.type}`]
            return (
              <TaskCard
                key={task.type}
                book={book}
                type={task.type}
                label={task.label}
                icon={task.icon}
                hint={task.hint}
                artifact={artifacts.find((a) => a.type === task.type)}
                running={state?.status === 'running'}
                done={state?.done ?? 0}
                total={state?.total ?? 0}
                error={state?.status === 'error' ? state.error : undefined}
                totalChapters={totalChapters}
              />
            )
          })}
        </div>
      ) : (
        <p className="p-4 rounded-card border border-dashed border-outline-variant font-label text-label-sm text-on-surface-variant">
          漫画还没有可分析的文本层——先长按页面试试「识别本页文字」，等 OCR 文字攒起来就能进知识库。
        </p>
      )}
    </section>
  )
}

export default KnowledgeSection
