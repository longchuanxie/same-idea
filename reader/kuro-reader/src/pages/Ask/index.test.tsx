import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const holder = vi.hoisted(() => ({
  library: null as ReturnType<typeof import('@/test/pageSmokeFactories').makeLibraryStoreState> | null,
}))

vi.mock('@/stores/useLibraryStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.library ??= f.makeLibraryStoreState()
  return { useLibraryStore: f.wrapAsStoreMock(holder.library) }
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
})
