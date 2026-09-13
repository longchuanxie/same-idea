/**
 * 知识任务注册表：定义「从书本内容生成一种知识产物」的完整配方。
 *
 * 每个任务 = 元信息（UI 呈现）+ 分块提示词 + 片段解析 + 合并。
 * 新增产物类型（时间线/设定集/摘要…）时在此追加一个条目即可，
 * 数据层（knowledgeRepo）、Store（useKnowledgeStore）与页面均按注册表驱动。
 */

import type {
  CharacterGraphData,
  ContentKind,
  GlossaryData,
  GraphDetailLevel,
  KnowledgeArtifactType,
  MindmapNodeData,
  PaperBriefData,
} from '@/types'
import {
  isBriefEmpty,
  mergeBriefs,
  mergeCharacterGraphs,
  mergeGlossary,
  mergeMindmapBranches,
  parseBriefPartial,
  parseGlossaryPartial,
  parseGraphPartial,
  parseMindmapPartial,
  type GlossaryPartial,
  type GraphPartial,
  type InterimBriefData,
  type InterimGlossaryData,
  type InterimGraphData,
} from '@/utils/knowledgeMerge'

export interface KnowledgeTaskChunkInput {
  bookTitle: string
  author?: string
  chunkLabel: string
  chunkText: string
  chunkIndex: number
  chunkTotal: number
  /** 内容视角：小说=人物情节 / 学术=论点术语（决定提示词侧重） */
  contentKind: ContentKind
  /** 图谱详细度（仅 character-graph 消费；core=只主要人物 / rich=含重要配角） */
  detail?: GraphDetailLevel
  /** 本片段是否为增量补充的新内容（提示词侧重"接续既有认知"） */
  incremental?: boolean
}

export interface KnowledgeChatMessage {
  role: 'system' | 'user'
  content: string
}

/**
 * 知识产物配方。parsePartial/merge 的类型收窄内聚在各任务实现里，
 * 注册表对 Store 暴露统一形状（片段数据对外视为 unknown）。
 */
export interface KnowledgeTask {
  type: KnowledgeArtifactType
  /** UI 名称 */
  label: string
  /** Material Symbols 图标名 */
  icon: string
  /** 一句话说明（生成入口按钮副标） */
  hint: string
  /** 适用内容视角：小说=人物情节 / 学术=论点术语 */
  kinds: ContentKind[]
  /** 产物默认标题 */
  artifactTitle: string
  buildMessages(input: KnowledgeTaskChunkInput): KnowledgeChatMessage[]
  /** 解析单块回复；形状不对返回 null（该块作废但不中断） */
  parsePartial(raw: unknown): unknown | null
  /** 合并全部有效片段为最终数据；base 为增量合并的基底（现有产物数据） */
  merge(bookTitle: string, partials: { label: string; data: unknown }[], base?: unknown): CharacterGraphData | MindmapNodeData | GlossaryData | PaperBriefData
  /** 结果为空判断（空结果不落库，直接报「提不出」） */
  isEmpty(data: CharacterGraphData | MindmapNodeData | GlossaryData | PaperBriefData): boolean
}

/** 提示词中分块正文注入上限（与 bookCorpus 分块粒度解耦：块 6k 字，注入 8k 余量） */
const PROMPT_TEXT_LIMIT_CHARS = 8000

const CHARACTER_SYSTEM_PROMPT = [
  '你是一位严谨的文学分析助手，任务是从书籍片段中提取人物与人物关系。',
  '只依据文本中明确出现或直接陈述的信息，不推测、不补充原作之外的知识。',
  '严格只输出一个 JSON 对象，不要输出任何解释、前后缀或代码围栏。',
].join('\n')

const CONCEPT_SYSTEM_PROMPT = [
  '你是一位严谨的学术阅读助手，任务是从书籍片段中提取核心概念与概念之间的关系。',
  '只依据文本中明确出现或直接陈述的信息，不推测、不补充原作之外的知识。',
  '严格只输出一个 JSON 对象，不要输出任何解释、前后缀或代码围栏。',
].join('\n')

