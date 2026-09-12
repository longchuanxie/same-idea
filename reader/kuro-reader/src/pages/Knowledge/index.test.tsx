import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { KnowledgePage } from '@/pages/Knowledge'
import type { KnowledgeArtifact } from '@/types'

// vi.mock 工厂被提升，状态经 vi.hoisted 建立（artifact 工厂无外部依赖，可直接构造）
const holder = vi.hoisted(() => {
  const artifact: KnowledgeArtifact = {
    id: 'kn-1',
    bookId: 'b1',
    type: 'character-graph',
    title: '人物关系图谱',
    data: {
      nodes: [
        { id: 'zhangsan', name: '张三', role: '主角', weight: 1 },
        { id: 'lisi', name: '李四', weight: 0.5 },
      ],
      edges: [{ source: 'zhangsan', target: 'lisi', relation: '师徒' }],
    },
    meta: { chapterCount: 12, contentFingerprint: 'fp-1' },
    generator: 'ai',
    createdAt: new Date('2026-09-12T10:00:00'),
    updatedAt: new Date('2026-09-12T10:00:00'),
  }
  return {
    knowledge: {
      artifactsByBook: { b1: [artifact] },
      generation: {},
      loadArtifacts: vi.fn(async () => {}),
      generateArtifact: vi.fn(async () => true),
      cancelGeneration: vi.fn(),
      removeArtifact: vi.fn(async () => {}),
    },
  }
})

vi.mock('@/stores/useLibraryStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  return { useLibraryStore: f.wrapAsStoreMock(f.makeLibraryStoreState()) }
})
vi.mock('@/stores/useKnowledgeStore', async () => {
  const f = await import('@/test/pageSmokeFactories')
  return { useKnowledgeStore: f.wrapAsStoreMock(holder.knowledge) }
})
vi.mock('@/stores/useAppStore', () => ({
  useAppStore: Object.assign(
    vi.fn(() => ({
      settings: { knowledgeAiUrl: 'https://api.example.com', knowledgeAiKey: 'k', knowledgeAiModel: 'm' },
    })),
    { getState: vi.fn(() => ({ settings: {} })) }
  ),
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/knowledge/:bookId/:artifactId" element={<KnowledgePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Knowledge 页面冒烟', () => {
  it('渲染人物图谱查看器：元信息与图谱节点', async () => {
    renderAt('/knowledge/b1/kn-1')
    expect(await screen.findByText(/人物关系图谱 · 覆盖 12 章/)).toBeTruthy()
    // 力导向图 SVG 节点名
    expect(screen.getByLabelText('张三，主角')).toBeTruthy()
    expect(holder.knowledge.loadArtifacts).toHaveBeenCalledWith('b1')
  })

  it('产物不存在时渲染缺位提示', async () => {
    renderAt('/knowledge/b1/kn-missing')
    expect(await screen.findByText(/这个知识件不存在/)).toBeTruthy()
  })
})
