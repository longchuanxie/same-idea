import React, { useState, useRef, useCallback, useEffect } from 'react';

import { cn } from '@/utils/cn';

export interface FullscreenViewerProps {
  imageUrl: string;
  pageIndex: number;
  totalPages: number;
  onClose: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const SCALE_STEP = 0.5;
const DOUBLE_TAP_SCALE = 2.5;
const WHEEL_SCALE_FACTOR = 0.5;
const DOUBLE_TAP_THRESHOLD_MS = 300;
const PERCENT_MULTIPLIER = 100;

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({
  imageUrl,
  pageIndex,
  totalPages,
  onClose,
  onPrevPage,
  onNextPage,
}) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastTapRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Gesture refs
  const pinchStartDistRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const pinchMidpointRef = useRef({ x: 0, y: 0 });
  const translateOnPinchStartRef = useRef({ x: 0, y: 0 });
  const isPinchingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const translateStartRef = useRef({ x: 0, y: 0 });

  const resetTransform = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetTransform();
  }, [imageUrl, resetTransform]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetTransform();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && scale <= 1) {
        onPrevPage?.();
      } else if (e.key === 'ArrowRight' && scale <= 1) {
        onNextPage?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrevPage, onNextPage, scale, resetTransform]);

  const getDistance = (t1: { clientX: number; clientY: number }, t2: { clientX: number; clientY: number }): number => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMidpoint = (t1: { clientX: number; clientY: number }, t2: { clientX: number; clientY: number }): { x: number; y: number } => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const limitTranslate = useCallback((newScale: number, newTranslate: { x: number; y: number }): { x: number; y: number } => {
    if (newScale <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return newTranslate;

    const containerRect = container.getBoundingClientRect();
    const imgNaturalWidth = img.naturalWidth || containerRect.width;
    const imgNaturalHeight = img.naturalHeight || containerRect.height;
    const aspectRatio = imgNaturalWidth / imgNaturalHeight;

    let renderedWidth: number;
    let renderedHeight: number;
    const containerAspect = containerRect.width / containerRect.height;
    if (aspectRatio > containerAspect) {
      renderedWidth = containerRect.width;
      renderedHeight = containerRect.width / aspectRatio;
    } else {
      renderedHeight = containerRect.height;
      renderedWidth = containerRect.height * aspectRatio;
    }

    const scaledWidth = renderedWidth * newScale;
    const scaledHeight = renderedHeight * newScale;

    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newTranslate.x)),
      y: Math.max(-maxY, Math.min(maxY, newTranslate.y)),
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      isPinchingRef.current = true;
      const dist = getDistance(e.touches[0], e.touches[1]);
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scale;
      pinchMidpointRef.current = getMidpoint(e.touches[0], e.touches[1]);
      translateOnPinchStartRef.current = { ...translate };
    } else if (e.touches.length === 1 && scale > 1) {
      // Drag start
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      translateStartRef.current = { ...translate };
      setIsDragging(true);
    }
  }, [scale, translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && isPinchingRef.current) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      const scaleRatio = dist / pinchStartDistRef.current;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchStartScaleRef.current * scaleRatio));

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const midpoint = getMidpoint(e.touches[0], e.touches[1]);

      // Calculate translate to keep pinch midpoint stable
      const scaleChange = newScale / pinchStartScaleRef.current;
      const dx = (midpoint.x - rect.left - rect.width / 2) - (pinchMidpointRef.current.x - rect.left - rect.width / 2);
      const dy = (midpoint.y - rect.top - rect.height / 2) - (pinchMidpointRef.current.y - rect.top - rect.height / 2);

      const newTranslate = {
        x: translateOnPinchStartRef.current.x * scaleChange + dx,
        y: translateOnPinchStartRef.current.y * scaleChange + dy,
      };

      setScale(newScale);
      setTranslate(limitTranslate(newScale, newTranslate));
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      const newTranslate = {
        x: translateStartRef.current.x + dx,
        y: translateStartRef.current.y + dy,
      };
      setTranslate(limitTranslate(scale, newTranslate));
    }
  }, [isDragging, scale, limitTranslate]);

  const handleTouchEnd = useCallback(() => {
    isPinchingRef.current = false;
    setIsDragging(false);
    if (scale < 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -SCALE_STEP * WHEEL_SCALE_FACTOR : SCALE_STEP * WHEEL_SCALE_FACTOR;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    setScale(newScale);
    if (newScale <= 1) {
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD_MS) {
      if (scale > 1) {
        resetTransform();
      } else {
        setScale(DOUBLE_TAP_SCALE);
      }
    }
    lastTapRef.current = now;
  }, [scale, resetTransform]);

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(MAX_SCALE, scale + SCALE_STEP);
    setScale(newScale);
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(MIN_SCALE, scale - SCALE_STEP);
    setScale(newScale);
    if (newScale <= 1) {
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && scale <= 1) {
        onClose();
      }
    },
    [onClose, scale]
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={handleBackgroundClick}
    >
      <div className="flex items-center justify-between px-4 py-3 z-10 pt-safe">
        <button
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          onClick={onClose}
          aria-label="关闭全屏"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="font-label text-label-md text-white/80">
          {pageIndex + 1} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="缩小"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="font-label text-label-sm text-white/60 min-w-[3rem] text-center">
            {Math.round(scale * PERCENT_MULTIPLIER)}%
          </span>
          <button
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="放大"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center overflow-hidden select-none touch-none"
        onWheel={handleWheel}
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={`Page ${pageIndex + 1}`}
          className={cn(
            'max-w-full max-h-full object-contain',
            isDragging || isPinchingRef.current ? 'transition-none' : 'transition-transform duration-100'
          )}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          draggable={false}
        />
      </div>

      {scale <= 1 && (
        <div className="flex items-center justify-center gap-6 py-4 z-10 pb-safe">
          <button
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              pageIndex > 0
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            )}
            onClick={onPrevPage}
            disabled={pageIndex <= 0}
            aria-label="上一页"
          >
            <span className="material-symbols-outlined">navigate_before</span>
          </button>
          <button
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              'bg-white/10 text-white hover:bg-white/20'
            )}
            onClick={resetTransform}
            aria-label="重置缩放"
          >
            <span className="material-symbols-outlined">fit_screen</span>
          </button>
          <button
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              pageIndex < totalPages - 1
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            )}
            onClick={onNextPage}
            disabled={pageIndex >= totalPages - 1}
            aria-label="下一页"
          >
            <span className="material-symbols-outlined">navigate_next</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FullscreenViewer;