const MINDMAP_SYSTEM_PROMPT = [
  '你是一位严谨的读书笔记助手，任务是把书籍片段整理成层次化大纲（思维导图分支）。',
  '只概括文本中出现的内容，按「主题 → 要点 → 细节」组织。',
  '严格只输出一个 JSON 对象，不要输出任何解释、前后缀或代码围栏。',
].join('\n')

function bookLine(input: KnowledgeTaskChunkInput): string {
  const authorPart = input.author ? `（作者：${input.author}）` : ''
  return `书名：《${input.bookTitle}》${authorPart}。本片段为全书第 ${input.chunkIndex + 1}/${input.chunkTotal} 部分。`
}

/** 实体提取类任务（人物图谱/概念图谱）的详细度要求：人物或概念的取舍上限 */
function detailRequirement(detail: KnowledgeTaskChunkInput['detail']): string {
  if (detail === 'core') return '- 只保留书中最核心的主实体（至多 8 个），一次性的次要实体不收'
  if (detail === 'rich') return '- 尽量完整地提取有明确信息的实体（至多 24 个），含重要的次要实体'
  return '- 只提取本片段中出场、被提及且有明确信息的实体，至多 15 个'
}

const characterGraphTask: KnowledgeTask = {
  type: 'character-graph',
  label: '人物关系图谱',
  icon: 'hub',
  hint: '出场人物、身份与彼此关系，一图看全',
  kinds: ['fiction'],
  artifactTitle: '人物关系图谱',
  buildMessages: (input) => [
    { role: 'system', content: CHARACTER_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        bookLine(input),
        '',
        '请从下面的片段中提取出场人物与人物关系，输出 JSON：',
        '{"characters":[{"name":"人物名（用原文最常用称呼）","role":"身份或阵营（≤20字）","description":"一句话小传（≤60字）"}],"relationships":[{"source":"人物A","target":"人物B","relation":"关系（师徒/恋人/父子/敌对等，2-8字）","description":"依据（≤40字）","evidence":"支撑该关系的原文短句（从片段正文逐字摘录，≤30字）"}]}',
        '要求：',
        // 详细度决定人物取舍（用户对图谱"看主次"的核心诉求）
        detailRequirement(input.detail),
        '- 关系只记录有直接互动或文本明确陈述的，两端人物必须在 characters 里',
        '- evidence 必须逐字摘自片段正文，不要改写、不要翻译、不要自行补全',
        '- 没有人物关系时 relationships 可为空数组，但 characters 给出出场人物',
        '',
        '片段正文：',
        input.chunkText.slice(0, PROMPT_TEXT_LIMIT_CHARS),
      ].join('\n'),
    },
  ],
  parsePartial: (raw) => parseGraphPartial(raw),
  merge: (_bookTitle, partials, base) =>
    mergeCharacterGraphs(
      partials.map((partial) => partial.data as GraphPartial),
      base as InterimGraphData | undefined
    ),
  isEmpty: (data) => {
    const graph = data as CharacterGraphData
    return graph.nodes.length === 0 || graph.edges.length === 0
  },
}

