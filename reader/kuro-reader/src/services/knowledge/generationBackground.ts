/**
 * 知识库生成的后台运行引导：把队列事件接到系统通道（通知栏 + 前台保活），
 * 并在 App 启动时续跑上次中断的任务。App 根组件挂载时调用一次。
 *
 * 队列本身跨平台可用（Web 调试也享受持久化队列）；本文件里的系统通道
 * 在 Web 上全部空操作（generationNotification 内部按平台分流）。
 */

import { getKnowledgeTask } from '@/services/ai/knowledgeTasks'
import {
  notifyGenerationFinished,
  stopGenerationForeground,
  syncGenerationNotification,
} from '@/services/knowledge/generationNotification'
import {
  getGenerationRecords,
  startGenerationQueue,
  subscribeGenerationQueue,
} from '@/services/knowledge/generationQueue'

let initialized = false

/** 进度同步节流：LLM 分块本就以十秒计，节流只为防极短块连环触发 */
const SYNC_THROTTLE_MS = 1500

export function initGenerationBackground(): void {
  if (initialized) return
  initialized = true

  subscribeGenerationQueue((event) => {
    switch (event.type) {
      case 'enqueued':
      case 'started':
      case 'progress': {
        syncGenerationQueueState(event.type)
        break
      }
      case 'settled': {
        // 取消不打扰（无收尾通知）；失败逐任务告警；成功仅在队列排空时收尾
        if (!event.cancelled && (!event.ok || getGenerationRecords().length === 0)) {
          void notifyGenerationFinished(
            event.bookTitle,
            getKnowledgeTask(event.taskType).label,
            event.ok ? undefined : event.error
          )
        }
        break
      }
      case 'idle': {
        void stopGenerationForeground()
        break
      }
    }
  })

  void startGenerationQueue()
}

/** 节流包装：短时间内连环 progress 只落最新一次状态 */
let syncTimer: ReturnType<typeof setTimeout> | null = null
let lastSyncAt = 0

function syncGenerationQueueState(trigger: 'enqueued' | 'started' | 'progress'): void {
  if (trigger === 'progress' && Date.now() - lastSyncAt < SYNC_THROTTLE_MS) {
    if (syncTimer != null) return
    syncTimer = setTimeout(() => {
      syncTimer = null
      syncGenerationQueueState('progress')
    }, SYNC_THROTTLE_MS)
    return
  }
  if (syncTimer != null) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
  lastSyncAt = Date.now()

  const running = getGenerationRecords().find((r) => r.status === 'running')
  if (!running) {
    void syncGenerationNotification({
      active: false,
      bookTitle: '',
      taskLabel: '',
      done: 0,
      total: 0,
      pendingCount: 0,
    })
    return
  }
  void syncGenerationNotification({
    active: true,
    bookTitle: running.bookTitle,
    taskLabel: getKnowledgeTask(running.type).label,
    done: running.done,
    total: running.total,
    pendingCount: getGenerationRecords().filter((r) => r.status === 'queued').length,
  })
}

/** **仅供测试使用**，不应在生产代码中调用。 */
export function _resetGenerationBackgroundForTesting(): void {
  initialized = false
  if (syncTimer != null) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
  lastSyncAt = 0
}
