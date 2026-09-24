/**
 * 知识库 AI 客户端：OpenAI 兼容 /v1/chat/completions。
 *
 * 本地优先原则：服务地址/密钥/模型仅存本机（useAppStore persist），
 * 只在用户主动生成知识产物时发起请求；不内置任何云端依赖，
 * 可对接 OpenAI / GLM / DeepSeek / Ollama（本地）等任意兼容端点。
 */

export interface AiProviderConfig {
  /** 服务根地址，如 https://api.openai.com 或 http://127.0.0.1:11434/v1 */
  baseUrl: string
  apiKey: string
  model: string
}

export class AiRequestError extends Error {
  constructor(
    message: string,
    /** HTTP 状态码（网络层失败时无） */
    readonly status?: number
  ) {
    super(message)
    this.name = 'AiRequestError'
  }
}

/** 规范化服务地址：补 http:// 协议、去尾部斜杠（手法同 serverTtsEngine） */
export function normalizeAiBaseUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  return withScheme.replace(/\/+$/, '')
}

/** 配置齐备（地址 + 模型）才可发起生成；密钥允许为空（Ollama 等本地服务） */
export function isProviderConfigured(config: AiProviderConfig): boolean {
  return normalizeAiBaseUrl(config.baseUrl).length > 0 && config.model.trim().length > 0
}

/** 地址已带版本段（/v1、/v4…）时不叠加 /v1（智谱 /paas/v4、Ollama /v1 等） */
const VERSIONED_PATH_PATTERN = /\/v\d+$/

function endpointUrl(base: string, path: string): string {
  return VERSIONED_PATH_PATTERN.test(base) ? `${base}${path}` : `${base}/v1${path}`
}

/** POST 目标：…/chat/completions */
export function chatCompletionsUrl(base: string): string {
  return endpointUrl(normalizeAiBaseUrl(base), '/chat/completions')
}

/** GET 目标：…/models */
export function modelsListUrl(base: string): string {
  return endpointUrl(normalizeAiBaseUrl(base), '/models')
}

interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

export interface ChatJsonOptions {
  messages: ChatMessage[]
  /** 毫秒；默认 120s（长文分析耗时可观） */
  timeoutMs?: number
  signal?: AbortSignal
  /** 采样温度；提取类任务用低值 */
  temperature?: number
  /**
   * 流式接收（stream:true）：响应持续有数据，长生成不再被网关/代理按
   * 「空闲连接」掐断，也不用等完整响应一次性到达。默认 false 保持轻量请求原样。
   */
  stream?: boolean
}

const DEFAULT_TIMEOUT_MS = 120_000
/** 模型列表/连接测试是轻量请求，不应久等（chat 补全才是 120s 长任务） */
const MODELS_TIMEOUT_MS = 15_000
const EXTRACT_TEMPERATURE = 0.2
/** 错误响应体回显上限（防超长 HTML 刷屏） */
const ERROR_BODY_PREVIEW_CHARS = 200

/**
 * 发起一次对话补全并把回复解析为 JSON 对象。
 *
 * 不发送 response_format（部分兼容端点不支持），
 * 改为提示词约束 + 容错抽取（剥代码围栏 / 平衡括号截取）。
 */
export async function chatCompletionJson<T>(
  config: AiProviderConfig,
  options: ChatJsonOptions
): Promise<T> {
  const base = normalizeAiBaseUrl(config.baseUrl)
  if (!base) throw new AiRequestError('AI 服务地址未配置')
  if (!config.model.trim()) throw new AiRequestError('AI 模型未配置')

  // 超时守护覆盖请求 + 响应体读取全程：掐的不只是连接建立，还有慢慢吞吞的读流
  const timeoutController = new AbortController()
  const timeoutId = window.setTimeout(() => timeoutController.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  // 外部取消信号（生成任务的 AbortController）联动到超时控制器
  const externalSignal = options.signal
  const linkAbort = () => timeoutController.abort()
  if (externalSignal) {
    if (externalSignal.aborted) timeoutController.abort()
    else externalSignal.addEventListener('abort', linkAbort, { once: true })
  }

  try {
    let response: Response
    try {
      response = await fetch(chatCompletionsUrl(base), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey.trim() ? { Authorization: `Bearer ${config.apiKey.trim()}` } : {}),
        },
        body: JSON.stringify({
          model: config.model.trim(),
          messages: options.messages,
          temperature: options.temperature ?? EXTRACT_TEMPERATURE,
          stream: options.stream === true,
        }),
        signal: timeoutController.signal,
      })
    } catch (e) {
      if (externalSignal?.aborted) throw new AiRequestError('已取消')
      if (timeoutController.signal.aborted) throw new AiRequestError('AI 服务响应超时')
      throw new AiRequestError(`无法连接 AI 服务：${(e as Error).message}`)
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new AiRequestError(
        `AI 服务返回 ${response.status}${body ? `：${body.slice(0, ERROR_BODY_PREVIEW_CHARS)}` : ''}`,
        response.status
      )
    }

    const contentType = response.headers.get('Content-Type') ?? ''
    let content: string
    if (options.stream === true && contentType.includes('text/event-stream')) {
      content = await readStreamContent(response, timeoutController, externalSignal)
    } else {
      // 非流式路径（含端点不支持 stream、按普通 JSON 一次性返回的情况）
      const payload = (await response.json().catch(() => null)) as {
        choices?: { message?: { content?: string } }[]
      } | null
      if (!payload) {
        // 200 但响应体不是 JSON（网关错误页等）：语法错误冒泡用户看不懂
        throw new AiRequestError('AI 服务返回了非 JSON 响应（可能被网关/代理拦截）')
      }
      content = payload.choices?.[0]?.message?.content ?? ''
    }

    const parsed = extractJsonPayload(content)
    if (parsed == null) {
      throw new AiRequestError('AI 没有返回可解析的 JSON 结果')
    }
    return parsed as T
  } finally {
    window.clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', linkAbort)
  }
}

