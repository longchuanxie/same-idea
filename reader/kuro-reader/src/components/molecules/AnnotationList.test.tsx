import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AnnotationList } from '@/components/molecules/AnnotationList'
import { COPY } from '@/constants/copy'
import type { Annotation } from '@/types'

const makeAnnotation = (overrides: Partial<Annotation> & { id: string }): Annotation => ({
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
  annotations: [] as Annotation[],
  bookTitle: '夜航',
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onNavigate: vi.fn(),
  onClose: vi.fn(),
}

const setup = (annotations: Annotation[], overrides: Partial<typeof PROPS> = {}) =>
  render(<AnnotationList {...PROPS} annotations={annotations} {...overrides} />)

/** 每条手记卡片的根节点：以章节标题文本定位最近容器 */
const cardOf = (id: string) => screen.getByText(id).closest('div.bg-surface-container-low') as HTMLElement

describe('AnnotationList', () => {
  it('空列表展示引导空态', () => {
    setup([])
    expect(screen.getByText('墙上还没有手记')).toBeInTheDocument()
  })

  it('纯划线（空笔记）显示「纯划线」标识而非笔记文字', () => {
    setup([makeAnnotation({ id: 'ann-pure', note: '' })])
    expect(screen.getByText(COPY.annotation.pureHighlight)).toBeInTheDocument()
  })

  it('编辑框清空后保存回调空笔记', () => {
    const onEdit = vi.fn()
    setup([makeAnnotation({ id: 'ann-1', note: '旧笔记' })], { onEdit })

    // 打开行内编辑（卡片内的铅笔图标按钮）
    const card = cardOf('第一章')
    const editButton = within(card).getByText('edit').closest('button') as HTMLElement
    fireEvent.click(editButton)

    const textarea = within(card).getByPlaceholderText(COPY.annotation.clearToPureHighlight)
    fireEvent.change(textarea, { target: { value: '' } })
    fireEvent.click(within(card).getByRole('button', { name: '保存' }))

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'ann-1', note: '' }))
  })

  it('点击卡片正文触发 onNavigate 跳转', () => {
    const onNavigate = vi.fn()
    setup([makeAnnotation({ id: 'ann-1' })], { onNavigate })
    fireEvent.click(cardOf('第一章'))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})
