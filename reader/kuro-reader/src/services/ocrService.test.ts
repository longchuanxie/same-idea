import { describe, expect, it, vi } from 'vitest'

const fakeRecognize = vi.fn()

vi.mock('tesseract.js', () => ({
  recognize: (...args: unknown[]) => fakeRecognize(...args),
}))

import { clearOcrCache, recognizeComicPage, recognizePageText } from './ocrService'

const words = [
  { text: '对白', bbox: { x0: 10, y0: 20, x1: 110, y1: 50 } },
  { text: ' ', bbox: { x0: 110, y0: 20, x1: 120, y1: 50 } }, // 空白词被过滤
  { text: 'sound', bbox: { x0: 10, y0: 100, x1: 210, y1: 130 } },
]

describe('recognizePageText', () => {
  it('把 Tesseract 词块 bbox 归一化为页面相对坐标', async () => {
    fakeRecognize.mockResolvedValue({ data: { words } })
    const items = await recognizePageText('blob:page', 400, 600)
    expect(items).toEqual([
      { str: '对白', x: 10 / 400, y: 20 / 600, w: 100 / 400, h: 30 / 600 },
      { str: 'sound', x: 10 / 400, y: 100 / 600, w: 200 / 400, h: 30 / 600 },
    ])
    expect(fakeRecognize).toHaveBeenCalledWith('blob:page', 'chi_sim+eng')
  })

  it('识别失败：直接调用上抛，缓存包装返回空数组', async () => {
    clearOcrCache()
    fakeRecognize.mockRejectedValue(new Error('worker failed'))
    await expect(recognizePageText('blob:page', 400, 600)).rejects.toThrow('worker failed')
    clearOcrCache()
    const items = await recognizeComicPage('b9', 0, 'blob:page', 400, 600)
    expect(items).toEqual([])
    // 失败不落缓存：下次重试会再次触发识别
    clearOcrCache()
  })
})

describe('recognizeComicPage 缓存', () => {
  it('同页重复识别只触发一次 OCR', async () => {
    clearOcrCache()
    fakeRecognize.mockClear()
    fakeRecognize.mockResolvedValue({ data: { words } })
    const first = await recognizeComicPage('b1', 3, 'blob:p3', 400, 600)
    const second = await recognizeComicPage('b1', 3, 'blob:p3', 400, 600)
    expect(first).toEqual(second)
    expect(fakeRecognize).toHaveBeenCalledTimes(1)
  })

  it('clearOcrCache(bookId) 只清该书条目', async () => {
    clearOcrCache()
    fakeRecognize.mockClear()
    fakeRecognize.mockResolvedValue({ data: { words } })
    await recognizeComicPage('b1', 0, 'blob:a', 400, 600)
    await recognizeComicPage('b2', 0, 'blob:b', 400, 600)
    clearOcrCache('b1')
    await recognizeComicPage('b1', 0, 'blob:a', 400, 600) // 重新识别
    await recognizeComicPage('b2', 0, 'blob:b', 400, 600) // 命中缓存
    expect(fakeRecognize).toHaveBeenCalledTimes(3)
  })
})
