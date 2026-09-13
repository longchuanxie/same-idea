import React, { useState } from 'react'

import { COPY } from '@/constants/copy'
import type { Book } from '@/types'
import {
  CITATION_FORMAT_LABELS,
  buildCitation,
  type CitationFormat,
} from '@/utils/citationExport'
import { copyTextToClipboard } from '@/utils/clipboard'
import { toast } from '@/utils/toast'

const FORMATS: CitationFormat[] = ['bibtex', 'gbt7714', 'apa']
/** 「已复制」对勾的停留时长（ms） */
const COPIED_FEEDBACK_MS = 1600

interface CitationDialogProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
}

/** 引用这本书：BibTeX / GB/T 7714 / APA 三格式预览 + 一键复制（写论文直接贴） */
export const CitationDialog: React.FC<CitationDialogProps> = ({ book, isOpen, onClose }) => {
  const [copied, setCopied] = useState<CitationFormat | null>(null)

  if (!isOpen || !book) return null

  const handleCopy = async (format: CitationFormat, text: string) => {
    const ok = await copyTextToClipboard(text)
    if (ok) {
      setCopied(format)
      toast(COPY.citation.copiedToast)
      window.setTimeout(() => setCopied(null), COPIED_FEEDBACK_MS)
    } else {
      toast(COPY.citation.copyFailedToast)
    }
  }

  return (
    <div className="fixed inset-0 z-dialog flex items-center justify-center bg-on-background/40 animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={COPY.citation.dialogTitle}
        className="bg-surface-bright border border-outline-variant rounded-card-lg shadow-raised p-6 mx-margin-mobile max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-md text-primary mb-1">
          {COPY.citation.dialogTitle}
        </h3>
        <p className="font-label text-label-sm text-on-surface-faint mb-4 truncate">
          《{book.title}》
          {!book.author.trim() && ` · ${COPY.citation.noAuthorHint}`}
        </p>

        <div className="flex flex-col gap-4">
          {FORMATS.map((format) => {
            const text = buildCitation(book, format)
            return (
              <div key={format}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label text-label-sm text-on-surface-variant">
                    {CITATION_FORMAT_LABELS[format]}
                  </span>
                  <button
                    className={`font-label text-label-sm transition-colors ${
                      copied === format ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                    }`}
                    onClick={() => void handleCopy(format, text)}
                  >
                    {copied === format ? '✓' : COPY.citation.copyAction}
                  </button>
                </div>
                <pre className="p-3 rounded-card bg-surface-container-low border border-outline-variant font-mono text-label-md text-on-surface whitespace-pre-wrap break-all">
                  {text}
                </pre>
              </div>
            )
          })}
        </div>

        <div className="flex justify-end mt-5">
          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors px-4 py-2"
            onClick={onClose}
          >
            {COPY.annotation.close}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CitationDialog