/**
 * 流式响应聚合：按 SSE `data:` 行累积 delta.content，[DONE] 收尾。
 * 读流中途的断连/取消/超时统一翻译成与请求阶段一致的错误文案；
 * 单行解析失败（心跳行等）跳过不致命。
 */
async function readStreamContent(
  response: Response,
  timeoutController: AbortController,
  externalSignal?: AbortSignal
): Promise<string> {
  const parts: string[] = []
  const consumeLine = (line: string): void => {
    if (!line.startsWith('data:')) return
    const data = line.slice('data:'.length).trim()
    if (!data || data === '[DONE]') return
    try {
      const chunk = JSON.parse(data) as {
        choices?: { delta?: { content?: string }; message?: { content?: string } }[]
      }
      const delta = chunk.choices?.[0]?.delta?.content ?? chunk.choices?.[0]?.message?.content ?? ''
      if (delta) parts.push(delta)
    } catch {
      // 非 JSON 行（网关心跳等）：跳过
    }
  }

  try {
    const reader = response.body?.getReader() ?? null
    if (!reader) {
      // 环境不提供流式读取（罕见）：退化为整段文本按行解析
      const text = await response.text()
      for (const line of text.split(/\r?\n/)) consumeLine(line)
    } else {
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''
        for (const line of lines) consumeLine(line)
      }
      buffer += decoder.decode()
      if (buffer) consumeLine(buffer)
    }
  } catch (e) {
    if (externalSignal?.aborted) throw new AiRequestError('已取消')
    if (timeoutController.signal.aborted) throw new AiRequestError('AI 服务响应超时')
    throw new AiRequestError(`AI 服务响应中断：${(e as Error).message}`)
  }
  return parts.join('')
}

/**
 * 拉取服务商全部可用模型（GET …/models）。
 * 兼容 OpenAI 形态 `{data:[{id}]}` 与字符串数组形态；去重排序后返回。
 * 兼任连接测试：失败（网络/鉴权/形状）抛 AiRequestError。
 */
export async function listModels(config: AiProviderConfig): Promise<string[]> {
  const base = normalizeAiBaseUrl(config.baseUrl)
  if (!base) throw new AiRequestError('AI 服务地址未配置')
  // 连接测试/拉列表不能永久挂起：超时与响应体读取都在同一守护内
  const timeoutController = new AbortController()
  const timeoutId = window.setTimeout(() => timeoutController.abort(), MODELS_TIMEOUT_MS)
  try {
    let response: Response
    try {
      response = await fetch(modelsListUrl(base), {
        headers: config.apiKey.trim() ? { Authorization: `Bearer ${config.apiKey.trim()}` } : {},
        signal: timeoutController.signal,
      })
    } catch (e) {
      if (timeoutController.signal.aborted) throw new AiRequestError('AI 服务响应超时')
      throw new AiRequestError(`无法连接 AI 服务：${(e as Error).message}`)
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new AiRequestError(
        `AI 服务返回 ${response.status}${body ? `：${body.slice(0, ERROR_BODY_PREVIEW_CHARS)}` : ''}`,
        response.status
      )
    }
    const payload = (await response.json().catch(() => null)) as { data?: unknown } | null
    if (!payload || !Array.isArray(payload.data)) {
      throw new AiRequestError('服务没有返回模型列表（可能不支持 /models 接口）')
    }
    const ids = new Set<string>()
    for (const item of payload.data) {
      if (typeof item === 'string' && item.trim()) ids.add(item.trim())
      else if (item != null && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string') {
        const id = (item as { id: string }).id.trim()
        if (id) ids.add(id)
      }
    }
    return [...ids].sort((a, b) => a.localeCompare(b))
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/**
 * 从模型回复中容错抽取 JSON：
 * 1. 剥 ```json 围栏；
 * 2. 取首个平衡的 {...} 或 [...] 片段（跳过前后闲话）。
 * 抽不出返回 null。
 */
export function extractJsonPayload(text: string): unknown {
  if (!text) return null
  let candidate = text.trim()
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) candidate = fence[1].trim()

  const start = candidate.search(/[[{]/)
  if (start < 0) return null
  const opener = candidate[start]
  const closer = opener === '{' ? '}' : ']'
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === opener) depth++
    else if (ch === closer) {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(start, i + 1))
        } catch {
          return null
        }
      }
    }
  }
  return null
}
