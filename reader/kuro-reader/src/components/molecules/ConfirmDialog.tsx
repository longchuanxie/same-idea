import React from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/40 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-surface-bright border border-outline-variant rounded-lg p-6 mx-margin-mobile max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-md text-primary mb-3">{title}</h3>
        <p className="font-body text-body-md text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            className="border border-outline-variant text-on-surface-variant font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`font-label text-label-md px-6 py-2 rounded hover:opacity-90 transition-colors ${
              variant === 'danger'
                ? 'bg-error text-on-error'
                : 'bg-primary text-on-primary'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
