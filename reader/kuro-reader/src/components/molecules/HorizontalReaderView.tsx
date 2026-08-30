import { useEffect, useRef } from 'react';
import type { FC, MouseEvent, TouchEvent } from 'react';

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
  zoomOrigin: { x: number; y: number };
  paperConfig: PaperTextureConfig | null;
  onSurfaceClick: (event: MouseEvent) => void;
  onSurfaceTouchStart: (event: TouchEvent) => void;
  onSurfaceTouchMove: (event: TouchEvent) => void;
  onSurfaceTouchEnd: (event: TouchEvent) => void;
  onImageClick: (pageIndex: number, event: MouseEvent) => void;
}

const HORIZONTAL_VIEW_CLASSES = 'w-full h-full flex items-center justify-center overflow-hidden px-1 sm:px-2';
const DOUBLE_SPREAD_CLASSES = 'flex items-center justify-center h-full w-full gap-1';
const DOUBLE_PAGE_SLOT_CLASSES = 'h-full min-w-0 flex-1 flex items-center justify-center';
const DOUBLE_IMAGE_CLASSES = 'max-w-full max-h-full object-contain cursor-pointer';
const SINGLE_IMAGE_CLASSES = 'max-w-full max-h-full object-contain cursor-pointer';
const LOADING_SLOT_CLASSES = 'h-full w-full max-w-max-width-content flex items-center justify-center';
const LOADING_FALLBACK_CLASSES = 'flex flex-col items-center gap-2';
const TOUCH_CLICK_SUPPRESSION_DISTANCE = 10;
const TOUCH_CLICK_SUPPRESSION_DURATION = 700;

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

  const imageStyle = {
    ...(paperConfig ? { filter: paperConfig.imageFilter } : {}),
  };
  // 占位块与纸底同色，消除纸型切换时的色差突兀
  const loadingSlotStyle = paperConfig ? { backgroundColor: paperConfig.bgColor } : undefined;

  const zoomStyle = zoomScale > 1
    ? {
        transform: `scale(${zoomScale})`,
        transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,
      }
    : {};

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
    onSurfaceTouchStart(event);
  };

  const handleTouchMove = (event: TouchEvent) => {
    onSurfaceTouchMove(event);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const touchStart = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;

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
      }}
    >
      {pageLayout === 'double' && horizontalPageSpread.length > 1 ? (
        <div className={cn(DOUBLE_SPREAD_CLASSES, turnAnimClass)}>
          {horizontalPageSpread.map((pageNumber) => {
            const url = pageUrls[pageNumber - 1];
            return (
              <div key={`${readingDirection}-${pageNumber}`} className={DOUBLE_PAGE_SLOT_CLASSES}>
                {url ? (
                  <img
                    src={url}
                    alt={`Page ${pageNumber}`}
                    className={DOUBLE_IMAGE_CLASSES}
                    style={imageStyle}
                    loading="eager"
                    draggable={false}
                    onClick={(event) => handleImageClick(pageNumber - 1, event)}
                  />
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
        <img
          key={currentPage}
          src={pageUrls[currentPage - 1]!}
          alt={`Page ${currentPage}`}
          className={cn(
            SINGLE_IMAGE_CLASSES,
            turnAnimClass,
            zoomScale > 1 && 'transition-transform duration-200'
          )}
          style={{
            ...imageStyle,
            ...zoomStyle,
          }}
          loading="eager"
          draggable={false}
          onClick={(event) => handleImageClick(currentPage - 1, event)}
        />
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
