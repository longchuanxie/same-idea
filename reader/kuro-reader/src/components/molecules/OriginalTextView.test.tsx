import { act, render } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { OriginalTextView } from './OriginalTextView'

/** foliate-view 的受控替身：open/next/prev/goToFraction 全量 mock，事件手工派发 */
const viewMocks = vi.hoisted(() => ({
  open: vi.fn().mockResolvedValue(undefined),
  next: vi.fn().mockResolvedValue(undefined),
  prev: vi.fn().mockResolvedValue(undefined),
  goToFraction: vi.fn().mockResolvedValue(undefined),
  instances: [] as Array<HTMLElement & { open?: unknown; next?: unknown; prev?: unknown; goToFraction?: unknown }>,
}))

vi.mock('foliate-js/view.js', () => {
  if (typeof customElements !== 'undefined' && !customElements.get('foliate-view')) {
    class FakeFoliateView extends HTMLElement {
      open = viewMocks.open
      next = viewMocks.next
      prev = viewMocks.prev
      goToFraction = viewMocks.goToFraction
      constructor() {
        super()
        viewMocks.instances.push(this)
      }
    }
    customElements.define('foliate-view', FakeFoliateView)
  }
  return {}
})

/** load 事件的受控伪文档：捕获注入的 style 与 click 监听 */
function createFakeDoc() {
  const clickHandlers: Array<(event: { target: unknown; clientX: number }) => void> = []
  const styleElements: Array<{ textContent: string }> = []
  const doc = {
    head: { appendChild: (el: { textContent: string }) => styleElements.push(el) },
    createElement: () => ({ textContent: '' }) as { textContent: string },
    addEventListener: (_type: string, handler: (event: { target: unknown; clientX: number }) => void) => {
      clickHandlers.push(handler)
    },
    defaultView: { innerWidth: 400 },
  }
  return { doc, clickHandlers, styleElements }
}

function getLastView(): (HTMLElement & { open?: unknown; next?: unknown; prev?: unknown; goToFraction?: unknown }) | undefined {
  return viewMocks.instances[viewMocks.instances.length - 1]
}

describe('OriginalTextView', () => {
  beforeEach(() => {
    viewMocks.open.mockClear()
    viewMocks.next.mockClear()
    viewMocks.prev.mockClear()
    viewMocks.goToFraction.mockClear()
  })

  it('挂载即打开书原件并把翻页 API 交给 apiRef', async () => {
    const apiRef: { current: import('./OriginalTextView').OriginalTextApi | null } = { current: null }
    const blob = new Blob(['x'], { type: 'application/epub+zip' })

    const { unmount } = render(
      <OriginalTextView
        blob={blob}
        initialFraction={null}
        background="#fff"
        color="#111"
        onRelocate={vi.fn()}
        onToggleUi={vi.fn()}
        apiRef={apiRef}
      />
    )

    await act(async () => { await Promise.resolve() })
    // 打开的书被包成带扩展名的 File（foliate 的 makeBook 按名分流）
    expect(viewMocks.open).toHaveBeenCalledTimes(1)
    const openedFile = viewMocks.open.mock.calls[0][0] as File
    expect(openedFile.name).toBe('book.epub')
    expect(openedFile.size).toBe(blob.size)

    act(() => {
      apiRef.current?.next()
      apiRef.current?.prev()
      apiRef.current?.goToFraction(0.5)
    })
    expect(viewMocks.next).toHaveBeenCalled()
    expect(viewMocks.prev).toHaveBeenCalled()
    expect(viewMocks.goToFraction).toHaveBeenCalledWith(0.5)

    // 卸载清理：API 失效 + 元素移除
    const view = getLastView()
    const removeSpy = vi.spyOn(view as HTMLElement, 'remove')
    unmount()
    expect(apiRef.current).toBeNull()
    expect(removeSpy).toHaveBeenCalled()
  })

  it('有起始比例时 open 后跳到对应位置', async () => {
    render(
      <OriginalTextView
        blob={new Blob(['x'])}
        initialFraction={0.42}
        background="#fff"
        color="#111"
        onRelocate={vi.fn()}
        onToggleUi={vi.fn()}
        apiRef={{ current: null }}
      />
    )
    await act(async () => { await Promise.resolve() })
    expect(viewMocks.goToFraction).toHaveBeenCalledWith(0.42)
  })

  it('relocate 事件转发外层进度回调', async () => {
    const onRelocate = vi.fn()
    render(
      <OriginalTextView
        blob={new Blob(['x'])}
        initialFraction={null}
        background="#fff"
        color="#111"
        onRelocate={onRelocate}
        onToggleUi={vi.fn()}
        apiRef={{ current: null }}
      />
    )
    await act(async () => { await Promise.resolve() })
    const view = getLastView()
    act(() => {
      view?.dispatchEvent(new CustomEvent('relocate', { detail: { fraction: 0.37, cfi: 'epubcfi(/6/4)' } }))
    })
    expect(onRelocate).toHaveBeenCalledWith({ fraction: 0.37, cfi: 'epubcfi(/6/4)' })
  })

  it('章节文档就绪后注入纸色并把点击分区转发为翻页/呼出（iframe 点击不冒泡）', async () => {
    const onToggleUi = vi.fn()
    render(
      <OriginalTextView
        blob={new Blob(['x'])}
        initialFraction={null}
        background="#faf9f7"
        color="#2e2b24"
        onRelocate={vi.fn()}
        onToggleUi={onToggleUi}
        apiRef={{ current: null }}
      />
    )
    await act(async () => { await Promise.resolve() })
    const view = getLastView()
    const { doc, clickHandlers } = createFakeDoc()
    act(() => {
      view?.dispatchEvent(new CustomEvent('load', { detail: { doc } }))
    })
    expect(clickHandlers).toHaveLength(1)

    // 左 25%（=100/400）→ prev；右 90%（=360/400）→ next；中间 → 呼出 UI
    act(() => { clickHandlers[0]({ target: null, clientX: 100 }) })
    expect(viewMocks.prev).toHaveBeenCalled()
    act(() => { clickHandlers[0]({ target: null, clientX: 360 }) })
    expect(viewMocks.next).toHaveBeenCalled()
    expect(onToggleUi).not.toHaveBeenCalled()
    act(() => { clickHandlers[0]({ target: null, clientX: 200 }) })
    expect(onToggleUi).toHaveBeenCalled()
  })
})
