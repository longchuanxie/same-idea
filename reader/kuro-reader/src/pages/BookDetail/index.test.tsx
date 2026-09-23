import { fireEvent, render, screen } from '@testing-library/react'
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

/** 长目录书：15 章（超过折叠预览数 12） */
const longBook = {
  ...fakeBook,
  id: 'b2',
  title: '长篇连载书',
  chapters: Array.from({ length: 15 }, (_, i) => ({
    id: `c${i + 1}`,
    number: i + 1,
    title: `章节标题${i + 1}`,
    status: 'unread',
  })),
}

vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: Object.assign(
    vi.fn(() => ({
      books: [fakeBook, longBook],
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
    { getState: vi.fn(() => ({ books: [fakeBook, longBook], loadBooks: vi.fn() })) }
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

vi.mock('@/services/storage/knowledgeRepo', () => ({
  knowledgeRepo: {
    getByBookId: vi.fn(async (bookId: string) =>
      bookId === 'b2'
        ? [
            {
              id: 'beats-1',
              bookId: 'b2',
              type: 'story-beats',
              title: '叙事节拍',
              data: {
                beats: [
                  { id: 'hook:0', role: 'hook', title: '夜雨入市', chapterIndex: 0 },
                  { id: 'climax:14', role: 'climax', title: '决战钟楼', chapterIndex: 14 },
                ],
              },
              meta: { chapterCount: 15, bookChapterCount: 15 },
              generator: 'ai',
              createdAt: new Date('2026-09-24'),
              updatedAt: new Date('2026-09-24'),
            },
          ]
        : []
    ),
  },
}))

import { BookDetailPage } from '@/pages/BookDetail'

const renderPage = (id = 'b1') =>
  render(
    <MemoryRouter initialEntries={[`/book/${id}`]}>
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

  it('长目录默认折叠：预览 12 章 + 展开入口，展开后全量可见可收起', async () => {
    renderPage('b2')
    expect(await screen.findByText('长篇连载书')).toBeTruthy()

    // 折叠态：只渲染前 12 章卡片
    expect(screen.queryByText('第 13 章')).toBeNull()
    expect(screen.getAllByText(/^第 \d+ 章$/)).toHaveLength(12)
    expect(screen.getByText('展开全部 15 章')).toBeTruthy()

    fireEvent.click(screen.getByText('展开全部 15 章'))
    expect(screen.getAllByText(/^第 \d+ 章$/)).toHaveLength(15)
    expect(screen.getByText('收起目录')).toBeTruthy()

    fireEvent.click(screen.getByText('收起目录'))
    expect(screen.getAllByText(/^第 \d+ 章$/)).toHaveLength(12)
  })

  it('知识库区块位于目录之前（章节多的书先见知识库菜单）', async () => {
    renderPage('b2')
    await screen.findByText('长篇连载书')
    const knowledgeHeading = screen.getByRole('heading', { name: '知识库' })
    const tocHeading = screen.getByRole('heading', { name: '目录' })
    // 知识库标题在 DOM 序上先于目录标题
    expect(
      knowledgeHeading.compareDocumentPosition(tocHeading) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('目录上方渲染叙事节拍结构条，点节拍可直达详情', async () => {
    renderPage('b2')
    await screen.findByText('长篇连载书')
    expect(await screen.findByRole('list', { name: '叙事节拍结构条' })).toBeTruthy()
    expect(screen.getByText('结构导览 · 2 个节拍')).toBeTruthy()
    // 节拍点在结构条上可点（跳阅读器），详情入口进知识件查看器
    expect(screen.getByTitle('高潮 · 第 15 章：决战钟楼')).toBeTruthy()
    expect(screen.getByText('查看节拍详情')).toBeTruthy()
  })
})
