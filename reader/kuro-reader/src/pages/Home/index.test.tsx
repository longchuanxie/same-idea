import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock 提升到文件顶部：共享状态经 hoisted holder 传递，工厂内动态 import 组装
const holder = vi.hoisted(() => ({
  library: null as unknown as ReturnType<typeof import('@/test/pageSmokeFactories').makeLibraryStoreState>,
  stats: null as unknown as ReturnType<typeof import('@/test/pageSmokeFactories').makeStatsStoreState>,
}))

vi.mock('@/stores/useLibraryStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.library ??= f.makeLibraryStoreState()
  return { useLibraryStore: f.wrapAsStoreMock(holder.library) }
})
vi.mock('@/stores/useStatsStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  holder.stats ??= f.makeStatsStoreState()
  return { useStatsStore: f.wrapAsStoreMock(holder.stats) }
})
vi.mock('@/services/storage/annotationRepo', () => ({
  annotationRepo: { getAll: vi.fn(async () => []) },
}))
vi.mock('@/hooks/useReadingStats', () => ({ useReadingStats: vi.fn() }))

import { HomePage } from '@/pages/Home'
import { makeBook } from '@/test/pageSmokeFactories'

/** 三本在读书（lastReadAt 递减 → 甲是主卡片，乙丙是你的座位小卡） */
const seatBooks = [
  makeBook({ id: 's1', title: '在读甲', lastReadAt: new Date('2026-09-04T10:00:00') }),
  makeBook({ id: 's2', title: '在读乙', lastReadAt: new Date('2026-09-03T10:00:00') }),
  makeBook({ id: 's3', title: '在读丙', lastReadAt: new Date('2026-09-02T10:00:00') }),
]

/** 按用例覆盖共享 store mock 的座位相关状态（libraryBooks 默认与座位一致） */
function setSeatState(continueList: ReturnType<typeof makeBook>[], hidden: string[] = [], libraryBooks?: ReturnType<typeof makeBook>[]) {
  holder.library.books = libraryBooks ?? continueList
  holder.library.getContinueReading = vi.fn(() => continueList)
  holder.library.hiddenContinueIds = hidden
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* 编辑态点卡片不应跳转——跳了就会命中这条路由 */}
        <Route path="/text-reader/:bookId/:chapterId?" element={<div>已跳转阅读器</div>} />
        <Route path="/reader/:bookId/:chapterId?" element={<div>已跳转阅读器</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  holder.library.books = [makeBook()]
  holder.library.getContinueReading = vi.fn(() => [])
  holder.library.hiddenContinueIds = []
  holder.library.dismissContinueReading.mockClear()
  holder.library.restoreContinueReading.mockClear()
})

describe('Home 页面冒烟', () => {
  it('渲染门厅骨架并触发书架加载', async () => {
    renderHome()
    expect(await screen.findAllByText(/冒烟测试书|书架还空着/)).not.toHaveLength(0)
    expect(holder.library.loadBooks).toHaveBeenCalled()
  })
})

describe('Home 座位区编辑', () => {
  it('有在读书时渲染主卡片、座位小卡与编辑入口', () => {
    setSeatState(seatBooks)
    renderHome()
    // 书名也会出现在「新近入藏」，断言存在即可
    expect(screen.getAllByText('在读甲').length).toBeGreaterThan(0)
    expect(screen.getAllByText('在读乙').length).toBeGreaterThan(0)
    expect(screen.getAllByText('在读丙').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '编辑座位列表' })).toBeTruthy()
  })

  it('编辑态：叉掉主卡片与小卡均调用移出，点卡片本体不跳转', () => {
    setSeatState(seatBooks)
    renderHome()

    fireEvent.click(screen.getByRole('button', { name: '编辑座位列表' }))
    // 叉钮出现，more_vert 菜单入口退场
    expect(screen.getByRole('button', { name: '移出《在读甲》' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '移出《在读乙》' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '座位选项' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '移出《在读乙》' }))
    expect(holder.library.dismissContinueReading).toHaveBeenCalledWith('s2')
    fireEvent.click(screen.getByRole('button', { name: '移出《在读甲》' }))
    expect(holder.library.dismissContinueReading).toHaveBeenCalledWith('s1')

    // 编辑态点击座位小卡（座位区在最前，取第一个命中）不触发导航
    fireEvent.click(screen.getAllByText('在读丙')[0])
    expect(screen.queryByText('已跳转阅读器')).toBeNull()
  })

  it('编辑态显示已隐藏计数与全部恢复入口', () => {
    setSeatState(seatBooks, ['s3'])
    renderHome()

    // 非编辑态不显示恢复入口
    expect(screen.queryByText('全部恢复')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '编辑座位列表' }))

    expect(screen.getByText('已隐藏 1 本在读')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '全部恢复' }))
    expect(holder.library.restoreContinueReading).toHaveBeenCalledWith('s3')
  })

  it('座位全部隐藏后保留恢复入口，全部恢复逐本调用', () => {
    setSeatState([], ['s1', 's2'], seatBooks)
    renderHome()

    expect(screen.getByText('座位已清空，进度都还在')).toBeTruthy()
    expect(screen.getByText('已隐藏 2 本在读')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '全部恢复' }))
    expect(holder.library.restoreContinueReading).toHaveBeenCalledTimes(2)
    expect(holder.library.restoreContinueReading).toHaveBeenCalledWith('s1')
    expect(holder.library.restoreContinueReading).toHaveBeenCalledWith('s2')
  })
})
