import { Capacitor } from '@capacitor/core';

import { WidgetBridge } from '@/plugins/WidgetBridgePlugin';
import { bookRepo } from '@/services/storage/bookRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useStatsStore } from '@/stores/useStatsStore';
import type { Book, ReadingProgress } from '@/types';

import {
  buildContinueWidgetPayload,
  buildStatsWidgetPayload,
  EMPTY_CONTINUE_PAYLOAD,
  type ContinueWidgetPayload,
} from './widgetPayload';

/**
 * 小组件数据推送：书架进度 / 阅读时长变化 → 原生 WidgetBridge 落盘渲染。
 * 仅原生平台生效；推送按串行链收敛（快速连续 sync 只落最新一次）。
 */

/** 封面缩略图边长（px）：小组件 44dp 逻辑像素的 2x 余量，控传输体积 */
const COVER_SIZE = 96
const COVER_JPEG_QUALITY = 0.82

const isNative = (): boolean => Capacitor.isNativePlatform()

/** 串行链：同一时间只有一个推送在飞，乱序完成也不会旧数据盖新数据 */
let pushChain: Promise<void> = Promise.resolve()

function enqueuePush(operation: () => Promise<void>): Promise<void> {
  const run = pushChain.then(operation, operation)
  pushChain = run.catch(() => undefined)
  return run
}

/** 上次推送过封面的书：换书才重取重传（封面传输体积大头，进度推送保持轻量） */
let lastCoverBookId: string | null = null

async function resolveCoverBase64(bookId: string): Promise<string | undefined> {
  if (lastCoverBookId === bookId) return undefined
  const blob = await bookRepo.getCover(bookId).catch(() => undefined)
  lastCoverBookId = bookId
  if (!blob || typeof createImageBitmap !== 'function') return undefined
  try {
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = COVER_SIZE
    canvas.height = COVER_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    // 封面比例不一：居中裁方形（小组件显示方图）
    const side = Math.min(bitmap.width, bitmap.height)
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      COVER_SIZE,
      COVER_SIZE
    )
    bitmap.close()
    const dataUrl = canvas.toDataURL('image/jpeg', COVER_JPEG_QUALITY)
    return dataUrl.split(',')[1] || undefined
  } catch {
    return undefined
  }
}

/** 推送「继续阅读」：source 为 null / 书无效 → 小组件清为空态 */
export async function pushContinueWidget(
  payload: ContinueWidgetPayload | null,
  coverBase64?: string
): Promise<void> {
  if (!isNative()) return
  const effective = payload ?? EMPTY_CONTINUE_PAYLOAD
  await enqueuePush(async () => {
    try {
      await WidgetBridge.updateContinueWidget({
        payload: { ...effective, ...(coverBase64 ? { coverBase64 } : {}) },
      })
    } catch {
      // 原生桥缺席/异常：小组件维持原样，下次推送兜底
    }
  })
}

/** 推送「阅读统计」 */
export async function pushStatsWidget(source: {
  todayMinutes: number
  dailyGoalMinutes: number
  streakDays: number
}): Promise<void> {
  if (!isNative()) return
  const payload = buildStatsWidgetPayload(source)
  await enqueuePush(async () => {
    try {
      await WidgetBridge.updateStatsWidget({ payload })
    } catch {
      // 同上
    }
  })
}

/** 从书架状态取「最近在读」并推送（useLibraryStore 订阅方调用） */
export async function syncContinueWidgetFromLibrary(): Promise<void> {
  const { readingProgress, getContinueReading } = useLibraryStore.getState()
  const current = getContinueReading()[0] as Book | undefined
  if (!current) {
    lastCoverBookId = null
    await pushContinueWidget(null)
    return
  }
  const progress: ReadingProgress | undefined = readingProgress[current.id]
  const payload = buildContinueWidgetPayload({ book: current, progress })
  if (!payload) {
    await pushContinueWidget(null)
    return
  }
  const coverBase64 = await resolveCoverBase64(current.id)
  await pushContinueWidget(payload, coverBase64)
}

/** 从时长簿取今日/目标/连击并推送（useStatsStore 订阅方调用） */
export async function syncStatsWidgetFromStats(): Promise<void> {
  const { dailyGoalMinutes, getTodayMinutes, getStats } = useStatsStore.getState()
  await pushStatsWidget({
    todayMinutes: getTodayMinutes(),
    dailyGoalMinutes,
    streakDays: getStats().currentStreak,
  })
}

/** **仅供测试使用**，不应在生产代码中调用。 */
export function _resetWidgetBridgeForTesting(): void {
  lastCoverBookId = null
  pushChain = Promise.resolve()
}
