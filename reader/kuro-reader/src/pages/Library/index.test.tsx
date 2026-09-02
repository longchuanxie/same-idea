import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const fakeBooks = [
  { id: 'b1', title: '示例漫画', format: 'comic', isFavorite: true, addedAt: new Date('2026-08-01'), sublibraryId: null },
  { id: 'b2', title: '示例小说', format: 'text', isFavorite: false, addedAt: new Date('2026-08-02'), sublibraryId: null },
]

vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: Object.assign(
    vi.fn(() => ({
      books: fakeBooks,
      subLibraries: [],
      tags: [],
      coverUrls: {},
      readingProgress: {},
      isLoading: false,
      loadBooks: vi.fn(),
      removeBook: vi.fn(),
      batchDelete: vi.fn(),
      batchMarkAsRead: vi.fn(),
      toggleFavorite: vi.fn(),
      updateBook: vi.fn(),
      createSubLibrary: vi.fn(),
      addBooksToSubLibrary: vi.fn(),
      renameSubLibrary: vi.fn(),
      deleteSubLibrary: vi.fn(),
      batchDeleteSubLibraries: vi.fn(),
      getBooksByTag: vi.fn(() => []),
    })),
    { getState: vi.fn(() => ({ books: fakeBooks, loadBooks: vi.fn() })) }
  ),
}))
vi.mock('@/stores/useAppStore', () => ({
  useAppStore: Object.assign(vi.fn(() => ({ settings: { theme: 'auto' }, theme: 'auto' })), {
    getState: vi.fn(() => ({})),
  }),
}))

import { LibraryPage } from '@/pages/Library'

describe('Library 页面冒烟', () => {
  it('渲染书库页与书籍条目', async () => {
    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('示例漫画')).toBeTruthy()
    expect(screen.getByText('示例小说')).toBeTruthy()
  })
})
