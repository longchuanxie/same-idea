import { describe, it, expect } from 'vitest'

import type { Annotation } from '@/types'
import { filterAnnotations, isEmptyAnnotationFilter, EMPTY_ANNOTATION_FILTER } from '@/utils/annotationFilter'

const makeAnnotation = (overrides: Partial<Annotation> & { id: string; bookId: string }): Annotation => ({
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '雨夜里只有一盏灯',
  note: '',
  startOffset: 0,
  endOffset: 8,
  style: 'highlight',
  createdAt: new Date('2026-08-01T10:00:00'),
  updatedAt: new Date('2026-08-01T10:00:00'),
  ...overrides,
})

const LIST = [
  makeAnnotation({ id: 'a1', bookId: 'b1', note: '灯是希望' }),
  makeAnnotation({ id: 'a2', bookId: 'b1', selectedText: '雨夜里只有一盏灯' }), // 纯划线
  makeAnnotation({ id: 'a3', bookId: 'b2', selectedText: '另一本书里的句子', note: '另一本书的批注', tagIds: ['t1'] }),
  makeAnnotation({ id: 'a4', bookId: 'b2', selectedText: '各不相同的引文', tagIds: ['t1', 't2'] }),
]

describe('filterAnnotations', () => {
  it('默认条件原样返回（引用不变）', () => {
    expect(filterAnnotations(LIST, EMPTY_ANNOTATION_FILTER)).toBe(LIST)
    expect(isEmptyAnnotationFilter(EMPTY_ANNOTATION_FILTER)).toBe(true)
  })

  it('query 命中引文或笔记（大小写不敏感）', () => {
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, query: '一盏灯' }).map((a) => a.id))
      .toEqual(['a1', 'a2'])
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, query: '希望' }).map((a) => a.id))
      .toEqual(['a1'])
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, query: '  另一本书  ' }).map((a) => a.id))
      .toEqual(['a3'])
  })

  it('bookId 过滤', () => {
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, bookId: 'b1' }).map((a) => a.id))
      .toEqual(['a1', 'a2'])
  })

  it('tagId 过滤命中 tagIds 引用', () => {
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, tagId: 't1' }).map((a) => a.id))
      .toEqual(['a3', 'a4'])
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, tagId: 't2' }).map((a) => a.id))
      .toEqual(['a4'])
  })

  it('kind 过滤：纯划线与批注互斥', () => {
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, kind: 'highlight' }).map((a) => a.id))
      .toEqual(['a2', 'a4'])
    expect(filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, kind: 'note' }).map((a) => a.id))
      .toEqual(['a1', 'a3'])
  })

  it('组合条件取交集', () => {
    expect(
      filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, bookId: 'b1', kind: 'note' }).map((a) => a.id)
    ).toEqual(['a1'])
    expect(
      filterAnnotations(LIST, { ...EMPTY_ANNOTATION_FILTER, tagId: 't1', kind: 'note' }).map((a) => a.id)
    ).toEqual(['a3'])
  })

  it('空白笔记（如「 」）按纯划线对待', () => {
    const list = [makeAnnotation({ id: 'a5', bookId: 'b1', note: '   ' })]
    expect(filterAnnotations(list, { ...EMPTY_ANNOTATION_FILTER, kind: 'highlight' })).toHaveLength(1)
  })
})
