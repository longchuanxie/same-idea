import React, { useMemo, useState } from 'react';

import type {
  Book,
  GraphDetailLevel,
  KnowledgeArtifact,
  KnowledgeArtifactType,
  KnowledgeGenerationOptions,
} from '@/types';

/**
 * 生成选项弹层：范围（全书/起止章）、图谱详细度、增量补充。
 * 从用户视角回应三种生成诉求——长书先看前几章、连载书只补新章、
 * 人物太多时收成核心图谱。默认值即"全书/标准/全量重生成"。
 */

const DETAIL_OPTIONS: { value: GraphDetailLevel; label: string; hint: string }[] = [
  { value: 'core', label: '聚焦核心', hint: '只留主要条目（≤8 个）' },
  { value: 'standard', label: '标准', hint: '常速阅读的均衡取材' },
  { value: 'rich', label: '尽量详尽', hint: '含重要次要条目（≤24 个）' },
];

/** 图谱类任务（实体+关系）：详细度选项适用 */
const GRAPH_TASK_TYPES: KnowledgeArtifactType[] = ['character-graph', 'concept-graph'];

export interface GenerationOptionsSheetProps {
  book: Book;
  type: KnowledgeArtifactType;
  label: string;
  artifact?: KnowledgeArtifact;
  /** 原书章数（未知传 null：隐藏总量提示，仍可输起止） */
  totalChapters: number | null;
  open: boolean;
  onClose: () => void;
  onStart: (options: KnowledgeGenerationOptions) => void;
}

export const GenerationOptionsSheet: React.FC<GenerationOptionsSheetProps> = ({
  book,
  type,
  label,
  artifact,
  totalChapters,
  open,
  onClose,
  onStart,
}) => {
  const baseChapterCount = artifact?.meta?.bookChapterCount ?? artifact?.meta?.chapterCount ?? null;
  const hasNewChapters =
    Boolean(artifact) && totalChapters != null && baseChapterCount != null && totalChapters > baseChapterCount;

  const [mode, setMode] = useState<'all' | 'range'>('all');
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [detail, setDetail] = useState<GraphDetailLevel>('standard');
  const [incremental, setIncremental] = useState(false);

  const parsedRange = useMemo(() => {
    const from = Number.parseInt(fromText, 10);
    const trimmedTo = toText.trim();
    if (!Number.isInteger(from) || from < 1) return null;
    if (from > 1 && totalChapters != null && from > totalChapters) return null;
    if (!trimmedTo) return { from: from - 1, to: undefined as number | undefined };
    const to = Number.parseInt(trimmedTo, 10);
    if (!Number.isInteger(to) || to < from) return null;
    if (totalChapters != null && to > totalChapters) return null;
    return { from: from - 1, to: to - 1 };
  }, [fromText, toText, totalChapters]);

  if (!open) return null;

  const incrementalFrom = (baseChapterCount ?? 0) + 1;
  const canStart = incremental || mode === 'all' || parsedRange != null;

  const handleStart = () => {
    if (!canStart) return;
    if (incremental) {
      onStart({ incremental: true, ...(GRAPH_TASK_TYPES.includes(type) ? { detail } : {}) });
      return;
    }
    onStart({
      ...(mode === 'range' && parsedRange ? { scope: parsedRange } : {}),
      ...(GRAPH_TASK_TYPES.includes(type) ? { detail } : {}),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-on-background/40 animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={`自定义生成${label}`}
        className="bg-surface-bright border border-outline-variant rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-sm text-primary mb-1">自定义生成{label}</h3>
        <p className="font-label text-label-xs text-on-surface-faint mb-4">
          {totalChapters != null ? `本书共 ${totalChapters} 章 · ` : ''}
          {book.title}
        </p>

        {/* 增量补充（仅当已有产物且书变长了才出现） */}
        {hasNewChapters && (
          <button
            type="button"
            aria-pressed={incremental}
            className={`w-full flex items-center gap-3 rounded-card border p-3 mb-3 text-left transition-colors ${
              incremental ? 'border-primary bg-surface-container' : 'border-outline-variant'
            }`}
            onClick={() => setIncremental((v) => !v)}
          >
            <span className={`material-symbols-outlined text-icon-md ${incremental ? 'text-primary' : 'text-on-surface-faint'}`}>
              {incremental ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span className="min-w-0">
              <span className="block font-label text-label-sm text-on-surface">
                只补新章节（第 {incrementalFrom} 章起）
              </span>
              <span className="block font-label text-label-xs text-on-surface-variant mt-0.5">
                在现有图谱上并入新内容，快且省——旧关系与原文依据原样保留
              </span>
            </span>
          </button>
        )}

        {/* 范围（增量时不需要） */}
        {!incremental && (
          <div className="mb-3">
            <p className="font-label text-label-xs text-on-surface-variant mb-1.5">生成范围</p>
            <div className="flex items-center gap-2 mb-2">
              {(['all', 'range'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  className={`px-3 py-1.5 rounded-full font-label text-label-sm transition-colors ${
                    mode === value ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant'
                  }`}
                  onClick={() => setMode(value)}
                >
                  {value === 'all' ? '全书' : '起止章'}
                </button>
              ))}
            </div>
            {mode === 'range' && (
              <div className="flex items-center gap-2">
                <span className="font-label text-label-sm text-on-surface-variant whitespace-nowrap">第</span>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={fromText}
                  onChange={(e) => setFromText(e.target.value)}
                  placeholder="1"
                  aria-label="起始章"
                  className="w-20 border border-outline-variant rounded px-2 py-1.5 font-mono text-label-sm bg-surface focus:outline-none focus:border-primary"
                />
                <span className="font-label text-label-sm text-on-surface-variant whitespace-nowrap">章 至 第</span>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={toText}
                  onChange={(e) => setToText(e.target.value)}
                  placeholder={totalChapters != null ? String(totalChapters) : '末章'}
                  aria-label="结束章（留空到末尾）"
                  className="w-20 border border-outline-variant rounded px-2 py-1.5 font-mono text-label-sm bg-surface focus:outline-none focus:border-primary"
                />
                <span className="font-label text-label-sm text-on-surface-variant whitespace-nowrap">章</span>
              </div>
            )}
          </div>
        )}

        {/* 图谱详细度 */}
        {GRAPH_TASK_TYPES.includes(type) && (
          <div className="mb-4">
            <p className="font-label text-label-xs text-on-surface-variant mb-1.5">详细度</p>
            <div className="grid grid-cols-3 gap-2">
              {DETAIL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={detail === option.value}
                  className={`rounded-card border p-2 text-left transition-colors ${
                    detail === option.value ? 'border-primary bg-surface-container' : 'border-outline-variant'
                  }`}
                  onClick={() => setDetail(option.value)}
                >
                  <span className="block font-label text-label-sm text-on-surface">{option.label}</span>
                  <span className="block font-label text-label-xs text-on-surface-faint mt-0.5">{option.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-full font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            disabled={!canStart}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-label text-label-md disabled:opacity-40"
            onClick={handleStart}
          >
            开始生成
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptionsSheet;
