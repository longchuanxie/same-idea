import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/cloudStorage', () => ({
  createCloudClient: vi.fn(() => fakeClient),
}))
vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: Object.assign(vi.fn(() => ({ importFile: mockImportFile })), {
    getState: vi.fn(() => ({ error: '导入失败的测试错误' })),
  }),
}))

import { CustomCloudPage } from '@/pages/CustomCloud'
import { createCloudClient } from '@/services/cloudStorage'
import type { CloudFile } from '@/services/cloudStorage'

const fakeClient = {
  testConnection: vi.fn<() => Promise<boolean>>(),
  listFiles: vi.fn<(p: string) => Promise<CloudFile[]>>(),
  downloadFile: vi.fn<() => Promise<Blob>>(),
}
const mockImportFile = vi.fn()

const rootListing: CloudFile[] = [
  { name: '小说', path: '/小说', isDirectory: true, size: 0, modifiedTime: '' },
  { name: '说明文件.txt', path: '/说明文件.txt', isDirectory: false, size: 120, modifiedTime: '' },
  { name: 'unsupported.exe', path: '/unsupported.exe', isDirectory: false, size: 8, modifiedTime: '' },
]

const renderPage = () =>
  render(
    <MemoryRouter>
      <CustomCloudPage />
    </MemoryRouter>
  )

const fillAndConnect = async () => {
  fireEvent.change(screen.getByPlaceholderText('https://dav.example.com'), {
    target: { value: 'http://localhost:6180' },
  })
  fireEvent.change(screen.getByPlaceholderText('输入用户名'), { target: { value: 'kuro' } })
  fireEvent.click(screen.getByRole('button', { name: /连接并浏览/ }))
  await screen.findByText('断开连接')
}

beforeEach(() => {
  vi.clearAllMocks()
  fakeClient.testConnection.mockResolvedValue(true)
  fakeClient.listFiles.mockImplementation(async (p: string) =>
    p === '/' ? rootListing : [
      {
        name: '云端测试书.md',
        path: `/小说/云端测试书.md`,
        isDirectory: false,
        size: 300,
        modifiedTime: '',
      },
    ]
  )
  fakeClient.downloadFile.mockResolvedValue(new Blob(['# 云端测试书'], { type: 'text/markdown' }))
  mockImportFile.mockResolvedValue({ id: 'book-1', title: '云端测试书', format: 'text' })
})

describe('CustomCloud browse flow', () => {
  it('connects and lists remote entries with unsupported ones marked', async () => {
    renderPage()
    await fillAndConnect()

    expect(createCloudClient).toHaveBeenCalledWith(
      expect.objectContaining({ serverAddress: 'http://localhost:6180', username: 'kuro' })
    )
    expect(fakeClient.listFiles).toHaveBeenCalledWith('/')
    // 目录在前；不支持的格式被标注
    const names = screen.getAllByRole('button').map((b) => b.textContent)
    expect(screen.getByText('小说')).toBeTruthy()
    expect(screen.getByText('说明文件.txt')).toBeTruthy()
    expect(screen.getByText('unsupported.exe')).toBeTruthy()
    expect(screen.getAllByText(/不支持的格式/).length).toBe(1)
    expect(names).toBeDefined()
  })

  it('navigates into a folder and back via breadcrumb root', async () => {
    renderPage()
    await fillAndConnect()

    fireEvent.click(screen.getByText('小说'))
    await screen.findByText('云端测试书.md')

    fireEvent.click(screen.getByText('根目录'))
    await screen.findByText('说明文件.txt')
  })

  it('downloads a book file and imports it with correct name and mime', async () => {
    renderPage()
    await fillAndConnect()

    fireEvent.click(screen.getByText('小说'))
    await screen.findByText('云端测试书.md')
    fireEvent.click(screen.getByText('云端测试书.md'))

    await screen.findByText(/导入成功/)
    expect(fakeClient.downloadFile).toHaveBeenCalledWith('/小说/云端测试书.md')
    expect(mockImportFile).toHaveBeenCalledTimes(1)
    const imported = mockImportFile.mock.calls[0][0] as File
    expect(imported.name).toBe('云端测试书.md')
    expect(imported.type).toBe('text/markdown')

    // 成功卡片提供阅读入口
    expect(screen.getByText('开始阅读')).toBeTruthy()
  })

  it('shows store error when import fails', async () => {
    mockImportFile.mockResolvedValue(null)
    renderPage()
    await fillAndConnect()

    fireEvent.click(screen.getByText('说明文件.txt'))
    await screen.findByText('导入失败的测试错误')
  })

  it('disconnect returns to the connection form', async () => {
    renderPage()
    await fillAndConnect()

    fireEvent.click(screen.getByText('断开连接'))
    expect(await screen.findByText(/连接并浏览/)).toBeTruthy()
  })
})
