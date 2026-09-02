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
vi.mock('@/services/storage/annotationRepo', () => ({
  annotationRepo: { getAll: vi.fn(async () => []) },
}))

import { NotesPage } from '@/pages/Notes'

describe('Notes 页面冒烟', () => {
  it('空手记时渲染摘抄墙空态提示', async () => {
    render(
      <MemoryRouter>
        <NotesPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('墙上还没有手记')).toBeTruthy()
    expect(holder.library.loadBooks).toHaveBeenCalled()
  })
})
