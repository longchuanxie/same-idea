import { beforeEach, describe, expect, it, vi } from 'vitest'

const createMock = vi.fn()
const downloadMock = vi.fn()
const storedMock = vi.fn(async (): Promise<string[]> => [])

vi.mock('@mintplex-labs/piper-tts-web', () => ({
  TtsSession: { create: (...args: unknown[]) => createMock(...args) },
  download: (...args: unknown[]) => downloadMock(...args),
  stored: () => storedMock(),
}))

// sessionPromise / activeDownload 为模块级缓存,每个用例重载模块以隔离
const loadEngine = async () => await import('./piperEngine')

describe('preloadPiperModel', () => {
  beforeEach(() => {
    vi.resetModules()
    createMock.mockReset()
    downloadMock.mockReset()
    storedMock.mockResolvedValue([])
  })

  it('触发会话创建并复用同一会话', async () => {
    createMock.mockResolvedValue({})
    const { preloadPiperModel } = await loadEngine()
    await preloadPiperModel()
    await preloadPiperModel()
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('创建失败后不缓存错误,下次调用可重试', async () => {
    createMock.mockRejectedValueOnce(new Error('network'))
    const { preloadPiperModel } = await loadEngine()
    await expect(preloadPiperModel()).rejects.toThrow('network')
    createMock.mockResolvedValue({})
    await expect(preloadPiperModel()).resolves.toBeUndefined()
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('未存储时先经库 download 取模型并广播进度', async () => {
    createMock.mockResolvedValue({})
    downloadMock.mockImplementation(async (_voice: unknown, onProgress?: (p: { url: string; total: number; loaded: number }) => void) => {
      onProgress?.({ url: 'a.onnx', total: 100, loaded: 40 })
      onProgress?.({ url: 'a.onnx', total: 100, loaded: 100 })
    })
    const mod = await loadEngine()
    const seen: number[] = []
    const unsubscribe = mod.subscribePiperDownloadProgress((percent) => seen.push(percent))
    await mod.preloadPiperModel()
    unsubscribe()
    expect(downloadMock).toHaveBeenCalledTimes(1)
    expect(seen).toContain(40)
    expect(seen[seen.length - 1]).toBe(-1) // 结束后回到空闲态
  })

  it('已存储时跳过下载直接建会话', async () => {
    storedMock.mockResolvedValue(['zh_CN-huayan-medium'])
    createMock.mockResolvedValue({})
    const mod = await loadEngine()
    await mod.preloadPiperModel()
    expect(downloadMock).not.toHaveBeenCalled()
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('并发触发共享同一次下载', async () => {
    createMock.mockResolvedValue({})
    let release!: () => void
    downloadMock.mockImplementation(() => new Promise<void>((resolve) => { release = resolve }))
    const mod = await loadEngine()
    const first = mod.preloadPiperModel()
    // download 在模块加载 + stored 查询之后才被调用，等它真正发起
    await vi.waitFor(() => expect(downloadMock).toHaveBeenCalledTimes(1))
    const second = mod.preloadPiperModel() // 下载进行中 → 共享同一 promise
    expect(mod.isPiperDownloading()).toBe(true)
    release()
    await Promise.all([first, second])
    expect(downloadMock).toHaveBeenCalledTimes(1)
    expect(mod.isPiperDownloading()).toBe(false)
  })
})
