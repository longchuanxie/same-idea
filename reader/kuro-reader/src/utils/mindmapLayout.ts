/**
 * XMind 风格思维导图布局（纯函数）。
 *
 * 根节点居中，一级分支按子树规模贪心分配到左右两侧（均衡辐射）；
 * 每侧内部为水平树：叶序定 y、深度定列（列宽取该层最大节点宽），
 * 节点宽随文字长度收缩（贴字，XMind 手感）。折叠子树不进布局。
 */

import type { MindmapNodeData } from '@/types'

/** 叶片行距（同侧相邻叶子中心的 y 差） */
export const ROW_HEIGHT = 40
/** 相邻层级列间距 */
export const COLUMN_GAP = 28
/** 根与一级分支之间的主干留白 */
export const TRUNK_GAP = 44
/** 画布四周留白 */
export const CANVAS_PADDING = 28
/** 空图兜底画布宽高 */
export const MIN_CANVAS_WIDTH = 480
export const MIN_CANVAS_HEIGHT = 240

/** 各层级节点规格：字号 / 高度 / 横向内边距（根 → 一级 → 二级 → 三级及以下）。
 *  表值为版式设计参数（XMind 手感的层级梯度），无业务阈值语义。 */
export const DEPTH_SPECS = [
  { fontSize: 16, height: 46, padX: 22 },
  { fontSize: 13, height: 34, padX: 16 },
  { fontSize: 12.5, height: 30, padX: 14 },
  { fontSize: 12, height: 24, padX: 12 },
] as const

/** 节点宽度上限（超长截断加省略号） */
export const TOPIC_MAX_WIDTH = 220
const TOPIC_MIN_WIDTH = 56
/** 半角字符的字宽系数（全角按 1 计） */
const HALF_WIDTH_CHAR_RATIO = 0.62
const ELLIPSIS = '…'

export type MindmapSide = 1 | -1 | 0

export interface LaidOutNode {
  key: string
  depth: number
  title: string
  /** 展示用标题（超宽截断后） */
  displayTitle: string
  detail?: string
  /** 画布坐标（节点中心） */
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  isRoot: boolean
  /** 相对根的方向：1 右 / -1 左 / 0 根 */
  side: MindmapSide
  /** 所属一级分支序号（着色键，根为 -1） */
  branchIndex: number
  hasChildren: boolean
  collapsed: boolean
  /** 折叠后隐藏的后代数 */
  hiddenCount: number
  parentKey?: string
}

export interface MindmapLayout {
  nodes: LaidOutNode[]
  width: number
  height: number
}

/** 文字宽度估算：CJK/全角按字号，半角按系数折算 */
export function estimateTopicWidth(text: string, fontSize: number, padX: number): number {
  let units = 0
  for (const ch of text) {
    units += /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\u3000-\u303F]/.test(ch) ? 1 : HALF_WIDTH_CHAR_RATIO
  }
  return units * fontSize + padX * 2
}

/** 超宽截断：返回展示文案与实际占宽 */
export function fitTopicText(
  text: string,
  fontSize: number,
  padX: number
): { display: string; width: number } {
  const full = estimateTopicWidth(text, fontSize, padX)
  if (full <= TOPIC_MAX_WIDTH) {
    return { display: text, width: Math.max(full, TOPIC_MIN_WIDTH) }
  }
  // 按比例估字符预算，逐字收敛到上限内
  let budget = Math.max(2, Math.floor((text.length * (TOPIC_MAX_WIDTH - padX * 2 - fontSize)) / (full - padX * 2)))
  while (budget > 1 && estimateTopicWidth(`${text.slice(0, budget)}${ELLIPSIS}`, fontSize, padX) > TOPIC_MAX_WIDTH) {
    budget -= 1
  }
  const display = `${text.slice(0, budget)}${ELLIPSIS}`
  return { display, width: Math.max(estimateTopicWidth(display, fontSize, padX), TOPIC_MIN_WIDTH) }
}

