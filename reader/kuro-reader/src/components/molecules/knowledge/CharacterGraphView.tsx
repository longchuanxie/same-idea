import React, { useMemo, useRef, useState } from 'react'

import { PanZoom } from '@/components/molecules/knowledge/PanZoom'
import type { CharacterGraphData, CharacterNode } from '@/types'
import { computeForceLayout, graphNodeRadius } from '@/utils/graphLayout'
import { knowledgeColor, PALETTE_TINT_ALPHA } from '@/utils/knowledgePalette'

/**
 * 人物关系图谱视图：力导向布局 + 节点拖拽 + 点选人物。
 * 布局确定性计算（graphLayout 纯函数）；拖拽只改本地位置，不回写数据。
 * 节点按数据序依次取知识件域色板（与思维导图分支色同源）——
 * 多人物重叠时靠颜色追踪个体；选中态仍归朱砂（印章强调语义）。
 */

const CANVAS_WIDTH = 960
const CANVAS_HEIGHT = 680
const NODE_STROKE_WIDTH = 2
const NODE_STROKE_WIDTH_SELECTED = 3
const LABEL_FONT_SIZE = 13
const EDGE_LABEL_FONT_SIZE = 11
const CJK_CHAR_WIDTH_RATIO = 1.0
const EDGE_LABEL_PADDING = 6
const EDGE_LABEL_BG_EXTRA = 4
const EDGE_LABEL_BG_RADIUS = 4
const LABEL_BASELINE_GAP = 2
const DRAG_THRESHOLD_PX = 5

interface CharacterGraphViewProps {
  data: CharacterGraphData
  selectedNodeId?: string | null
  onSelectNode?: (node: CharacterNode | null) => void
  /** 实体称谓（aria 文案用）：人物图谱=人物 / 概念图谱=概念 */
  entityLabel?: '人物' | '概念'
}

interface PositionedNode extends CharacterNode {
  x: number
  y: number
}

const NODE_HIT_PADDING = 8
/** 已校验节点角标：朱砂小圆 + 白勾（印章意象） */
const VERIFIED_BADGE_OFFSET_RATIO = 0.75
const VERIFIED_BADGE_RADIUS = 7
const VERIFIED_BADGE_FONT_SIZE = 9

/** CJK 主导的文本宽度估算（字符数 × 字号，够画背景条用） */
function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * CJK_CHAR_WIDTH_RATIO + EDGE_LABEL_PADDING
}

