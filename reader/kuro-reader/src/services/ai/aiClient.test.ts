import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  AiRequestError,
  chatCompletionJson,
  chatCompletionsUrl,
  extractJsonPayload,
  isProviderConfigured,
  listModels,
  modelsListUrl,
  normalizeAiBaseUrl,
} from '@/services/ai/aiClient'

const baseConfig = { baseUrl: 'https://api.example.com', apiKey: 'sk-test', model: 'test-model' }

function mockFetchOnce(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
}

/** 构造 SSE 流式响应：逐行下发后正常收尾 */
function sseResponse(lines: string[]): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) controller.enqueue(encoder.encode(line))
      controller.close()
    },
  })
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeAiBaseUrl', () => {
  it('补协议与去尾斜杠', () => {
    expect(normalizeAiBaseUrl('api.example.com/v1/')).toBe('http://api.example.com/v1')
    expect(normalizeAiBaseUrl('https://x.com//')).toBe('https://x.com')
    expect(normalizeAiBaseUrl('')).toBe('')
  })
})

describe('isProviderConfigured', () => {
  it('地址与模型齐备即可（密钥可空，本地服务无需鉴权）', () => {
    expect(isProviderConfigured({ baseUrl: 'http://127.0.0.1:11434', apiKey: '', model: 'qwen' })).toBe(true)
    expect(isProviderConfigured({ baseUrl: '', apiKey: 'k', model: 'm' })).toBe(false)
    expect(isProviderConfigured({ baseUrl: 'https://x.com', apiKey: 'k', model: ' ' })).toBe(false)
  })
})

describe('extractJsonPayload', () => {
  it('直接解析纯 JSON', () => {
    expect(extractJsonPayload('{"a":1}')).toEqual({ a: 1 })
  })

  it('剥 ```json 围栏', () => {
    expect(extractJsonPayload('```json\n{"a":[1,2]}\n```')).toEqual({ a: [1, 2] })
  })

  it('跳过前后闲话取首个平衡对象', () => {
    expect(extractJsonPayload('好的，以下是结果：\n{"name":"张三"}\n希望有帮助')).toEqual({ name: '张三' })
  })

  it('数组顶层也支持', () => {
    expect(extractJsonPayload('[1,2,{"x":"}"}]')).toEqual([1, 2, { x: '}' }])
  })

  it('字符串内的花括号不破坏平衡', () => {
    expect(extractJsonPayload('{"s":"包含 } 与 { 的文本"}')).toEqual({ s: '包含 } 与 { 的文本' })
  })

  it('解析不出返回 null', () => {
    expect(extractJsonPayload('完全不是 JSON')).toBeNull()
    expect(extractJsonPayload('{"broken":')).toBeNull()
    expect(extractJsonPayload('')).toBeNull()
  })
})

