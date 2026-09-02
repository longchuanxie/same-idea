import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LongPressActionMenu } from './LongPressActionMenu'

describe('LongPressActionMenu', () => {
  it('渲染页级手记与阅读设置两个动作', () => {
    render(
      <LongPressActionMenu
        page={3}
        onAddPageNote={() => {}}
        onOpenReaderSettings={() => {}}
        onClose={() => {}}
      />
    )
    expect(screen.getByRole('button', { name: /页级手记|手记/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /阅读设置/ })).toBeInTheDocument()
  })

  it('动作回调携带触发页索引并关闭菜单', async () => {
    const onAddPageNote = vi.fn()
    const onOpenReaderSettings = vi.fn()
    const onClose = vi.fn()
    render(
      <LongPressActionMenu
        page={5}
        onAddPageNote={onAddPageNote}
        onOpenReaderSettings={onOpenReaderSettings}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(onAddPageNote).toHaveBeenCalledWith(5)

    fireEvent.click(screen.getAllByRole('button')[1])
    expect(onOpenReaderSettings).toHaveBeenCalledWith(5)
  })

  it('点击遮罩关闭', async () => {
    const onClose = vi.fn()
    const { container } = render(
      <LongPressActionMenu
        page={0}
        onAddPageNote={() => {}}
        onOpenReaderSettings={() => {}}
        onClose={onClose}
      />
    )
    fireEvent.click(container.firstElementChild as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
