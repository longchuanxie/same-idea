/**
 * 人物图谱力导向布局（Fruchterman-Reingold 简化版）。
 *
 * 纯函数 + 确定性种子初始化：同一图谱数据永远得到同一布局，
 * 免去动画模拟的状态管理，也便于快照测试。
 */

export interface LayoutNodeRef {
  id: string
  /** 重要性权重 0..1（节点越大越居中心） */
  weight?: number
}

export interface LayoutEdgeRef {
  source: string
  target: string
}

export interface Point {
  x: number
  y: number
}

const ITERATIONS = 320
/** 初始温度（单步位移上限）与布局边距占画布比例 */
const TEMP_RATIO = 0.12
const GRAVITY = 0.06
const PADDING_RATIO = 0.08
const IDEAL_K_FACTOR = 0.85
const MIN_DISTANCE = 0.01
/** 圆环初始化半径占短边比例 */
const INIT_RADIUS_RATIO = 0.4
/** 初始抖动占半径比例（打破正多边形对称） */
const INIT_JITTER_RATIO = 0.3
/** 单位区间中点（把 0..1 随机数平移到 -0.5..0.5） */
const UNIT_INTERVAL_MID = 0.5
/** 向心重力基线（权重 0 的节点也保底受半份重力） */
const GRAVITY_WEIGHT_BASE = 0.5
/** 节点渲染半径（与 CharacterGraphView 一致，供碰撞松弛与命中区共用） */
export const NODE_RADIUS_BASE = 16
export const NODE_RADIUS_SPAN = 16
/** 碰撞松弛的最小间隙与迭代上限 */
const COLLISION_GAP = 8
const COLLISION_ITERATIONS = 160

/** 节点渲染半径：布局碰撞检测与视图绘制必须用同一把尺子 */
export function graphNodeRadius(weight: number | undefined): number {
  return NODE_RADIUS_BASE + (weight ?? 0) * NODE_RADIUS_SPAN
}

/** 伪随机数生成器（mulberry32）：同一种子产出同一序列，保证布局确定性。
 *  函数体内的常量是算法规定的位混淆参数，非业务阈值（手法同 revisit.ts）。 */
/* eslint-disable no-magic-numbers */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a 哈希：多项式累积与进制位权是算法参数，非业务阈值 */
function hashSeed(ids: string[]): number {
  let hash = 0x811c9dc5
  for (const id of ids) {
    for (let i = 0; i < id.length; i++) {
      hash ^= id.charCodeAt(i)
      hash = Math.imul(hash, 0x01000193) >>> 0
    }
  }
  return hash
}
/* eslint-enable no-magic-numbers */

