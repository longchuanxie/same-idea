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

import { ReviewPage } from '@/pages/Review'

describe('Review 页面冒烟', () => {
  it('空馆藏渲染指路空态（标题与引导可见）', async () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('复习席')).toBeTruthy()
    expect(await screen.findByText('馆里还没有可复习的卡')).toBeTruthy()
  })
})
