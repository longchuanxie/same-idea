import { describe, it, expect } from 'vitest'

import {
  ANNOTATION_QUERY_PARAM,
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
})
