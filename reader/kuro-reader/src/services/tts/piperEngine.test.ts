import { beforeEach, describe, expect, it, vi } from 'vitest'

const createMock = vi.fn()

vi.mock('@mintplex-labs/piper-tts-web', () => ({
  TtsSession: { create: (...args: unknown[]) => createMock(...args) },
  stored: vi.fn(async () => []),
}))

// sessionPromise 为模块级缓存,每个用例重载模块以隔离
const loadEngine = async () => {
  const mod = await import('./piperEngine')
  return mod.preloadPiperModel
}

describe('preloadPiperModel', () => {
  beforeEach(() => {
    vi.resetModules()
    createMock.mockReset()
  })

  it('触发会话创建并复用同一会话', async () => {
    createMock.mockResolvedValue({})
    const preload = await loadEngine()
    await preload()
    await preload()
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('创建失败后不缓存错误,下次调用可重试', async () => {
    createMock.mockRejectedValueOnce(new Error('network'))
    const preload = await loadEngine()
    await expect(preload()).rejects.toThrow('network')
    createMock.mockResolvedValue({})
    await expect(preload()).resolves.toBeUndefined()
    expect(createMock).toHaveBeenCalledTimes(2)
  })
})
