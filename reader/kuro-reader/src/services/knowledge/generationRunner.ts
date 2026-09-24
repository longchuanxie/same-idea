/**
 * 知识库生成执行器：从书本语料到可落库知识件的完整生成流程。
 *
 * 从 useKnowledgeStore 抽出的纯执行体（不碰 store 与 repo，IO 走回调）：
 * - 语料构建与增量范围推导（与原实现逐字同构，错误文案不变）
 * - 分块并发：滑动窗口（CONCURRENT_CHUNKS 路在飞）派发 LLM 请求，
 *   单块流式 + 长超时 + 退避重试；跨块称呼按派发瞬间快照注入
 * - checkpoint：每块完成回报进度与凭据（槽位按块序对齐，未完成 = null，
 *   并发空洞可续跑）；进程被杀后据此只补未完成块
 * - 合并/证据定位/空结果判定 → 产出待落库的完整产物
 */

import { chatCompletionJson, type AiProviderConfig } from '@/services/ai/aiClient'
import { getKnowledgeTask } from '@/services/ai/knowledgeTasks'
import {
  BookCorpusError,
  buildBookCorpus,
  buildDigestCorpus,
  type BookCorpus,
} from '@/services/knowledge/bookCorpus'
import type { GenerationCheckpoint } from '@/services/storage/generationTaskRepo'
import type {
  Book,
  ContentKind,
  KnowledgeArtifact,
  KnowledgeArtifactType,
  KnowledgeGenerationOptions,
} from '@/types'
import { detectContentKindFromChapters } from '@/utils/contentKind'
import {
  normalizeCharacterName,
  resolveBeatsEvidence,
  resolveBriefEvidence,
  resolveGlossaryEvidence,
  resolveGraphEvidence,
  stampBriefChapters,
  stampGlossaryChapters,
  stampPartialChapters,
  type GlossaryPartial,
  type GraphPartial,
  type InterimBeatsData,
  type InterimBriefData,
  type InterimGlossaryData,
  type InterimGraphData,
} from '@/utils/knowledgeMerge'

/** 分块请求失败时的重试次数（单块两次重试：长书几十上百块，瞬时抖动不该毁掉整轮生成） */
const CHUNK_RETRIES = 2
/** 重试退避（毫秒，按次数递增）：给限流与服务端瞬时故障喘息 */
/* eslint-disable no-magic-numbers */
const RETRY_BACKOFF_MS = [2_000, 8_000]
/* eslint-enable no-magic-numbers */
/**
 * 单块请求超时：分块注入 8k 字 + JSON 产出，推理型模型经常跑满两三分钟，
 * 客户端默认 120s 会把本可成功的请求掐死在半路（长网文超时报错的直接来源）。
 */
const CHUNK_TIMEOUT_MS = 300_000
/**
 * 同书分块的并发上限：分块数由全书字数决定后，长书动辄数百块，
 * 串行要跑几个小时；4 路在飞让墙钟时间约为串行的四分之一，
 * 又不至于触发服务商限流（瞬时 429 由重试退避兜住）。
 */
const CONCURRENT_CHUNKS = 4

/** 可取消的退避等待：取消信号一到立即返回（不白等也不悬挂） */
function delayWithAbort(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(done, ms)
    function done(): void {
      window.clearTimeout(timer)
      signal.removeEventListener('abort', done)
      resolve()
    }
    signal.addEventListener('abort', done, { once: true })
  })
}

/** 图谱任务跨块称呼名单上限（提示词体积护栏：名字注入不喧宾夺主） */
const KNOWN_NAMES_MAX = 40
/** 图谱类任务（消费 knownNames + 关系回连已认人物） */
const GRAPH_TASK_TYPES: readonly KnowledgeArtifactType[] = ['character-graph', 'concept-graph']

const RANDOM_ID_RADIX = 36
const RANDOM_ID_SLICE_START = 2
const RANDOM_ID_SLICE_END = 10

