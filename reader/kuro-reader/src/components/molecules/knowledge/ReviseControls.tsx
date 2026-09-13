import React from 'react'

import { COPY } from '@/constants/copy'

/**
 * 修订模式的条目控件：已校验章 + 改/删/校章三连。
 * 知识件视图（术语卡/速览卡/导图大纲/图谱侧卡）在修订模式下统一消费。
 */

/** 「已校验」章：读者核对过这条内容（朱砂印章意象） */
export const VerifiedBadge: React.FC = () => (
  <span
    className="inline-flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 rounded-full border border-seal/50 bg-seal-soft/60 text-seal-deep font-label text-label-xs"
    title={COPY.knowledgeEdit.verifiedBadge}
  >
    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
      verified
    </span>
    {COPY.knowledgeEdit.verifiedBadge}
  </span>
)

interface EntryReviseActionsProps {
  verified?: boolean
  onEdit: () => void
  onRemove: () => void
  onToggleVerified: () => void
  /** 无障碍用途的条目名（如术语名） */
  entryLabel: string
}

/** 改 / 删 / 盖章三连（仅修订模式渲染） */
export const EntryReviseActions: React.FC<EntryReviseActionsProps> = ({
  verified,
  onEdit,
  onRemove,
  onToggleVerified,
  entryLabel,
}) => (
  <div
    className="flex items-center gap-1"
    onClick={(e) => e.stopPropagation()}
    role="group"
    aria-label={`修订 ${entryLabel}`}
  >
    <button
      aria-label={`改 ${entryLabel}`}
      className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
      onClick={onEdit}
    >
      <span className="material-symbols-outlined text-icon-sm">edit</span>
    </button>
    <button
      aria-label={`删 ${entryLabel}`}
      className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-seal hover:bg-seal-soft/50 transition-colors"
      onClick={onRemove}
    >
      <span className="material-symbols-outlined text-icon-sm">delete</span>
    </button>
    <button
      aria-label={verified ? COPY.knowledgeEdit.unverify : COPY.knowledgeEdit.verify}
      title={verified ? COPY.knowledgeEdit.unverify : COPY.knowledgeEdit.verify}
      className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
        verified
          ? 'text-seal hover:bg-seal-soft/50'
          : 'text-on-surface-variant hover:text-seal hover:bg-seal-soft/50'
      }`}
      style={verified ? { fontVariationSettings: "'FILL' 1" } : undefined}
      onClick={onToggleVerified}
    >
      <span className="material-symbols-outlined text-icon-sm">verified</span>
    </button>
  </div>
)
