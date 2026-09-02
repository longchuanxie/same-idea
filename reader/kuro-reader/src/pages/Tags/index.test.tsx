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

import { TagsPage } from '@/pages/Tags'

describe('Tags 页面冒烟', () => {
  it('渲染标签目录与新建入口', async () => {
    render(
      <MemoryRouter>
        <TagsPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('标签一')).toBeTruthy()
    expect(screen.getByText('新建标签')).toBeTruthy()
  })
})
