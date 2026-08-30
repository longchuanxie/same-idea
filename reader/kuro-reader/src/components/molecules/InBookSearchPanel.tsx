import React, { useEffect, useMemo, useState } from 'react';

import { COPY } from '@/constants/copy';
import type { TextChapter } from '@/services/textContent';
import { MIN_QUERY_CHARS, searchChapters, type SearchHit } from '@/utils/textSearch';

/** 输入防抖：避免逐键全量扫描大书 */
const INPUT_DEBOUNCE_MS = 300;
const INPUT_MAX_CHARS = 50;

interface InBookSearchPanelProps {
  chapters: TextChapter[];
  /** 点击命中：调用方负责定位并关闭面板 */
  onSelectHit: (hit: SearchHit) => void;
  onClose: () => void;
}

/** 书内全文检索面板（底部抽屉，样式同书签/手记面板） */
export const InBookSearchPanel: React.FC<InBookSearchPanelProps> = ({
  chapters,
  onSelectHit,
  onClose,
}) => {
  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(input), INPUT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const hits = useMemo(() => searchChapters(chapters, debounced), [chapters, debounced]);
  const queryEffective = debounced.trim().length >= MIN_QUERY_CHARS;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-on-background/40 animate-fade-in" onClick={onClose} />

      {/* 面板 */}
      <div className="relative bg-surface rounded-t-card-lg max-h-[70vh] flex flex-col animate-slide-up shadow-raised">
        {/* 标题栏 + 检索输入 */}
        <div className="px-5 py-4 border-b border-outline-variant/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-headline-sm text-primary">{COPY.searchInBook.title}</h3>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
              onClick={onClose}
              aria-label={COPY.annotation.close}
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, INPUT_MAX_CHARS))}
              placeholder={COPY.searchInBook.placeholder}
              autoFocus
              className="flex-1 bg-transparent text-on-surface font-body text-body-sm focus:outline-none placeholder:text-on-surface-variant/40"
            />
            {input && (
              <button
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
                onClick={() => setInput('')}
                aria-label="清空"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* 结果列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!queryEffective ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl opacity-40">search</span>
              <p className="font-label text-label-sm text-on-surface-variant opacity-40">{COPY.searchInBook.hint}</p>
            </div>
          ) : hits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl opacity-40">
                search_off
              </span>
              <p className="font-body text-body-md text-on-surface-variant opacity-60">
                {COPY.searchInBook.noResults}
              </p>
            </div>
          ) : (
            <div className="py-2">
              <p className="px-5 pb-1 font-label text-label-xs text-on-surface-faint">
                {COPY.searchInBook.hitCount(hits.length)}
              </p>
              {hits.map((hit) => (
                <button
                  key={`${hit.chapterIndex}-${hit.offset}`}
                  className="w-full text-left mx-0 px-5 py-3 hover:bg-surface-variant/50 transition-colors border-b border-outline-variant/30"
                  onClick={() => onSelectHit(hit)}
                >
                  <p className="font-label text-label-sm text-primary mb-1">{hit.chapterTitle}</p>
                  <p className="font-body text-body-sm text-on-surface/80 leading-relaxed">
                    {hit.before}
                    <mark className="bg-primary/20 text-on-surface rounded px-0.5">{hit.match}</mark>
                    {hit.after}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
