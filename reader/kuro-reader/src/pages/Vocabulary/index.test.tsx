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

import { VocabularyPage } from '@/pages/Vocabulary'

describe('Vocabulary 页面冒烟', () => {
  it('空生词本渲染指路空态', async () => {
    render(
      <MemoryRouter>
        <VocabularyPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('生词本还空着')).toBeTruthy()
    expect(await screen.findByText('阅读时选中一个词，点「查词」，释义就会收进来')).toBeTruthy()
  })
})
