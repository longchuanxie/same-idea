import { describe, it, expect, beforeEach } from 'vitest'

import { getDB, _resetDBForTesting } from '@/services/storage/db'
import { knowledgeRepo } from '@/services/storage/knowledgeRepo'
import { tombstoneRepo } from '@/services/storage/tombstoneRepo'
import type { KnowledgeArtifact } from '@/types'

beforeEach(async () => {
  try {
    const db = await getDB()
    db.close()
  } catch {
    // first run: no DB yet
  }
  _resetDBForTesting()
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('kuro-reader-db')
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => resolve()
  })
})

const makeArtifact = (overrides: Partial<KnowledgeArtifact> & { id: string; bookId: string }): KnowledgeArtifact => ({
  type: 'character-graph',
  title: '人物关系图谱',
  data: { nodes: [{ id: 'zhangsan', name: '张三' }], edges: [] },
  generator: 'ai',
  createdAt: new Date('2026-09-01T10:00:00'),
  updatedAt: new Date('2026-09-01T10:00:00'),
  ...overrides,
})

describe('knowledgeRepo', () => {
  it('save + getByBookId 只返回该书知识件并按 updatedAt 倒序', async () => {
    const older = makeArtifact({ id: 'kn-1', bookId: 'book-1' })
    const newer = makeArtifact({ id: 'kn-2', bookId: 'book-1', updatedAt: new Date('2026-09-02T10:00:00') })
    const other = makeArtifact({ id: 'kn-3', bookId: 'book-2' })
    await knowledgeRepo.save(older)
    await knowledgeRepo.save(newer)
    await knowledgeRepo.save(other)

    const result = await knowledgeRepo.getByBookId('book-1')
    expect(result.map((a) => a.id)).toEqual(['kn-2', 'kn-1'])
    expect(result[0].updatedAt instanceof Date).toBe(true)
  })

  it('get 取回单件并还原日期', async () => {
    await knowledgeRepo.save(makeArtifact({ id: 'kn-1', bookId: 'book-1' }))
    const artifact = await knowledgeRepo.get('kn-1')
    expect(artifact?.id).toBe('kn-1')
    expect(artifact?.createdAt instanceof Date).toBe(true)
    expect(await knowledgeRepo.get('nope')).toBeUndefined()
  })

  it('remove 删除并记录 knowledge 墓碑', async () => {
    await knowledgeRepo.save(makeArtifact({ id: 'kn-1', bookId: 'book-1' }))
    await knowledgeRepo.remove('kn-1')
    expect(await knowledgeRepo.get('kn-1')).toBeUndefined()

    const tombstones = await tombstoneRepo.getAll()
    expect(tombstones.some((t) => t.kind === 'knowledge' && t.key === 'kn-1')).toBe(true)
  })

  it('deleteByBookId 清空该书全部知识件并记整书墓碑', async () => {
    await knowledgeRepo.save(makeArtifact({ id: 'kn-1', bookId: 'book-1' }))
    await knowledgeRepo.save(makeArtifact({ id: 'kn-2', bookId: 'book-1', type: 'mindmap' }))
    await knowledgeRepo.save(makeArtifact({ id: 'kn-3', bookId: 'book-2' }))

    await knowledgeRepo.deleteByBookId('book-1')
    expect(await knowledgeRepo.getByBookId('book-1')).toEqual([])
    expect((await knowledgeRepo.getByBookId('book-2')).map((a) => a.id)).toEqual(['kn-3'])

    const tombstones = await tombstoneRepo.getAll()
    expect(tombstones.some((t) => t.kind === 'book' && t.key === 'book-1')).toBe(true)
  })

  it('getAll / deleteAll 供备份导出与覆盖导入', async () => {
    await knowledgeRepo.save(makeArtifact({ id: 'kn-1', bookId: 'book-1' }))
    await knowledgeRepo.save(makeArtifact({ id: 'kn-2', bookId: 'book-2' }))
    expect((await knowledgeRepo.getAll()).length).toBe(2)

    await knowledgeRepo.deleteAll()
    expect(await knowledgeRepo.getAll()).toEqual([])
  })
})
