import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const holder = vi.hoisted(() => ({
  library: null as ReturnType<typeof import('@/test/pageSmokeFactories').makeLibraryStoreState> | null,
}))

vi.mock('@/stores/useLibraryStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.library ??= f.makeLibraryStoreState()
  // 惰性读 holder.library：允许单个用例替换馆藏形态后再渲染
  const lazy = Object.assign(vi.fn(() => holder.library), {
    getState: vi.fn(() => holder.library),
  })
  return { useLibraryStore: lazy }
})

import { AskLibraryPage } from '@/pages/Ask'

describe('Ask 页面冒烟', () => {
  it('渲染页名、提示与空态示例问题', () => {
    render(
      <MemoryRouter>
        <AskLibraryPage />
      </MemoryRouter>
    )
    expect(screen.getByText('问藏书')).toBeTruthy()
    expect(screen.getByPlaceholderText('问点什么，比如「哪本书讲过注意力机制」')).toBeTruthy()
    expect(screen.getByText('把整座馆当成一个脑子来问')).toBeTruthy()
  })

  it('纯漫画馆藏：指路空态替代提问框，不再撞「没有检索到内容」误导报错', async () => {
    const f = await import('@/test/pageSmokeFactories')
    holder.library = f.makeLibraryStoreState({
      books: [f.makeBook({ id: 'c1', format: 'comic' })],
      loadBooks: vi.fn(async () => {}),
    })
    const { unmount } = render(
      <MemoryRouter>
        <AskLibraryPage />
      </MemoryRouter>
    )
    await vi.waitFor(() => expect(screen.getByText('馆里还没有能问答的书')).toBeTruthy())
    expect(screen.queryByPlaceholderText(/问点什么/)).toBeNull()
    expect(screen.getByText('去导入')).toBeTruthy()
    unmount()
    holder.library = null
  })
})