/** 概念关系图谱：学术读者的"人物图谱"——概念为点、上位/组成/依赖/对比为边，证据回原文 */
const conceptGraphTask: KnowledgeTask = {
  type: 'concept-graph',
  label: '概念关系图谱',
  icon: 'share',
  hint: '概念织成网络：上位、组成、依赖与对比，一点回原文',
  kinds: ['academic'],
  artifactTitle: '概念关系图谱',
  buildMessages: (input) => [
    { role: 'system', content: CONCEPT_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        bookLine(input),
        '',
        '请从下面的片段中提取核心概念与概念之间的关系，输出 JSON：',
        '{"characters":[{"name":"概念名（用书中原文用词）","role":"概念类别（机制/模型/度量/方法/现象等，≤12字）","description":"一句话解释（≤60字）"}],"relationships":[{"source":"概念A","target":"概念B","relation":"关系类型（上位/组成/依赖/对比/相关，2-4字）","description":"关系说明（≤40字）","evidence":"支撑该关系的原文短句（从片段正文逐字摘录，≤30字）"}]}',
        '要求：',
        detailRequirement(input.detail),
        '- 关系必须有文本依据，两端概念必须在 characters 里；is-a 用「上位」、part-of 用「组成」、依赖/前提用「依赖」、对照用「对比」',
        '- evidence 必须逐字摘自片段正文，不要改写、不要翻译、不要自行补全',
        '- 没有明确概念关系时 relationships 可为空数组，但 characters 给出核心概念',
        '',
        '片段正文：',
        input.chunkText.slice(0, PROMPT_TEXT_LIMIT_CHARS),
      ].join('\n'),
    },
  ],
  // 概念图与人物图同构：解析/合并直接复用图谱机械（人名归一化即概念名归一化）
  parsePartial: (raw) => parseGraphPartial(raw),
  merge: (_bookTitle, partials, base) =>
    mergeCharacterGraphs(
      partials.map((partial) => partial.data as GraphPartial),
      base as InterimGraphData | undefined
    ),
  isEmpty: (data) => {
    const graph = data as CharacterGraphData
    return graph.nodes.length === 0 || graph.edges.length === 0
  },
}

const mindmapTask: KnowledgeTask = {
  type: 'mindmap',
  label: '全书思维导图',
  icon: 'account_tree',
  hint: '情节、人物与设定织成的层次大纲',
  kinds: ['fiction', 'academic'],
  artifactTitle: '全书思维导图',
  buildMessages: (input) => [
    { role: 'system', content: MINDMAP_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        `${bookLine(input)}（${input.chunkLabel}）`,
        '',
        '请把下面的片段整理成思维导图分支，输出 JSON：',
        '{"title":"本部分主题（≤14字）","children":[{"title":"要点（≤14字）","detail":"一句话补充（≤40字，可省略）","children":[]}]}',
        '要求：',
        // 内容视角决定导图的「肉」：小说读者要情节回顾，学术读者要论证链条
        ...(input.contentKind === 'academic'
          ? [
              '- 层级不超过 3 层，每层至多 8 个子节点',
              '- 按「核心论点 → 分论点/论证 → 证据与方法」组织，呈现作者的推理链',
              '- 关键定义、实验/数据、反例与局限单独成枝',
            ]
          : [
              '- 层级不超过 3 层，每层至多 8 个子节点',
              '- 覆盖主要情节推进、关键人物动向、重要设定三类内容',
            ]),
        '- 节点标题使用短语，不要整句；叶子节点的 children 省略',
        '',
        '片段正文：',
        input.chunkText.slice(0, PROMPT_TEXT_LIMIT_CHARS),
      ].join('\n'),
    },
  ],
  parsePartial: (raw) => parseMindmapPartial(raw),
  merge: (bookTitle, partials, base) =>
    mergeMindmapBranches(
      bookTitle,
      partials.map((partial) => ({ label: partial.label, tree: partial.data as MindmapNodeData })),
      base as MindmapNodeData | undefined
    ),
  isEmpty: (data) => (data as MindmapNodeData).children?.length === 0,
}

const GLOSSARY_SYSTEM_PROMPT = [
  '你是一位严谨的学术阅读助手，任务是从书籍片段中提取关键概念与术语。',
  '只提取片段中正式出现或反复使用的概念，定义必须来自书中表述，不引入外部知识。',
  '严格只输出一个 JSON 对象，不要输出任何解释、前后缀或代码围栏。',
].join('\n')

