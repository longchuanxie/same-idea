import React, { useEffect, useRef } from 'react';

import { COPY } from '@/constants/copy';

const VIEWPORT_EDGE_PX = 8;
/** 选区/手柄豁免区外扩：盖住选区行下方的原生拖拽手柄（水滴球在选区矩形下方 ~24px） */
const SELECTION_EXEMPT_MARGIN_PX = 30;
const BUTTON_OFFSET_X_PX = 48;
const BUTTON_OFFSET_Y_PX = 52;
/** 动作条（划线/复制/查词/批注）的最长宽度 */
const BUTTON_MAX_WIDTH_PX = 330;
const BUTTON_MAX_HEIGHT_PX = 48;
const BUTTON_DIVIDER_CLASS = 'w-px h-5 bg-on-primary/30 my-1';

interface SelectionFloatingButtonProps {
  position: { x: number; y: number };
  /** 选区包围盒（视口坐标）：其外扩邻域内的触摸属于选区本身或原生拖拽手柄，不触发外点取消 */
  selectionRect?: { x: number; y: number; width: number; height: number };
  /** 一键划线：零输入直接保存纯高亮 */
  onHighlight: () => void;
  /** 复制选中文本到剪贴板 */
  onCopy: () => void;
  /** 打开批注弹窗（写笔记） */
  onOpen: () => void;
  /** 划词查词（短选区才有——词或短语才值得翻词典） */
  onLookup?: () => void;
  /** 划句翻译（长选区才有——与查词互斥分流，动作条恒为四键） */
  onTranslate?: () => void;
  onCancel: () => void;
}

/** 判断点击点是否落在选区（含手柄）邻域内 */
function isWithinSelectionZone(
  point: { x: number; y: number },
  rect?: { x: number; y: number; width: number; height: number }
): boolean {
  if (!rect) return false;
  const m = SELECTION_EXEMPT_MARGIN_PX;
  return (
    point.x >= rect.x - m &&
    point.x <= rect.x + rect.width + m &&
    point.y >= rect.y - m &&
    point.y <= rect.y + rect.height + m
  );
}

/**
 * 选中文本后的浮动动作条（划线 / 复制 / 查词|翻译 / 批注）。
 *
 * 外点取消不走全屏遮罩：遮罩会拦下原生选区手柄的拖拽触摸（扩选直接失效，真机实测），
 * 也会吃掉顶栏/底栏按钮的第一次点击。改为文档级捕获 click：
 * - 点在动作条内 → 不处理（按钮自身 stopPropagation，不会到 document）；
 * - 点在选区/手柄邻域 → 不处理（拖柄扩选、点选区本身）；
 * - 点在 UI 控件上 → 仅取消选区，控件点击照常生效（选区存在时导航可一次点中）；
 * - 点在正文空白 → 取消选区并吞掉该 click（避免顺手触发翻页/UI 切换）。
 */
export const SelectionFloatingButton: React.FC<SelectionFloatingButtonProps> = ({
  position,
  selectionRect,
  onHighlight,
  onCopy,
  onOpen,
  onLookup,
  onTranslate,
  onCancel,
}) => {
  // 快照最新回调与选区矩形，监听器只在挂载时注册一次
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;
  const zoneRef = useRef(selectionRect);
  zoneRef.current = selectionRect;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const node = e.target as Node | null;
      // 捕获阶段先于动作条按钮的 onClick 执行：点在动作条内直接放行
      if (containerRef.current && node && containerRef.current.contains(node)) return;
      if (isWithinSelectionZone({ x: e.clientX, y: e.clientY }, zoneRef.current)) return;
      const target = e.target as HTMLElement;
      const isUiControl = !!target.closest('button, a, input, textarea, select, [role="button"], [data-ui-control]');
      cancelRef.current();
      if (!isUiControl) {
        // 正文/空白处的点击只用于取消选区：吞掉，防止同一个 click 继续触发翻页或 UI 切换
        e.stopPropagation();
        e.preventDefault();
      }
    };
    document.addEventListener('click', handleDocClick, true);
    return () => document.removeEventListener('click', handleDocClick, true);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed z-[69] option-active rounded-full shadow-paper-up flex items-center divide-none animate-fade-in hover:shadow-raised active:scale-95 transition-shadow"
      style={{
        left: Math.max(
          VIEWPORT_EDGE_PX,
          Math.min(position.x - BUTTON_OFFSET_X_PX, window.innerWidth - BUTTON_MAX_WIDTH_PX)
        ),
        top: Math.max(
          VIEWPORT_EDGE_PX,
          Math.min(position.y - BUTTON_OFFSET_Y_PX, window.innerHeight - BUTTON_MAX_HEIGHT_PX)
        ),
      }}
    >
      <button
        className="flex items-center gap-1.5 pl-3 pr-2.5 py-2"
        onClick={(e) => {
          e.stopPropagation();
          onHighlight();
        }}
        data-ui-control
        aria-label={COPY.annotation.highlightAction}
      >
        <span className="material-symbols-outlined text-[18px]">highlight</span>
        <span className="font-label text-label-sm">{COPY.annotation.highlightAction}</span>
      </button>
      <span className={BUTTON_DIVIDER_CLASS} aria-hidden="true" />
      <button
        className="flex items-center gap-1.5 px-2.5 py-2"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        data-ui-control
        aria-label={COPY.annotation.copyAction}
      >
        <span className="material-symbols-outlined text-[18px]">content_copy</span>
        <span className="font-label text-label-sm">{COPY.annotation.copyAction}</span>
      </button>
      {onLookup && (
        <>
          <span className={BUTTON_DIVIDER_CLASS} aria-hidden="true" />
          <button
            className="flex items-center gap-1.5 px-2.5 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onLookup();
            }}
            data-ui-control
            aria-label={COPY.vocab.lookupAction}
          >
            <span className="material-symbols-outlined text-[18px]">translate</span>
            <span className="font-label text-label-sm">{COPY.vocab.lookupAction}</span>
          </button>
        </>
      )}
      {onTranslate && (
        <>
          <span className={BUTTON_DIVIDER_CLASS} aria-hidden="true" />
          <button
            className="flex items-center gap-1.5 px-2.5 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onTranslate();
            }}
            data-ui-control
            aria-label={COPY.translate.action}
          >
            <span className="material-symbols-outlined text-[18px]">g_translate</span>
            <span className="font-label text-label-sm">{COPY.translate.action}</span>
          </button>
        </>
      )}
      <span className={BUTTON_DIVIDER_CLASS} aria-hidden="true" />
      <button
        className="flex items-center gap-1.5 pl-2.5 pr-3 py-2"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        data-ui-control
        aria-label={COPY.annotation.annotateAction}
      >
        <span className="material-symbols-outlined text-[18px]">edit_note</span>
        <span className="font-label text-label-sm">{COPY.annotation.annotateAction}</span>
      </button>
    </div>
  );
};
