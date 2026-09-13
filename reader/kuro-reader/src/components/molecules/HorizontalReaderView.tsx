import { useEffect, useLayoutEffect, useRef, useState, type ReactNode , FC, MouseEvent, TouchEvent } from 'react';

import { cn } from '@/utils/cn';
import type { PaperTextureConfig } from '@/utils/paperTexture';

type ReaderPageLayout = 'single' | 'double';
type ReaderDirection = 'rtl' | 'ltr';

interface HorizontalReaderViewProps {
  pageLayout: ReaderPageLayout;
  readingDirection: ReaderDirection;
  pageUrls: (string | null)[];
  currentPage: number;
  currentPageLabel: string;
  totalPages: number;
  horizontalPageSpread: number[];
  zoomScale: number;
  /** 双击放大时的触点（视口坐标），用于锚定初始缩放位置 */
  zoomOrigin: { x: number; y: number };
  paperConfig: PaperTextureConfig | null;
  onSurfaceClick: (event: MouseEvent) => void;
  onSurfaceTouchStart: (event: TouchEvent) => void;
  onSurfaceTouchMove: (event: TouchEvent) => void;
  onSurfaceTouchEnd: (event: TouchEvent) => void;
  onImageClick: (pageIndex: number, event: MouseEvent) => void;
  /** 页面级叠加层渲染槽（PDF 文字层等；返回内容将绝对定位于页图之上） */
  renderPageOverlay?: (pageIndex: number) => ReactNode;
}

const HORIZONTAL_VIEW_CLASSES = 'w-full h-full flex items-center justify-center overflow-hidden touch-none px-1 sm:px-2';
const DOUBLE_SPREAD_CLASSES = 'flex items-center justify-center h-full w-full gap-1';
const DOUBLE_PAGE_SLOT_CLASSES = 'h-full min-w-0 flex-1 flex items-center justify-center';
const DOUBLE_IMAGE_CLASSES = 'max-w-full max-h-full object-contain cursor-pointer';
const SINGLE_IMAGE_CLASSES = 'max-w-full max-h-full object-contain cursor-pointer';
const LOADING_SLOT_CLASSES = 'h-full w-full max-w-max-width-content flex items-center justify-center';
const LOADING_FALLBACK_CLASSES = 'flex flex-col items-center gap-2';
const TOUCH_CLICK_SUPPRESSION_DISTANCE = 10;
const TOUCH_CLICK_SUPPRESSION_DURATION = 700;

interface PanPoint {
  x: number;
  y: number;
}

const clampToRange = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/** 当前缩放下允许的平移半径：超出即意味着图像边缘缩进视口内（露底）或过度甩出 */
function getPanBounds(el: HTMLElement | null, scale: number): { maxX: number; maxY: number } {
  const container = el?.parentElement;
  if (!el || !container) return { maxX: 0, maxY: 0 };
  // offsetWidth/Height 不受 transform 影响，即未缩放的布局尺寸
  return {
    maxX: Math.max(0, (el.offsetWidth * scale - container.clientWidth) / 2),
    maxY: Math.max(0, (el.offsetHeight * scale - container.clientHeight) / 2),
  };
}

function clampPan(pan: PanPoint, el: HTMLElement | null, scale: number): PanPoint {
  const { maxX, maxY } = getPanBounds(el, scale);
  return { x: clampToRange(pan.x, -maxX, maxX), y: clampToRange(pan.y, -maxY, maxY) };
}

