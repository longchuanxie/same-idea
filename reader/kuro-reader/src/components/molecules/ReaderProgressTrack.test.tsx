import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ReaderProgressTrack } from './ReaderProgressTrack'

const trackWidth = 400

function getTrack(): HTMLElement {
  // 进度轨道是带 data-ui-control 的可点击 div
  const els = Array.from(document.querySelectorAll('[data-ui-control]')) as HTMLElement[]
  return els.find((el) => el.className.includes('rounded-full')) ?? els[0]
}

describe('ReaderProgressTrack', () => {
  it('展示当前页标签与总页数', () => {
    render(
      <ReaderProgressTrack
        totalPages={20}
        direction="horizontal"
        pageLayout="single"
        readingDirection="ltr"
        progressPercent={50}
        currentPageLabel="10"
        onJump={() => {}}
      />
    )
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('轨道点击：按比例映射页码并触发跳页', async () => {
    const onJump = vi.fn()
    render(
      <ReaderProgressTrack
        totalPages={20}
        direction="horizontal"
        pageLayout="single"
        readingDirection="ltr"
        progressPercent={0}
        currentPageLabel="1"
        onJump={onJump}
      />
    )
    const track = getTrack()
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: trackWidth, height: 12, right: trackWidth, bottom: 12, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect)
    fireEvent.click(track, { clientX: trackWidth / 2 })
    // 点击点在轨道中点 → 第 10/11 页附近（clamp 后 1..20）
    expect(onJump).toHaveBeenCalledTimes(1)
    const [page] = onJump.mock.calls[0]
    expect(page).toBeGreaterThanOrEqual(10)
    expect(page).toBeLessThanOrEqual(11)
  })

  it('onInteractStart 在轨道点击时触发（父层抑制单击切 UI）', async () => {
    const onInteractStart = vi.fn()
    render(
      <ReaderProgressTrack
        totalPages={20}
        direction="horizontal"
        pageLayout="single"
        readingDirection="ltr"
        progressPercent={0}
        currentPageLabel="1"
        onJump={() => {}}
        onInteractStart={onInteractStart}
      />
    )
    const track = getTrack()
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: trackWidth, height: 12, right: trackWidth, bottom: 12, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect)
    fireEvent.click(track, { clientX: trackWidth / 2 })
    expect(onInteractStart).toHaveBeenCalled()
  })
})
