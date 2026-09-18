import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createMock = vi.fn((..._args: unknown[]): unknown => undefined)
const storedMock = vi.fn(async (): Promise<string[]> => [])
const capacitorHttpGet = vi.fn()
const predictMock = vi.fn(async (text: string) => new Blob([`wav:${text}`]))

vi.mock('@mintplex-labs/piper-tts-web', () => ({
  TtsSession: { create: (...args: unknown[]) => createMock(...args) },
  stored: () => storedMock(),
}))

vi.mock('@capacitor/core', () => ({
  CapacitorHttp: { get: (...args: unknown[]) => capacitorHttpGet(...args) },
}))

// ===== 假 OPFS：jsdom 无 OPFS，记录写入文件与字节数 =====
const opfsFiles = new Map<string, number>()
function installFakeOpfs() {
  opfsFiles.clear()
  const dirHandle = {
    async getFileHandle(name: string, opts?: { create?: boolean }) {
      if (!opfsFiles.has(name) && !opts?.create) throw new Error(`NotFound: ${name}`)
      return {
        async createWritable() {
          let bytes = 0
          return {
            write: async (part: BlobPart) => {
              bytes += part instanceof Blob ? part.size : (part as ArrayBuffer).byteLength ?? 0
            },
            close: async () => { opfsFiles.set(name, bytes) },
          }
        },
        async getFile() { return { size: opfsFiles.get(name) ?? 0 } as File },
      }
    },
  }
  const root = { getDirectoryHandle: async () => dirHandle }
  const nav = navigator as unknown as { storage: { getDirectory: unknown } }
  nav.storage = nav.storage ?? ({} as StorageManager)
  nav.storage.getDirectory = async () => root
}

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
    storedMock.mockResolvedValue([])
    capacitorHttpGet.mockReset()
    createMock.mockResolvedValue(undefined)
    installFakeOpfs()
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
    expect([...opfsFiles.keys()].sort()).toEqual(['zh_CN-huayan-medium.onnx', 'zh_CN-huayan-medium.onnx.json'])
  })

  it('主源失败自动切换镜像源（revision API 解析后直出），全部失败才报错', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/models/diffusionstudio/piper-voices/revision/main')) {
        return new Response(JSON.stringify({ sha: '840e38a7e26d813bd6221b78cfbaefa3585b3f71' }), { status: 200 })
      }
      if (url.startsWith('https://hf-mirror.com/')) return fakeResponse(10)
      throw new TypeError('fetch failed')
    })
    vi.stubGlobal('fetch', fetchMock)
    const mod = await loadEngine()
    await expect(mod.preloadPiperModel()).resolves.toBeUndefined()
    // 2 个文件 ×（HF 1 次失败 + 镜像 revision API 1 次 + 镜像直出 1 次）= 6
    expect(fetchMock).toHaveBeenCalledTimes(6)
    expect(opfsFiles.size).toBe(2)
    // 走的是 resolve-cache 直出（绕开 /resolve 的 307 CORS 失败点）
    const fetchedUrls = fetchMock.mock.calls.map((call) => String(call[0]))
    expect(fetchedUrls.filter((url) => url.includes('/api/resolve-cache/models/')).length).toBe(2)
  })

  it('镜像 revision API 失败时回退 resolve 直拼并由原生通道兜底', async () => {
    // HF 的 fetch 与原生兜底都失败，才会走到镜像源
    capacitorHttpGet.mockImplementation(async ({ url }: { url: string }) => {
      if (url.startsWith('https://hf-mirror.com/')) return { data: new ArrayBuffer(10) }
      throw new Error('native failed')
    })
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/models/') || url.startsWith('https://huggingface.co/')) throw new TypeError('fetch failed')
      throw new TypeError('CORS blocked')
    })
    vi.stubGlobal('fetch', fetchMock)
    const mod = await loadEngine()
    await mod.preloadPiperModel()
    // 每文件先在 HF 源走完（fetch ✗ + 原生 ✗）再到镜像：原生共 4 次，其中镜像 resolve 直拼 2 次成功
    expect(capacitorHttpGet).toHaveBeenCalledTimes(4)
    const nativeUrls = capacitorHttpGet.mock.calls.map((call) => String((call[0] as { url: string }).url))
    const mirrorUrls = nativeUrls.filter((url) => url.startsWith('https://hf-mirror.com/diffusionstudio/piper-voices/resolve/main/'))
    expect(mirrorUrls.length).toBe(2)
    expect(opfsFiles.size).toBe(2)
  })

  it('全部源失败时下载失败，不写 OPFS', async () => {
    capacitorHttpGet.mockRejectedValue(new Error('native failed'))
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed') }))
    const mod = await loadEngine()
    await expect(mod.preloadPiperModel()).rejects.toThrow()
    expect(opfsFiles.size).toBe(0)
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
    expect(opfsFiles.size).toBe(2)
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

  it('fetch 全部被拦（如 CORS）时回退 CapacitorHttp 原生通道完成下载', async () => {
    capacitorHttpGet.mockResolvedValue({ data: new ArrayBuffer(10) })
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    const mod = await loadEngine()
    await mod.preloadPiperModel()
    // 两个文件各走一次原生兜底，均写入 OPFS
    expect(capacitorHttpGet).toHaveBeenCalledTimes(2)
    expect(opfsFiles.size).toBe(2)
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('原生兜底下载期间播报不确定态进度（-2），结束后回空闲', async () => {
    capacitorHttpGet.mockResolvedValue({ data: new ArrayBuffer(10) })
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    const mod = await loadEngine()
    const seen: number[] = []
    const unsubscribe = mod.subscribePiperDownloadProgress((percent) => seen.push(percent))
    await mod.preloadPiperModel()
    unsubscribe()
    expect(seen).toContain(mod.PROGRESS_INDETERMINATE)
    expect(seen[seen.length - 1]).toBe(-1)
  })

  it('fetch 与原生兜底全部失败才报错，不写 OPFS', async () => {
    capacitorHttpGet.mockRejectedValue(new Error('native failed'))
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed') }))
    const mod = await loadEngine()
    await expect(mod.preloadPiperModel()).rejects.toThrow()
    expect(opfsFiles.size).toBe(0)
  })
})

describe('normalizePiperDownloadPercent', () => {
  it('非负百分比原样透传', async () => {
    const mod = await loadEngine()
    expect(mod.normalizePiperDownloadPercent(0)).toBe(0)
    expect(mod.normalizePiperDownloadPercent(47)).toBe(47)
    expect(mod.normalizePiperDownloadPercent(100)).toBe(100)
  })

  it('不确定态（-2）原样透传给 UI 呈现，空闲（-1）等其他负值返回 null', async () => {
    const mod = await loadEngine()
    expect(mod.PROGRESS_INDETERMINATE).toBe(-2)
    expect(mod.normalizePiperDownloadPercent(mod.PROGRESS_INDETERMINATE)).toBe(-2)
    expect(mod.normalizePiperDownloadPercent(-1)).toBeNull()
    expect(mod.normalizePiperDownloadPercent(-3)).toBeNull()
  })
})

describe('PiperEngine', () => {
  // ── Audio Fake（合成出的 wav 经 HTMLAudioElement 播放）──
  class FakeAudio {
    static instances: FakeAudio[] = []
    src = ''
    playbackRate = 1
    onended: (() => void) | null = null
    onerror: (() => void) | null = null
    play = vi.fn(() => Promise.resolve())
    pause = vi.fn()
    removeAttribute = vi.fn()
    constructor() {
      FakeAudio.instances.push(this)
    }
  }

  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    storedMock.mockResolvedValue(['zh_CN-huayan-medium'])
    predictMock.mockClear()
    predictMock.mockImplementation(async (text: string) => new Blob([`wav:${text}`]))
    createMock.mockReset()
    createMock.mockResolvedValue({ predict: predictMock })
    FakeAudio.instances = []
    vi.stubGlobal('Audio', FakeAudio)
    installFakeOpfs()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('后台预合成下一分块，speak 命中后不重复推理', async () => {
    const { PiperEngine } = await loadEngine()
    const engine = new PiperEngine()

    engine.prepare('第二句。')
    await vi.waitFor(() => expect(predictMock).toHaveBeenCalledTimes(1))

    const onDone = vi.fn()
    const onError = vi.fn()
    engine.speak('第二句。', { rate: 1, lang: 'zh-CN' }, { onDone, onError })
    await vi.waitFor(() => expect(FakeAudio.instances).toHaveLength(1))
    // 复用预合成产物：总推理次数仍为 1
    expect(predictMock).toHaveBeenCalledTimes(1)

    FakeAudio.instances[0].onended?.()
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  it('未命中预合成的分块现场推理', async () => {
    const { PiperEngine } = await loadEngine()
    const engine = new PiperEngine()

    engine.prepare('第二句。')
    await vi.waitFor(() => expect(predictMock).toHaveBeenCalledTimes(1))

    engine.speak('第三句。', { rate: 1, lang: 'zh-CN' }, { onDone: vi.fn(), onError: vi.fn() })
    await vi.waitFor(() => expect(FakeAudio.instances).toHaveLength(1))
    expect(predictMock).toHaveBeenCalledTimes(2)
  })

  it('现场推理与后台预合成经串行队列执行，绝不并发', async () => {
    const { PiperEngine } = await loadEngine()
    let running = 0
    let maxRunning = 0
    predictMock.mockImplementation(async (text: string) => {
      running += 1
      maxRunning = Math.max(maxRunning, running)
      await new Promise((resolve) => setTimeout(resolve, 5))
      running -= 1
      return new Blob([`wav:${text}`])
    })

    const engine = new PiperEngine()
    // 首块现场推理仍在排队/执行时就预合成下一块：两次推理必须先后串行
    engine.speak('第一句。', { rate: 1, lang: 'zh-CN' }, { onDone: vi.fn(), onError: vi.fn() })
    engine.prepare('第二句。')

    await vi.waitFor(() => expect(FakeAudio.instances).toHaveLength(1))
    await vi.waitFor(() => expect(predictMock).toHaveBeenCalledTimes(2))
    expect(maxRunning).toBe(1)
  })
})
