import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  clampTrackRatio,
  getHorizontalPageSpread,
  getPageSpreadLabel,
  pagePositionFromTrackRatio,
} from '@/utils/readerPagination';

const PERCENT_MULTIPLIER = 100;

interface ReaderProgressTrackProps {
  totalPages: number;
  direction: 'vertical' | 'horizontal';
  pageLayout: 'single' | 'double';
  readingDirection: 'ltr' | 'rtl';
  /** 非拖拽状态的进度百分比（0..100） */
  progressPercent: number;
  /** 非拖拽状态的页码标签（双页排版显示跨页标签） */
  currentPageLabel: string;
  /** 松手/点击轨道的统一跳页入口（携带页内占比，垂直模式拇指与视口逐像素一致） */
  onJump: (page: number, pageScrollRatio: number) => void;
  /** 用户开始交互（点击/拖拽）时触发，父层用于抑制随后的单击切 UI */
  onInteractStart?: () => void;
}

/**
 * 漫画阅读器底部进度条：轨道点击 + 拖拽预览 + 松手精确落点。
 * 拖拽期间吃掉全局 touchmove，避免指尖滑出轨道后底层阅读容器跟着滚动。
 */
export const ReaderProgressTrack: React.FC<ReaderProgressTrackProps> = ({
  totalPages,
  direction,
  pageLayout,
  readingDirection,
  progressPercent,
  currentPageLabel,
  onJump,
  onInteractStart,
}) => {
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragPageRef = useRef<number | null>(null);
  /** 拖拽期间的轨道比例（0..1）：松手时按模式语义精确映射落点 */
  const dragRatioRef = useRef<number | null>(null);
  const [dragPage, setDragPage] = useState<number | null>(null);

  const dragPageLabel = (() => {
    if (dragPage === null) return currentPageLabel;
    if (direction !== 'horizontal' || pageLayout !== 'double') return `${dragPage}`;
    return getPageSpreadLabel(getHorizontalPageSpread(dragPage, totalPages, pageLayout, readingDirection));
  })();

  /** 轨道坐标 → 拖拽比例（0..1，供统一映射） */
  const getTrackRatioFromClientX = useCallback((clientX: number) => {
    const track = progressTrackRef.current;
    if (!track || totalPages === 0) return null;
    const rect = track.getBoundingClientRect();
    return clampTrackRatio((clientX - rect.left) / rect.width);
  }, [totalPages]);

  /** 轨道坐标 → 预览页码（拖拽标签） */
  const getPageFromClientX = useCallback((clientX: number) => {
    const ratio = getTrackRatioFromClientX(clientX);
    if (ratio == null) return 1;
    return pagePositionFromTrackRatio(ratio, totalPages, direction).page;
  }, [getTrackRatioFromClientX, direction, totalPages]);

  const handleScrollTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clampTrackRatio((e.clientX - rect.left) / rect.width);
    const pos = pagePositionFromTrackRatio(ratio, totalPages, direction);
    onJump(pos.page, pos.pageScrollRatio);
    onInteractStart?.();
  }, [direction, totalPages, onJump, onInteractStart]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    onInteractStart?.();
    const ratio = getTrackRatioFromClientX(e.clientX);
    if (ratio != null) dragRatioRef.current = ratio;
    const page = getPageFromClientX(e.clientX);
    dragPageRef.current = page;
    setDragPage(page);
  }, [getTrackRatioFromClientX, getPageFromClientX, onInteractStart]);

  const handleProgressTouchStart = useCallback((e: React.TouchEvent) => {
    isDraggingRef.current = true;
    onInteractStart?.();
    const touch = e.touches[0];
    const ratio = getTrackRatioFromClientX(touch.clientX);
    if (ratio != null) dragRatioRef.current = ratio;
    const page = getPageFromClientX(touch.clientX);
    dragPageRef.current = page;
    setDragPage(page);
  }, [getTrackRatioFromClientX, getPageFromClientX, onInteractStart]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const ratio = getTrackRatioFromClientX(e.clientX);
      if (ratio != null) dragRatioRef.current = ratio;
      const page = getPageFromClientX(e.clientX);
      dragPageRef.current = page;
      setDragPage(page);
    };

    const releaseDrag = () => {
      isDraggingRef.current = false;
      const ratio = dragRatioRef.current;
      const page = dragPageRef.current;
      dragPageRef.current = null;
      dragRatioRef.current = null;
      setDragPage(null);
      if (page === null || ratio === null) return;
      // 松手落点用比例精确映射：垂直模式携带页内占比，拇指与视口逐像素一致
      const pos = pagePositionFromTrackRatio(ratio, totalPages, direction);
      onJump(pos.page, pos.pageScrollRatio);
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      releaseDrag();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      // 拖进度条期间吃掉手势，避免指尖滑出 track 后底层阅读容器同步滚动
      e.preventDefault();
      const touch = e.touches[0];
      const ratio = getTrackRatioFromClientX(touch.clientX);
      if (ratio != null) dragRatioRef.current = ratio;
      const page = getPageFromClientX(touch.clientX);
      dragPageRef.current = page;
      setDragPage(page);
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;
      releaseDrag();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [getTrackRatioFromClientX, getPageFromClientX, onJump, direction, totalPages]);

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="font-label text-label-sm text-on-surface-variant tabular-nums min-w-10 text-right">
        {dragPageLabel}
      </span>
      <div
        ref={progressTrackRef}
        className="flex-1 h-3 bg-surface-container-high/80 relative rounded-full cursor-pointer touch-none select-none"
        onClick={handleScrollTrackClick}
        onMouseDown={handleProgressMouseDown}
        onTouchStart={handleProgressTouchStart}
        data-ui-control
      >
        <div
          className="absolute left-0 top-0 h-full bg-primary/70 rounded-full transition-all duration-150"
          style={{ width: `${dragPage !== null ? ((dragPage / totalPages) * PERCENT_MULTIPLIER) : progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 bg-primary rounded-full shadow-md ring-2 ring-surface"
          style={{ left: `${dragPage !== null ? ((dragPage / totalPages) * PERCENT_MULTIPLIER) : progressPercent}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <span className="font-label text-label-sm text-on-surface-variant tabular-nums min-w-8">{totalPages}</span>
    </div>
  );
};
