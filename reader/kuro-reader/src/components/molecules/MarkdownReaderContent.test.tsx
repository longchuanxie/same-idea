import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { parseMarkdownDocument } from '@/utils/markdownDocument'

import { MarkdownReaderContent } from './MarkdownReaderContent'

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg aria-label="流程图"></svg>' }),
  },
}))

const renderMarkdown = (markdown: string) => render(
  <MarkdownReaderContent
    document={parseMarkdownDocument(markdown)}
    annotations={[]}
    color="#222222"
    firstLineIndent={false}
    onAnnotationClick={vi.fn()}
  />
)

const renderMarkdownWithInternalLink = (markdown: string, onInternalLink: (href: string) => void) => render(
  <MarkdownReaderContent
    document={parseMarkdownDocument(markdown)}
    annotations={[]}
    color="#222222"
    firstLineIndent={false}
    onAnnotationClick={vi.fn()}
    onInternalLink={onInternalLink}
  />
)

describe('MarkdownReaderContent', () => {
  it('renders semantic markdown formatting without source markers', () => {
    renderMarkdown('### 小标题\n\n这是 **重点** 和 `代码`。\n\n> 一段引用')

    expect(screen.getByRole('heading', { name: '小标题' })).toHaveAttribute('aria-level', '3')
    expect(screen.getByText('重点').tagName).toBe('SPAN')
    expect(screen.getByText('重点').closest('strong')).not.toBeNull()
    expect(screen.getByText('代码').closest('code')).not.toBeNull()
    expect(screen.getByText('一段引用').closest('blockquote')).not.toBeNull()
    expect(screen.queryByText('**重点**')).not.toBeInTheDocument()
  })

  it('wraps the speech highlight range in a speech-reading span', () => {
    const markdown = '第一段内容。\n\n第二段内容。'
    render(
      <MarkdownReaderContent
        document={parseMarkdownDocument(markdown)}
        annotations={[]}
        color="#222222"
        firstLineIndent={false}
        highlightRange={{ start: 8, end: 14 }}
        onAnnotationClick={vi.fn()}
      />
    )

    expect(screen.getByText('第二段内容。').closest('.speech-reading')).not.toBeNull()
    expect(screen.getByText('第一段内容。').closest('.speech-reading')).toBeNull()
  })

  it('allows safe links and leaves unsafe links inert', () => {
    renderMarkdown('[安全链接](https://example.com) [危险链接](javascript:alert(1))')

    expect(screen.getByRole('link', { name: '安全链接' })).toHaveAttribute('href', 'https://example.com')
    expect(screen.getByText('危险链接').closest('a')).toBeNull()
  })

  it('delegates page-internal heading links to the paginated reader', () => {
    const onInternalLink = vi.fn()
    renderMarkdownWithInternalLink('[跳转](#目标章节)\n\n### 目标章节', onInternalLink)

    screen.getByRole('link', { name: '跳转' }).click()
    expect(onInternalLink).toHaveBeenCalledWith('#目标章节')
  })

  it('renders images, heading anchors and nested list depth', () => {
    const { container } = renderMarkdown('### 图片章节\n\n![封面](https://example.com/cover.png)\n\n- 父项\n  - 子项')

    expect(screen.getByRole('heading', { name: '图片章节' })).toHaveAttribute('id', '图片章节')
    expect(screen.getByRole('img', { name: '封面' })).toHaveAttribute('loading', 'lazy')
    expect(container.querySelector('[data-list-depth="1"]')).toHaveTextContent('子项')
  })

  it('renders markdown tables with semantic table elements', () => {
    const { container } = renderMarkdown('| 名称 | 数量 |\n| :--- | ---: |\n| 苹果 | 2 |')

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '名称' })).toHaveStyle({ textAlign: 'left' })
    expect(screen.getByRole('columnheader', { name: '数量' })).toHaveStyle({ textAlign: 'right' })
    expect(screen.getByRole('cell', { name: '苹果' })).toBeInTheDocument()
    expect(container.querySelector('[data-reader-horizontal-scroll]')).toBeInTheDocument()
  })

  it('exposes stable block boundaries for paginated measurement', () => {
    const { container } = renderMarkdown('## Heading\n\nParagraph')
    const blocks = container.querySelectorAll('[data-markdown-block-index]')

    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toHaveAttribute('data-markdown-block-type', 'heading')
    expect(blocks[1]).toHaveAttribute('data-markdown-block-type', 'paragraph')
  })

  it('renders complete mermaid blocks as diagrams', async () => {
    const { container } = renderMarkdown('```mermaid\ngraph TD\n  A --> B\n```')

    expect(screen.getByText('Mermaid')).toBeInTheDocument()
    await waitFor(() => expect(container.querySelector('svg[aria-label="流程图"]')).not.toBeNull())
  })

  it('renders math, footnotes and safe inline HTML', async () => {
    const { container } = renderMarkdown('公式 $E = mc^2$[^math]，按 <kbd>Ctrl</kbd>。\n\n[^math]: 质能方程。')

    expect(screen.getByText('Ctrl').closest('kbd')).not.toBeNull()
    expect(container.querySelector('#footnote-math')).toHaveTextContent('质能方程')
    expect(screen.getByRole('link', { name: '返回脚注引用位置' })).toHaveAttribute('href', '#footnote-ref-math')
    await waitFor(() => expect(container.querySelector('.katex')).not.toBeNull())
  })

  it('renders task-list checkboxes without duplicating text markers', () => {
    renderMarkdown('- [x] 已完成\n- [ ] 未完成')

    expect(screen.getByRole('checkbox', { name: '已完成任务' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: '未完成任务' })).not.toBeChecked()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('highlights supported fenced-code languages without losing source offsets', async () => {
    const { container } = renderMarkdown('```javascript\nconst answer = 42\n```')

    await waitFor(() => expect(container.querySelector('.hljs-keyword')).toHaveTextContent('const'))
    expect(container.querySelector('code[data-source-start]')).not.toBeNull()

    const wrapButton = screen.getByRole('button', { name: '开启代码自动换行' })
    fireEvent.click(wrapButton)
    expect(screen.getByRole('button', { name: '关闭代码自动换行' })).toHaveAttribute('aria-pressed', 'true')

    const lineNumberButton = screen.getByRole('button', { name: '显示代码行号' })
    fireEvent.click(lineNumberButton)
    expect(screen.getByRole('button', { name: '隐藏代码行号' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: '复制代码' }))
    expect(await screen.findByText('复制失败')).toBeInTheDocument()
  })

  it('top-aligns multi-line code with its line-number gutter', () => {
    const { container } = renderMarkdown('```text\nAgent\nRunner\nTools\n```')
    const lineNumbers = container.querySelector('[data-code-line-numbers]')
    const code = container.querySelector('code[data-source-start]')
    const pre = code?.closest('pre')

    expect(lineNumbers?.textContent).toBe('1\n2\n3')
    expect(lineNumbers).toHaveClass('self-start')
    expect(pre).toHaveClass('flex', 'items-start')
    expect(code).toHaveClass('block', 'flex-1')
  })

  it('offers zoom controls for rendered Mermaid diagrams', async () => {
    renderMarkdown('```mermaid\ngraph TD\n  A --> B\n```')

    const zoomIn = await screen.findByRole('button', { name: '放大图表' })
    fireEvent.click(zoomIn)
    expect(screen.getByRole('button', { name: '重置图表缩放' })).toHaveTextContent('125%')
  })
})