export interface KnowledgeGenerationInput {
  book: Book
  type: KnowledgeArtifactType
  options?: KnowledgeGenerationOptions
  config: AiProviderConfig
  signal: AbortSignal
  /** 现有同类型产物：增量合并基底 + 覆盖式落库的旧件清单 */
  existing: KnowledgeArtifact[]
  /** 上次会话中断的进度凭据（无效时执行器自动丢弃重跑） */
  checkpoint?: GenerationCheckpoint | null
  onProgress: (done: number, total: number) => void
  /** 每块完成后的续跑凭据（含已完成块；调用方持久化） */
  onCheckpoint: (checkpoint: GenerationCheckpoint) => Promise<void> | void
}

export type KnowledgeGenerationOutcome =
  | { ok: true; artifact: KnowledgeArtifact; staleArtifactIds: string[] }
  | { ok: false; cancelled?: boolean; error: string }

function makeArtifactId(): string {
  return `kn-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).slice(RANDOM_ID_SLICE_START, RANDOM_ID_SLICE_END)}`
}

const EMPTY_RESULT_HINT: Record<KnowledgeArtifactType, string> = {
  'character-graph': '这本书提不出足够的人物关系（文本里可能没有明确的人物互动）',
  'concept-graph': '这本书提不出足够的概念关系（学术性文本才有清晰的概念网络，可试试切换内容类型）',
  mindmap: '这本书提不出可用的结构大纲',
  glossary: '这本书提不出明确的概念术语（可能不是学术性文本，可试试切换内容类型）',
  'paper-brief': '这篇文本提不出速览卡（贡献、局限与疑问都需要明确的论述文本）',
  'story-beats': '这本书提不出叙事节拍（节拍梳理适合多章长篇，短文看不出结构起伏）',
}

/** 校验 checkpoint 与当前语料仍对齐：书内容变了或块数不一致就整体作废重跑。
 *  全空槽位（所有块都没产出有效片段）的 checkpoint 同样作废——它没有可续跑的
 *  价值，继承它只会把重试变成「零请求再失败一次」。
 *  槽位补齐到当前块数：null 槽（含 checkpoint 长度缺口）一律视为未完成，
 *  并发完成顺序不定，未完成块允许出现在任意位置（中间空洞）。 */
function reconcileCheckpoint(
  checkpoint: GenerationCheckpoint | null | undefined,
  corpus: BookCorpus
): {
  slots: ({ label: string; data: unknown } | null)[]
  knownNames: string[]
  /** 尚未完成的块索引（升序）：并发调度的派发池 */
  pending: number[]
} {
  const total = corpus.chunks.length
  const allIndexes = Array.from({ length: total }, (_, index) => index)
  const hasUsableSlots = checkpoint?.slots.some((slot) => slot?.data != null) ?? false
  const valid =
    checkpoint != null &&
    hasUsableSlots &&
    checkpoint.corpusFingerprint === corpus.fingerprint &&
    checkpoint.corpusChunkCount === total &&
    checkpoint.slots.length <= total
  if (!valid) return { slots: allIndexes.map(() => null), knownNames: [], pending: allIndexes }
  const slots = allIndexes.map((index) => checkpoint.slots[index] ?? null)
  return {
    slots,
    knownNames: checkpoint.knownNames ?? [],
    pending: allIndexes.filter((index) => slots[index] == null),
  }
}

