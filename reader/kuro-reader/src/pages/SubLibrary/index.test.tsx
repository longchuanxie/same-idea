import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const holder = vi.hoisted(() => ({
  library: null as ReturnType<typeof import('@/test/pageSmokeFactories').makeLibraryStoreState> | null,
}))

vi.mock('@/stores/useLibraryStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.library ??= f.makeLibraryStoreState()
  return { useLibraryStore: f.wrapAsStoreMock(holder.library) }
})
vi.mock('@/stores/useAppStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  const appState = f.makeAppStoreState()
  return { useAppStore: f.wrapAsStoreMock(appState) }
})

import { SubLibraryPage } from '@/pages/SubLibrary'

describe('SubLibrary 页面冒烟', () => {
  it('按路由渲染特藏书库页与馆内书籍', async () => {
    render(
      <MemoryRouter initialEntries={['/sublibrary/sub-1']}>
        <Routes>
          <Route path="/sublibrary/:subLibraryId" element={<SubLibraryPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText('特藏书库')).toBeTruthy()
    expect(screen.getByLabelText('返回')).toBeTruthy()
  })
})
