import { describe, expect, it } from 'vitest'

import type { MarkdownDocument } from './markdownDocument'
import { getMarkdownPaginationEnd, getTextPageLayout } from './textPageLayout'

describe('getTextPageLayout', () => {
  it('uses a wider and taller content area for landscape single-page reading', () => {
    const layout = getTextPageLayout({
      viewportWidth: 1280,
      viewportHeight: 800,
      isColumnsLayoutActive: false,
      isLandscapeViewport: true,
      isDesktopViewport: true,
      isLargeViewport: true,
    })

    expect(layout.articleWidth).toBe(960)
    expect(layout.contentWidth).toBe(912)
    expect(layout.verticalPadding).toBe(48)
    expect(layout.pageHeight).toBe(680)
  })

  it('keeps the compact portrait reading width', () => {
    const layout = getTextPageLayout({
      viewportWidth: 800,
      viewportHeight: 1280,
      isColumnsLayoutActive: false,
      isLandscapeViewport: false,
      isDesktopViewport: true,
      isLargeViewport: false,
    })

    expect(layout.articleWidth).toBe(680)
    expect(layout.contentWidth).toBe(632)
    expect(layout.verticalPadding).toBe(96)
  })
})

describe('getMarkdownPaginationEnd', () => {
  it('excludes a trailing decorative divider from pagination', () => {
    const document = {
      text: '正文────────',
      blocks: [
        { type: 'paragraph', start: 0, end: 2 },
        { type: 'divider', start: 2, end: 10 },
      ],
      spans: [],
      frontMatter: {},
    } satisfies MarkdownDocument

    expect(getMarkdownPaginationEnd(document)).toBe(2)
  })

  it('keeps dividers that introduce following content', () => {
    const document = {
      text: '正文────────脚注',
      blocks: [
        { type: 'paragraph', start: 0, end: 2 },
        { type: 'divider', start: 2, end: 10 },
        { type: 'footnote', start: 10, end: 12 },
      ],
      spans: [],
      frontMatter: {},
    } satisfies MarkdownDocument

    expect(getMarkdownPaginationEnd(document)).toBe(document.text.length)
  })
})