/** 计算力导向布局；输入引用了不存在的端点的边会被忽略 */
export function computeForceLayout(
  nodes: LayoutNodeRef[],
  edges: LayoutEdgeRef[],
  width: number,
  height: number
): Record<string, Point> {
  const count = nodes.length
  if (count === 0) return {}
  if (count === 1) return { [nodes[0].id]: { x: width / 2, y: height / 2 } }

  const random = mulberry32(hashSeed(nodes.map((n) => n.id)))
  const radius = Math.min(width, height) * INIT_RADIUS_RATIO
  const positions: Record<string, Point> = {}
  const ids: string[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    // 圆环初始化 + 少量抖动打破对称
    positions[nodes[i].id] = {
      x: width / 2 + Math.cos(angle) * radius + (random() - UNIT_INTERVAL_MID) * radius * INIT_JITTER_RATIO,
      y: height / 2 + Math.sin(angle) * radius + (random() - UNIT_INTERVAL_MID) * radius * INIT_JITTER_RATIO,
    }
    ids.push(nodes[i].id)
  }

  const idSet = new Set(ids)
  const validEdges = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target) && e.source !== e.target)
  const k = IDEAL_K_FACTOR * Math.sqrt((width * height) / count)
  const startTemp = Math.min(width, height) * TEMP_RATIO

  for (let step = 0; step < ITERATIONS; step++) {
    const temp = startTemp * (1 - step / ITERATIONS)
    const displacement: Record<string, Point> = {}
    for (const id of ids) displacement[id] = { x: 0, y: 0 }

    // 斥力（所有点对）
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = positions[ids[i]]
        const b = positions[ids[j]]
        let dx = a.x - b.x
        let dy = a.y - b.y
        let dist = Math.hypot(dx, dy)
        if (dist < MIN_DISTANCE) {
          dx = random() - UNIT_INTERVAL_MID
          dy = random() - UNIT_INTERVAL_MID
          dist = MIN_DISTANCE
        }
        const force = (k * k) / dist
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        displacement[ids[i]].x += fx
        displacement[ids[i]].y += fy
        displacement[ids[j]].x -= fx
        displacement[ids[j]].y -= fy
      }
    }

    // 引力（边）+ 向心重力（权重高的更靠中心）
    for (const edge of validEdges) {
      const a = positions[edge.source]
      const b = positions[edge.target]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.max(Math.hypot(dx, dy), MIN_DISTANCE)
      const force = (dist * dist) / k
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      displacement[edge.source].x -= fx
      displacement[edge.source].y -= fy
      displacement[edge.target].x += fx
      displacement[edge.target].y += fy
    }
    for (const node of nodes) {
      const weight = node.weight ?? 0
      const p = positions[node.id]
      displacement[node.id].x += (width / 2 - p.x) * GRAVITY * (GRAVITY_WEIGHT_BASE + weight)
      displacement[node.id].y += (height / 2 - p.y) * GRAVITY * (GRAVITY_WEIGHT_BASE + weight)
    }

    // 限温应用位移
    for (const id of ids) {
      const d = displacement[id]
      const len = Math.hypot(d.x, d.y)
      if (len < MIN_DISTANCE) continue
      const limited = Math.min(len, temp)
      positions[id].x += (d.x / len) * limited
      positions[id].y += (d.y / len) * limited
    }
  }

  // 归一化到带边距的画布内
  const paddingX = width * PADDING_RATIO
  const paddingY = height * PADDING_RATIO
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const id of ids) {
    const p = positions[id]
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const spanX = Math.max(maxX - minX, 1)
  const spanY = Math.max(maxY - minY, 1)
  const innerW = width - paddingX * 2
  const innerH = height - paddingY * 2
  const normalized: Record<string, Point> = {}
  for (const id of ids) {
    const p = positions[id]
    normalized[id] = {
      x: paddingX + ((p.x - minX) / spanX) * innerW,
      y: paddingY + ((p.y - minY) / spanY) * innerH,
    }
  }

  // 碰撞松弛：FR 收敛不保证圆不重叠（枢纽周围的叶尤其容易叠），
  // 在最终画布坐标上按「半径和 + 间隙」推开重叠对，直到无重叠或到达迭代上限。
  // 确定性：逐对按 id 序处理，不用随机数。
  const weightById = new Map(nodes.map((n) => [n.id, n.weight]))
  const clampToCanvas = (p: Point): Point => ({
    x: Math.min(width - paddingX, Math.max(paddingX, p.x)),
    y: Math.min(height - paddingY, Math.max(paddingY, p.y)),
  })
  for (let step = 0; step < COLLISION_ITERATIONS; step++) {
    let anyOverlap = false
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const idA = ids[i]
        const idB = ids[j]
        const a = normalized[idA]
        const b = normalized[idB]
        const minDist =
          graphNodeRadius(weightById.get(idA)) + graphNodeRadius(weightById.get(idB)) + COLLISION_GAP
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.hypot(dx, dy)
        if (dist >= minDist) continue
        anyOverlap = true
        if (dist < MIN_DISTANCE) {
          // 完全重合：沿 id 序的确定性方向拆开
          const angle = ((i * count + j) / (count * count)) * Math.PI * 2
          a.x += Math.cos(angle) * minDist * 0.5
          a.y += Math.sin(angle) * minDist * 0.5
          b.x -= Math.cos(angle) * minDist * 0.5
          b.y -= Math.sin(angle) * minDist * 0.5
          continue
        }
        const push = (minDist - dist) / 2
        const ux = dx / dist
        const uy = dy / dist
        a.x += ux * push
        a.y += uy * push
        b.x -= ux * push
        b.y -= uy * push
      }
    }
    if (!anyOverlap) break
    for (const id of ids) normalized[id] = clampToCanvas(normalized[id])
  }

  return normalized
}
