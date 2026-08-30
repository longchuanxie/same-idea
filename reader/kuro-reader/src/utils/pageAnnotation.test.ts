import { describe, it, expect } from 'vitest'

import type { Annotation } from '@/types'
import {
  buildPageNoteAnnotation,
  isPageNote,
  pageNoteTitle,
} from '@/utils/pageAnnotation'

describe('isPageNote', () => {
  it('pageIndex 为非负数字即页级手记；文本批注/负值不算', () => {
    expect(isPageNote({ pageIndex: 0 })).toBe(true)
    expect(isPageNote({ pageIndex: 5 })).toBe(true)
    expect(isPageNote({})).toBe(false)
    expect(isPageNote({ pageIndex: undefined })).toBe(false)
    expect(isPageNote({ pageIndex: -1 })).toBe(false)
  })
})

describe('pageNoteTitle', () => {
  it('0 起索引转 1 起页码', () => {
    expect(pageNoteTitle(0)).toBe('第 1 页')
    expect(pageNoteTitle(11)).toBe('第 12 页')
  })
})

describe('buildPageNoteAnnotation', () => {
  it('构建页级手记：selectedText 为页码文案、offsets 归零、携带 pageIndex', () => {
    const ann = buildPageNoteAnnotation({
      bookId: 'b1',
      chapterIndex: 2,
      chapterTitle: '第三章',
      pageIndex: 4,
      note: '这一页的分镜很妙',
    })
    expect(ann.bookId).toBe('b1')
    expect(ann.chapterIndex).toBe(2)
    expect(ann.chapterTitle).toBe('第三章')
    expect(ann.pageIndex).toBe(4)
    expect(ann.selectedText).toBe('第 5 页')
    expect(ann.note).toBe('这一页的分镜很妙')
    expect(ann.startOffset).toBe(0)
    expect(ann.endOffset).toBe(0)
    expect(ann.style).toBe('highlight')
    expect(ann.tagIds).toBeUndefined()
    expect(ann.id).toMatch(/^pagenote-/)
    expect(ann.createdAt instanceof Date).toBe(true)
  })

  it('空标签列表归一为 undefined；可指定 id', () => {
    const ann = buildPageNoteAnnotation({
      bookId: 'b1',
      chapterIndex: 0,
      chapterTitle: '一',
      pageIndex: 0,
      note: '',
      tagIds: [],
      id: 'fixed-id',
    })
    expect(ann.tagIds).toBeUndefined()
    expect(ann.id).toBe('fixed-id')
    expect(ann.note).toBe('')
  })
})

describe('页级手记与 filterAnnotations 语义', () => {
  it('页注不算「纯划线」筛选形态（空笔记页注归入批注侧）', async () => {
    const { filterAnnotations, EMPTY_ANNOTATION_FILTER } = await import('@/utils/annotationFilter')
    const pageNote: Annotation = buildPageNoteAnnotation({
      bookId: 'b1',
      chapterIndex: 0,
      chapterTitle: '一',
      pageIndex: 1,
      note: '',
    })
    const textHighlight: Annotation = {
      id: 'a2', bookId: 'b1', chapterIndex: 0, chapterTitle: '一',
      selectedText: '句子', note: '', startOffset: 0, endOffset: 2,
      style: 'highlight', createdAt: new Date(), updatedAt: new Date(),
    }

    const highlights = filterAnnotations([pageNote, textHighlight], { ...EMPTY_ANNOTATION_FILTER, kind: 'highlight' })
    expect(highlights.map((a) => a.id)).toEqual(['a2'])
    const notes = filterAnnotations([pageNote, textHighlight], { ...EMPTY_ANNOTATION_FILTER, kind: 'note' })
    expect(notes.map((a) => a.id)).toEqual([pageNote.id])
  })
})
