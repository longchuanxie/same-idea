import React from 'react'

import { COPY } from '@/constants/copy'
import type { VocabLookupResult } from '@/services/ai/vocabLookup'

const POPUP_EDGE_MARGIN_PX = 16
const POPUP_VERTICAL_OFFSET_PX = 8
const VIEWPORT_EDGE_MARGIN_PX = 8
const POPUP_WIDTH = 320
const POPUP_MAX_HEIGHT = 360

export interface VocabLookupState {
  word: string
  context: string
  status: 'loading' | 'error' | 'done'
  result?: VocabLookupResult
  errorMessage?: string
}

interface VocabLookupPopupProps {
  state: VocabLookupState
  position: { x: number; y: number } | null
  /** 收进生词本（调用方负责去重与落库） */
  onSave: (result: VocabLookupResult) => void
  onClose: () => void
}

/** 划词查词弹层：翻词典 → 释义卡（词/发音/释义/用法 + 语境句）→ 收进生词本 */
export const VocabLookupPopup: React.FC<VocabLookupPopupProps> = ({
  state,
  position,
  onSave,
  onClose,
}) => {
  if (!position) return null

  const left = Math.min(position.x, window.innerWidth - POPUP_WIDTH - POPUP_EDGE_MARGIN_PX)
  const top = position.y + POPUP_VERTICAL_OFFSET_PX

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div
        role="dialog"
        aria-label={COPY.vocab.lookupTitle}
        className="absolute bg-surface rounded-card-lg shadow-raised border border-outline-variant/50 overflow-hidden animate-fade-in"
        style={{
          left: Math.max(VIEWPORT_EDGE_MARGIN_PX, left),
          top: Math.min(top, window.innerHeight - POPUP_MAX_HEIGHT - POPUP_EDGE_MARGIN_PX),
          width: POPUP_WIDTH,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 词头 */}
        <div className="px-4 py-3 bg-primary/10 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-icon-sm">translate</span>
            <span className="font-display text-headline-sm text-primary truncate">{state.word}</span>
            {state.result?.pronunciation && (
              <span className="font-label text-label-sm text-on-surface-variant truncate">
                {state.result.pronunciation}
              </span>
            )}
          </div>
        </div>

        {/* 释义区 */}
        <div className="px-4 py-3 max-h-[220px] overflow-y-auto">
          {state.status === 'loading' && (
            <p className="font-body text-body-sm text-on-surface-variant flex items-center gap-2 py-2">
              <span className="material-symbols-outlined text-[18px] animate-pulse">hourglass_top</span>
              {COPY.vocab.loading}
            </p>
          )}
          {state.status === 'error' && (
            <p className="font-label text-label-sm text-seal-deep py-2">
              {state.errorMessage || COPY.vocab.lookupFailed}
            </p>
          )}
          {state.status === 'done' && state.result && (
            <>
              <p className="font-body text-body-md text-on-surface leading-relaxed">
                {state.result.definition}
              </p>
              {state.result.note && (
                <p className="font-label text-label-sm text-on-surface-variant mt-2 leading-relaxed">
                  {state.result.note}
                </p>
              )}
              {state.context && (
                <div className="mt-3">
                  <p className="font-label text-label-xs text-on-surface-faint mb-1">{COPY.vocab.contextLabel}</p>
                  <p className="font-body text-body-sm text-on-surface-variant leading-relaxed line-clamp-3 opacity-80">
                    …{state.context}…
                  </p>
                </div>
              )}
            </>
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
          {state.status === 'done' && state.result && (
            <button
              className="btn-primary btn-sm px-4 py-1.5"
              onClick={() => onSave(state.result!)}
            >
              {COPY.vocab.saveToVocab}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VocabLookupPopup