describe('chatCompletionJson', () => {
  it('发起 OpenAI 兼容请求并解析 choices 内容', async () => {
    const fetchMock = mockFetchOnce({
      choices: [{ message: { content: '{"characters":[]}' } }],
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await chatCompletionJson(baseConfig, {
      messages: [{ role: 'user', content: 'hi' }],
    })
    expect(result).toEqual({ characters: [] })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/v1/chat/completions')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer sk-test')
    expect(JSON.parse(init.body).model).toBe('test-model')
  })

  it('无密钥时不带 Authorization 头', async () => {
    const fetchMock = mockFetchOnce({ choices: [{ message: { content: '{}' } }] })
    vi.stubGlobal('fetch', fetchMock)
    await chatCompletionJson({ ...baseConfig, apiKey: ' ' }, { messages: [{ role: 'user', content: 'x' }] })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('回复无 JSON 时抛错', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({ choices: [{ message: { content: '抱歉我不能' } }] }))
    await expect(
      chatCompletionJson(baseConfig, { messages: [{ role: 'user', content: 'x' }] })
    ).rejects.toThrow(AiRequestError)
  })

  it('HTTP 错误透出状态码', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({ error: 'bad key' }, 401))
    await expect(
      chatCompletionJson(baseConfig, { messages: [{ role: 'user', content: 'x' }] })
    ).rejects.toMatchObject({ status: 401 })
  })

  it('流式：SSE delta 逐段累积成完整 JSON（请求体带 stream:true）', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"{\\"chara"}}]}\n\n',
        ': keep-alive\n\n',
        'data: {"choices":[{"delta":{"content":"cters\\":[]}"}}]}\n\n',
        'data: {"choices":[{"delta":{"reasoning_content":"思考中"}}]}\n\n',
        'data: [DONE]\n\n',
      ])
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await chatCompletionJson(baseConfig, {
      messages: [{ role: 'user', content: 'x' }],
      stream: true,
    })
    expect(result).toEqual({ characters: [] })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBe(true)
  })

  it('流式请求但端点按普通 JSON 返回时照常解析（不支持 stream 的端点回退）', async () => {
    const fetchMock = mockFetchOnce({ choices: [{ message: { content: '{"ok":1}' } }] })
    vi.stubGlobal('fetch', fetchMock)
    const result = await chatCompletionJson(baseConfig, {
      messages: [{ role: 'user', content: 'x' }],
      stream: true,
    })
    expect(result).toEqual({ ok: 1 })
  })

  it('流式读中途断连报「响应中断」，不静默当成功', async () => {
    const broken = new Response(
      new ReadableStream<Uint8Array>({
        pull(controller) {
          controller.error(new Error('connection reset'))
        },
      }),
      { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(broken))
    await expect(
      chatCompletionJson(baseConfig, { messages: [{ role: 'user', content: 'x' }], stream: true })
    ).rejects.toThrow('AI 服务响应中断')
  })
})

describe('endpoint URL 拼接', () => {
  it('裸根地址自动补 /v1', () => {
    expect(chatCompletionsUrl('https://api.openai.com')).toBe('https://api.openai.com/v1/chat/completions')
    expect(modelsListUrl('https://api.deepseek.com/')).toBe('https://api.deepseek.com/v1/models')
  })

  it('已带版本段（/v1、/v4）不再叠加', () => {
    expect(chatCompletionsUrl('https://open.bigmodel.cn/api/paas/v4')).toBe(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    )
    expect(modelsListUrl('http://127.0.0.1:11434/v1')).toBe('http://127.0.0.1:11434/v1/models')
  })
})

describe('listModels', () => {
  it('解析 OpenAI 形态 {data:[{id}]}，去重排序', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 'glm-4-plus' }, { id: 'glm-4-flash' }, { id: 'glm-4-flash' }, { id: '' }] }))
    )
    vi.stubGlobal('fetch', fetchMock)
    const models = await listModels(baseConfig)
    expect(models).toEqual(['glm-4-flash', 'glm-4-plus'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/v1/models')
    expect(init.headers.Authorization).toBe('Bearer sk-test')
  })

  it('兼容字符串数组形态（部分网关返回）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: ['b-model', 'a-model'] }))))
    expect(await listModels(baseConfig)).toEqual(['a-model', 'b-model'])
  })

  it('data 非数组时抛错（不支持 /models 的服务）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ object: 'list' }))))
    await expect(listModels(baseConfig)).rejects.toThrow(/模型列表/)
  })

  it('HTTP 错误透出状态码', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"error":"bad key"}', { status: 401 })))
    await expect(listModels(baseConfig)).rejects.toMatchObject({ status: 401 })
  })

  it('不可达时抛连接错误', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    await expect(listModels(baseConfig)).rejects.toThrow('无法连接')
  })

  it('端点无响应时 15s 超时，不永久挂起', async () => {
    vi.useFakeTimers()
    try {
      // 模拟服务端接收连接但不返回：仅在 abort 时 reject
      vi.stubGlobal('fetch', vi.fn((_: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
        })
      ))
      const pending = listModels(baseConfig)
      const assertion = expect(pending).rejects.toThrow('AI 服务响应超时')
      await vi.advanceTimersByTimeAsync(15_000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })
})
