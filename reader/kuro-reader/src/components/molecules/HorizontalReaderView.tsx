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
  onImageClick: (pageIndex: number, event: MouseEvent) => void;
  onImageTouchStart: (pageIndex: number, event: TouchEvent) => void;
  onImageTouchMove: (event: TouchEvent) => void;
  onImageTouchEnd: (event: TouchEvent) => void;
}

const HORIZONTAL_VIEW_CLASSES = 'w-full h-full flex items-center justify-center px-margin-mobile md:px-margin-desktop';
const DOUBLE_SPREAD_CLASSES = 'flex items-center justify-center h-full w-full gap-2 animate-page-fade';
const DOUBLE_PAGE_SLOT_CLASSES = 'h-full min-w-0 flex-1 flex items-center justify-center';
const DOUBLE_IMAGE_CLASSES = 'max-w-full max-h-full object-contain cursor-pointer';
const SINGLE_IMAGE_CLASSES = 'max-w-full max-h-full object-contain cursor-pointer animate-page-fade';
const LOADING_SLOT_CLASSES = 'h-full w-full max-w-max-width-content flex items-center justify-center bg-surface-container';
const LOADING_FALLBACK_CLASSES = 'flex flex-col items-center gap-2';

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
  onImageClick,
  onImageTouchStart,
  onImageTouchMove,
  onImageTouchEnd,
}) => {
  const imageStyle = {
    ...(paperConfig ? { filter: paperConfig.imageFilter } : {}),
    willChange: 'transform',
  };

  const zoomStyle = zoomScale > 1
    ? {
        transform: `scale(${zoomScale})`,
        transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,
      }
    : {};

  return (
    <div className={HORIZONTAL_VIEW_CLASSES}>
      {pageLayout === 'double' && horizontalPageSpread.length > 1 ? (
        <div className={DOUBLE_SPREAD_CLASSES}>
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
                    onClick={(event) => onImageClick(pageNumber - 1, event)}
                    onTouchStart={(event) => onImageTouchStart(pageNumber - 1, event)}
                    onTouchMove={onImageTouchMove}
                    onTouchEnd={onImageTouchEnd}
                  />
                ) : (
                  <div className={LOADING_SLOT_CLASSES}>
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
            zoomScale > 1 && 'transition-transform duration-200'
          )}
          style={{
            ...imageStyle,
            ...zoomStyle,
          }}
          loading="eager"
          draggable={false}
          onClick={(event) => onImageClick(currentPage - 1, event)}
          onTouchStart={(event) => onImageTouchStart(currentPage - 1, event)}
          onTouchMove={onImageTouchMove}
          onTouchEnd={onImageTouchEnd}
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
