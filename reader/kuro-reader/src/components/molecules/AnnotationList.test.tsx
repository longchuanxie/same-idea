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

type AnnotationListPropsFull = React.ComponentProps<typeof AnnotationList>

const setup = (annotations: Annotation[], overrides: Partial<AnnotationListPropsFull> = {}) =>
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

describe('AnnotationList 书签 tab', () => {
  const makeBookmark = (id: string, chapterTitle: string) => ({
    id,
    bookId: 'b1',
    chapterIndex: 0,
    chapterTitle,
    pageIndex: 2,
    textPreview: `夹了书签的那一页-${id}`,
    createdAt: new Date('2026-09-01T09:00:00'),
  })

  const BOOKMARK_PROPS = {
    bookmarks: [makeBookmark('bm-1', '第一章'), makeBookmark('bm-2', '第二章')],
    onBookmarkSelect: vi.fn(),
    onBookmarkDelete: vi.fn(),
  }

  it('不传书签 props 时不出现书签 tab（图页阅读器单 tab 兼容）', () => {
    setup([])
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('传入书签 props 时出现双 tab，默认停留在手记', () => {
    setup([makeAnnotation({ id: 'ann-1' })], BOOKMARK_PROPS)
    const tablist = screen.getByRole('tablist')
    expect(within(tablist).getByRole('tab', { name: /手记/ })).toHaveAttribute('aria-selected', 'true')
    expect(within(tablist).getByRole('tab', { name: /书签/ })).toHaveAttribute('aria-selected', 'false')
    // 手记列表内容仍在
    expect(screen.getByText('一条笔记')).toBeInTheDocument()
  })

  it('切到书签 tab 列出书签，点击条目回调 onBookmarkSelect', () => {
    const onBookmarkSelect = vi.fn()
    setup([], { ...BOOKMARK_PROPS, onBookmarkSelect })

    fireEvent.click(screen.getByRole('tab', { name: /书签/ }))
    expect(screen.getByText('夹了书签的那一页-bm-1')).toBeInTheDocument()
    expect(screen.getByText('夹了书签的那一页-bm-2')).toBeInTheDocument()

    fireEvent.click(
      screen.getByText('夹了书签的那一页-bm-1').closest('div.bg-surface-container-low') as HTMLElement
    )
    expect(onBookmarkSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'bm-1' }))
  })

  it('书签删除按钮回调 onBookmarkDelete', () => {
    const onBookmarkDelete = vi.fn()
    setup([], { ...BOOKMARK_PROPS, onBookmarkDelete })

    fireEvent.click(screen.getByRole('tab', { name: /书签/ }))
    const firstCard = screen.getByText('夹了书签的那一页-bm-1').closest('div.bg-surface-container-low') as HTMLElement
    const cardRoot = firstCard.parentElement as HTMLElement
    fireEvent.click(within(cardRoot).getByText('delete').closest('button') as HTMLElement)
    expect(onBookmarkDelete).toHaveBeenCalledWith('bm-1')
  })

  it('书签为空时展示空态引导', () => {
    setup([], { ...BOOKMARK_PROPS, bookmarks: [] })
    fireEvent.click(screen.getByRole('tab', { name: /书签/ }))
    expect(screen.getByText('暂无书签')).toBeInTheDocument()
    expect(screen.getByText('点击顶栏书签按钮添加')).toBeInTheDocument()
  })
})
