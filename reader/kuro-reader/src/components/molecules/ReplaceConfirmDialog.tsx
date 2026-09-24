import React from 'react'

import { Button } from '@/components/atoms/Button'
import type { PendingBookReplace } from '@/stores/useLibraryStore'

/**
 * 同书换新文件的替换确认（M1.8 追更主路径）：
 * 对照书架现存与新文件（防同标题误伤），三选一——替换内容（同书续读）/保留两本/取消。
 * 形制沿 ConfirmDialog：z-dialog + surface-bright + card-lg + raised。
 */

interface ReplaceConfirmDialogProps {
  pending: PendingBookReplace | null
  onResolve: (decision: 'replace' | 'keep-both' | 'cancel') => void
}

function CompareRow({ label, existing, incoming }: { label: string; existing: string; incoming: string }) {
  return (
    <div className="grid grid-cols-[5rem_1fr_1fr] items-baseline gap-2 py-1.5">
      <span className="font-label text-label-sm text-on-surface-variant">{label}</span>
      <span className="font-body text-body-sm text-on-surface-variant">{existing}</span>
      <span className="font-body text-body-sm text-primary">{incoming}</span>
    </div>
  )
}

export const ReplaceConfirmDialog: React.FC<ReplaceConfirmDialogProps> = ({ pending, onResolve }) => {
  if (!pending) return null

  return (
    <div
      className="fixed inset-0 z-dialog flex items-center justify-center bg-on-background/40 animate-fade-in"
      onClick={() => onResolve('cancel')}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-surface-bright rounded-card-lg shadow-raised p-6 mx-margin-mobile max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-md text-primary mb-2">这本书已经在书架上</h3>
        <p className="font-body text-body-md text-on-surface-variant mb-4">
          是同一本换了新文件（追更），还是另一本同名书？
        </p>

        <div className="rounded-card bg-surface-container px-4 py-3 mb-4">
          <div className="grid grid-cols-[5rem_1fr_1fr] gap-2 pb-1.5 border-b border-outline-variant">
            <span />
            <span className="font-label text-label-sm text-on-surface-variant">书架现存</span>
            <span className="font-label text-label-sm text-primary">新文件</span>
          </div>
          <CompareRow label="标题" existing={pending.existingTitle} incoming={pending.incomingTitle} />
          <CompareRow
            label="作者"
            existing={pending.existingAuthor || '未知'}
            incoming={pending.incomingAuthor || '未知'}
          />
          <CompareRow
            label="章节"
            existing={`${pending.existingChapters} 章`}
            incoming={`${pending.incomingChapters} 章`}
          />
          <CompareRow label="来源" existing="已在书架" incoming={pending.incomingFileName} />
        </div>

        <p className="font-body text-body-xs text-on-surface-variant mb-5">
          替换内容会在原书上更新：阅读进度、标签、收藏都保留；已生成的知识卡会标记「内容已更新」待重跑。
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={() => onResolve('replace')}>
            替换内容（在原书上更新）
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => onResolve('keep-both')}>
              保留两本
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => onResolve('cancel')}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReplaceConfirmDialog
