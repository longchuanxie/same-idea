import { Fragment, useState, type FC, type ReactNode } from 'react'

import type { Annotation } from '@/types'
import { getAnnotationPresentation } from '@/utils/annotationHighlight'
import { cn } from '@/utils/cn'
import {
  isSafeMarkdownLink,
  isSafeMarkdownImageSource,
  type MarkdownBlock,
  type MarkdownDocument,
  type MarkdownSpan,
} from '@/utils/markdownDocument'

import { MarkdownCodeBlock } from './MarkdownCodeBlock'
import { MarkdownMath } from './MarkdownMath'

export interface MarkdownReaderContentProps {
  document: MarkdownDocument
  startOffset?: number
  endOffset?: number
  annotations: Annotation[]
  color: string
  firstLineIndent: boolean
  paginated?: boolean
  measurementMode?: boolean
  /** 听书跟读高亮：章节坐标系中的当前播报范围（章节全文 document.text 的偏移） */
  highlightRange?: { start: number; end: number } | null
  onAnnotationClick: (annotation: Annotation) => void
  onInternalLink?: (href: string) => void
}

const HEADING_LEVEL_ONE = 1
const HEADING_LEVEL_TWO = 2
const HEADING_LEVEL_THREE = 3
const HEADING_LEVEL_FOUR = 4
const BINARY_SEARCH_DIVISOR = 2
const LIST_ROOT_LEVEL = 1

function findBlockSpans(spans: MarkdownSpan[], block: MarkdownBlock): MarkdownSpan[] {
  let low = 0
  let high = spans.length
  while (low < high) {
    const middle = Math.floor((low + high) / BINARY_SEARCH_DIVISOR)
    if (spans[middle].start < block.start) low = middle + 1
    else high = middle
  }

  const matches: MarkdownSpan[] = []
  for (let index = low; index < spans.length && spans[index].start < block.end; index += 1) {
    if (spans[index].end > block.start) matches.push(spans[index])
  }
  return matches
}

const MarkdownImage: FC<{ span: MarkdownSpan }> = ({ span }) => {
  const [failed, setFailed] = useState(false)
  const source = span.href?.trim() ?? ''
  const alt = span.alt || 'Markdown 图片'

  if (failed || !isSafeMarkdownImageSource(source)) {
    return (
      <span className="inline-flex rounded border border-current/15 bg-current/[0.05] px-2 py-1 text-[0.9em] opacity-70">
        {failed ? `图片加载失败：${alt}` : alt}
      </span>
    )
  }

  return (
    <img
      src={source}
      alt={alt}
      title={span.title ?? undefined}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="my-3 inline-block max-h-[70vh] max-w-full rounded-lg object-contain align-middle"
      onLoad={() => window.dispatchEvent(new Event('markdown-media-load'))}
      onError={() => setFailed(true)}
      onClick={(event) => event.stopPropagation()}
    />
  )
}

function wrapWithMarkdownSpan(
  node: ReactNode,
  span: MarkdownSpan,
  key: string,
  onInternalLink?: (href: string) => void
): ReactNode {
  switch (span.type) {
    case 'strong':
      return <strong key={key} className="font-bold">{node}</strong>
    case 'emphasis':
      return <em key={key}>{node}</em>
    case 'delete':
      return <del key={key} className="opacity-70">{node}</del>
    case 'code':
      return <code key={key} className="rounded bg-current/10 px-1 py-0.5 font-mono text-[0.92em]">{node}</code>
    case 'link':
      return span.href && isSafeMarkdownLink(span.href) ? (
        <a
          key={key}
          id={span.id}
          href={span.href}
          target={span.href.startsWith('#') ? undefined : '_blank'}
          rel="noreferrer noopener"
          className="underline decoration-current/50 underline-offset-2 hover:opacity-70"
          onClick={(event) => {
            event.stopPropagation()
            if (span.href?.startsWith('#') && onInternalLink) {
              event.preventDefault()
              onInternalLink(span.href)
            }
          }}
        >
          {node}
        </a>
      ) : node
    case 'image':
      return <MarkdownImage key={key} span={span} />
    case 'math':
      return (
        <MarkdownMath
          key={key}
          formula={span.formula ?? ''}
          displayMode={false}
          sourceStart={span.start}
        />
      )
    case 'kbd':
      return <kbd key={key} className="rounded border border-current/25 bg-current/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] shadow-sm">{node}</kbd>
    case 'sub':
      return <sub key={key}>{node}</sub>
    case 'sup':
      return <sup key={key}>{node}</sup>
    case 'mark':
      return <mark key={key} className="rounded bg-yellow-300/35 px-0.5">{node}</mark>
    case 'underline':
      return <u key={key} className="underline-offset-2">{node}</u>
  }
}

function getBlockClassName(block: MarkdownBlock): string {
  switch (block.type) {
    case 'heading':
      return cn(
        'font-bold leading-snug mt-3 mb-4',
        block.depth === HEADING_LEVEL_ONE && 'text-[1.75em]',
        block.depth === HEADING_LEVEL_TWO && 'text-[1.5em]',
        block.depth === HEADING_LEVEL_THREE && 'text-[1.3em]',
        (block.depth ?? HEADING_LEVEL_FOUR) >= HEADING_LEVEL_FOUR && 'text-[1.12em]'
      )
    case 'blockquote':
      return 'border-l-4 border-current/25 pl-4 my-4 italic opacity-80'
    case 'list-item':
      return 'pl-4 mb-2'
    case 'table':
      return 'my-4 overflow-x-auto rounded-lg border border-current/15'
    case 'divider':
      return 'text-center tracking-widest opacity-30 my-5 select-none'
    case 'paragraph':
    default:
      return 'mb-4 last:mb-0'
  }
}

export const MarkdownReaderContent: FC<MarkdownReaderContentProps> = ({
  document,
  startOffset = 0,
  endOffset = document.text.length,
  annotations,
  color,
  firstLineIndent,
  paginated = false,
  measurementMode = false,
  highlightRange = null,
  onAnnotationClick,
  onInternalLink,
}) => {
  const visibleBlocks = document.blocks.filter(
    (block) => block.start < endOffset && block.end > startOffset
  )

  return (
    <div className="break-words">
      {visibleBlocks.map((block, blockIndex) => {
        const blockMeasurementProps = {
          'data-markdown-block-index': blockIndex,
          'data-markdown-block-start': block.start,
          'data-markdown-block-end': block.end,
          'data-markdown-block-type': block.type,
        }
        const visibleStart = Math.max(block.start, startOffset)
        const visibleEnd = Math.min(block.end, endOffset)
        const spans = findBlockSpans(document.spans, block)
        const blockAnnotations = annotations.filter(
          (annotation) => annotation.startOffset < visibleEnd && annotation.endOffset > visibleStart
        )
        const renderRange = (rangeStart: number, rangeEnd: number): ReactNode => {
          const rangeSpans = spans.filter((span) => span.start < rangeEnd && span.end > rangeStart)
          const rangeAnnotations = blockAnnotations.filter(
            (annotation) => annotation.startOffset < rangeEnd && annotation.endOffset > rangeStart
          )
          const boundaries = new Set<number>([rangeStart, rangeEnd])
          rangeSpans.forEach((span) => {
            boundaries.add(Math.max(rangeStart, span.start))
            boundaries.add(Math.min(rangeEnd, span.end))
          })
          rangeAnnotations.forEach((annotation) => {
            boundaries.add(Math.max(rangeStart, annotation.startOffset))
            boundaries.add(Math.min(rangeEnd, annotation.endOffset))
          })
          // 听书跟读范围：裁剪到当前区间后并入边界集合，保证任一分段内命中状态一致
          const speechStart = highlightRange
            ? Math.max(rangeStart, Math.min(highlightRange.start, rangeEnd))
            : null
          const speechEnd = highlightRange
            ? Math.max(rangeStart, Math.min(highlightRange.end, rangeEnd))
            : null
          const hasSpeech = speechStart !== null && speechEnd !== null && speechEnd > speechStart
          if (hasSpeech) {
            boundaries.add(speechStart)
            boundaries.add(speechEnd)
          }

          const sortedBoundaries = [...boundaries].sort((left, right) => left - right)
          return sortedBoundaries.slice(0, -1).map((segmentStart, segmentIndex) => {
          const segmentEnd = sortedBoundaries[segmentIndex + 1]
          const segmentText = document.text.slice(segmentStart, segmentEnd)
          let node: ReactNode = (
            <span data-source-start={segmentStart}>{segmentText}</span>
          )

          rangeSpans
            .filter((span) => span.start <= segmentStart && span.end >= segmentEnd)
            .forEach((span, spanIndex) => {
              node = wrapWithMarkdownSpan(
                node,
                span,
                `${segmentStart}-${span.type}-${spanIndex}`,
                onInternalLink
              )
            })

          const annotation = rangeAnnotations.find(
            (item) => item.startOffset <= segmentStart && item.endOffset >= segmentEnd
          )
          if (annotation) {
            const presentation = getAnnotationPresentation(annotation.style, color, annotation.id)
            node = (
              <mark
                key={`annotation-${annotation.id}-${segmentStart}`}
                style={presentation.style}
                title={annotation.note}
                className={cn('transition-colors hover:opacity-80', presentation.className)}
                onClick={(event) => {
                  event.stopPropagation()
                  onAnnotationClick(annotation)
                }}
              >
                {node}
              </mark>
            )
          }

          if (hasSpeech && segmentStart >= speechStart && segmentEnd <= speechEnd) {
            node = (
              <span key={`speech-${segmentStart}`} className="speech-reading">
                {node}
              </span>
            )
          }

          return <Fragment key={`${segmentStart}-${segmentEnd}`}>{node}</Fragment>
          })
        }

        const content = renderRange(visibleStart, visibleEnd)

        const style = block.type === 'paragraph' && firstLineIndent && visibleStart === block.start
          ? { textIndent: '2em' }
          : block.type === 'list-item'
            ? { paddingInlineStart: `calc(1rem + ${block.listDepth ?? 0} * 1.25rem)` }
          : undefined

        if (block.type === 'code') {
          return (
            <div key={`${block.start}-${blockIndex}`} {...blockMeasurementProps} className="my-4">
              <MarkdownCodeBlock
                code={document.text.slice(visibleStart, visibleEnd)}
                language={block.language}
                isComplete={visibleStart === block.start && visibleEnd === block.end}
                renderedCode={content}
                paginated={paginated}
                measurementMode={measurementMode}
                sourceStart={visibleStart}
              />
            </div>
          )
        }
        if (block.type === 'math') {
          return (
            <div key={`${block.start}-${blockIndex}`} {...blockMeasurementProps} className="my-4">
              <MarkdownMath
                formula={document.text.slice(visibleStart, visibleEnd)}
                displayMode
                sourceStart={visibleStart}
              />
            </div>
          )
        }
        if (block.type === 'table' && block.table) {
          const [headerRow, ...bodyRows] = block.table.rows
          const visibleBodyRows = bodyRows.filter((row) =>
            row.some((cell) => cell.start < visibleEnd && cell.end > visibleStart)
          )
          const renderRow = (row: typeof headerRow, header: boolean, rowIndex: number) => (
            <tr key={`${block.start}-${header ? 'head' : 'body'}-${rowIndex}`} className="border-b border-current/10 last:border-b-0">
              {row.map((cell, cellIndex) => {
                const Cell = header ? 'th' : 'td'
                const cellStart = header ? cell.start : Math.max(cell.start, visibleStart)
                const cellEnd = header ? cell.end : Math.min(cell.end, visibleEnd)
                return (
                  <Cell
                    key={`${cell.start}-${cellIndex}`}
                    className={cn(
                      'min-w-24 px-4 py-3 [overflow-wrap:anywhere]',
                      header ? 'bg-current/[0.07] font-bold' : 'align-top'
                    )}
                    style={{ textAlign: cell.align ?? 'left' }}
                    scope={header ? 'col' : undefined}
                  >
                    {cellStart < cellEnd ? renderRange(cellStart, cellEnd) : null}
                  </Cell>
                )
              })}
            </tr>
          )

          return (
            <div
              key={`${block.start}-${blockIndex}`}
              {...blockMeasurementProps}
              data-reader-horizontal-scroll
              data-ui-control
              role="region"
              aria-label="Markdown 表格，可横向滚动"
              tabIndex={0}
              className={cn(getBlockClassName(block), paginated && 'max-h-[65vh] overflow-auto overscroll-contain')}
            >
              <table aria-label="Markdown 数据表" className="w-full min-w-max border-collapse text-[0.92em]">
                <thead>{headerRow ? renderRow(headerRow, true, 0) : null}</thead>
                <tbody>{visibleBodyRows.map((row, rowIndex) => renderRow(row, false, rowIndex))}</tbody>
              </table>
            </div>
          )
        }
        if (block.type === 'blockquote') {
          return (
            <blockquote key={`${block.start}-${blockIndex}`} {...blockMeasurementProps} className={getBlockClassName(block)}>
              {content}
            </blockquote>
          )
        }
        if (block.type === 'footnote') {
          return (
            <div
              key={`${block.start}-${blockIndex}`}
              {...blockMeasurementProps}
              id={block.id}
              className="mb-3 border-l-2 border-current/15 pl-3 text-[0.9em] opacity-85"
            >
              {content}
              <a
                href={`#${block.id?.replace('footnote-', 'footnote-ref-') ?? ''}`}
                className="ml-2 inline-flex rounded px-1 align-middle no-underline hover:bg-current/10"
                aria-label="返回脚注引用位置"
                onClick={(event) => {
                  event.stopPropagation()
                  if (onInternalLink) {
                    event.preventDefault()
                    onInternalLink(event.currentTarget.hash)
                  }
                }}
              >
                ↩
              </a>
            </div>
          )
        }

        if (block.type === 'list-item' && block.listTask && block.listContentStart !== undefined) {
          return (
            <div
              key={`${block.start}-${blockIndex}`}
              {...blockMeasurementProps}
              className={cn(getBlockClassName(block), 'flex items-start gap-2')}
              style={style}
              role="listitem"
              aria-level={(block.listDepth ?? 0) + LIST_ROOT_LEVEL}
              data-list-depth={block.listDepth}
            >
              {visibleStart < block.listContentStart && (
                <span className="shrink-0">
                  {renderRange(visibleStart, Math.min(block.listContentStart, visibleEnd))}
                </span>
              )}
              <input
                type="checkbox"
                checked={block.listChecked === true}
                readOnly
                tabIndex={-1}
                aria-label={block.listChecked ? '已完成任务' : '未完成任务'}
                className="mt-[0.35em] size-4 shrink-0 accent-current"
              />
              <span className="min-w-0">
                {renderRange(Math.max(block.listContentStart, visibleStart), visibleEnd)}
              </span>
            </div>
          )
        }

        return (
          <div
            key={`${block.start}-${blockIndex}`}
            {...blockMeasurementProps}
            className={getBlockClassName(block)}
            style={style}
            role={block.type === 'heading' ? 'heading' : block.type === 'list-item' ? 'listitem' : undefined}
            aria-level={block.type === 'heading'
              ? block.depth
              : block.type === 'list-item'
                ? (block.listDepth ?? 0) + LIST_ROOT_LEVEL
                : undefined}
            id={block.type === 'heading' ? block.id : undefined}
            data-list-depth={block.type === 'list-item' ? block.listDepth : undefined}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}

export default MarkdownReaderContent
