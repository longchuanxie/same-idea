import React, { useMemo, useState } from 'react';

import { t } from '@/i18n';
import { getKnowledgeTask } from '@/services/ai/knowledgeTasks';
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
  { value: 'core', label: t('聚焦核心'), hint: t('只留主要条目（≤8 个）') },
  { value: 'standard', label: t('标准'), hint: t('常速阅读的均衡取材') },
  { value: 'rich', label: t('尽量详尽'), hint: t('含重要次要条目（≤24 个）') },
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

  // 章节总结这类「先圈范围」的任务默认落在起止章模式——全书对它们既贵又非所求
  const [mode, setMode] = useState<'all' | 'range'>(getKnowledgeTask(type).requireScope ? 'range' : 'all');
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
        aria-label={t('自定义生成{{label}}', { label: label })}
        className="bg-surface-bright border border-outline-variant rounded-t-card-lg sm:rounded-card-lg p-5 w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-sm text-primary mb-1">{t('自定义生成{{label}}', { label: label })}</h3>
        <p className="font-label text-label-xs text-on-surface-faint mb-4">
          {totalChapters != null ? t('本书共 {{totalChapters}} 章 · ', { totalChapters: totalChapters }) : ''}
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
              <span className="block font-label text-label-sm text-on-surface">{t('只补新章节（第 {{incrementalFrom}} 章起）', { incrementalFrom: incrementalFrom })}</span>
              <span className="block font-label text-label-xs text-on-surface-variant mt-0.5">{t('在现有图谱上并入新内容，快且省——旧关系与原文依据原样保留')}</span>
            </span>
          </button>
        )}

        {/* 范围（增量时不需要） */}
        {!incremental && (
          <div className="mb-3">
            <p className="font-label text-label-xs text-on-surface-variant mb-1.5">{t('生成范围')}</p>
            <div className="flex items-center gap-2 mb-2">
              {(['all', 'range'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  className={`chip px-3 py-1.5 ${
                    mode === value ? 'chip-active' : ''
                  }`}
                  onClick={() => setMode(value)}
                >
                  {value === 'all' ? t('全书') : t('起止章')}
                </button>
              ))}
            </div>
            {mode === 'range' && (
              <div className="flex items-center gap-2">
                <span className="font-label text-label-sm text-on-surface-variant whitespace-nowrap">{t('第')}</span>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={fromText}
                  onChange={(e) => setFromText(e.target.value)}
                  placeholder="1"
                  aria-label={t('起始章')}
                  className="input-field w-20 font-mono text-label-sm"
                />
                <span className="font-label text-label-sm text-on-surface-variant whitespace-nowrap">{t('章 至 第')}</span>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={toText}
                  onChange={(e) => setToText(e.target.value)}
                  placeholder={totalChapters != null ? String(totalChapters) : t('末章')}
                  aria-label={t('结束章（留空到末尾）')}
                  className="input-field w-20 font-mono text-label-sm"
                />
                <span className="font-label text-label-sm text-on-surface-variant whitespace-nowrap">{t('章')}</span>
              </div>
            )}
          </div>
        )}

        {/* 图谱详细度 */}
        {GRAPH_TASK_TYPES.includes(type) && (
          <div className="mb-4">
            <p className="font-label text-label-xs text-on-surface-variant mb-1.5">{t('详细度')}</p>
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
            className="btn-ghost px-4 py-2"
            onClick={onClose}
          >{t('取消')}</button>
          <button
            type="button"
            disabled={!canStart}
            className="btn-primary px-5 py-2"
            onClick={handleStart}
          >{t('开始生成')}</button>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptionsSheet;
