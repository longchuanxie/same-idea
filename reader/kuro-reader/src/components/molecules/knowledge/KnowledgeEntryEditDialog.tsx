import React, { useEffect, useState } from 'react'

import { COPY } from '@/constants/copy'

/**
 * 知识件条目编辑弹窗（修订模式）：几个文本字段的通用表单。
 * 人物/概念改名字身份小传，术语改定义，速览改要点，导图改标题——一个弹窗全包。
 */

export interface EditFieldDef {
  key: string
  label: string
  placeholder?: string
  /** 多行文本（小传/定义/说明） */
  multiline?: boolean
  /** 留空不可保存（名字/术语这类标识字段） */
  required?: boolean
}

interface KnowledgeEntryEditDialogProps {
  isOpen: boolean
  title: string
  fields: EditFieldDef[]
  /** 各字段初值（打开时快照） */
  values: Record<string, string>
  onSave: (values: Record<string, string>) => void
  onCancel: () => void
}

export const KnowledgeEntryEditDialog: React.FC<KnowledgeEntryEditDialogProps> = ({
  isOpen,
  title,
  fields,
  values,
  onSave,
  onCancel,
}) => {
  const [draft, setDraft] = useState<Record<string, string>>(values)

  useEffect(() => {
    if (isOpen) setDraft(values)
  }, [isOpen, values])

  if (!isOpen) return null

  const trimmed: Record<string, string> = {}
  for (const field of fields) trimmed[field.key] = (draft[field.key] ?? '').trim()
  const savable = fields.every((field) => !field.required || trimmed[field.key].length > 0)

  return (
    <div
      className="fixed inset-0 z-dialog flex items-center justify-center bg-on-background/40 animate-fade-in"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-surface-bright border border-outline-variant rounded-card-lg shadow-raised p-6 mx-margin-mobile max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-md text-primary mb-4">{title}</h3>
        <div className="flex flex-col gap-4 mb-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="font-label text-label-sm text-on-surface-variant mb-1 block">
                {field.label}
              </label>
              {field.multiline ? (
                <textarea
                  value={draft[field.key] ?? ''}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={3}
                  className="input-field resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={draft[field.key] ?? ''}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full border border-outline-variant rounded-card px-3 py-2 font-body text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            className="btn-secondary px-6 py-2"
            onClick={onCancel}
          >
            {COPY.annotation.cancel}
          </button>
          <button
            className="btn-primary px-6 py-2"
            onClick={() => savable && onSave(trimmed)}
            disabled={!savable}
          >
            {COPY.knowledgeEdit.saveRevision}
          </button>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeEntryEditDialog
