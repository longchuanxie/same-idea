import React, { useMemo, useState } from 'react'

import { MindmapOutlineEditor } from '@/components/molecules/knowledge/MindmapOutlineEditor'
import { PanZoom } from '@/components/molecules/knowledge/PanZoom'
import type { MindmapNodeData } from '@/types'
import type { MindmapNodePath } from '@/utils/knowledgeEdit'
import {
  CANVAS_PADDING,
  computeMindmapLayout,
  hoistSingleBranchRoot,
  type LaidOutNode,
} from '@/utils/mindmapLayout'

/**
 * XMind 风格思维导图视图：根居中、分支左右均衡辐射。
 * 每条一级分支一个主题色（曲线粗细随层级递减、胶囊底色随层级变浅，
 * 三级起退为彩线下划的纯文本）；点击有子节点的主题折叠/展开。
 */

/** 分支主题色板：纸墨审美的八色（朱砂/黛蓝/松绿/藤黄/青碧/紫棠/棕/灰蓝） */
const BRANCH_COLORS = [
  '#B54529', '#35618E', '#3E7C59', '#C9862B',
  '#2F8F83', '#7C5295', '#8D6E63', '#5C7A99',
] as const

/** 浅底色透明度（十六进制后缀） */
const TINT_L2 = '2E'
/** 各层级连线粗细（主干 → 深层递减，XMind 手感）；与连线不透明度为版式设计常量 */
/* eslint-disable no-magic-numbers */
const LINK_WIDTHS = [3.5, 2.2, 1.4, 1.2] as const
const LINK_OPACITY_TRUNK = 0.9
const LINK_OPACITY_DEEP = 0.75
/* eslint-enable no-magic-numbers */
/** 贝塞尔控制点水平占比 */
const CURVE_CONTROL_RATIO = 0.5
const COLLAPSE_BADGE_OFFSET = 10
const COLLAPSE_BADGE_RADIUS = 11
const COLLAPSE_BADGE_FONT_SIZE = 10
const COLLAPSE_BADGE_MAX_COUNT = 99
/** 深层纯文本主题的彩线下坠距离（相对节点中心） */
const DEEP_UNDERLINE_OFFSET = 14

function branchColor(branchIndex: number): string {
  return BRANCH_COLORS[branchIndex % BRANCH_COLORS.length]
}

function linkWidth(depth: number): number {
  return LINK_WIDTHS[Math.min(depth, LINK_WIDTHS.length - 1)]
}

/** 有机 S 形连线：从父节点远端到子节点近端 */
function branchPath(parent: LaidOutNode, child: LaidOutNode): string {
  const side = child.side
  const sx = parent.x + side * (parent.width / 2)
  const sy = parent.y
  const ex = child.x - side * (child.width / 2)
  const ey = child.y
  const k = (ex - sx) * CURVE_CONTROL_RATIO
  return `M ${sx} ${sy} C ${sx + k} ${sy}, ${ex - k} ${ey}, ${ex} ${ey}`
}

interface MindmapViewProps {
  data: MindmapNodeData
  /** 修订模式：画布换大纲列表，逐节点改/删/校章 */
  revising?: boolean
  onEditNode?: (path: MindmapNodePath) => void
  onRemoveNode?: (path: MindmapNodePath) => void
  onToggleNodeVerified?: (path: MindmapNodePath) => void
}

