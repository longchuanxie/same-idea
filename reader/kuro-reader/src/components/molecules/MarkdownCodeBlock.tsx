import { useEffect, useId, useRef, useState, type FC, type ReactNode } from 'react'

import type { HLJSApi, LanguageFn } from 'highlight.js'

export interface MarkdownCodeBlockProps {
  code: string
  language?: string
  isComplete: boolean
  renderedCode?: ReactNode
  paginated?: boolean
  measurementMode?: boolean
  sourceStart?: number
}

interface MermaidRenderResult {
  svg: string
}

interface HighlightedCodeProps {
  code: string
  language: string
  sourceStart?: number
  wrapLines: boolean
}

const COPY_FEEDBACK_DURATION_MS = 1500
const MERMAID_MIN_SCALE = 0.5
const MERMAID_MAX_SCALE = 2
const MERMAID_SCALE_STEP = 0.25
const MERMAID_DEFAULT_SCALE = 1
const PERCENT_MULTIPLIER = 100
const LINE_NUMBER_START = 1

let mermaidLoader: Promise<typeof import('mermaid').default> | null = null
let highlighterLoader: Promise<HLJSApi> | null = null
const registeredHighlightLanguages = new Set<string>()
const highlightLanguageAliases: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'xml',
  vue: 'xml',
  shell: 'bash',
  sh: 'bash',
  py: 'python',
  cs: 'csharp',
}
const highlightLanguageLoaders: Record<string, () => Promise<{ default: LanguageFn }>> = {
  bash: () => import('highlight.js/lib/languages/bash'),
  cpp: () => import('highlight.js/lib/languages/cpp'),
  csharp: () => import('highlight.js/lib/languages/csharp'),
  css: () => import('highlight.js/lib/languages/css'),
  java: () => import('highlight.js/lib/languages/java'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  json: () => import('highlight.js/lib/languages/json'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  python: () => import('highlight.js/lib/languages/python'),
  sql: () => import('highlight.js/lib/languages/sql'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  xml: () => import('highlight.js/lib/languages/xml'),
}

async function loadMermaid(): Promise<typeof import('mermaid').default> {
  if (!mermaidLoader) {
    mermaidLoader = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'neutral',
        suppressErrorRendering: true,
      })
      return mermaid
    })
  }
  return mermaidLoader
}

async function loadHighlighter(language: string): Promise<{ highlighter: HLJSApi; language: string } | null> {
  const resolvedLanguage = highlightLanguageAliases[language] ?? language
  const languageLoader = highlightLanguageLoaders[resolvedLanguage]
  if (!languageLoader) return null
  if (!highlighterLoader) {
    highlighterLoader = import('highlight.js/lib/core').then(({ default: highlighter }) => highlighter)
  }
  const highlighter = await highlighterLoader
  if (!registeredHighlightLanguages.has(resolvedLanguage)) {
    const { default: languageDefinition } = await languageLoader()
    highlighter.registerLanguage(resolvedLanguage, languageDefinition)
    registeredHighlightLanguages.add(resolvedLanguage)
  }
  return { highlighter, language: resolvedLanguage }
}

const HighlightedCode: FC<HighlightedCodeProps> = ({ code, language, sourceStart, wrapLines }) => {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadHighlighter(language).then((loaded) => {
      if (!active || !loaded) return
      setHtml(loaded.highlighter.highlight(code, {
        language: loaded.language,
        ignoreIllegals: true,
      }).value)
    })
    return () => {
      active = false
    }
  }, [code, language])

  if (!html) {
    return (
      <code
        data-source-start={sourceStart}
        className={wrapLines
          ? 'block min-w-0 flex-1 whitespace-pre-wrap break-words'
          : 'block min-w-0 flex-1 whitespace-pre'}
      >
        {code}
      </code>
    )
  }
  return (
    <code
      data-source-start={sourceStart}
      className={wrapLines
        ? 'markdown-code-highlight block min-w-0 flex-1 whitespace-pre-wrap break-words'
        : 'markdown-code-highlight block min-w-0 flex-1 whitespace-pre'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

interface CodeToolbarProps {
  code: string
  label: string
  showFormattingControls: boolean
  wrapLines: boolean
  showLineNumbers: boolean
  onToggleWrap: () => void
  onToggleLineNumbers: () => void
}

type CopyStatus = 'idle' | 'copied' | 'failed'

async function copyCodeText(code: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code)
      return true
    }
  } catch {
    // Fall back to the selection-based copy path below.
  }

  const textarea = document.createElement('textarea')
  textarea.value = code
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