/**
 * 展示归一化：根下仅一条"中转分支"（如单片语料的「片段1」）时上提其子树，
 * 让真实主题成为一级分支、吃到完整的层级版式与配色。
 * 返回新对象，不改动入参；多分支或中转分支无子树时原样返回。
 */
export function hoistSingleBranchRoot(root: MindmapNodeData): MindmapNodeData {
  const children = root.children ?? []
  if (children.length !== 1) return root
  const [only] = children
  if (!only.children || only.children.length === 0) return root
  return { ...root, children: only.children }
}

function specOf(depth: number) {
  return DEPTH_SPECS[Math.min(depth, DEPTH_SPECS.length - 1)]
}

function countDescendants(children: MindmapNodeData[]): number {
  let count = 0
  for (const child of children) {
    count += 1 + countDescendants(child.children ?? [])
  }
  return count
}

function countLeaves(node: MindmapNodeData): number {
  const children = node.children ?? []
  if (children.length === 0) return 1
  return children.reduce((sum, child) => sum + countLeaves(child), 0)
}

/**
 * XMind 式导图布局。
 * 折叠子树不参与布局；key 为从根出发的路径序（稳定可寻址）。
 */
export function computeMindmapLayout(root: MindmapNodeData, collapsedKeys: Set<string>): MindmapLayout {
  const nodes: LaidOutNode[] = []

  const rootFit = fitTopicText(root.title, specOf(0).fontSize, specOf(0).padX)
  const rootSpec = specOf(0)

  // 一级分支贪心分流：子树叶子规模小的一侧接新枝，保持两侧高度均衡
  const rootChildren = root.children ?? []
  interface BranchEntry {
    node: MindmapNodeData
    key: string
    branchIndex: number
    side: 1 | -1
  }
  const branches: BranchEntry[] = []
  let rightLeaves = 0
  let leftLeaves = 0
  rootChildren.forEach((child, index) => {
    const leaves = countLeaves(child)
    const side: 1 | -1 = leftLeaves < rightLeaves ? -1 : 1
    if (side === 1) rightLeaves += leaves
    else leftLeaves += leaves
    branches.push({ node: child, key: `0/${index}`, branchIndex: index, side })
  })

  const effectiveChildren = (node: MindmapNodeData, key: string): MindmapNodeData[] =>
    collapsedKeys.has(key) ? [] : node.children ?? []

  // 每侧布局：先收集节点（含宽度），再定 y（叶序）与 x（列宽）
  interface SideDraft {
    node: LaidOutNode
    childKeys: string[]
  }
  const sideDrafts = new Map<1 | -1, SideDraft[]>()
  const draftsByKey = new Map<string, SideDraft>()

  const makeNode = (
    node: MindmapNodeData,
    key: string,
    depth: number,
    side: MindmapSide,
    branchIndex: number,
    parentKey?: string
  ): SideDraft => {
    const spec = specOf(depth)
    const fit = fitTopicText(node.title, spec.fontSize, spec.padX)
    const children = effectiveChildren(node, key)
    const collapsed = collapsedKeys.has(key) && (node.children ?? []).length > 0
    const laid: LaidOutNode = {
      key,
      depth,
      title: node.title,
      displayTitle: fit.display,
      detail: node.detail,
      x: 0,
      y: 0,
      width: fit.width,
      height: spec.height,
      fontSize: spec.fontSize,
      isRoot: depth === 0,
      side,
      branchIndex,
      hasChildren: (node.children ?? []).length > 0,
      collapsed,
      hiddenCount: collapsed ? countDescendants(node.children ?? []) : 0,
      parentKey,
    }
    const draft: SideDraft = { node: laid, childKeys: [] }
    draftsByKey.set(key, draft)
    children.forEach((child, index) => {
      const childDraft = makeNode(child, `${key}/${index}`, depth + 1, side, branchIndex, key)
      draft.childKeys.push(childDraft.node.key)
    })
    return draft
  }

  for (const branch of branches) {
    const draft = makeNode(branch.node, branch.key, 1, branch.side, branch.branchIndex, '0')
    const list = sideDrafts.get(branch.side) ?? []
    list.push(draft)
    sideDrafts.set(branch.side, list)
  }

  const layoutSide = (side: 1 | -1, drafts: SideDraft[]): number => {
    if (drafts.length === 0) return 0
    let leafY = 0
    const assignY = (draft: SideDraft): number => {
      if (draft.childKeys.length === 0) {
        const y = leafY
        leafY += ROW_HEIGHT
        draft.node.y = y
        return y
      }
      const childYs = draft.childKeys.map((key) => assignY(draftsByKey.get(key)!))
      draft.node.y = (childYs[0] + childYs[childYs.length - 1]) / 2
      return draft.node.y
    }
    for (const draft of drafts) assignY(draft)
    const sideLeaves = leafY / ROW_HEIGHT

    // 列宽：每层取该侧最大节点宽，自根向外交错排开
    let colStart = rootFit.width / 2 + TRUNK_GAP
    let prevMax = 0
    const columns = new Map<number, { start: number; max: number }>()
    const depthMax = new Map<number, number>()
    for (const draft of draftsByKey.values()) {
      if (draft.node.side !== side) continue
      depthMax.set(draft.node.depth, Math.max(depthMax.get(draft.node.depth) ?? 0, draft.node.width))
    }
    const orderedDepths = [...depthMax.keys()].sort((a, b) => a - b)
    for (const depth of orderedDepths) {
      const max = depthMax.get(depth) ?? 0
      const start = colStart + prevMax
      columns.set(depth, { start, max })
      colStart = start
      prevMax = max + COLUMN_GAP
    }
    for (const draft of draftsByKey.values()) {
      if (draft.node.side !== side) continue
      const col = columns.get(draft.node.depth)!
      draft.node.x = side * (col.start + draft.node.width / 2)
    }
    return sideLeaves
  }

  const rightLeavesLaid = layoutSide(1, sideDrafts.get(1) ?? [])
  const leftLeavesLaid = layoutSide(-1, sideDrafts.get(-1) ?? [])

  // 两侧各自垂直居中于根
  const rootY = (Math.max(rightLeavesLaid, leftLeavesLaid) * ROW_HEIGHT) / 2
  for (const draft of draftsByKey.values()) {
    const sideHeight = (draft.node.side === 1 ? rightLeavesLaid : leftLeavesLaid) * ROW_HEIGHT
    draft.node.y += rootY - sideHeight / 2
  }

  nodes.push({
    key: '0',
    depth: 0,
    title: root.title,
    displayTitle: rootFit.display,
    detail: root.detail,
    x: 0,
    y: rootY,
    width: rootFit.width,
    height: rootSpec.height,
    fontSize: rootSpec.fontSize,
    isRoot: true,
    side: 0,
    branchIndex: -1,
    hasChildren: rootChildren.length > 0,
    collapsed: false,
    hiddenCount: 0,
  })
  for (const draft of draftsByKey.values()) nodes.push(draft.node)

  // 画布范围：取两侧最远边界
  let halfWidth = rootFit.width / 2 + TRUNK_GAP
  let minY = rootY - rootSpec.height / 2
  let maxY = rootY + rootSpec.height / 2
  for (const node of nodes) {
    if (node.isRoot) continue
    halfWidth = Math.max(halfWidth, Math.abs(node.x) + node.width / 2)
    minY = Math.min(minY, node.y - node.height / 2)
    maxY = Math.max(maxY, node.y + node.height / 2)
  }

  return {
    nodes,
    width: Math.max(halfWidth * 2 + CANVAS_PADDING * 2, MIN_CANVAS_WIDTH),
    height: Math.max(maxY - minY + CANVAS_PADDING * 2 + ROW_HEIGHT, MIN_CANVAS_HEIGHT),
  }
}
