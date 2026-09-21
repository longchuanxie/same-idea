import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ReadingRecapSheet } from '@/components/molecules/ReadingRecapSheet'
import type { Book } from '@/types'

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: 'b1',
  title: '长夜',
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'ongoing',
  totalChapters: 2,
  chapters: [{ id: 'ch-1', bookId: 'b1', number: 1, title: '第一章', pages: [], status: 'unread' }],
  addedAt: new Date('2026-01-01'),
  lastReadAt: new Date('2026-08-01'),
  isFavorite: false,
  format: 'text',
  ...overrides,
})

describe('ReadingRecapSheet', () => {
  it('回来的人看到：离开天数、停点、生成前情入口与继续读', () => {
    render(
      <MemoryRouter>
        <ReadingRecapSheet book={makeBook()} annotations={[]} onContinue={vi.fn()} onClose={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText('欢迎回来')).toBeTruthy()
    expect(screen.getByText(/离开这本书 \d+ 天了/)).toBeTruthy()
    expect(screen.getByText(/已读 \d+%/)).toBeTruthy()
    expect(screen.getByText('生成前情提要')).toBeTruthy()
    expect(screen.getByText('直接继续读')).toBeTruthy()
  })

  it('漫画书不摆 AI 前情，给本地提示', () => {
    render(
      <MemoryRouter>
        <ReadingRecapSheet
          book={makeBook({ format: 'comic' })}
          annotations={[]}
          onContinue={vi.fn()}
          onClose={vi.fn()}
        />
      </MemoryRouter>
    )
    expect(screen.queryByText('生成前情提要')).toBeNull()
    expect(screen.getByText('漫画还没有文本层——先看看进度和你的手记吧')).toBeTruthy()
  })

  it('痕迹手记可点击回跳（onClose 先触发）', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <ReadingRecapSheet
          book={makeBook()}
          annotations={[]}
          onContinue={vi.fn()}
          onClose={onClose}
        />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('关闭'))
    expect(onClose).toHaveBeenCalled()
  })

  it('AI 未配置点生成：弹层内常驻「去配置」出路，动作按钮仍在可重试', () => {
    render(
      <MemoryRouter>
        <ReadingRecapSheet book={makeBook()} annotations={[]} onContinue={vi.fn()} onClose={vi.fn()} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('生成前情提要'))
    expect(screen.getByText(/生成前情要用你自己的 AI 服务/)).toBeTruthy()
    expect(screen.getByText('去配置')).toBeTruthy()
    // 动作按钮保留（配置回来后免重开弹层）
    expect(screen.getByText('生成前情提要')).toBeTruthy()
  })
})
