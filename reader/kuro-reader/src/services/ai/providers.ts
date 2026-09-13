/**
 * 知识库 AI 服务商预设：下拉选择的内置项 + 自定义兜底。
 *
 * baseUrl 均为 OpenAI 兼容根地址：已带版本段（/v1、/v4…）的服务商
 * 客户端不再叠加 /v1（见 aiClient 的 URL 拼接规则）。
 */

import { normalizeAiBaseUrl } from '@/services/ai/aiClient'
import { isNativePlatform } from '@/utils/capacitor'

export interface KnowledgeAiProvider {
  id: string
  label: string
  /** OpenAI 兼容根地址；'' 表示自定义（用户手填） */
  baseUrl: string
  /** 是否必须配置 API Key（本机服务如 Ollama 无需） */
  needsKey: boolean
  /** 选择器里的副标说明 */
  hint: string
  /**
   * 配置期保底的官方模型（设置页「拉取模型」前就有得选）。
   * 只收长期稳定的官方模型名；聚合平台（硅基流动）与本机 Ollama
   * 模型面因人而异，不预置，靠实拉列表。实拉列表始终优先展示。
   */
  models: string[]
}

export const CUSTOM_PROVIDER_ID = 'custom'

const ALL_PRESETS: KnowledgeAiProvider[] = [
  {
    id: 'glm',
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    needsKey: true,
    hint: 'glm-4 系列',
    models: ['glm-4-flash', 'glm-4-air', 'glm-4-plus', 'glm-4.5', 'glm-4.6'],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    needsKey: true,
    hint: 'deepseek-chat 系列',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com',
    needsKey: true,
    hint: 'gpt 系列',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1'],
  },
  {
    id: 'siliconflow',
    label: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn',
    needsKey: true,
    hint: '多模型聚合',
    models: [],
  },
  {
    id: 'ollama',
    label: 'Ollama',
    baseUrl: 'http://127.0.0.1:11434/v1',
    needsKey: false,
    hint: '本机运行，无需密钥',
    models: [],
  },
  {
    id: CUSTOM_PROVIDER_ID,
    label: '自定义',
    baseUrl: '',
    needsKey: true,
    hint: '任意 OpenAI 兼容服务',
    models: [],
  },
]

/**
 * 回环地址预设（如 Ollama 的 127.0.0.1）仅桌面浏览器可达：手机原生端回环指向设备自身，
 * 预设必连不上。原生端直接不列出，反查地址也不会命中（落回自定义，避免幽灵选中态）。
 */
export const KNOWLEDGE_AI_PROVIDERS: KnowledgeAiProvider[] = isNativePlatform()
  ? ALL_PRESETS.filter((preset) => !preset.baseUrl.startsWith('http://127.0.0.1'))
  : ALL_PRESETS

export function findKnowledgeAiProvider(id: string): KnowledgeAiProvider | undefined {
  return KNOWLEDGE_AI_PROVIDERS.find((provider) => provider.id === id)
}

/** 按地址反查预设（设置页据此高亮当前服务商；匹配不到即自定义） */
export function matchProviderByBaseUrl(url: string): KnowledgeAiProvider | undefined {
  const normalized = normalizeAiBaseUrl(url)
  if (!normalized) return undefined
  return KNOWLEDGE_AI_PROVIDERS.find(
    (provider) => provider.baseUrl && normalizeAiBaseUrl(provider.baseUrl) === normalized
  )
}
