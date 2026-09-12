import { describe, expect, it } from 'vitest'

import type { MindmapNodeData } from '@/types'
import {
  ROW_HEIGHT,
  TRUNK_GAP,
  computeMindmapLayout,
  estimateTopicWidth,
  fitTopicText,
  hoistSingleBranchRoot,
} from '@/utils/mindmapLayout'

/** 四条均衡分支 × 各两叶（用于双侧分流的对称样本） */
const balancedTree: MindmapNodeData = {
  title: '根',
  children: [
    { title: '甲', children: [{ title: '甲一' }, { title: '甲二' }] },
    { title: '乙', children: [{ title: '乙一' }, { title: '乙二' }] },
    { title: '丙', children: [{ title: '丙一' }, { title: '丙二' }] },
    { title: '丁', children: [{ title: '丁一' }, { title: '丁二' }] },
  ],
}

describe('computeMindmapLayout · XMind 双侧辐射', () => {
  it('一级分支左右均衡分流（贪心按子树规模），根居中', () => {
    const { nodes } = computeMindmapLayout(balancedTree, new Set())
    const root = nodes.find((n) => n.isRoot)!
    const l1 = nodes.filter((n) => n.depth === 1)
    const right = l1.filter((n) => n.side === 1)
    const left = l1.filter((n) => n.side === -1)

    expect(right).toHaveLength(2)
    expect(left).toHaveLength(2)
    // 根在 x=0；右支 x>0、左支 x<0，且都隔出主干留白
    expect(root.x).toBe(0)
    for (const node of right) {
      expect(node.x).toBeGreaterThan(root.width / 2 + TRUNK_GAP - 1)
    }
    for (const node of left) {
      expect(node.x).toBeLessThan(-root.width / 2)
    }
    // 深度越深离根越远（按 |x| 列位）
    const leaf = nodes.find((n) => n.title === '甲一')!
    const branch = nodes.find((n) => n.title === '甲')!
    expect(Math.abs(leaf.x) - Math.abs(branch.x)).toBeGreaterThan(0)
  })

  it('叶序定 y：同侧叶子按 ROW_HEIGHT 分行，父居子中点', () => {
    const { nodes } = computeMindmapLayout(balancedTree, new Set())
    const leaves = nodes.filter((n) => n.depth === 2 && n.side === 1).sort((a, b) => a.y - b.y)
    expect(leaves.length).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < leaves.length; i++) {
      expect(Math.round(leaves[i].y - leaves[i - 1].y)).toBe(ROW_HEIGHT)
    }
    const branch = nodes.find((n) => n.title === '甲')!
    const children = nodes.filter((n) => n.parentKey === branch.key).sort((a, b) => a.y - b.y)
    expect(branch.y).toBeCloseTo((children[0].y + children[1].y) / 2, 5)
  })

  it('折叠分支：子树不进布局并计隐藏数', () => {
    const expanded = computeMindmapLayout(balancedTree, new Set())
    const collapsed = computeMindmapLayout(balancedTree, new Set(['0/0']))
    const branch = collapsed.nodes.find((n) => n.key === '0/0')!

    expect(collapsed.nodes.length).toBe(expanded.nodes.length - 2) // 甲一/甲二 隐藏
    expect(branch.collapsed).toBe(true)
    expect(branch.hiddenCount).toBe(2)
    expect(collapsed.width).toBeLessThanOrEqual(expanded.width)
  })

  it('父 key 链路正确（连线寻址用），分支索引即一级序号', () => {
    const { nodes } = computeMindmapLayout(balancedTree, new Set())
    const leaf = nodes.find((n) => n.title === '乙一')!
    const parent = nodes.find((n) => n.key === leaf.parentKey)!
    expect(parent.title).toBe('乙')
    expect(nodes.find((n) => n.title === '乙')!.branchIndex).toBe(1)
    expect(nodes.find((n) => n.isRoot)!.branchIndex).toBe(-1)
  })

  it('空树与单链退化情形有合法画布', () => {
    const single = computeMindmapLayout({ title: '单点' }, new Set())
    expect(single.nodes).toHaveLength(1)
    expect(single.width).toBeGreaterThan(0)
    expect(single.height).toBeGreaterThan(0)

    const chain = computeMindmapLayout(
      { title: '根', children: [{ title: '独枝', children: [{ title: '末梢' }] }] },
      new Set()
    )
    expect(chain.nodes.find((n) => n.title === '独枝')!.side).toBe(1) // 唯一分支落在右侧
    expect(chain.nodes.find((n) => n.title === '末梢')!.side).toBe(1)
  })
})

describe('hoistSingleBranchRoot · 单中转分支上提', () => {
  it('根下唯一分支有子树时，其子节点上提为一级分支', () => {
    const hoisted = hoistSingleBranchRoot({
      title: '书',
      children: [{ title: '片段1', children: [{ title: '核心论点' }, { title: '关键定义' }] }],
    })
    expect(hoisted.children?.map((c) => c.title)).toEqual(['核心论点', '关键定义'])
  })

  it('多分支、无子树中转、无子节点时原样返回且不改入参', () => {
    const multi = { title: '根', children: [{ title: '甲' }, { title: '乙' }] }
    expect(hoistSingleBranchRoot(multi)).toBe(multi)

    const passThroughLeaf = { title: '根', children: [{ title: '片段1' }] }
    expect(hoistSingleBranchRoot(passThroughLeaf)).toBe(passThroughLeaf)

    expect(hoistSingleBranchRoot({ title: '单点' })).toEqual({ title: '单点' })
  })
})

describe('fitTopicText · 贴字宽度', () => {
  it('短标题保留全文，宽度随字数与字号增长；半角窄于全角', () => {
    const a = fitTopicText('甲一', 12, 12)
    expect(a.display).toBe('甲一')
    const b = fitTopicText('甲一甲二', 12, 12)
    expect(b.width).toBeGreaterThan(a.width)
    expect(estimateTopicWidth('ab', 12, 6)).toBeLessThan(estimateTopicWidth('甲乙', 12, 6))
  })

  it('超宽标题截断加省略号且不越上限', () => {
    const long = '这是一个非常长的主题标题用来验证导图主题的截断逻辑是否正确工作'
    const fit = fitTopicText(long, 13, 16)
    expect(fit.display.endsWith('…')).toBe(true)
    expect(fit.display.length).toBeLessThan(long.length)
    expect(fit.width).toBeLessThanOrEqual(221) // TOPIC_MAX_WIDTH(220) + 取整余量
  })
})
