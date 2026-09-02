import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

// vi.mock 提升到文件顶部：共享状态经 hoisted holder 传递，工厂内动态 import 组装
const holder = vi.hoisted(() => ({
  library: null as unknown as ReturnType<typeof import('@/test/pageSmokeFactories').makeLibraryStoreState>,
  stats: null as unknown as ReturnType<typeof import('@/test/pageSmokeFactories').makeStatsStoreState>,
}))

vi.mock('@/stores/useLibraryStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.library ??= f.makeLibraryStoreState()
  return { useLibraryStore: f.wrapAsStoreMock(holder.library) }
})
vi.mock('@/stores/useStatsStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.stats ??= f.makeStatsStoreState()
  return { useStatsStore: f.wrapAsStoreMock(holder.stats) }
})
vi.mock('@/services/storage/annotationRepo', () => ({
  annotationRepo: { getAll: vi.fn(async () => []) },
}))
vi.mock('@/hooks/useReadingStats', () => ({ useReadingStats: vi.fn() }))

import { HomePage } from '@/pages/Home'

describe('Home 页面冒烟', () => {
  it('渲染门厅骨架并触发书架加载', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    expect(await screen.findAllByText(/冒烟测试书|书架还空着/)).not.toHaveLength(0)
    expect(holder.library.loadBooks).toHaveBeenCalled()
  })
})
