import { fireEvent, render, screen } from '@testing-library/react'
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

import { SearchPage } from '@/pages/Search'

describe('Search 页面冒烟', () => {
  it('渲染搜索框；输入关键词过滤出匹配书籍', async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    )
    const input = screen.getByPlaceholderText('搜书、手记或知识件…')
    fireEvent.change(input, { target: { value: '冒烟' } })
    expect(await screen.findByText('冒烟测试书')).toBeTruthy()
    // 三路聚合视图：馆藏分组标题可见
    expect(await screen.findByText(/馆藏 \(1\)/)).toBeTruthy()
  })
})
