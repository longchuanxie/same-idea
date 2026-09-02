import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

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

import { StatsPage } from '@/pages/Stats'

describe('Stats 页面冒烟', () => {
  it('渲染统计页骨架（热力图与本期概览）', async () => {
    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>
    )
    // 页面主体挂载且书架数据被拉取；热力图格子渲染
    expect(holder.library.loadBooks).toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(document.querySelectorAll('[class*="rounded"]').length).toBeGreaterThan(0)
    })
  })
})
