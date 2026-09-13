import React from 'react'

import { COPY } from '@/constants/copy'
import type { NotesOutlineResult } from '@/services/ai/notesOutline'
import { downloadTextFile, sanitizeFileName } from '@/utils/annotationExport'
import { copyTextToClipboard } from '@/utils/clipboard'
import { toast } from '@/utils/toast'

export interface NotesOutlineDialogState {
  status: 'loading' | 'done' | 'error'
  error?: string
  result?: NotesOutlineResult
  sourceCount: number
}

interface NotesOutlineDialogProps {
  state: NotesOutlineDialogState
  onClose: () => void
  onRetry: () => void
}

/** 从划线生成的写作提纲：标题 + Markdown 正文 + 原料计数，可复制可下载 */
export const NotesOutlineDialog: React.FC<NotesOutlineDialogProps> = ({ state, onClose, onRetry }) => {
  if (state.status === 'loading') {
    return (
      <div className="fixed inset-0 z-dialog flex items-center justify-center bg-on-background/40 animate-fade-in" onClick={onClose}>
        <div
          className="bg-surface-bright border border-outline-variant rounded-card-lg shadow-raised p-8 mx-margin-mobile max-w-md w-full text-center animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse block mb-3">edit_note</span>
          <p className="font-label text-label-md text-on-surface-variant">{COPY.notesTheme.outlineLoading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-dialog flex items-center justify-center bg-on-background/40 animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={COPY.notesTheme.outlineTitle}
        className="bg-surface-bright border border-outline-variant rounded-card-lg shadow-raised p-6 mx-margin-mobile max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {state.status === 'error' ? (
          <div className="text-center py-4">
            <p className="font-label text-label-md text-seal-deep mb-4">{state.error || COPY.notesTheme.outlineFailed}</p>
            <div className="flex justify-center gap-3">
              <button className="font-label text-label-md text-on-surface-variant hover:text-primary px-4 py-2" onClick={onClose}>
                {COPY.annotation.close}
              </button>
              <button
                className="btn-secondary px-4 py-2"
                onClick={onRetry}
              >
                {COPY.askLibrary.retry}
              </button>
            </div>
          </div>
        ) : (
          state.result && (
            <>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display text-headline-md text-primary">{state.result.title}</h3>
                <button
                  aria-label={COPY.annotation.close}
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                  onClick={onClose}
                >
                  <span className="material-symbols-outlined text-icon-sm">close</span>
                </button>
              </div>
              <p className="font-label text-label-xs text-on-surface-faint mb-4">
                {COPY.notesTheme.outlineSources(state.sourceCount)}
              </p>
              <pre className="p-3 rounded-card bg-surface-container-low border border-outline-variant font-body text-body-sm text-on-surface whitespace-pre-wrap break-words">
                {state.result.markdown}
              </pre>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors px-4 py-2"
                  onClick={() => {
                    void copyTextToClipboard(`# ${state.result!.title}\n\n${state.result!.markdown}`).then((ok) =>
                      toast(ok ? COPY.citation.copiedToast : COPY.citation.copyFailedToast)
                    )
                  }}
                >
                  {COPY.notesTheme.outlineCopy}
                </button>
                <button
                  className="btn-secondary px-4 py-2"
                  onClick={() =>
                    downloadTextFile(
                      `提纲-${sanitizeFileName(state.result!.title)}.md`,
                      `# ${state.result!.title}\n\n${state.result!.markdown}\n`
                    )
                  }
                >
                  {COPY.notesTheme.outlineDownload}
                </button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default NotesOutlineDialog