export async function runKnowledgeGeneration(input: KnowledgeGenerationInput): Promise<KnowledgeGenerationOutcome> {
  const { book, type, options, config, signal, existing } = input

  const task = getKnowledgeTask(type)
  const digestMode = task.corpusMode === 'digest'
  // 增量补充的基底：现有同类型产物（旧节点/边先入列，新内容只是并进来）
  const baseArtifact = options?.incremental ? existing[0] : undefined
  const baseData = baseArtifact?.data
  // 增量的默认范围 = 上次生成之后的章节（书还在长，结尾未知故 to 省略）。
  // digest 模式例外：骨架本来就是全本压缩视图、生成只要一次调用，
  // 没有「只补新章」的收益——默认始终整书重梳（显式 scope 仍然尊重）
  const range =
    options?.scope ??
    (digestMode
      ? undefined
      : baseArtifact
        ? { from: baseArtifact.meta?.bookChapterCount ?? baseArtifact.meta?.chapterCount ?? 0 }
        : undefined)

  let corpus: BookCorpus
  try {
    corpus = digestMode ? await buildDigestCorpus(book, range) : await buildBookCorpus(book, range)
  } catch (e) {
    const incrementalEmpty = e instanceof BookCorpusError && e.code === 'empty' && range != null
    const message = incrementalEmpty
      ? '没有发现需要补充的新章节（书还没有更新）'
      : e instanceof BookCorpusError
        ? e.message
        : '读取书本内容失败'
    return { ok: false, error: message }
  }
  // 内容视角：用户显式指定优先，否则按文本启发式检测（小说/学术走不同提示词与任务集）
  const contentKind: ContentKind =
    book.contentKind && book.contentKind !== 'auto'
      ? book.contentKind
      : detectContentKindFromChapters(corpus.chapterTexts)

  const { slots, knownNames, pending } = reconcileCheckpoint(input.checkpoint, corpus)
  const knownNameIds = new Set<string>(knownNames.map((name) => normalizeCharacterName(name)))

  const total = corpus.chunks.length
  let doneCount = total - pending.length
  input.onProgress(doneCount, total)

  const isGraphTask = GRAPH_TASK_TYPES.includes(type)
  /** 首个耗尽重试的块错误（并发下哪个块先失败按完成序，语义一致） */
  let failureMessage: string | null = null
  let cancelled = false
  let cursor = 0

  /** 单块完整流程：请求（重试+退避）→ 解析 → 盖章 → 落槽位 → 回报进度与断点。
   *  返回 'done'/'failed'/'cancelled'，并发工作据此决定是否继续派发。 */
  const runChunk = async (index: number): Promise<'done' | 'failed' | 'cancelled'> => {
    const chunk = corpus.chunks[index]
    // 提示词在派发瞬间构建：拿的是当时的已认称呼快照（同波并发块互不见新名字）
    const messages = task.buildMessages({
      bookTitle: book.title,
      author: book.author || undefined,
      chunkLabel: chunk.label,
      chunkText: chunk.text,
      chunkIndex: index,
      chunkTotal: total,
      contentKind,
      detail: type === 'character-graph' || type === 'concept-graph' ? options?.detail : undefined,
      incremental: Boolean(baseArtifact),
      knownNames: isGraphTask && knownNames.length > 0 ? [...knownNames] : undefined,
    })

    let parsed: unknown | null = null
    let lastError: unknown = null
    for (let attempt = 0; attempt <= CHUNK_RETRIES; attempt++) {
      try {
        const raw = await chatCompletionJson<unknown>(config, {
          messages,
          signal,
          // 流式 + 长超时：长生成不被网关掐断，也不被客户端 120s 默认值误杀
          timeoutMs: CHUNK_TIMEOUT_MS,
          stream: true,
        })
        parsed = task.parsePartial(raw, isGraphTask ? [...knownNames] : undefined)
        lastError = null
        break
      } catch (e) {
        if (signal.aborted) return 'cancelled'
        lastError = e
        if (attempt < CHUNK_RETRIES) {
          await delayWithAbort(RETRY_BACKOFF_MS[attempt], signal)
          if (signal.aborted) return 'cancelled'
        }
      }
    }
    if (lastError != null) {
      const reason = (lastError as Error).message || 'AI 请求失败'
      // 断点已随 checkpoint 落库：重试只补未完成块，长书不必从头再来
      failureMessage = `片段 ${index + 1}/${total} 请求失败：${reason}（稍后重新生成会从该片段继续，已完成部分不重跑）`
      return 'failed'
    }

    if (parsed != null) {
      // 图谱任务滚动累积已确认称呼（跨块提示词 + 关系回连的依据）
      if (isGraphTask) {
        for (const character of (parsed as GraphPartial).characters) {
          const id = normalizeCharacterName(character.name)
          if (id && !knownNameIds.has(id) && knownNames.length < KNOWN_NAMES_MAX) {
            knownNameIds.add(id)
            knownNames.push(character.name)
          }
        }
      }
      // 图谱/术语/速览片段盖上分块覆盖章节（回原文链路：条目的章节并集来源）
      const stamped =
        type === 'character-graph' || type === 'concept-graph'
          ? stampPartialChapters(parsed as GraphPartial, chunk.chapterIndexes)
          : type === 'glossary'
            ? stampGlossaryChapters(parsed as GlossaryPartial, chunk.chapterIndexes)
            : type === 'paper-brief'
              ? stampBriefChapters(parsed as InterimBriefData, chunk.chapterIndexes)
              : parsed
      // 增量的导图分支加前缀，避免与基底里的「片段N」撞名
      const label =
        baseArtifact && type === 'mindmap' && corpus.coveredRange
          ? `第${chunk.chapterIndexes[0] + 1}章起`
          : chunk.label
      slots[index] = { label, data: stamped }
    } else {
      // 该块未产出：占位保持槽位与块序对齐（null 槽 = 未完成，data:null = 完成无为）
      slots[index] = { label: chunk.label, data: null }
    }

    doneCount += 1
    input.onProgress(doneCount, total)
    await input.onCheckpoint({
      slots: [...slots],
      knownNames: [...knownNames],
      corpusFingerprint: corpus.fingerprint,
      corpusChunkCount: total,
    })
    return 'done'
  }

  /** 滑动窗口工作体：只要有待派发块且没有失败/取消，就取下一块补位。
   *  失败即停派（在飞块跑完落断点）；取消即停派（在飞块各自感知 abort 收尾）。 */
  const worker = async (): Promise<void> => {
    for (;;) {
      if (failureMessage != null || cancelled || signal.aborted) return
      const take = cursor
      if (take >= pending.length) return
      cursor += 1
      const outcome = await runChunk(pending[take])
      if (outcome === 'cancelled') cancelled = true
    }
  }
  const workerCount = Math.min(CONCURRENT_CHUNKS, pending.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  if (cancelled) {
    return { ok: false, cancelled: true, error: '已取消' }
  }
  if (failureMessage != null) {
    return { ok: false, error: failureMessage }
  }

  // 续跑时 slots 前段来自 checkpoint（可能含占位 null）：合并前统一收窄
  const partials = slots.slice(0, corpus.chunks.length).filter((slot): slot is { label: string; data: unknown } => slot?.data != null)
  if (partials.length === 0) {
    return { ok: false, error: 'AI 没有返回任何可用的分析结果' }
  }

  // 合并/证据定位/组装全程兜底：任一环抛错必须转成错误结果，
  // 否则任务会永久卡在 running，重入守卫就此锁死该书该类型
  try {
    let data = task.merge(book.title, partials, baseData)
    if (type === 'character-graph' || type === 'concept-graph') {
      // 证据摘句在真实章节文本中校验定位（防幻觉引文），换成可跳转的章内坐标
      data = resolveGraphEvidence(data as InterimGraphData, corpus.chapterTexts)
    } else if (type === 'glossary') {
      data = resolveGlossaryEvidence(data as InterimGlossaryData, corpus.chapterTexts)
    } else if (type === 'paper-brief') {
      data = resolveBriefEvidence(data as InterimBriefData, corpus.chapterTexts)
    } else if (type === 'story-beats') {
      // 骨架摘句是真章子串，优先在节拍自己的章里逐字定位
      data = resolveBeatsEvidence(data as InterimBeatsData, corpus.chapterTexts)
    }
    if (task.isEmpty(data)) {
      return { ok: false, error: EMPTY_RESULT_HINT[type] }
    }

    // 覆盖式落库：复用同类型旧件 id（保留引用稳定性），删除其余同类型件
    const reusedId = existing[0]?.id ?? makeArtifactId()
    const now = new Date()
    const artifact: KnowledgeArtifact = {
      id: reusedId,
      bookId: book.id,
      type,
      title: task.artifactTitle,
      data,
      meta: {
        chapterCount: corpus.coveredChapterCount,
        contentFingerprint: corpus.fingerprint,
        contentKind,
        bookChapterCount: corpus.chapterCount,
        analyzedChunkCount: corpus.chunks.length,
        totalChunkCount: corpus.totalChunkCount,
        ...(corpus.coveredRange ? { scope: corpus.coveredRange } : {}),
        ...((type === 'character-graph' || type === 'concept-graph') && options?.detail
          ? { detail: options.detail }
          : {}),
      },
      generator: 'ai',
      createdAt: existing[0]?.createdAt ?? now,
      updatedAt: now,
    }
    return {
      ok: true,
      artifact,
      staleArtifactIds: existing.filter((old) => old.id !== reusedId).map((old) => old.id),
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '知识件生成失败' }
  }
}
