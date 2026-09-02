import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { AnnotationRect } from '@/types';
import type { PositionedTextItem } from '@/services/pdfTextLayer';
import { getPdfTextItems } from '@/services/pdfTextLayer';
import { cn } from '@/utils/cn';

export interface PdfTextSelection {
  pageIndex: number;
  text: string;
  /** 选区矩形（页面相对坐标；浏览器换行会产生多枚） */
  rects: { x: number; y: number; w: number; h: number }[];
  /** 弹窗锚点（松手时指针的视口坐标） */
  anchor: { x: number; y: number };
}

interface PdfTextLayerOverlayProps {
  bookId: string;
  /** 章内页索引（0 起） */
  pageIndex: number;
  /** 文本项来源（默认 PDF 文本层；漫画 OCR 等场景可注入） */
  itemsProvider?: () => Promise<PositionedTextItem[]>;
  /** 该页已有划线高亮（跨多页批注中属于本页的矩形） */
  highlights: { id: string; rect: AnnotationRect }[];
  /** 选区回调（松开鼠标且选区在本文本层内时触发） */
  onSelect?: (selection: PdfTextSelection) => void;
  /** 点击已有高亮（打开批注详情） */
  onHighlightClick?: (annotationId: string) => void;
  /** 是否允许选择文字（选择模式下开启；关闭时整层穿透不拦截手势） */
  selectable: boolean;
}

/**
 * PDF 页面文字层：铺在页图上的透明可选文本 + 划线高亮回显。
 *
 * - 文本项用容器查询单位（cqw/cqh）定位，随页图任意缩放保持对齐
 * - 非 selectable 时整层 pointer-events:none，不影响翻页/长按手势
 */
export const PdfTextLayerOverlay: React.FC<PdfTextLayerOverlayProps> = ({
  bookId,
  pageIndex,
  itemsProvider,
  highlights,
  onSelect,
  onHighlightClick,
  selectable,
}) => {
  const [items, setItems] = useState<PositionedTextItem[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const provider = itemsProvider
      ?? (() => getPdfTextItems(bookId).then((pages) => pages[pageIndex] ?? []));
    provider()
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
    // itemsProvider 由调用方 useCallback 稳定提供
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, pageIndex, itemsProvider]);

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!onSelect || !selectable) return;
    const container = containerRef.current;
    if (!container) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
    // 选区必须落在本层内（跨页选区不支持：PDF 翻页浏览下无跨页拖选）
    if (!container.contains(sel.anchorNode)) return;

    const containerRect = container.getBoundingClientRect();
    const range = sel.getRangeAt(0);
    const rects: PdfTextSelection['rects'] = [];
    for (const domRect of Array.from(range.getClientRects())) {
      if (domRect.width <= 0 || domRect.height <= 0) continue;
      const x = (domRect.left - containerRect.left) / containerRect.width;
      const y = (domRect.top - containerRect.top) / containerRect.height;
      const w = domRect.width / containerRect.width;
      const h = domRect.height / containerRect.height;
      if (w <= 0 || h <= 0 || x < -0.05 || x > 1.05) continue;
      rects.push({ x, y, w, h });
    }
    const text = sel.toString().replace(/\s+/g, ' ').trim();
    if (!text || rects.length === 0) return;
    onSelect({ pageIndex, text, rects, anchor: { x: e.clientX, y: e.clientY } });
  };

  const spans = useMemo(() => {
    if (!items) return null;
    return items.map((item, i) => (
      <span
        key={i}
        style={{
          position: 'absolute',
          left: `${item.x * 100}cqw`,
          top: `${item.y * 100}cqh`,
          fontSize: `${item.h * 100}cqh`,
          lineHeight: 1,
          whiteSpace: 'pre',
          color: 'transparent',
          margin: 0,
          padding: 0,
        }}
      >
        {item.str}
      </span>
    ));
  }, [items]);

  return (
    <div
      ref={containerRef}
      data-pdf-text-layer
      className={cn('absolute inset-0 select-text', !selectable && 'pointer-events-none')}
      style={{ containerType: 'size' }}
      onMouseUp={handleMouseUp}
    >
      {spans}
      {highlights.map(({ id, rect }) => (
        <div
          key={id}
          className="absolute bg-primary/30 rounded-[2px] cursor-pointer"
          style={{
            left: `${rect.x * 100}cqw`,
            top: `${rect.y * 100}cqh`,
            width: `${rect.w * 100}cqw`,
            height: `${rect.h * 100}cqh`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onHighlightClick?.(id);
          }}
          data-ui-control
        />
      ))}
    </div>
  );
};
