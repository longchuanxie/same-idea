// jsdom 的 Blob 经 fake-indexeddb 克隆会退化为普通对象（丢 type/text）；
// 用 Node 原生 Blob 保真（真实浏览器 IDB 的 structuredClone 同样保真）
import { Blob as NodeBlob } from 'node:buffer'
import { describe, it, expect, beforeEach } from 'vitest'

import { bookFileRepo } from '@/services/storage/bookFileRepo'
import { bookRepo } from '@/services/storage/bookRepo'
import { _resetDBForTesting, getDB } from '@/services/storage/db'
import { textChapterCacheRepo } from '@/services/storage/textChapterCacheRepo'
import { loadTextContentDetailed } from '@/services/textContent'
import { useAppStore } from '@/stores/useAppStore'
import type { Book } from '@/types'

beforeEach(async () => {
  try {
    const db = await getDB()
    db.close()
  } catch {
    // first run: no DB yet
  }
  _resetDBForTesting()
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('kuro-reader-db')
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => resolve()
  })
  // 默认设置：净化全开（typography+ads，按书 pending → detect）
  useAppStore.setState({
    settings: {
      ...useAppStore.getState().settings,
      contentSanitize: { enabled: true, typography: true, ads: true, customKeywords: [] },
    },
  })
})

const BOOK_ID = 'book-sanitize-test'

function makeBook(ads: Book['contentSanitize']): Book {
  return {
    id: BOOK_ID,
    title: '试炼之书',
    author: '佚名',
    cover: '',
    genres: [],
    tags: [],
    description: '',
    status: 'completed',
    totalChapters: 2,
    chapters: [],
    addedAt: new Date(),
    isFavorite: false,
    format: 'text',
    ...(ads ? { contentSanitize: ads } : {}),
  }
}

/** 脏样本：两章，含 2 处 A 类广告行 + 1 处 B 类排版噪音（半角标点） */
const DIRTY_TXT = [
  '第一章 试炼',
  '夜色渐深，他把信纸折好放回抽屉。',
  '更多精彩请访问www.biquge.com',
  '他转过身，不再看她,只是望着窗外渐渐暗下来的天色.',
  '第二章 归途',
  '第二天清晨，码头上的雾还没散。',
  '本书由新笔趣阁整理发布',
].join('\n')

async function seedBook(ads: Book['contentSanitize']): Promise<void> {
  await bookFileRepo.save(BOOK_ID, new NodeBlob([DIRTY_TXT], { type: 'text/plain' }) as unknown as Blob)
  await bookRepo.save(makeBook(ads))
}

/** 等待异步预热把缓存记录落库（load 返回后 warm 是 fire-and-forget） */
async function waitForCache(): Promise<void> {
  for (let i = 0; i < 50; i++) {
    const record = await textChapterCacheRepo.get(BOOK_ID)
    if (record) return
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error('cache warm timeout')
}

describe('loadTextContentDetailed · 净化管线', () => {
  it('pending 首开：排版即净化、广告只检测——确认门命中数与样例可取', async () => {
    await seedBook(undefined)
    const detail = await loadTextContentDetailed(BOOK_ID)

    expect(detail.sanitize.pendingAdHitCount).toBe(2)
    expect(detail.sanitize.adSamples[0]).toContain('www.biquge.com')

    const ch1 = detail.chapters[0]?.content ?? ''
    // B 类排版已生效：半角逗号/句号全角化（中文语境）
    expect(ch1).toContain('不再看她，只是望着窗外渐渐暗下来的天色。')
    // A 类广告在 detect 模式保留原文（等确认）
    expect(ch1).toContain('www.biquge.com')
  }, 10_000)

  it('确认应用（ads on）：rev 变化重算，广告行从正文/缓存消失', async () => {
    await seedBook(undefined)
    await loadTextContentDetailed(BOOK_ID)
    await waitForCache()

    await bookRepo.save(makeBook({ ads: 'on', confirmedAt: Date.now() }))
    const detail = await loadTextContentDetailed(BOOK_ID)

    expect(detail.sanitize.pendingAdHitCount).toBe(0)
    expect(detail.chapters[0]?.content).not.toContain('www.biquge.com')
    expect(detail.chapters[1]?.content).not.toContain('新笔趣阁')
    // 正文骨架不动：两章、标题不变
    expect(detail.chapters).toHaveLength(2)
    expect(detail.chapters[0]?.title).toBe('第一章 试炼')

    await waitForCache()
    const cached = await textChapterCacheRepo.get(BOOK_ID)
    expect(cached?.sanitizeRev).toBeTruthy()
    expect(cached?.chapters[0]?.content).not.toContain('www.biquge.com')
  }, 10_000)

  it('全局关闭：rev 不匹配重算回原始内容（可逆性）', async () => {
    await seedBook({ ads: 'on', confirmedAt: Date.now() })
    await loadTextContentDetailed(BOOK_ID)
    await waitForCache()

    const appStore = useAppStore.getState()
    useAppStore.setState({
      settings: {
        ...appStore.settings,
        contentSanitize: { enabled: false, typography: false, ads: false, customKeywords: [] },
      },
    })
    const detail = await loadTextContentDetailed(BOOK_ID)
    // 回到原始：广告与半角标点都在
    expect(detail.chapters[0]?.content).toContain('www.biquge.com')
    expect(detail.chapters[0]?.content).toContain('不再看她,')
    expect(detail.sanitize.pendingAdHitCount).toBe(0)
  }, 10_000)

  it('本书关闭（ads off）：不再检测不再净化', async () => {
    await seedBook({ ads: 'off' })
    const detail = await loadTextContentDetailed(BOOK_ID)
    expect(detail.sanitize.pendingAdHitCount).toBe(0)
    // 排版仍生效（off 只关广告门槛）
    expect(detail.chapters[0]?.content).toContain('不再看她，')
    expect(detail.chapters[0]?.content).toContain('www.biquge.com')
  }, 10_000)
})