const glossaryTask: KnowledgeTask = {
  type: 'glossary',
  label: '概念术语卡',
  icon: 'abc',
  hint: '关键概念与书内定义，一点回原文',
  kinds: ['academic'],
  artifactTitle: '概念术语卡',
  buildMessages: (input) => [
    { role: 'system', content: GLOSSARY_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        `${bookLine(input)}（${input.chunkLabel}）`,
        '',
        '请从下面的片段中提取本书的关键概念与术语，输出 JSON：',
        '{"terms":[{"term":"术语（用书中原文用词）","definition":"书中给出的定义或解释（≤60字）","evidence":"定义所在的原文短句（从片段正文逐字摘录，≤30字）"}]}',
        '要求：',
        '- 只提取反复出现或首次被正式定义的概念，至多 12 个',
        '- definition 用书中的表述概括，不要外部知识',
        '- evidence 必须逐字摘自片段正文，不要改写',
        '',
        '片段正文：',
        input.chunkText.slice(0, PROMPT_TEXT_LIMIT_CHARS),
      ].join('\n'),
    },
  ],
  parsePartial: (raw) => parseGlossaryPartial(raw),
  merge: (_bookTitle, partials, base) =>
    mergeGlossary(partials.map((partial) => partial.data as GlossaryPartial), base as InterimGlossaryData | undefined),
  isEmpty: (data) => (data as GlossaryData).terms.length === 0,
}

/** 论文速览：研究型读者的读前分流与批判性阅读——自闭环，全部条目可回原文 */
const paperBriefTask: KnowledgeTask = {
  type: 'paper-brief',
  label: '论文速览与批判',
  icon: 'rate_review',
  hint: 'TL;DR、贡献强度、局限与审稿人问题——读完即带走',
  kinds: ['academic'],
  artifactTitle: '论文速览',
  buildMessages: (input) => [
    {
      role: 'system',
      content: [
        '你是一位严谨的学术评审助手，任务是为研究者生成论文速览与批判性阅读卡。',
        '只依据文本中明确出现或直接陈述的信息，不推测、不补充论文之外的知识（不引用外部文献、不编造实验数字）。',
        '严格只输出一个 JSON 对象，不要输出任何解释、前后缀或代码围栏。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        bookLine(input),
        '',
        '请阅读下面的片段，输出 JSON：',
        '{"tldr":"一句话速览：解决什么问题、用什么方法、结果强在哪（≤80字）","contributions":[{"point":"贡献点（≤50字）","strength":"支撑强度：experiment=有实验支撑/theory=有理论证明/partial=部分支撑/claim=仅声称","evidence":"支撑该贡献的原文短句（逐字摘录，≤30字）"}],"limitations":[{"point":"局限或软肋（≤50字），含论文自认的 limitation 与你依据文本指出的软肋","evidence":"依据的原文短句（逐字摘录，≤30字，可省略）"}],"questions":[{"question":"研究者视角的疑问（≤60字），如方法选择依据、基线公平性、泛化性","evidence":"疑问指向的原文短句（逐字摘录，≤30字，可省略）"}]}',
        '要求：',
        '- contributions 2-4 条，limitations 2-4 条，questions 2-4 条',
        '- evidence 必须逐字摘自片段正文，不要改写、不要翻译；找不到依据就省略该字段',
        '- limitations 要区分论文自认与文本可见的软肋，不要凭空质疑',
        '- questions 站在研究者/审稿人视角，问到方法与实验的关键决策上',
        '',
        '片段正文：',
        input.chunkText.slice(0, PROMPT_TEXT_LIMIT_CHARS),
      ].join('\n'),
    },
  ],
  parsePartial: (raw) => parseBriefPartial(raw),
  merge: (_bookTitle, partials, base) =>
    mergeBriefs(partials.map((partial) => partial.data as InterimBriefData), base as InterimBriefData | undefined),
  isEmpty: (data) => isBriefEmpty(data as PaperBriefData),
}

/** 注册表：新产物类型在此追加 */
export const KNOWLEDGE_TASKS: Record<KnowledgeArtifactType, KnowledgeTask> = {
  'character-graph': characterGraphTask,
  'paper-brief': paperBriefTask,
  'concept-graph': conceptGraphTask,
  mindmap: mindmapTask,
  glossary: glossaryTask,
}

export function getKnowledgeTask(type: KnowledgeArtifactType): KnowledgeTask {
  return KNOWLEDGE_TASKS[type]
}

/** 某内容视角下可生成的任务（学术书不摆人物图谱，小说书不摆术语卡） */
export function getKnowledgeTasksForKind(kind: ContentKind): KnowledgeTask[] {
  return Object.values(KNOWLEDGE_TASKS).filter((task) => task.kinds.includes(kind))
}