export const CharacterGraphView: React.FC<CharacterGraphViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
  entityLabel = '人物',
}) => {
  const baseLayout = useMemo(
    () => computeForceLayout(data.nodes, data.edges, CANVAS_WIDTH, CANVAS_HEIGHT),
    [data]
  )
  const [dragOverrides, setDragOverrides] = useState<Record<string, { x: number; y: number }>>({})
  const dragStateRef = useRef<{ id: string; startX: number; startY: number; moved: boolean } | null>(null)

  const nodes: PositionedNode[] = useMemo(
    () =>
      data.nodes
        .filter((node) => baseLayout[node.id])
        .map((node) => ({
          ...node,
          x: dragOverrides[node.id]?.x ?? baseLayout[node.id].x,
          y: dragOverrides[node.id]?.y ?? baseLayout[node.id].y,
        })),
    [data.nodes, baseLayout, dragOverrides]
  )
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])

  const handleNodePointerDown = (e: React.PointerEvent, node: PositionedNode) => {
    e.stopPropagation()
    // 捕获在节点 g 自身（而非命中子元素）：指针移出节点后拖拽/释放仍可靠送达
    try {
      const target = e.currentTarget as Element
      target.setPointerCapture?.(e.pointerId)
    } catch {
      // 合成事件/无活动指针的环境（测试）没有可捕获的 pointerId，忽略
    }
    dragStateRef.current = { id: node.id, startX: e.clientX, startY: e.clientY, moved: false }
  }

  const handleNodePointerMove = (e: React.PointerEvent) => {
    const drag = dragStateRef.current
    if (!drag) return
    e.stopPropagation()
    // 位移小于阈值视为点按（触屏轻扫误触保护）
    if (
      !drag.moved &&
      Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD_PX
    ) {
      return
    }
    drag.moved = true
    const svg = (e.currentTarget as SVGGElement).ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    // 换算回 viewBox 坐标（rect 含 CSS 缩放，按比例折算）
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    setDragOverrides((current) => ({ ...current, [drag.id]: { x, y } }))
  }

  const handleNodePointerUp = (e: React.PointerEvent, node: PositionedNode) => {
    e.stopPropagation()
    const drag = dragStateRef.current
    dragStateRef.current = null
    if (drag && !drag.moved) {
      onSelectNode?.(selectedNodeId === node.id ? null : node)
    }
  }

  return (
    <PanZoom ariaLabel={`${entityLabel}关系图谱，可拖拽与缩放`} className="h-[68vh]" fitWidth={CANVAS_WIDTH} fitHeight={CANVAS_HEIGHT}>
      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        className="touch-none"
        role="img"
                aria-label={`${data.nodes.length} 个${entityLabel}的关系图`}
      >
        {/* 关系边（压在节点下方） */}
        {data.edges.map((edge, index) => {
          const source = nodeById.get(edge.source)
          const target = nodeById.get(edge.target)
          if (!source || !target) return null
          const midX = (source.x + target.x) / 2
          const midY = (source.y + target.y) / 2
          const labelWidth = estimateTextWidth(edge.relation, EDGE_LABEL_FONT_SIZE)
          return (
            <g key={`${edge.source}-${edge.target}-${index}`} data-relation={edge.relation}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgb(var(--color-outline))"
                strokeWidth={1.5}
                strokeOpacity={0.8}
              />
              <rect
                x={midX - labelWidth / 2}
                y={midY - EDGE_LABEL_FONT_SIZE}
                width={labelWidth}
                height={EDGE_LABEL_FONT_SIZE + EDGE_LABEL_BG_EXTRA}
                rx={EDGE_LABEL_BG_RADIUS}
                fill="rgb(var(--color-surface-container-lowest))"
                stroke="rgb(var(--color-outline-variant))"
                strokeWidth={0.5}
              />
              <text
                x={midX}
                y={midY + 2}
                textAnchor="middle"
                fontSize={EDGE_LABEL_FONT_SIZE}
                fill="rgb(var(--color-on-surface-variant))"
              >
                {edge.relation}
              </text>
            </g>
          )
        })}

        {/* 人物节点（按数据序取域色：连接度越高的实体越靠前拿到靠前的色） */}
        {nodes.map((node, nodeIndex) => {
          const radius = graphNodeRadius(node.weight)
          const selected = node.id === selectedNodeId
          const color = knowledgeColor(nodeIndex)
          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`${node.name}${node.role ? `，${node.role}` : ''}`}
              data-panzoom-interactive
              style={{ cursor: 'grab' }}
              onPointerDown={(e) => handleNodePointerDown(e, node)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={(e) => handleNodePointerUp(e, node)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectNode?.(selected ? null : node)
                }
              }}
            >
              {/* 透明命中区：比可见圆大一圈，重叠/缩小时依然好点 */}
              <circle
                cx={node.x}
                cy={node.y}
                r={radius + NODE_HIT_PADDING}
                fill="transparent"
                stroke="none"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={selected ? 'rgb(var(--color-seal-soft))' : `${color}${PALETTE_TINT_ALPHA}`}
                stroke={selected ? 'rgb(var(--color-seal))' : color}
                strokeWidth={selected ? NODE_STROKE_WIDTH_SELECTED : NODE_STROKE_WIDTH}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={node.x}
                y={node.y + radius + LABEL_FONT_SIZE + LABEL_BASELINE_GAP}
                textAnchor="middle"
                fontSize={LABEL_FONT_SIZE}
                fontWeight={500}
                fill="rgb(var(--color-on-surface))"
                style={{ pointerEvents: 'none' }}
              >
                {node.name}
              </text>
              {node.role && (
                <text
                  x={node.x}
                  y={node.y + radius + LABEL_FONT_SIZE * 2 + LABEL_BASELINE_GAP}
                  textAnchor="middle"
                  fontSize={EDGE_LABEL_FONT_SIZE}
                  fill="rgb(var(--color-on-surface-variant))"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.role}
                </text>
              )}
              {node.verified && (
                <g style={{ pointerEvents: 'none' }}>
                  <circle
                    cx={node.x + radius * VERIFIED_BADGE_OFFSET_RATIO}
                    cy={node.y - radius * VERIFIED_BADGE_OFFSET_RATIO}
                    r={VERIFIED_BADGE_RADIUS}
                    fill="rgb(var(--color-seal))"
                  />
                  <text
                    x={node.x + radius * VERIFIED_BADGE_OFFSET_RATIO}
                    y={node.y - radius * VERIFIED_BADGE_OFFSET_RATIO + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={VERIFIED_BADGE_FONT_SIZE}
                    fill="#FFFFFF"
                  >
                    ✓
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </PanZoom>
  )
}

export default CharacterGraphView
