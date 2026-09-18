import { describe, it, expect } from 'vitest'

import {
  ANNOTATION_QUERY_PARAM,
  knowledgeSourcePath,
  notesPath,
  parseGotoParam,
  readerPathForBook,
  textReaderPath,
} from '@/constants/routes'

describe('批注直达路由', () => {
  it('textReaderPath 拼接可选章节与 ?ann= 查询参数', () => {
    expect(textReaderPath('b1')).toBe('/text-reader/b1')
    expect(textReaderPath('b1', 'ch2')).toBe('/text-reader/b1/ch2')
    expect(textReaderPath('b1', 'ch2', 'ann-9')).toBe(
      `/text-reader/b1/ch2?${ANNOTATION_QUERY_PARAM}=ann-9`
    )
    expect(textReaderPath('b1', undefined, 'ann-9')).toBe(
      `/text-reader/b1?${ANNOTATION_QUERY_PARAM}=ann-9`
    )
  })

  it('readerPathForBook 仅文本书携带批注直达；漫画/PDF 维持章节级', () => {
    expect(readerPathForBook({ id: 'b1', format: 'text' }, 'ch1', 'ann-1')).toBe(
      `/text-reader/b1/ch1?${ANNOTATION_QUERY_PARAM}=ann-1`
    )
    expect(readerPathForBook({ id: 'b2', format: 'comic' }, 'ch1', 'ann-1')).toBe('/reader/b2/ch1')
    expect(readerPathForBook({ id: 'b3', format: 'pdf' }, 'ch1', 'ann-1')).toBe('/reader/b3/ch1')
  })

  it('查询参数值经过 URL 编码', () => {
    expect(textReaderPath('b1', undefined, 'ann 100%')).toBe(
      `/text-reader/b1?${ANNOTATION_QUERY_PARAM}=ann%20100%25`
    )
  })

  it('notesPath 无参落摘抄墙，带 bookId 时按本书筛选深链', () => {
    expect(notesPath()).toBe('/notes')
    expect(notesPath('b1')).toBe('/notes?bookId=b1')
    expect(notesPath('weird id/1')).toBe('/notes?bookId=weird%20id%2F1')
  })
})

describe('知识库原文直达路由', () => {
  const textBook = {
    id: 'b1',
    format: 'text' as const,
    chapters: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
  }

  it('parseGotoParam 解析 `chapterIndex,ratio` 并拒绝非法形状', () => {
    expect(parseGotoParam('2,0.35')).toEqual({ chapterIndex: 2, ratio: 0.35 })
    expect(parseGotoParam('0,0')).toEqual({ chapterIndex: 0, ratio: 0 })
    expect(parseGotoParam(null)).toBeNull()
    expect(parseGotoParam('')).toBeNull()
    expect(parseGotoParam('abc')).toBeNull()
    expect(parseGotoParam('1')).toBeNull()
    expect(parseGotoParam('1,1.5')).toBeNull()
    expect(parseGotoParam('-1,0.2')).toBeNull()
  })

  it('text 书：目标章 + ?goto= 章内占比；缺章回退首章', () => {
    expect(knowledgeSourcePath(textBook, 1, 0.25)).toBe('/text-reader/b1/c2?goto=1,0.25')
    expect(knowledgeSourcePath(textBook, 2)).toBe('/text-reader/b1/c3')
    // 章节表缺位时回退第一章（goto 仍指向请求章，阅读器会自行夹取）
    expect(knowledgeSourcePath({ ...textBook, chapters: [{ id: 'only' }] }, 5, 0.5)).toBe(
      '/text-reader/b1/only?goto=5,0.5'
    )
  })

  it('pdf 书：?page= 页码直达（索引+1，单章承载全部页）', () => {
    expect(knowledgeSourcePath({ id: 'b2', format: 'pdf', chapters: [{ id: 'all' }] }, 4)).toBe(
      '/reader/b2/all?page=5'
    )
  })

  it('漫画等其他格式落回档案卡', () => {
    expect(knowledgeSourcePath({ id: 'b3', format: 'comic' }, 0)).toBe('/book/b3')
  })
})
