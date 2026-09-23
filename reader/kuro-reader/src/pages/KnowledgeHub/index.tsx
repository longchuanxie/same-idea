import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { COPY } from '@/constants/copy';
import { ROUTES, askPath, atlasPath, knowledgePath } from '@/constants/routes';
import { getKnowledgeTask } from '@/services/ai/knowledgeTasks';
import { knowledgeRepo } from '@/services/storage/knowledgeRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { KnowledgeArtifact } from '@/types';
import { booksHavingKind } from '@/utils/crossBookGraph';

const KIND_LABELS: Record<KnowledgeArtifact['type'], string> = {
  'character-graph': '人物图谱',
  'concept-graph': '概念图谱',
  mindmap: '思维导图',
  glossary: '术语卡',
  'paper-brief': '速览卡',
  'story-beats': '叙事节拍',
};

function artifactMeta(artifact: KnowledgeArtifact): string {
  const parts: string[] = []
  if (artifact.type === 'character-graph' || artifact.type === 'concept-graph') {
    const graph = artifact.data as { nodes?: unknown[]; edges?: unknown[] }
    const entity = artifact.type === 'concept-graph' ? '概念' : '人物'
    parts.push(`${graph.nodes?.length ?? 0} ${entity} · ${graph.edges?.length ?? 0} 关系`)
  } else if (artifact.type === 'glossary') {
    const glossary = artifact.data as { terms?: unknown[] }
    parts.push(`${glossary.terms?.length ?? 0} 术语`)
  } else if (artifact.type === 'paper-brief') {
    const brief = artifact.data as { contributions?: unknown[]; limitations?: unknown[] }
    parts.push(`${brief.contributions?.length ?? 0} 贡献 · ${brief.limitations?.length ?? 0} 局限`)
  } else if (artifact.type === 'story-beats') {
    const beats = artifact.data as { beats?: unknown[] }
    parts.push(`${beats.beats?.length ?? 0} 节拍`)
  }
  if (artifact.meta?.chapterCount) parts.push(`覆盖 ${artifact.meta.chapterCount} 章`)
  // 短日期（9/12）：移动端卡片元信息一行放得下，不再被截断
  parts.push(new Date(artifact.updatedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }))
  return parts.join(' · ')
}

/** 全局知识库（主菜单直达）：跨书聚合全部 AI 知识产物——
 *  知识件本随书走（档案卡生成），这里给它们一张馆藏总目。 */
export const KnowledgeHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, loadBooks } = useLibraryStore();
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[] | null>(null);

  useEffect(() => {
    loadBooks();
    let cancelled = false;
    knowledgeRepo.getAll().then((all) => {
      if (!cancelled) setArtifacts(all);
    });
    return () => {
      cancelled = true;
    };
  }, [loadBooks]);

  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);

  // 按书分组，书按最新产物排序；书内产物新者在前
  const groups = useMemo(() => {
    if (!artifacts) return [];
    const byBook = new Map<string, KnowledgeArtifact[]>();
    for (const artifact of artifacts) {
      const list = byBook.get(artifact.bookId) ?? [];
      list.push(artifact);
      byBook.set(artifact.bookId, list);
    }
    return [...byBook.entries()]
      .map(([bookId, list]) => ({
        bookId,
        book: bookById.get(bookId),
        artifacts: list.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.artifacts[0].updatedAt).getTime() -
          new Date(a.artifacts[0].updatedAt).getTime()
      );
  }, [artifacts, bookById]);

  const total = artifacts?.length ?? 0;

  // 跨书图谱入口：至少两本书有同类知识件才亮（否则是死路）
  const atlasAvailable = useMemo(() => {
    if (!artifacts) return false
    const live = artifacts.filter((a) => bookById.has(a.bookId))
    return (
      booksHavingKind(live, 'character-graph').length >= 2 ||
      booksHavingKind(live, 'concept-graph').length >= 2 ||
      booksHavingKind(live, 'glossary').length >= 2
    )
  }, [artifacts, bookById])

  return (
    <div className="mx-auto max-w-3xl px-4 pt-3">
      {/* 页名由顶栏承载；不放页内标题与引导文案，保持列表直达 */}

      {/* 知识库的两张活口：问藏书（活问活答）+ 跨书图谱（同名实体并网） */}
      <div className={`mb-5 grid gap-2 ${atlasAvailable ? 'sm:grid-cols-2' : ''}`}>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-card border border-primary/40 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10"
          onClick={() => navigate(askPath())}
        >
          <span
            className="material-symbols-outlined text-[22px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology_alt
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-label text-label-md text-primary">{COPY.askLibrary.pageName}</span>
          <span className="mt-0.5 block font-label text-label-sm text-on-surface-variant truncate">
            {COPY.askLibrary.pageHint}
          </span>
        </span>
        <span className="material-symbols-outlined text-icon-md text-on-surface-variant">chevron_right</span>
        </button>

        {atlasAvailable && (
          <button
            type="button"
            className="card-link flex w-full items-center gap-3 p-3"
            onClick={() => navigate(atlasPath())}
          >
            <span
              className="material-symbols-outlined text-[22px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-label text-label-md text-primary">{COPY.atlas.pageName}</span>
              <span className="mt-0.5 block font-label text-label-sm text-on-surface-variant truncate">
                {COPY.atlas.pageHint}
              </span>
            </span>
            <span className="material-symbols-outlined text-icon-md text-on-surface-variant">chevron_right</span>
          </button>
        )}
      </div>

      {artifacts !== null && total === 0 && (
        <div className="rounded-card border border-outline-variant bg-surface-container-low p-8 text-center">
          <span className="material-symbols-outlined text-[44px] text-on-surface-faint">psychology</span>
          <p className="font-label text-label-lg text-on-surface-variant mt-3">
            馆藏知识件还空着
          </p>
          <p className="font-label text-label-sm text-on-surface-faint mt-1">
            到书籍档案卡的「知识库」区块，先在设置里配好 AI 服务再生成
          </p>
          <button
            type="button"
            className="btn-seal mt-4 px-5 py-2"
            onClick={() => navigate(ROUTES.LIBRARY)}
          >
            去书库挑一本书
          </button>
        </div>
      )}

      {groups.map(({ bookId, book, artifacts: list }) => (
        <section key={bookId} className="mb-5">
          <div className="mb-1.5 flex items-baseline gap-2">
            <h2 className="font-display text-title-sm text-on-surface truncate">
              {book?.title ?? '已删书籍'}
            </h2>
            <span className="font-mono text-label-xs text-on-surface-faint flex-shrink-0">
              {list.length} 件
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {list.map((artifact) => {
              const task = getKnowledgeTask(artifact.type);
              return (
                <button
                  key={artifact.id}
                  type="button"
                  className="card-link flex items-start gap-2.5 p-3 active:bg-surface-container"
                  onClick={() => navigate(knowledgePath(bookId, artifact.id))}
                >
                  <span className="material-symbols-outlined text-icon-md text-primary mt-0.5">
                    {task.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="min-w-0 flex-1 font-label text-label-md text-on-surface truncate">
                        {artifact.title}
                      </span>
                      <span className="font-label text-label-xs text-on-surface-faint flex-shrink-0 rounded-full border border-outline-variant px-1.5 leading-4">
                        {KIND_LABELS[artifact.type]}
                      </span>
                    </span>
                    <span className="mt-0.5 block font-mono text-label-xs text-on-surface-variant truncate">
                      {artifactMeta(artifact)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default KnowledgeHubPage;
