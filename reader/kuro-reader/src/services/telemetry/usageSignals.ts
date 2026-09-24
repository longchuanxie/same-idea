import { STORAGE_KEYS } from '@/constants/storage'

/**
 * 使用信号最小采集：本地 localStorage 计数，不上报、无设备指纹。
 * 服务三类判断：回原文点击率、节拍点击率、替换触发次数（追更型读者规模的唯一直接证据）。
 * 写入失败（隐私模式/配额）静默——信号是加速层，不拖业务动作。
 */

export const USAGE_SIGNAL_EVENTS = [
  'knowledge-back-to-source',
  'knowledge-beat-tap',
  'book-replace',
] as const

export type UsageSignalEvent = (typeof USAGE_SIGNAL_EVENTS)[number]

export interface UsageSignalSample {
  bookId?: string
  ts: number
}

export interface UsageSignalRecord {
  count: number
  firstAt: number
  lastAt: number
  /** 最近样本（封顶 20 条）：导出诊断时看得到「谁在何时触发」，不堆积全量 */
  recent: UsageSignalSample[]
}

export type UsageSignalMap = Partial<Record<UsageSignalEvent, UsageSignalRecord>>

const RECENT_SAMPLE_CAP = 20

function readSignals(): UsageSignalMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USAGE_SIGNALS)
    return raw ? (JSON.parse(raw) as UsageSignalMap) : {}
  } catch {
    return {}
  }
}

function writeSignals(signals: UsageSignalMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USAGE_SIGNALS, JSON.stringify(signals))
  } catch {
    // 隐私模式/配额满：丢这一次计数，不抛给调用方
  }
}

export function recordUsageSignal(event: UsageSignalEvent, context?: { bookId?: string }): void {
  const signals = readSignals()
  const previous = signals[event]
  const now = Date.now()
  const sample: UsageSignalSample = { ts: now, ...(context?.bookId ? { bookId: context.bookId } : {}) }
  signals[event] = {
    count: (previous?.count ?? 0) + 1,
    firstAt: previous?.firstAt ?? now,
    lastAt: now,
    recent: [...(previous?.recent ?? []), sample].slice(-RECENT_SAMPLE_CAP),
  }
  writeSignals(signals)
}

export function getUsageSignals(): UsageSignalMap {
  return readSignals()
}

export function exportUsageSignalsJson(): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), events: readSignals() }, null, 2)
}

export function clearUsageSignals(): void {
  writeSignals({})
}