export const HorizontalReaderView: FC<HorizontalReaderViewProps> = ({
  pageLayout,
  readingDirection,
  pageUrls,
  currentPage,
  currentPageLabel,
  totalPages,
  horizontalPageSpread,
  zoomScale,
  zoomOrigin,
  paperConfig,
  onSurfaceClick,
  onSurfaceTouchStart,
  onSurfaceTouchMove,
  onSurfaceTouchEnd,
  onImageClick,
  renderPageOverlay,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntilRef = useRef(0);
  // 翻页方向感：按页码变化方向给进入页加方向性滑动（与文本阅读器手感对齐）
  const prevPageRef = useRef(currentPage);
  const turnDirection = currentPage >= prevPageRef.current ? 'next' : 'prev';
  useEffect(() => {
    prevPageRef.current = currentPage;
  }, [currentPage]);
  const turnAnimClass = turnDirection === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left';

  // ---- 放大平移（修复放大后边缘内容被裁切且无法查看的问题）----
  // 模型：transform-origin 固定为内容中心，transform = translate(pan) scale(zoomScale)。
  // 双击放大时按触点换算初始平移（触点保持原位）；放大后单指拖拽平移，范围经钳制，
  // 保证放大后的页面始终覆盖视口，任何边缘内容都可以拖到眼前。
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [zoomPan, setZoomPan] = useState<PanPoint>({ x: 0, y: 0 });
  /** 同一次放大只做一次初始平移换算的会话标记 */
  const zoomPanSessionRef = useRef<number | null>(null);
  /** 未缩放状态的内容框（视口坐标），缩放瞬间据此换算双击点的初始平移 */
  const baseRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  /** 平移拖拽期间的上一触点 */
  const panLastTouchRef = useRef<PanPoint | null>(null);

  useLayoutEffect(() => {
    if (zoomScale === 1 && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      baseRectRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    }
  });

  useEffect(() => {
    if (zoomScale <= 1) {
      zoomPanSessionRef.current = null;
      panLastTouchRef.current = null;
      setZoomPan({ x: 0, y: 0 });
      return;
    }
    if (zoomPanSessionRef.current === zoomScale) return;
    const rect = baseRectRef.current;
    zoomPanSessionRef.current = zoomScale;
    if (!rect) return;
    const px = zoomOrigin.x - (rect.left + rect.width / 2);
    const py = zoomOrigin.y - (rect.top + rect.height / 2);
    // 保持双击点原位的平移补偿：t = (p - center) * (1 - s)
    setZoomPan(clampPan({ x: px * (1 - zoomScale), y: py * (1 - zoomScale) }, contentRef.current, zoomScale));
  }, [zoomScale, zoomOrigin]);

  const imageStyle = {
    ...(paperConfig ? { filter: paperConfig.imageFilter } : {}),
  };
  // 占位块与纸底同色，消除纸型切换时的色差突兀
  const loadingSlotStyle = paperConfig ? { backgroundColor: paperConfig.bgColor } : undefined;

  const zoomedStyle = zoomScale > 1
    ? { transform: `translate(${zoomPan.x}px, ${zoomPan.y}px) scale(${zoomScale})` }
    : undefined;

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      panLastTouchRef.current = zoomScale > 1 ? { x: touch.clientX, y: touch.clientY } : null;
    }
    onSurfaceTouchStart(event);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (zoomScale > 1) {
      const touch = event.touches[0];
      const last = panLastTouchRef.current;
      if (touch && last && (touch.clientX !== last.x || touch.clientY !== last.y)) {
        setZoomPan((prev) =>
          clampPan(
            { x: prev.x + (touch.clientX - last.x), y: prev.y + (touch.clientY - last.y) },
            contentRef.current,
            zoomScale
          )
        );
      }
      if (touch) panLastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
    onSurfaceTouchMove(event);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const touchStart = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    panLastTouchRef.current = null;

    if (
      touchStart &&
      touch &&
      (
        Math.abs(touch.clientX - touchStart.x) > TOUCH_CLICK_SUPPRESSION_DISTANCE ||
        Math.abs(touch.clientY - touchStart.y) > TOUCH_CLICK_SUPPRESSION_DISTANCE
      )
    ) {
      suppressClickUntilRef.current = Date.now() + TOUCH_CLICK_SUPPRESSION_DURATION;
    }

    onSurfaceTouchEnd(event);
  };

  const shouldSuppressClick = (event: MouseEvent): boolean => {
    if (Date.now() > suppressClickUntilRef.current) return false;
    suppressClickUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
    return true;
  };

  const handleSurfaceClick = (event: MouseEvent) => {
    if (!shouldSuppressClick(event)) {
      onSurfaceClick(event);
    }
  };

  const handleImageClick = (pageIndex: number, event: MouseEvent) => {
    if (!shouldSuppressClick(event)) {
      onImageClick(pageIndex, event);
    }
  };

  return (
    <div
      data-testid="horizontal-reader-surface"
      className={HORIZONTAL_VIEW_CLASSES}
      onClick={handleSurfaceClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        touchStartRef.current = null;
        panLastTouchRef.current = null;
      }}
    >
      {pageLayout === 'double' && horizontalPageSpread.length > 1 ? (
        <div ref={contentRef} style={zoomedStyle} className={cn(DOUBLE_SPREAD_CLASSES, turnAnimClass)}>
          {horizontalPageSpread.map((pageNumber) => {
            const url = pageUrls[pageNumber - 1];
            return (
              <div key={`${readingDirection}-${pageNumber}`} className={DOUBLE_PAGE_SLOT_CLASSES}>
                {url ? (
                  // h-full w-full 定高定宽：否则 max-h-full 百分比链在自动高度父级上失效，
                  // 横屏双页时图片按原始尺寸撑出视口、上下被裁（与单页分支同一根因）
                  <div className="relative flex h-full w-full items-center justify-center">
                    <img
                      src={url}
                      alt={`Page ${pageNumber}`}
                      className={DOUBLE_IMAGE_CLASSES}
                      style={imageStyle}
                      loading="eager"
                      draggable={false}
                      onClick={(event) => handleImageClick(pageNumber - 1, event)}
                    />
                    {renderPageOverlay?.(pageNumber - 1)}
                  </div>
                ) : (
                  <div className={LOADING_SLOT_CLASSES} style={loadingSlotStyle}>
                    <span className="material-symbols-outlined text-on-surface-variant text-3xl animate-spin">progress_activity</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : pageUrls[currentPage - 1] ? (
        <div
          key={currentPage}
          ref={contentRef}
          style={zoomedStyle}
          // w-full h-full 定高定宽：否则 max-h-full 百分比链在自动高度父级上失效，
          // 横屏时图片按宽度撑满、上下溢出被裁（横屏裁切根因）
          className="relative flex h-full w-full items-center justify-center"
        >
          <img
            src={pageUrls[currentPage - 1]!}
            alt={`Page ${currentPage}`}
            className={cn(SINGLE_IMAGE_CLASSES, turnAnimClass)}
            style={imageStyle}
            loading="eager"
            draggable={false}
            onClick={(event) => handleImageClick(currentPage - 1, event)}
          />
          {renderPageOverlay?.(currentPage - 1)}
        </div>
      ) : (
        <div className={LOADING_FALLBACK_CLASSES}>
          <span className="material-symbols-outlined text-on-surface-variant text-4xl animate-spin">progress_activity</span>
          <p className="font-label text-label-sm text-on-surface-variant">{currentPageLabel} / {totalPages}</p>
        </div>
      )}
    </div>
  );
};

export default HorizontalReaderView;
