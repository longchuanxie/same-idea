import { useEffect, useState, type FC } from 'react'

import 'katex/dist/katex.min.css'

interface MarkdownMathProps {
  formula: string
  displayMode: boolean
  sourceStart: number
}

interface MathRenderState {
  html: string
  failed: boolean
}

let katexLoader: Promise<typeof import('katex')> | null = null

function loadKatex(): Promise<typeof import('katex')> {
  if (!katexLoader) katexLoader = import('katex')
  return katexLoader
}

export const MarkdownMath: FC<MarkdownMathProps> = ({ formula, displayMode, sourceStart }) => {
  const [rendered, setRendered] = useState<MathRenderState | null>(null)

  useEffect(() => {
    let active = true
    void loadKatex().then((katex) => {
      try {
        const html = katex.renderToString(formula, {
          displayMode,
          throwOnError: false,
          strict: 'ignore',
          trust: false,
          output: 'htmlAndMathml',
        })
        if (active) {
          setRendered({ html, failed: false })
          window.dispatchEvent(new Event('markdown-media-load'))
        }
      } catch {
        if (active) setRendered({ html: '', failed: true })
      }
    })
    return () => {
      active = false
    }
  }, [displayMode, formula])

  if (!rendered) {
    return <code data-source-start={sourceStart} className="font-mono opacity-70">{formula}</code>
  }
  if (rendered.failed) {
    return <code data-source-start={sourceStart} className="font-mono text-red-500/80">{formula}</code>
  }

  const Element = displayMode ? 'div' : 'span'
  return (
    <Element
      data-source-start={sourceStart}
      data-ui-control={displayMode ? true : undefined}
      data-reader-horizontal-scroll={displayMode ? true : undefined}
      className={displayMode ? 'my-4 max-w-full overflow-x-auto py-2 text-center' : 'inline-block max-w-full align-middle'}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  )
}

export default MarkdownMath
