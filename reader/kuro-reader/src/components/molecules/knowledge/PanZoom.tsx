import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * 平移缩放容器：图谱/导图等大幅 SVG 画布的统一交互层。
 * 单指拖拽平移；双指捏合缩放；滚轮缩放（桌面）；右下悬浮缩放条（沿用 Mermaid 图表样式）。
 * 传入 fitWidth/fitHeight 时初始缩放至整幅可见。
 */

const MIN_SCALE = 0.3
const MAX_SCALE = 2.5
const DEFAULT_SCALE = 1
const PERCENT_MULTIPLIER = 100
const BUTTON_ZOOM_RATIO = 1.2
/** 适配时四周留出的呼吸边距 */
const FIT_MARGIN_PX = 16

interface PanZoomProps {
  children: ReactNode
  ariaLabel?: string
  className?: string
  /** 内容逻辑宽高（初始适配缩放用） */
  fitWidth?: number
  fitHeight?: number
}

interface ActivePointer {
  x: number
  y: number
}

/** 捏合起点快照：两指距离与当时的变换，保证连续捏合不跳变 */
interface PinchSnapshot {
  distance: number
  scale: number
  tx: number
  ty: number
  midX: number
  midY: number
}

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

export const PanZoom: React.FC<PanZoomProps> = ({ children, ariaLabel, className, fitWidth, fitHeight }) => {
  const [scale, setScale] = useState(DEFAULT_SCALE)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const pointersRef = useRef(new Map<number, ActivePointer>())
  const pinchRef = useRef<PinchSnapshot | null>(null)
  const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 初始适配：内容大于容器时缩到整幅可见（只在挂载/尺寸变化时收敛，不打断用户操作）
  useEffect(() => {
    const el = containerRef.current
    if (!el || !fitWidth || !fitHeight) return
    const fit = () => {
      const target = Math.min(
        DEFAULT_SCALE,
        (el.clientWidth - FIT_MARGIN_PX * 2) / fitWidth,
        (el.clientHeight - FIT_MARGIN_PX * 2) / fitHeight
      )
      if (Number.isFinite(target) && target > 0) {
        setScale((current) => (current === DEFAULT_SCALE ? clampScale(target) : Math.min(current, clampScale(target))))
      }
    }
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [fitWidth, fitHeight])

  const zoomBy = useCallback((ratio: number, anchorX?: number, anchorY?: number) => {
    setScale((currentScale) => {
      const next = clampScale(currentScale * ratio)
      if (next === currentScale) return currentScale
      if (anchorX == null || anchorY == null) return next
      setOffset((currentOffset) => {
        const realRatio = next / currentScale
        return {
          x: anchorX - (anchorX - currentOffset.x) * realRatio,
          y: anchorY - (anchorY - currentOffset.y) * realRatio,
        }
      })
      return next
    })
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    // 交互子树（图谱节点等）自带手势：不启平移/捏合，避免两套指针逻辑互相打架
    if ((e.target as Element | null)?.closest?.('[data-panzoom-interactive]')) return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointersRef.current.size === 1) {
      panStartRef.current = { x: e.clientX, y: e.clientY, tx: offset.x, ty: offset.y }
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      pinchRef.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        scale,
        tx: offset.x,
        ty: offset.y,
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      }
      panStartRef.current = null
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointersRef.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const start = pinchRef.current
      const nextScale = clampScale((start.scale * distance) / Math.max(start.distance, 1))
      const ratio = nextScale / start.scale
      // 以捏合中点为锚：中点内容跟随手指
      const rect = e.currentTarget.getBoundingClientRect()
      const anchorX = start.midX - rect.left
      const anchorY = start.midY - rect.top
      setScale(nextScale)
      setOffset({
        x: anchorX - (anchorX - start.tx) * ratio,
        y: anchorY - (anchorY - start.ty) * ratio,
      })
      return
    }

    if (pointersRef.current.size === 1 && panStartRef.current) {
      const start = panStartRef.current
      setOffset({ x: start.tx + (e.clientX - start.x), y: start.ty + (e.clientY - start.y) })
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
    if (pointersRef.current.size === 0) panStartRef.current = null
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const anchorX = e.clientX - rect.left
    const anchorY = e.clientY - rect.top
    zoomBy(e.deltaY < 0 ? BUTTON_ZOOM_RATIO : 1 / BUTTON_ZOOM_RATIO, anchorX, anchorY)
  }

  const resetView = () => {
    setScale(DEFAULT_SCALE)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      data-reader-horizontal-scroll
      data-ui-control
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      className={`relative touch-none overflow-hidden overscroll-contain ${className ?? 'h-[70vh]'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
      <div className="pointer-events-auto absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full border border-outline-variant bg-surface/90 p-1 shadow-paper-up backdrop-blur">
        <button
          type="button"
          className="rounded-full p-1 hover:bg-surface-variant disabled:opacity-30"
          disabled={scale <= MIN_SCALE}
          aria-label="缩小视图"
          onClick={() => zoomBy(1 / BUTTON_ZOOM_RATIO)}
        >
          <span className="material-symbols-outlined text-icon-md">zoom_out</span>
        </button>
        <button
          type="button"
          className="min-w-12 rounded-full px-2 py-1 font-label text-label-sm hover:bg-surface-variant"
          aria-label="重置视图"
          onClick={resetView}
        >
          {Math.round(scale * PERCENT_MULTIPLIER)}%
        </button>
        <button
          type="button"
          className="rounded-full p-1 hover:bg-surface-variant disabled:opacity-30"
          disabled={scale >= MAX_SCALE}
          aria-label="放大视图"
          onClick={() => zoomBy(BUTTON_ZOOM_RATIO)}
        >
          <span className="material-symbols-outlined text-icon-md">zoom_in</span>
        </button>
      </div>
    </div>
  )
}

export default PanZoom
