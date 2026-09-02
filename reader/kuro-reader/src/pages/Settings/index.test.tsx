import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

// Settings 页依赖多个 store 与服务；冒烟测试全部 mock，只验证页面骨架与关键区块
vi.mock('@/stores/useAppStore', () => ({
  useAppStore: Object.assign(vi.fn(() => ({
    settings: {
      theme: 'auto',
      fontFamily: 'literata',
      fontSize: 18,
      readingDirection: 'ltr',
      paperMode: false,
      paperType: 'cream',
      textureIntensity: 50,
      brightness: 100,
      colorTemperature: 0,
      auth: { lockTimeout: 300000, maxAttempts: 5 },
    },
    theme: 'auto',
    updateSettings: vi.fn(),
    togglePaperMode: vi.fn(),
  })), { getState: vi.fn(() => ({ updateSettings: vi.fn(), togglePaperMode: vi.fn() })) }),
}))
vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: Object.assign(vi.fn(() => ({
    books: [],
    updateProgress: vi.fn(),
    getBookById: vi.fn(),
    toggleFavorite: vi.fn(),
  })), { getState: vi.fn(() => ({ books: [], readingProgress: {}, loadBooks: vi.fn() })) }),
}))
vi.mock('@/stores/useStatsStore', () => ({
  useStatsStore: Object.assign(vi.fn(() => ({
    readingSessions: [],
    dailyGoalMinutes: 30,
  })), { getState: vi.fn(() => ({ readingSessions: [], dailyGoalMinutes: 30 })) }),
}))
vi.mock('@/services/storage/progressRepo', () => ({ progressRepo: { getAll: vi.fn(async () => []) } }))
vi.mock('@/services/storage/bookmarkRepo', () => ({ bookmarkRepo: { getAll: vi.fn(async () => []) } }))
vi.mock('@/services/storage/annotationRepo', () => ({ annotationRepo: { getAll: vi.fn(async () => []) } }))
vi.mock('@/services/storage/tombstoneRepo', () => ({ tombstoneRepo: { getAll: vi.fn(async () => []) } }))
vi.mock('@/services/cloudSync', () => ({ runCloudSync: vi.fn(), applyMergedPayloadToLocal: vi.fn() }))
vi.mock('@/services/gestureLock', () => ({
  getGestureLockStatus: vi.fn(async () => ({ enabled: false })),
  setupGestureLock: vi.fn(),
  verifyGestureLock: vi.fn(),
}))
vi.mock('@/hooks/useReadingStats', () => ({ useReadingStats: vi.fn() }))

import { SettingsPage } from '@/pages/Settings'

const renderPage = () =>
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  )

describe('Settings 页面冒烟', () => {
  it('渲染设置页骨架与关键分区标题', async () => {
    renderPage()
    // 页面标题
    expect(screen.getByText('设置')).toBeTruthy()
    // 关键设置区块
    expect(screen.getByText(/阅读方向/)).toBeTruthy()
    expect(screen.getByText(/WebDAV/)).toBeTruthy()
  })
})
