import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/services/opds', () => ({
  fetchOpdsFeed: vi.fn(),
  downloadOpdsBook: vi.fn(),
  buildOpdsFileName: vi.fn(),
}))

import { OpdsBrowser } from '@/components/molecules/OpdsBrowser'
import { fetchOpdsFeed, downloadOpdsBook } from '@/services/opds'
import type { OpdsFeed } from '@/services/opds'

const rootFeed: OpdsFeed = {
  title: '我的书库',
  entries: [
    {
      id: 'nav-1',
      title: '小说',
      isCatalog: true,
      subsectionHref: 'http://nas/opds/novels',
      acquisitions: [],
    },
    {
      id: 'pub-1',
      title: '测试书',
      isCatalog: false,
      acquisitions: [{ href: 'http://nas/download/1.epub', type: 'application/epub+zip' }],
    },
  ],
}

const novelsFeed: OpdsFeed = {
  title: '小说目录',
  entries: [
    {
      id: 'pub-2',
      title: '云端小说',
      isCatalog: false,
      acquisitions: [{ href: 'http://nas/download/2.epub', type: 'application/epub+zip' }],
    },
  ],
}

function renderBrowser(
  onImportFile = vi.fn().mockResolvedValue({ id: 'b1', title: '云端小说' })
) {
  return { onImportFile, ...render(
    <OpdsBrowser catalogUrl="http://nas/opds" username="u" password="p" onImportFile={onImportFile} />
  ) };
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchOpdsFeed).mockImplementation(async (url: string) =>
    url.includes('novels') ? novelsFeed : rootFeed
  )
  vi.mocked(downloadOpdsBook).mockResolvedValue(
    new File(['x'], '云端小说.epub', { type: 'application/epub+zip' })
  )
})

describe('OpdsBrowser', () => {
  it('loads root feed on mount and lists catalog before publications', async () => {
    renderBrowser()

    expect(await screen.findByText('小说')).toBeTruthy()
    expect(screen.getByText('测试书')).toBeTruthy()
    expect(fetchOpdsFeed).toHaveBeenCalledWith('http://nas/opds', { username: 'u', password: 'p' })
  })

  it('navigates into a catalog entry and downloads a book', async () => {
    const { onImportFile } = renderBrowser()

    await screen.findByText('小说')
    fireEvent.click(screen.getByText('小说'))
    await screen.findByText('云端小说')

    fireEvent.click(screen.getByText('云端小说'))
    await screen.findByText(/导入成功/)

    expect(downloadOpdsBook).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pub-2' }),
      { username: 'u', password: 'p' }
    )
    expect(onImportFile).toHaveBeenCalledWith(
      expect.objectContaining({ name: '云端小说.epub' })
    )
  })

  it('shows error banner when download fails', async () => {
    vi.mocked(downloadOpdsBook).mockRejectedValue(new Error('网络错误'))
    renderBrowser()

    await screen.findByText('测试书')
    fireEvent.click(screen.getByText('测试书'))
    await screen.findByText('网络错误')
  })
})
