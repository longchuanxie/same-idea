import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AnnotationDetailModal } from '@/components/molecules/AnnotationDetailModal'
import { COPY } from '@/constants/copy'
import type { Annotation } from '@/types'

const makeAnnotation = (overrides: Partial<Annotation> = {}): Annotation => ({
  id: 'ann-1',
  bookId: 'b1',
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '被划中的句子',
  note: '一条笔记',
  startOffset: 0,
  endOffset: 6,
  style: 'highlight',
  createdAt: new Date('2026-08-01T10:00:00'),
  updatedAt: new Date('2026-08-01T10:00:00'),
  ...overrides,
})

const PROPS = {
  annotation: makeAnnotation(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onNavigate: vi.fn(),
  onClose: vi.fn(),
}

const setup = (overrides: Partial<typeof PROPS> = {}) =>
  render(<AnnotationDetailModal {...PROPS} {...overrides} />)

describe('AnnotationDetailModal', () => {
  it('展示章节、引文与笔记；纯划线显示标识而非空段', () => {
    setup()
    expect(screen.getByText('第一章')).toBeInTheDocument()
    expect(screen.getByText(/被划中的句子/)).toBeInTheDocument()
    expect(screen.getByText('一条笔记')).toBeInTheDocument()

    setup({ annotation: makeAnnotation({ note: '' }) })
    expect(screen.getByText(COPY.annotation.pureHighlight)).toBeInTheDocument()
  })

  it('编辑：改笔记与样式后以补丁回调 onEdit', () => {
    const onEdit = vi.fn()
    setup({ onEdit })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.edit }))
    const textarea = screen.getByPlaceholderText(COPY.annotation.notePlaceholder)
    fireEvent.change(textarea, { target: { value: '改后的笔记' } })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.styleLabels.underline }))
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.save }))
    expect(onEdit).toHaveBeenCalledWith({ id: 'ann-1', note: '改后的笔记', style: 'underline' })
  })

  it('删除：回调 onDelete 并关闭弹窗', () => {
    const onDelete = vi.fn()
    const onClose = vi.fn()
    setup({ onDelete, onClose })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.remove }))
    expect(onDelete).toHaveBeenCalledWith('ann-1')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('回到此处：回调 onNavigate 并关闭弹窗', () => {
    const onNavigate = vi.fn()
    const onClose = vi.fn()
    setup({ onNavigate, onClose })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.goTo }))
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
