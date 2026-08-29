import React from 'react';

interface UndoToastProps {
  message: string;
  onUndo?: () => void;
}

/** 底部轻提示；提供 onUndo 时附带撤销按钮（由调用方负责定时隐藏） */
export const UndoToast: React.FC<UndoToastProps> = ({ message, onUndo }) => (
  <div
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] animate-fade-in"
    role="status"
    aria-live="polite"
  >
    <div className="bg-on-surface/80 backdrop-blur-sm rounded-full pl-4 pr-2 py-2 flex items-center gap-2 shadow-lg">
      <span className="font-label text-label-sm text-surface">{message}</span>
      {onUndo && (
        <button
          className="px-3 py-1 rounded-full bg-surface/20 text-surface font-label text-label-sm hover:bg-surface/30 transition-colors"
          onClick={onUndo}
          data-ui-control
        >
          撤销
        </button>
      )}
    </div>
  </div>
);
