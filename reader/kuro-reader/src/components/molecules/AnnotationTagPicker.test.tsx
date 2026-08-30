import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { AnnotationTagPicker } from '@/components/molecules/AnnotationTagPicker'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type { LibraryState } from '@/stores/useLibraryStore'
import type { Tag } from '@/types'

vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}))

const makeTag = (id: string, name: string): Tag => ({
  id,
  name,
  color: '#888888',
  bookIds: [],
  createdAt: new Date('2026-08-01T10:00:00'),
})

const setStore = (state: { tags: Tag[]; createTag: ReturnType<typeof vi.fn> }) => {
  vi.mocked(useLibraryStore).mockImplementation(((selector?: (s: LibraryState) => unknown) =>
    selector ? selector(state as unknown as LibraryState) : state) as never)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AnnotationTagPicker', () => {
  it('渲染全部标签 chips，点选切换选中并回调完整列表', () => {
    setStore({ tags: [makeTag('t1', '意象'), makeTag('t2', '夜')], createTag: vi.fn() })
    const onChange = vi.fn()
    render(<AnnotationTagPicker selected={['t1']} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '夜' }))
    expect(onChange).toHaveBeenCalledWith(['t1', 't2'])

    fireEvent.click(screen.getByRole('button', { name: '意象' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('选中态以 aria-pressed 标记', () => {
    setStore({ tags: [makeTag('t1', '意象')], createTag: vi.fn() })
    render(<AnnotationTagPicker selected={['t1']} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '意象' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('allowCreate 时可内联新建：Enter 提交并自动选中新标签', async () => {
    const created = makeTag('t-new', '孤独')
    const createTag = vi.fn().mockResolvedValue(created)
    setStore({ tags: [], createTag })
    const onChange = vi.fn()
    render(<AnnotationTagPicker selected={[]} onChange={onChange} allowCreate />)

    fireEvent.click(screen.getByRole('button', { name: '新建标签' }))
    const input = screen.getByPlaceholderText('新标签名')
    fireEvent.change(input, { target: { value: '孤独' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(['t-new']))
    expect(createTag).toHaveBeenCalledWith('孤独')
  })

  it('Escape 取消新建', () => {
    setStore({ tags: [], createTag: vi.fn() })
    render(<AnnotationTagPicker selected={[]} onChange={vi.fn()} allowCreate />)

    fireEvent.click(screen.getByRole('button', { name: '新建标签' }))
    const input = screen.getByPlaceholderText('新标签名')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByPlaceholderText('新标签名')).toBeNull()
  })
})
