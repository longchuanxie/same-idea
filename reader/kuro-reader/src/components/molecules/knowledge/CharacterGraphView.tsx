import React, { useMemo, useRef, useState } from 'react'

import { PanZoom } from '@/components/molecules/knowledge/PanZoom'
import type { CharacterGraphData, CharacterNode } from '@/types'
import { computeForceLayout } from '@/utils/graphLayout'

/**
 * 人物关系图谱视图：力导向布局 + 节点拖拽 + 点选人物。
 * 布局确定性计算（graphLayout 纯函数）；拖拽只改本地位置，不回写数据。
 */

const CANVAS_WIDTH = 960
const CANVAS_HEIGHT = 680
const NODE_MIN_RADIUS = 16
const NODE_RADIUS_SPAN = 16
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
}

interface PositionedNode extends CharacterNode {
  x: number
  y: number
}

function nodeRadius(weight: number | undefined): number {
  return NODE_MIN_RADIUS + (weight ?? 0) * NODE_RADIUS_SPAN
}

/** CJK 主导的文本宽度估算（字符数 × 字号，够画背景条用） */
function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * CJK_CHAR_WIDTH_RATIO + EDGE_LABEL_PADDING
}

export const CharacterGraphView: React.FC<CharacterGraphViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
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
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
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
    <PanZoom ariaLabel="人物关系图谱，可拖拽与缩放" className="h-[68vh]" fitWidth={CANVAS_WIDTH} fitHeight={CANVAS_HEIGHT}>
      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        className="touch-none"
        role="img"
        aria-label={`${data.nodes.length} 个人物的关系图`}
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

        {/* 人物节点 */}
        {nodes.map((node) => {
          const radius = nodeRadius(node.weight)
          const selected = node.id === selectedNodeId
          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`${node.name}${node.role ? `，${node.role}` : ''}`}
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
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={selected ? 'rgb(var(--color-seal-soft))' : 'rgb(var(--color-surface-container-high))'}
                stroke={selected ? 'rgb(var(--color-seal))' : 'rgb(var(--color-primary))'}
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
            </g>
          )
        })}
      </svg>
    </PanZoom>
  )
}

export default CharacterGraphView
