import React from 'react';

import { COPY } from '@/constants/copy';

const VIEWPORT_EDGE_PX = 8;
const BUTTON_OFFSET_X_PX = 48;
const BUTTON_OFFSET_Y_PX = 52;
const BUTTON_MAX_WIDTH_PX = 176;
const BUTTON_MAX_HEIGHT_PX = 48;
const BUTTON_DIVIDER_CLASS = 'w-px h-5 bg-on-primary/30 my-1';

interface SelectionFloatingButtonProps {
  position: { x: number; y: number };
  /** 一键划线：零输入直接保存纯高亮 */
  onHighlight: () => void;
  /** 打开批注弹窗（写笔记） */
  onOpen: () => void;
  onCancel: () => void;
}

/** 选中文本后的浮动动作条（划线 / 批注）+ 透明取消遮罩 */
export const SelectionFloatingButton: React.FC<SelectionFloatingButtonProps> = ({
  position,
  onHighlight,
  onOpen,
  onCancel,
}) => (
  <>
    {/* 透明遮罩：点击空白区域取消选区 */}
    <div className="fixed inset-0 z-[68]" onClick={onCancel} />
    {/* 浮动动作条 */}
    <div
      className="fixed z-[69] bg-primary text-on-primary rounded-full shadow-paper-up flex items-center divide-none animate-fade-in hover:shadow-raised active:scale-95 transition-shadow"
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
  </>
);
