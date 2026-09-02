import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const fakeBook = {
  id: 'b1',
  title: '档案卡测试书',
  author: '作者甲',
  description: '简介',
  format: 'text',
  status: 'ongoing',
  isFavorite: false,
  addedAt: new Date('2026-08-01'),
  tagIds: [],
  sublibraryId: null,
  chapters: [{ id: 'c1', title: '第一章', status: 'read' }],
  genres: [],
}

vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: Object.assign(
    vi.fn(() => ({
      books: [fakeBook],
      subLibraries: [],
      tags: [],
      coverUrls: {},
      readingProgress: {},
      isLoading: false,
      loadBooks: vi.fn(),
      toggleFavorite: vi.fn(),
      updateBook: vi.fn(),
      addTagToBook: vi.fn(),
      removeTagFromBook: vi.fn(),
      createTag: vi.fn(),
      removeBook: vi.fn(),
    })),
    { getState: vi.fn(() => ({ books: [fakeBook], loadBooks: vi.fn() })) }
  ),
}))
vi.mock('@/stores/useAppStore', () => ({
  useAppStore: Object.assign(vi.fn(() => ({ settings: { theme: 'auto' }, theme: 'auto' })), {
    getState: vi.fn(() => ({})),
  }),
}))
vi.mock('@/services/storage/annotationRepo', () => ({
  annotationRepo: { getByBookId: vi.fn(async () => []) },
}))

import { BookDetailPage } from '@/pages/BookDetail'

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/book/b1']}>
      <Routes>
        <Route path="/book/:id" element={<BookDetailPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('BookDetail 页面冒烟', () => {
  it('按路由 id 渲染对应书籍档案卡', async () => {
    renderPage()
    expect(await screen.findByText('档案卡测试书')).toBeTruthy()
    expect(screen.getByText('作者甲')).toBeTruthy()
  })
})
