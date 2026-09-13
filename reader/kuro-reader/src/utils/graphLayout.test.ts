import { describe, expect, it } from 'vitest'

import { computeForceLayout, graphNodeRadius } from '@/utils/graphLayout'

const WIDTH = 900
const HEIGHT = 600

const triangleNodes = [
  { id: 'a', weight: 1 },
  { id: 'b', weight: 0.5 },
  { id: 'c', weight: 0 },
]
const triangleEdges = [
  { source: 'a', target: 'b' },
  { source: 'a', target: 'c' },
]

describe('computeForceLayout', () => {
  it('确定性：同输入同布局', () => {
    const first = computeForceLayout(triangleNodes, triangleEdges, WIDTH, HEIGHT)
    const second = computeForceLayout(triangleNodes, triangleEdges, WIDTH, HEIGHT)
    expect(first).toEqual(second)
  })

  it('所有节点拿到画布内的坐标', () => {
    const nodes = Array.from({ length: 12 }, (_, i) => ({ id: `n${i}` }))
    const edges = nodes.slice(1).map((n, i) => ({ source: 'n0', target: n.id, key: i }))
    const layout = computeForceLayout(nodes, edges as never, WIDTH, HEIGHT)

    expect(Object.keys(layout)).toHaveLength(12)
    for (const point of Object.values(layout)) {
      expect(point.x).toBeGreaterThanOrEqual(0)
      expect(point.x).toBeLessThanOrEqual(WIDTH)
      expect(point.y).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeLessThanOrEqual(HEIGHT)
    }
  })

  it('空图与单点图的退化情形', () => {
    expect(computeForceLayout([], [], WIDTH, HEIGHT)).toEqual({})
    expect(computeForceLayout([{ id: 'solo' }], [], WIDTH, HEIGHT)).toEqual({
      solo: { x: WIDTH / 2, y: HEIGHT / 2 },
    })
  })

  it('相连节点比无关节点靠得更近（大体趋势）', () => {
    const nodes = [
      { id: 'hub' },
      { id: 'friend' },
      { id: 'stranger' },
    ]
    const layout = computeForceLayout(nodes, [{ source: 'hub', target: 'friend' }], WIDTH, HEIGHT)
    const near = Math.hypot(layout.hub.x - layout.friend.x, layout.hub.y - layout.friend.y)
    const far = Math.hypot(layout.hub.x - layout.stranger.x, layout.hub.y - layout.stranger.y)
    // 斥力作用两者都会被推开，但相连的一对应明显更近
    expect(near).toBeLessThan(far)
  })

  it('引用不存在端点的边被忽略', () => {
    const layout = computeForceLayout([{ id: 'a' }, { id: 'b' }], [{ source: 'a', target: 'ghost' }], WIDTH, HEIGHT)
    expect(layout.ghost).toBeUndefined()
    expect(layout.a).toBeTruthy()
  })
})

describe('computeForceLayout · 碰撞松弛', () => {
  it('任意两节点不重叠：间距 ≥ 半径和 + 安全间隙', () => {
    const nodes = Array.from({ length: 16 }, (_, i) => ({
      id: `n${i}`,
      weight: (i % 4) / 4,
    }))
    const edges = [
      { source: 'n0', target: 'n1' },
      { source: 'n0', target: 'n2' },
      { source: 'n1', target: 'n3' },
      { source: 'n2', target: 'n4' },
      { source: 'n3', target: 'n4' },
      { source: 'n5', target: 'n6' },
    ]
    const layout = computeForceLayout(nodes, edges, 960, 680)
    const gap = 8
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = layout[nodes[i].id]
        const b = layout[nodes[j].id]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        const minDist =
          graphNodeRadius(nodes[i].weight) + graphNodeRadius(nodes[j].weight) + gap
        expect(dist).toBeGreaterThanOrEqual(minDist - 0.5)
      }
    }
  })

  it('完全重合的初始化也能被拆开（确定性方向）', () => {
    const nodes = [
      { id: 'a', weight: 0 },
      { id: 'b', weight: 0 },
    ]
    const layout = computeForceLayout(nodes, [], 400, 400)
    const dist = Math.hypot(layout.a.x - layout.b.x, layout.a.y - layout.b.y)
    const minDist = graphNodeRadius(0) * 2 + 8
    expect(dist).toBeGreaterThanOrEqual(minDist - 0.5)
  })
})