const CodeToolbar: FC<CodeToolbarProps> = ({
  code,
  label,
  showFormattingControls,
  wrapLines,
  showLineNumbers,
  onToggleWrap,
  onToggleLineNumbers,
}) => {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const feedbackTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
  }, [])

  const handleCopy = async () => {
    const copied = await copyCodeText(code)
    setCopyStatus(copied ? 'copied' : 'failed')
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = window.setTimeout(
      () => setCopyStatus('idle'),
      COPY_FEEDBACK_DURATION_MS
    )
  }

  return (
    <div className="flex items-center justify-between border-b border-current/10 px-3 py-2 text-[0.75em] opacity-70">
      <span className="font-label uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1">
        {showFormattingControls && (
          <>
            <button
              type="button"
              className="rounded px-2 py-1 hover:bg-current/10"
              aria-label={wrapLines ? '关闭代码自动换行' : '开启代码自动换行'}
              aria-pressed={wrapLines}
              onClick={(event) => {
                event.stopPropagation()
                onToggleWrap()
              }}
            >
              <span className="material-symbols-outlined text-[16px]">wrap_text</span>
            </button>
            <button
              type="button"
              className="rounded px-2 py-1 hover:bg-current/10"
              aria-label={showLineNumbers ? '隐藏代码行号' : '显示代码行号'}
              aria-pressed={showLineNumbers}
              onClick={(event) => {
                event.stopPropagation()
                onToggleLineNumbers()
              }}
            >
              <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
            </button>
          </>
        )}
        <button
          type="button"
          className="flex items-center gap-1 rounded px-2 py-1 hover:bg-current/10"
          onClick={(event) => {
            event.stopPropagation()
            void handleCopy()
          }}
          aria-label="复制代码"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copyStatus === 'copied' ? 'check' : copyStatus === 'failed' ? 'error' : 'content_copy'}
          </span>
          {copyStatus === 'copied' ? '已复制' : copyStatus === 'failed' ? '复制失败' : '复制'}
        </button>
      </div>
    </div>
  )
}

const MermaidDiagram: FC<{ chart: string; paginated: boolean }> = ({ chart, paginated }) => {
  const reactId = useId()
  const [result, setResult] = useState<MermaidRenderResult | null>(null)
  const [failed, setFailed] = useState(false)
  const [scale, setScale] = useState(MERMAID_DEFAULT_SCALE)

  useEffect(() => {
    let active = true
    const renderDiagram = async () => {
      try {
        const mermaid = await loadMermaid()
        const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
        const rendered = await mermaid.render(id, chart)
        if (active) {
          setResult({ svg: rendered.svg })
          setFailed(false)
        }
      } catch {
        if (active) {
          setResult(null)
          setFailed(true)
        }
      }
    }

    void renderDiagram()
    return () => {
      active = false
    }
  }, [chart, reactId])

  if (failed) {
    return (
      <div className="p-4">
        <p className="mb-3 font-label text-sm opacity-70">Mermaid 图表语法有误，已显示源码</p>
        <pre className="overflow-x-auto whitespace-pre font-mono text-[0.9em] leading-relaxed">{chart}</pre>
      </div>
    )
  }

  if (!result) {
    return <div className="p-6 text-center font-label text-sm opacity-60">正在渲染 Mermaid 图表…</div>
  }

  return (
    <div
      data-reader-horizontal-scroll
      data-ui-control
      role="region"
      aria-label="Mermaid 图表，可缩放和滚动"
      tabIndex={0}
      className={paginated
        ? 'relative max-h-[62vh] overflow-auto overscroll-contain p-4'
        : 'relative overflow-x-auto p-4'}
    >
      <div className="sticky right-0 top-0 z-10 mb-2 ml-auto flex w-fit items-center gap-1 rounded-full border border-current/10 bg-surface/90 p-1 shadow-sm backdrop-blur">
        <button
          type="button"
          className="rounded-full p-1 hover:bg-current/10 disabled:opacity-30"
          disabled={scale <= MERMAID_MIN_SCALE}
          aria-label="缩小图表"
          onClick={(event) => {
            event.stopPropagation()
            setScale((current) => Math.max(MERMAID_MIN_SCALE, current - MERMAID_SCALE_STEP))
          }}
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <button
          type="button"
          className="min-w-12 rounded-full px-2 py-1 font-label text-xs hover:bg-current/10"
          aria-label="重置图表缩放"
          onClick={(event) => {
            event.stopPropagation()
            setScale(MERMAID_DEFAULT_SCALE)
          }}
        >
          {Math.round(scale * PERCENT_MULTIPLIER)}%
        </button>
        <button
          type="button"
          className="rounded-full p-1 hover:bg-current/10 disabled:opacity-30"
          disabled={scale >= MERMAID_MAX_SCALE}
          aria-label="放大图表"
          onClick={(event) => {
            event.stopPropagation()
            setScale((current) => Math.min(MERMAID_MAX_SCALE, current + MERMAID_SCALE_STEP))
          }}
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
      </div>
      <div
        className="origin-top-left [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
        style={{ zoom: scale }}
        dangerouslySetInnerHTML={{ __html: result.svg }}
      />
    </div>
  )
}

