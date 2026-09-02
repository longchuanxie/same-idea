import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const holder = vi.hoisted(() => ({
  library: null as unknown as ReturnType<typeof import('@/test/pageSmokeFactories').makeLibraryStoreState>,
}))

vi.mock('@/stores/useLibraryStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.library ??= f.makeLibraryStoreState()
  return { useLibraryStore: f.wrapAsStoreMock(holder.library) }
})
vi.mock('@/utils/capacitor', () => ({ isNativePlatform: () => false }))

import { ImportPage } from '@/pages/Import'

describe('Import 页面冒烟', () => {
  it('渲染导入中心与支持格式说明', () => {
    render(
      <MemoryRouter>
        <ImportPage />
      </MemoryRouter>
    )
    expect(screen.getByText('导入中心')).toBeTruthy()
  })
})
