import { describe, expect, it, vi } from 'vitest'

import { normalizeAiBaseUrl } from '@/services/ai/aiClient'
import {
  CUSTOM_PROVIDER_ID,
  KNOWLEDGE_AI_PROVIDERS,
  findKnowledgeAiProvider,
  matchProviderByBaseUrl,
} from '@/services/ai/providers'

describe('KNOWLEDGE_AI_PROVIDERS', () => {
  it('id 唯一且必含自定义项；除自定义外地址唯一且非空', () => {
    const ids = new Set(KNOWLEDGE_AI_PROVIDERS.map((p) => p.id))
    expect(ids.size).toBe(KNOWLEDGE_AI_PROVIDERS.length)
    expect(ids.has(CUSTOM_PROVIDER_ID)).toBe(true)

    const urls = KNOWLEDGE_AI_PROVIDERS.filter((p) => p.id !== CUSTOM_PROVIDER_ID).map((p) => p.baseUrl)
    expect(new Set(urls).size).toBe(urls.length)
    for (const url of urls) expect(url.length).toBeGreaterThan(0)
  })

  it('预设地址满足客户端 /vN 拼接约定（带版本段或裸根，无尾斜杠）', () => {
    for (const provider of KNOWLEDGE_AI_PROVIDERS) {
      if (!provider.baseUrl) continue
      expect(normalizeAiBaseUrl(provider.baseUrl)).toBe(provider.baseUrl)
      expect(provider.baseUrl.endsWith('/')).toBe(false)
    }
  })
})

describe('findKnowledgeAiProvider', () => {
  it('按 id 查找', () => {
    expect(findKnowledgeAiProvider('glm')?.label).toBe('智谱 GLM')
    expect(findKnowledgeAiProvider('nope')).toBeUndefined()
  })
})

describe('matchProviderByBaseUrl', () => {
  it('精确匹配预设地址（尾斜杠归一；协议缺省归一为 http，不与 https 预设混淆）', () => {
    expect(matchProviderByBaseUrl('https://open.bigmodel.cn/api/paas/v4')?.id).toBe('glm')
    expect(matchProviderByBaseUrl('https://open.bigmodel.cn/api/paas/v4/')?.id).toBe('glm')
    expect(matchProviderByBaseUrl('https://api.deepseek.com')?.id).toBe('deepseek')
    expect(matchProviderByBaseUrl('http://127.0.0.1:11434/v1')?.id).toBe('ollama')
  })

  it('未知地址与空地址返回 undefined（即自定义）', () => {
    expect(matchProviderByBaseUrl('https://api.example.com')).toBeUndefined()
    expect(matchProviderByBaseUrl('')).toBeUndefined()
    expect(matchProviderByBaseUrl('  ')).toBeUndefined()
  })
})

describe('平台差异', () => {
  it('原生端不列出回环地址预设（手机上 127.0.0.1 指向设备自身，不可达），反查同样不命中', async () => {
    vi.resetModules()
    vi.doMock('@/utils/capacitor', () => ({ isNativePlatform: () => true }))
    const { KNOWLEDGE_AI_PROVIDERS: nativeProviders, matchProviderByBaseUrl: nativeMatch } = await import(
      '@/services/ai/providers'
    )
    expect(nativeProviders.some((p) => p.baseUrl.startsWith('http://127.0.0.1'))).toBe(false)
    expect(nativeProviders.some((p) => p.id === CUSTOM_PROVIDER_ID)).toBe(true)
    expect(nativeMatch('http://127.0.0.1:11434/v1')).toBeUndefined()
    vi.doUnmock('@/utils/capacitor')
    vi.resetModules()
  })
})