export const MarkdownCodeBlock: FC<MarkdownCodeBlockProps> = ({
  code,
  language,
  isComplete,
  renderedCode,
  paginated = false,
  measurementMode = false,
  sourceStart,
}) => {
  const normalizedLanguage = language?.trim().toLowerCase().split(/\s+/, 1)[0] || 'text'
  const isMermaid = normalizedLanguage === 'mermaid'
  const [wrapLines, setWrapLines] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(() => code.includes('\n'))
  const lineNumbers = code.split('\n').map((_line, index) => index + LINE_NUMBER_START).join('\n')

  return (
    <div className="overflow-hidden rounded-lg border border-current/15 bg-current/[0.06]">
      <CodeToolbar
        code={code}
        label={isMermaid ? 'Mermaid' : normalizedLanguage}
        showFormattingControls={!isMermaid}
        wrapLines={wrapLines}
        showLineNumbers={showLineNumbers}
        onToggleWrap={() => setWrapLines((current) => !current)}
        onToggleLineNumbers={() => setShowLineNumbers((current) => !current)}
      />
      {isMermaid && isComplete && !measurementMode ? (
        <MermaidDiagram chart={code} paginated={paginated} />
      ) : (
        <div className="relative">
          {isMermaid && !isComplete && (
            <p className="border-b border-current/10 px-3 py-2 font-label text-xs opacity-60">
              图表跨页，完整图形将在包含完整源码的页面中显示
            </p>
          )}
          <pre
            data-reader-horizontal-scroll
            data-ui-control
            className={paginated
              ? 'flex max-h-[62vh] max-w-full items-start overflow-auto overscroll-contain p-4 font-mono text-[0.9em] leading-relaxed'
              : 'flex max-w-full items-start overflow-x-auto p-4 font-mono text-[0.9em] leading-relaxed'}
          >
            {showLineNumbers && !wrapLines && !isMermaid && (
              <span
                aria-hidden="true"
                data-code-line-numbers
                className="mr-4 block shrink-0 self-start select-none border-r border-current/10 pr-3 text-right opacity-35"
              >
                {lineNumbers}
              </span>
            )}
            {!isMermaid && isComplete && !measurementMode && normalizedLanguage !== 'text' ? (
              <HighlightedCode
                code={code}
                language={normalizedLanguage}
                sourceStart={sourceStart}
                wrapLines={wrapLines}
              />
            ) : (
              <code
                data-source-start={sourceStart}
                className={wrapLines
                  ? 'block min-w-0 flex-1 whitespace-pre-wrap break-words'
                  : 'block min-w-0 flex-1 whitespace-pre'}
              >
                {renderedCode ?? code}
              </code>
            )}
          </pre>
        </div>
      )}
    </div>
  )
}

export default MarkdownCodeBlock