export const MindmapView: React.FC<MindmapViewProps> = ({
  data,
  revising = false,
  onEditNode,
  onRemoveNode,
  onToggleNodeVerified,
}) => {
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set())
  // 布局前上提单片语料的「片段N」中转层，让真实主题成为一级分支
  const layout = useMemo(
    () => computeMindmapLayout(hoistSingleBranchRoot(data), collapsedKeys),
    [data, collapsedKeys]
  )
  const nodeByKey = useMemo(() => new Map(layout.nodes.map((n) => [n.key, n])), [layout.nodes])

  // 修订模式不画画布：大纲列表逐节点修订（改字/删枝在列表上才好点）
  if (revising && onEditNode && onRemoveNode && onToggleNodeVerified) {
    return (
      <MindmapOutlineEditor
        data={data}
        onEditNode={onEditNode}
        onRemoveNode={onRemoveNode}
        onToggleNodeVerified={onToggleNodeVerified}
      />
    )
  }

  const toggleNode = (key: string, hasChildren: boolean) => {
    if (!hasChildren) return
    setCollapsedKeys((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <PanZoom
      ariaLabel="全书思维导图，可拖拽与缩放"
      className="h-[68vh]"
      fitWidth={layout.width}
      fitHeight={layout.height}
    >
      <svg
        width={layout.width}
        height={layout.height}
        viewBox={`${-layout.width / 2} 0 ${layout.width} ${layout.height}`}
        className="touch-none"
        role="img"
        aria-label={`${layout.nodes.length} 个节点的思维导图`}
      >
        <g transform={`translate(0, ${CANVAS_PADDING})`}>
          {/* 分支曲线（压在主题下方） */}
          {layout.nodes.map((node) => {
            if (node.isRoot) return null
            const parent = node.parentKey ? nodeByKey.get(node.parentKey) : undefined
            if (!parent) return null
            return (
              <path
                key={`link-${node.key}`}
                d={branchPath(parent, node)}
                fill="none"
                stroke={branchColor(node.branchIndex)}
                strokeWidth={linkWidth(node.depth - 1)}
                strokeLinecap="round"
                strokeOpacity={node.depth > 2 ? LINK_OPACITY_DEEP : LINK_OPACITY_TRUNK}
              />
            )
          })}

          {/* 主题 */}
          {layout.nodes.map((node) => {
            const color = node.isRoot ? undefined : branchColor(node.branchIndex)
            const clickable = node.hasChildren
            const halfW = node.width / 2
            const halfH = node.height / 2

            let topic: React.ReactNode
            if (node.isRoot) {
              topic = (
                <>
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={node.width}
                    height={node.height}
                    rx={halfH}
                    fill="rgb(var(--color-primary))"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={node.fontSize}
                    fontWeight={600}
                    fill="rgb(var(--color-on-primary))"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.displayTitle}
                  </text>
                </>
              )
            } else if (node.depth === 1) {
              topic = (
                <>
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={node.width}
                    height={node.height}
                    rx={halfH}
                    fill={color}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={node.fontSize}
                    fontWeight={500}
                    fill="#FFFFFF"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.displayTitle}
                  </text>
                </>
              )
            } else if (node.depth === 2) {
              topic = (
                <>
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={node.width}
                    height={node.height}
                    rx={halfH / 2}
                    fill={`${color}${TINT_L2}`}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={node.fontSize}
                    fill="rgb(var(--color-on-surface))"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.displayTitle}
                  </text>
                </>
              )
            } else {
              // 三级及以下：纯文本 + 分支色下划线（XMind 深层样式）
              topic = (
                <>
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={node.fontSize}
                    fill="rgb(var(--color-on-surface))"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.displayTitle}
                  </text>
                  <line
                    x1={-halfW}
                    y1={DEEP_UNDERLINE_OFFSET}
                    x2={halfW}
                    y2={DEEP_UNDERLINE_OFFSET}
                    stroke={color}
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    style={{ pointerEvents: 'none' }}
                  />
                </>
              )
            }

            return (
              <g
                key={node.key}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={`${node.title}${clickable ? '，点击折叠或展开' : ''}`}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                onClick={() => toggleNode(node.key, clickable)}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    toggleNode(node.key, clickable)
                  }
                }}
              >
                <title>{node.detail ? `${node.title}：${node.detail}` : node.title}</title>
                {topic}
                {node.collapsed && node.hiddenCount > 0 && color && (
                  <g>
                    <circle
                      cx={node.side * (halfW + COLLAPSE_BADGE_OFFSET)}
                      cy={0}
                      r={COLLAPSE_BADGE_RADIUS}
                      fill={color}
                    />
                    <text
                      x={node.side * (halfW + COLLAPSE_BADGE_OFFSET)}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={COLLAPSE_BADGE_FONT_SIZE}
                      fill="#FFFFFF"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.hiddenCount > COLLAPSE_BADGE_MAX_COUNT ? '99+' : node.hiddenCount}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </PanZoom>
  )
}

export default MindmapView
