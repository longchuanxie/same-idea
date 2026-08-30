import React from 'react';

const VIEWPORT_EDGE_PX = 8;
const BUTTON_OFFSET_X_PX = 24;
const BUTTON_OFFSET_Y_PX = 52;
const BUTTON_MAX_WIDTH_PX = 100;
const BUTTON_MAX_HEIGHT_PX = 48;

interface SelectionFloatingButtonProps {
  position: { x: number; y: number };
  onOpen: () => void;
  onCancel: () => void;
}

/** 选中文本后的浮动「批注」按钮 + 透明取消遮罩 */
export const SelectionFloatingButton: React.FC<SelectionFloatingButtonProps> = ({
  position,
  onOpen,
  onCancel,
}) => (
  <>
    {/* 透明遮罩：点击空白区域取消选区 */}
    <div className="fixed inset-0 z-[68]" onClick={onCancel} />
    {/* 浮动按钮 */}
    <button
      className="fixed z-[69] bg-primary text-on-primary rounded-full shadow-paper-up flex items-center gap-1.5 pl-2.5 pr-3 py-2 animate-fade-in hover:shadow-raised active:scale-95 transition-shadow"
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
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      data-ui-control
    >
      <span className="material-symbols-outlined text-[18px]">edit_note</span>
      <span className="font-label text-label-sm">批注</span>
    </button>
  </>
);
