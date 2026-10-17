import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { isMobiBlob, loadMobiChapters } from '@/services/mobiContent'
import { MobiParser, isMobiFile } from '@/services/parsers/mobiParser'

const FIXTURE = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../test-fixtures/mobi/fixture.mobi')
)

describe('isMobiBlob 魔数探测', () => {
  it('BOOKMOBI 头识别为 MOBI', async () => {
    expect(await isMobiBlob(new Blob([FIXTURE]))).toBe(true)
  })

  it('非 MOBI 字节（纯文本/EPUB）不误判', async () => {
    expect(await isMobiBlob(new Blob(['第一章\n正文'.repeat(20)], { type: 'text/plain' }))).toBe(false)
    expect(await isMobiBlob(new Blob([new Uint8Array([0x50, 0x4b, 0x03, 0x04])]))).toBe(false)
  })
})

describe('isMobiFile 扩展名', () => {
  it('接受 mobi/azw/azw3/prc', () => {
    expect(isMobiFile('书.mobi')).toBe(true)
    expect(isMobiFile('书.azw')).toBe(true)
    expect(isMobiFile('书.azw3')).toBe(true)
    expect(isMobiFile('书.prc')).toBe(true)
    expect(isMobiFile('书.MOBI')).toBe(true)
    expect(isMobiFile('书.epub')).toBe(false)
    expect(isMobiFile('书.txt')).toBe(false)
  })
})

describe('loadMobiChapters 保真管线', () => {
  it('按 pagebreak 分章、标题/正文/图片 markdown 齐全且带结构文档', async () => {
    const chapters = await loadMobiChapters(new Blob([FIXTURE]))

    expect(chapters).toHaveLength(2)
    expect(chapters[0]?.title).toBe('第1章')
    // mobi6 的 h1 → markdown 标题
    expect(chapters[0]?.content).toContain('# 第一章 长夜')
    expect(chapters[0]?.content).toContain('山风掠过林梢')
    // 插图经 recindex 替换成 object URL 后进 markdown（blob: 前缀由测试 setup 注入）
    expect(chapters[0]?.content).toMatch(/!\[插图一\]\(blob:/)
    expect(chapters[0]?.markdownDocument?.blocks.length).toBeGreaterThan(0)
    // 图片 span 立档（分页的不可拆块依据）
    expect(chapters[0]?.markdownDocument?.spans.some((s) => s.type === 'image')).toBe(true)

    expect(chapters[1]?.content).toContain('# 第二章 微光')
    expect(chapters[1]?.content).toContain('堤岸尽头的路灯下')
  })

  it('非 MOBI 字节抛错（调用方兜底为解析失败章节）', async () => {
    await expect(loadMobiChapters(new Blob([new Uint8Array([1, 2, 3])]))).rejects.toThrow()
  })
})

describe('MobiParser 导入期解析', () => {
  it('元数据/封面/章节纯文本齐备', async () => {
    const parser = new MobiParser()
    const file = new File([FIXTURE], 'fixture.mobi', { type: 'application/x-mobipocket-ebook' })
    const parsed = await parser.parse(file)

    expect(parsed.format).toBe('text')
    if (parsed.format !== 'text') return
    expect(parsed.title).toBe('MOBI 夹具书')
    expect(parsed.author).toBe('夹具作者')
    expect(parsed.textFile.type).toBe('application/x-mobipocket-ebook')
    expect(parsed.chapters?.length).toBe(2)
    expect(parsed.chapters?.[0]?.content).toContain('山风掠过林梢')
    expect(parsed.coverBlob.size).toBeGreaterThan(0)
  })

  it('非 MOBI 文件抛错', async () => {
    const parser = new MobiParser()
    const file = new File([new Uint8Array([1, 2, 3])], 'fake.mobi')
    await expect(parser.parse(file)).rejects.toThrow('BOOKMOBI')
  })
})
