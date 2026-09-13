import React from 'react'

import { COPY } from '@/constants/copy'
import { copyTextToClipboard } from '@/utils/clipboard'
import { toast } from '@/utils/toast'

const POPUP_EDGE_MARGIN_PX = 16
const POPUP_VERTICAL_OFFSET_PX = 8
const VIEWPORT_EDGE_MARGIN_PX = 8
const POPUP_WIDTH = 340
const POPUP_MAX_HEIGHT = 380
/** 原文预览行数（译文才是主角） */
const SOURCE_CLAMP_CLASS = 'line-clamp-3'

export interface TranslateState {
  text: string
  status: 'loading' | 'error' | 'done'
  translation?: string
  errorMessage?: string
}

interface TranslatePopupProps {
  state: TranslateState
  position: { x: number; y: number } | null
  /** 译文存为批注（原文 + 译文）——由阅读器负责落库 */
  onSaveAsNote: (translation: string) => void
  onClose: () => void
}

/** 划词翻译弹层：原文收起、译文为主，可复制、可存为批注 */
export const TranslatePopup: React.FC<TranslatePopupProps> = ({
  state,
  position,
  onSaveAsNote,
  onClose,
}) => {
  if (!position) return null

  const left = Math.min(position.x, window.innerWidth - POPUP_WIDTH - POPUP_EDGE_MARGIN_PX)
  const top = position.y + POPUP_VERTICAL_OFFSET_PX

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(state.translation ?? '')
    toast(ok ? COPY.translate.copiedToast : COPY.translate.copyFailedToast)
  }

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div
        role="dialog"
        aria-label={COPY.translate.action}
        className="absolute bg-surface rounded-card-lg shadow-raised border border-outline-variant/50 overflow-hidden animate-fade-in"
        style={{
          left: Math.max(VIEWPORT_EDGE_MARGIN_PX, left),
          top: Math.min(top, window.innerHeight - POPUP_MAX_HEIGHT - POPUP_EDGE_MARGIN_PX),
          width: POPUP_WIDTH,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 原文（收起） */}
        <div className="px-4 py-3 bg-primary/10 border-b border-outline-variant/30">
          <p className="font-label text-label-xs text-primary mb-1">{COPY.translate.sourceLabel}</p>
          <p className={`font-body text-body-sm text-on-surface-variant leading-relaxed ${SOURCE_CLAMP_CLASS} opacity-80`}>
            {state.text}
          </p>
        </div>

        {/* 译文 */}
        <div className="px-4 py-3 max-h-[220px] overflow-y-auto">
          {state.status === 'loading' && (
            <p className="font-body text-body-sm text-on-surface-variant flex items-center gap-2 py-2">
              <span className="material-symbols-outlined text-[18px] animate-pulse">hourglass_top</span>
              {COPY.translate.loading}
            </p>
          )}
          {state.status === 'error' && (
            <p className="font-label text-label-sm text-seal-deep py-2">
              {state.errorMessage || COPY.translate.failed}
            </p>
          )}
          {state.status === 'done' && state.translation && (
            <p className="font-body text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
              {state.translation}
            </p>
          )}
        </div>

        {/* 操作 */}
        <div className="flex justify-end gap-2 px-4 pb-3">
          <button
            className="px-4 py-1.5 rounded-lg font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
            onClick={onClose}
          >
            {COPY.annotation.close}
          </button>
          {state.status === 'done' && state.translation && (
            <>
              <button
                className="px-4 py-1.5 rounded-lg font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                onClick={() => void handleCopy()}
              >
                {COPY.translate.copyTranslation}
              </button>
              <button
                className="btn-primary btn-sm px-4 py-1.5"
                onClick={() => onSaveAsNote(state.translation!)}
              >
                {COPY.translate.saveAsNote}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranslatePopup
