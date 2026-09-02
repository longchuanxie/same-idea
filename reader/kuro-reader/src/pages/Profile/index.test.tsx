import { render, screen } from '@testing-library/react'
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
vi.mock('@/services/storage/annotationRepo', () => ({
  annotationRepo: { getAll: vi.fn(async () => []) },
}))
vi.mock('@/utils/storage', () => ({
  getStorageUsage: vi.fn(async () => ({ used: 0, quota: 0 })),
}))

import { ProfilePage } from '@/pages/Profile'

describe('Profile 页面冒烟', () => {
  it('渲染档案卡统计与本地模式说明', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )
    expect(await screen.findByText('本地模式 · 馆藏与手记只存在这台设备')).toBeTruthy()
    expect(screen.getByText('我的手记')).toBeTruthy()
  })
})
