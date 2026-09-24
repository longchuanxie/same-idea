import { Capacitor } from '@capacitor/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'


import { GenerationKeepAlive } from '@/plugins/GenerationKeepAlivePlugin'

import {
  _resetGenerationNotificationForTesting,
  buildGenerationFinishedContent,
  buildGenerationNotificationContent,
  notifyGenerationFinished,
  syncGenerationNotification,
} from './generationNotification'

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => true),
    getPlatform: vi.fn(() => 'android'),
  },
}))

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    createChannel: vi.fn(),
    schedule: vi.fn(),
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    removeDeliveredNotificationsById: vi.fn(),
  },
}))

vi.mock('@/plugins/GenerationKeepAlivePlugin', () => ({
  GenerationKeepAlive: {
    start: vi.fn(async () => undefined),
    update: vi.fn(async () => undefined),
    finish: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
  },
}))

const activeState = (overrides: Partial<Parameters<typeof buildGenerationNotificationContent>[0]> = {}) => ({
  active: true,
  bookTitle: '测试书',
  taskLabel: '人物关系图谱',
  done: 3,
  total: 12,
  pendingCount: 0,
  ...overrides,
})

beforeEach(() => {
  _resetGenerationNotificationForTesting()
  vi.clearAllMocks()
})

describe('generationNotification · 文案构建（纯函数）', () => {
  it('激活态产出「书名 · n/total 段」进度文案', () => {
    expect(buildGenerationNotificationContent(activeState())).toEqual({
      title: '正在生成人物关系图谱',
      body: '《测试书》· 3/12 段',
    })
  })

  it('带排队任务时提示剩余数量；语料未构建时显示准备中', () => {
    expect(buildGenerationNotificationContent(activeState({ pendingCount: 2 }))).toMatchObject({
      body: '《测试书》· 3/12 段，还有 2 项排队',
    })
    expect(buildGenerationNotificationContent(activeState({ total: 0 }))).toMatchObject({
      body: '《测试书》· 准备中',
    })
  })

  it('未激活返回 null（调用方据此撤除常驻通知）', () => {
    expect(buildGenerationNotificationContent(activeState({ active: false }))).toBeNull()
  })

  it('终态文案：成功与失败两种语气', () => {
    expect(buildGenerationFinishedContent('测试书', '叙事节拍')).toEqual({
      title: '叙事节拍已生成',
      body: '《测试书》· 打开档案卡知识库查看',
    })
    expect(buildGenerationFinishedContent('测试书', '叙事节拍', '服务超时')).toEqual({
      title: '叙事节拍生成失败',
      body: '《测试书》· 服务超时',
    })
  })
})

describe('generationNotification · Android 前台服务联动', () => {
  it('首次同步 start 拉起服务，后续 update 原地刷新', async () => {
    await syncGenerationNotification(activeState())
    expect(GenerationKeepAlive.start).toHaveBeenCalledWith({
      title: '正在生成人物关系图谱',
      body: '《测试书》· 3/12 段',
    })
    expect(GenerationKeepAlive.update).not.toHaveBeenCalled()

    await syncGenerationNotification(activeState({ done: 4 }))
    expect(GenerationKeepAlive.update).toHaveBeenCalledWith({
      title: '正在生成人物关系图谱',
      body: '《测试书》· 4/12 段',
    })
  })

  it('停止态走 stop 撤服务；终态走 finish 留收尾通知', async () => {
    await syncGenerationNotification(activeState())
    await syncGenerationNotification(activeState({ active: false }))
    expect(GenerationKeepAlive.stop).toHaveBeenCalled()

    await notifyGenerationFinished('测试书', '叙事节拍', undefined)
    expect(GenerationKeepAlive.finish).toHaveBeenCalledWith({
      title: '叙事节拍已生成',
      body: '《测试书》· 打开档案卡知识库查看',
    })
  })

  it('Web 平台全程空操作', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
    await syncGenerationNotification(activeState())
    await notifyGenerationFinished('测试书', '叙事节拍')
    expect(GenerationKeepAlive.start).not.toHaveBeenCalled()
    expect(GenerationKeepAlive.finish).not.toHaveBeenCalled()
  })
})
