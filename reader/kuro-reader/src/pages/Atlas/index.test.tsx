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

import { AtlasPage } from '@/pages/Atlas'

describe('Atlas 页面冒烟', () => {
  it('馆内无跨书数据时渲染指路空态', async () => {
    render(
      <MemoryRouter>
        <AtlasPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('跨书图谱')).toBeTruthy()
    expect(await screen.findByText('跨书网络还连不起来')).toBeTruthy()
  })
})
