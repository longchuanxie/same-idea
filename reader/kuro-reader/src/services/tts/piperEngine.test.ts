import { beforeEach, describe, expect, it, vi } from 'vitest'

const createMock = vi.fn((..._args: unknown[]) => undefined)
const writeBlobMock = vi.fn(async (..._args: unknown[]) => {})
const storedMock = vi.fn(async (): Promise<string[]> => [])

vi.mock('@mintplex-labs/piper-tts-web', () => ({
  TtsSession: { create: (...args: unknown[]) => createMock(...args) },
  writeBlob: (...args: unknown[]) => writeBlobMock(...args),
  stored: () => storedMock(),
}))

// sessionPromise / activeDownload 为模块级缓存,每个用例重载模块以隔离
const loadEngine = async () => await import('./piperEngine')

/** 构造带流式 body 的伪 fetch 响应（分两次吐字节，可观察进度回调） */
function fakeResponse(bytes: number, chunks = 2) {
  let sent = 0
  return {
    ok: true,
    headers: { get: (key: string) => (key === 'Content-Length' ? String(bytes) : null) },
    body: {
      getReader: () => ({
        read: async () => {
          if (sent >= chunks) return { done: true }
          sent += 1
          return { done: false, value: new Uint8Array(bytes / chunks) }
        },
      }),
    },
    arrayBuffer: async () => new ArrayBuffer(bytes),
  }
}

describe('preloadPiperModel', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    createMock.mockReset()
    writeBlobMock.mockReset()
    storedMock.mockResolvedValue([])
    createMock.mockResolvedValue(undefined)
  })

  it('触发会话创建并复用同一会话', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse(10)))
    const { preloadPiperModel } = await loadEngine()
    await preloadPiperModel()
    await preloadPiperModel()
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('创建失败后不缓存错误,下次调用可重试', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse(10)))
    createMock.mockRejectedValueOnce(new Error('network'))
    const { preloadPiperModel } = await loadEngine()
    await expect(preloadPiperModel()).rejects.toThrow('network')
    createMock.mockResolvedValue(undefined)
    await expect(preloadPiperModel()).resolves.toBeUndefined()
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('未存储时从 HuggingFace 源拉取并以库认 URL 写入 OPFS', async () => {
    const fetchMock = vi.fn(async () => fakeResponse(10))
    vi.stubGlobal('fetch', fetchMock)
    const mod = await loadEngine()
    await mod.preloadPiperModel()
    // 两个文件：.onnx.json 配置 + .onnx 模型，均写入 OPFS
    expect(writeBlobMock).toHaveBeenCalledTimes(2)
    const urls = writeBlobMock.mock.calls.map((call) => String(call[0]))
    expect(urls.every((url) => url.startsWith('https://huggingface.co/'))).toBe(true)
    expect(urls.some((url) => url.endsWith('.onnx'))).toBe(true)
    expect(urls.some((url) => url.endsWith('.onnx.json'))).toBe(true)
  })

  it('主源失败自动切换镜像源，全部失败才报错', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.startsWith('https://hf-mirror.com/')) return fakeResponse(10)
      throw new TypeError('fetch failed')
    })
    vi.stubGlobal('fetch', fetchMock)
    const mod = await loadEngine()
    await expect(mod.preloadPiperModel()).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(4) // 2 个文件 × 每个先主源后镜像
    expect(writeBlobMock).toHaveBeenCalledTimes(2)
  })

  it('全部源失败时下载失败，不写 OPFS', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed') }))
    const mod = await loadEngine()
    await expect(mod.preloadPiperModel()).rejects.toThrow()
    expect(writeBlobMock).not.toHaveBeenCalled()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('已存储时跳过下载直接建会话', async () => {
    storedMock.mockResolvedValue(['zh_CN-huayan-medium'])
    createMock.mockResolvedValue(undefined)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const mod = await loadEngine()
    await mod.preloadPiperModel()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('并发触发共享同一次下载', async () => {
    storedMock.mockResolvedValue([])
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    vi.stubGlobal('fetch', vi.fn(async () => { await gate; return fakeResponse(10) }))
    const mod = await loadEngine()
    const first = mod.preloadPiperModel()
    const second = mod.preloadPiperModel()
    expect(mod.isPiperDownloading()).toBe(true)
    release()
    await Promise.all([first, second])
    expect(writeBlobMock).toHaveBeenCalledTimes(2)
    expect(mod.isPiperDownloading()).toBe(false)
  })

  it('下载进度经订阅广播，结束后回到空闲态', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse(100, 4)))
    const mod = await loadEngine()
    const seen: number[] = []
    const unsubscribe = mod.subscribePiperDownloadProgress((percent) => seen.push(percent))
    await mod.preloadPiperModel()
    unsubscribe()
    expect(seen[0]).toBe(-1) // 订阅回放当前空闲态
    expect(seen).toContain(100)
    expect(seen[seen.length - 1]).toBe(-1)
  })
})
