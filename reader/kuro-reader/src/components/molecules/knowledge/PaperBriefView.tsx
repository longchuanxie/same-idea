import React from 'react';

import { useNavigate } from 'react-router-dom';

import { EntryReviseActions, VerifiedBadge } from '@/components/molecules/knowledge/ReviseControls';
import { knowledgeSourcePath } from '@/constants/routes';
import type { Book, ContributionStrength, KnowledgeEvidence, PaperBriefData } from '@/types';
import type { BriefSection } from '@/utils/knowledgeEdit';

/**
 * 论文速览与批判卡：研究型读者的读前分流与批判性阅读。
 * 自闭环——TL;DR/贡献/局限/疑问全部在查看器内消费，
 * 每条结论带原文定位，一点跳回上下文，无需导出到任何外部工具。
 * 修订模式下每条要点可改/删/盖校章（证据原句不受影响）。
 */

const STRENGTH_LABELS: Record<ContributionStrength, string> = {
  experiment: '实验支撑',
  theory: '理论证明',
  partial: '部分支撑',
  claim: '仅声称',
};

/** 强度徽标的视觉分级：实底=硬证据，描边=软声称 */
const STRENGTH_STYLES: Record<ContributionStrength, string> = {
  experiment: 'option-active',
  theory: 'bg-primary/90 text-on-primary border-primary',
  partial: 'bg-surface-container text-on-surface border-outline-variant',
  claim: 'bg-transparent text-on-surface-variant border-outline-variant',
};

interface EvidenceJumpProps {
  book: Book;
  evidence: KnowledgeEvidence;
  title: string;
}

/** 证据摘句块：点击跳回原文（章内占比坐标） */
const EvidenceJump: React.FC<EvidenceJumpProps> = ({ book, evidence, title }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="self-start text-left max-w-full px-2.5 py-1 rounded-card border-l-2 border-seal bg-surface-container-low font-body text-label-md text-on-surface-variant italic truncate hover:text-on-surface transition-colors"
      onClick={() => navigate(knowledgeSourcePath(book, evidence.chapterIndex, evidence.offsetRatio))}
      title={title}
    >
      「{evidence.quote}」
    </button>
  );
};

interface SectionProps {
  title: string;
  icon: string;
  count: number;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, count, children }) => (
  <section className="mb-5">
    <div className="flex items-center gap-2 mb-2">
      <span className="material-symbols-outlined text-icon-md text-primary">{icon}</span>
      <h3 className="font-label text-label-md text-primary">{title}</h3>
      <span className="font-mono text-label-xs text-on-surface-faint">{count}</span>
    </div>
    {children}
  </section>
);

interface PaperBriefViewProps {
  data: PaperBriefData;
  book: Book;
  /** 修订模式：渲染条目级修订控件 */
  revising?: boolean;
  onEditTldr?: () => void;
  onEditEntry?: (section: BriefSection, index: number) => void;
  onRemoveEntry?: (section: BriefSection, index: number) => void;
  onToggleEntryVerified?: (section: BriefSection, index: number) => void;
}

export const PaperBriefView: React.FC<PaperBriefViewProps> = ({
  data,
  book,
  revising = false,
  onEditTldr,
  onEditEntry,
  onRemoveEntry,
  onToggleEntryVerified,
}) => (
  <div className="p-5 overflow-y-auto max-h-[68vh]" data-ui-control>
    {data.tldr && (
      <div className="mb-5 rounded-card border border-outline-variant bg-surface-container-low p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-label text-label-xs text-on-surface-faint">一句话速览</p>
          {revising && onEditTldr && (
            <button
              aria-label="改一句话速览"
              className="w-7 h-7 -mr-1 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              onClick={onEditTldr}
            >
              <span className="material-symbols-outlined text-icon-sm">edit</span>
            </button>
          )}
        </div>
        <p className="font-body text-body-md text-on-surface leading-relaxed">{data.tldr}</p>
      </div>
    )}

    <Section title="贡献点（按证据强度）" icon="verified" count={data.contributions.length}>
      <ul className="flex flex-col gap-2">
        {data.contributions.map((entry, index) => (
          <li key={`${entry.point}-${index}`} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full border font-label text-label-xs ${STRENGTH_STYLES[entry.strength]}`}
              >
                {STRENGTH_LABELS[entry.strength]}
              </span>
              <span className="font-label text-label-md text-on-surface leading-snug flex-1">{entry.point}</span>
              {entry.verified && <VerifiedBadge />}
              {revising && onEditEntry && onRemoveEntry && onToggleEntryVerified && (
                <EntryReviseActions
                  verified={entry.verified}
                  entryLabel={entry.point}
                  onEdit={() => onEditEntry('contributions', index)}
                  onRemove={() => onRemoveEntry('contributions', index)}
                  onToggleVerified={() => onToggleEntryVerified('contributions', index)}
                />
              )}
            </div>
            {entry.evidence && <EvidenceJump book={book} evidence={entry.evidence} title={entry.point} />}
          </li>
        ))}
        {data.contributions.length === 0 && (
          <li className="font-label text-label-sm text-on-surface-faint">文本中没有明确声称的贡献点</li>
        )}
      </ul>
    </Section>

    <Section title="局限与软肋" icon="report_problem" count={data.limitations.length}>
      <ul className="flex flex-col gap-2">
        {data.limitations.map((entry, index) => (
          <li key={`${entry.point}-${index}`} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <span className="font-label text-label-md text-on-surface leading-snug flex-1">{entry.point}</span>
              {entry.verified && <VerifiedBadge />}
              {revising && onEditEntry && onRemoveEntry && onToggleEntryVerified && (
                <EntryReviseActions
                  verified={entry.verified}
                  entryLabel={entry.point}
                  onEdit={() => onEditEntry('limitations', index)}
                  onRemove={() => onRemoveEntry('limitations', index)}
                  onToggleVerified={() => onToggleEntryVerified('limitations', index)}
                />
              )}
            </div>
            {entry.evidence && <EvidenceJump book={book} evidence={entry.evidence} title={entry.point} />}
          </li>
        ))}
        {data.limitations.length === 0 && (
          <li className="font-label text-label-sm text-on-surface-faint">文本中没有可见的局限陈述</li>
        )}
      </ul>
    </Section>

    <Section title="审稿人视角的疑问" icon="help" count={data.questions.length}>
      <ul className="flex flex-col gap-2">
        {data.questions.map((entry, index) => (
          <li key={`${entry.question}-${index}`} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <span className="font-label text-label-md text-on-surface leading-snug flex-1">{entry.question}</span>
              {entry.verified && <VerifiedBadge />}
              {revising && onEditEntry && onRemoveEntry && onToggleEntryVerified && (
                <EntryReviseActions
                  verified={entry.verified}
                  entryLabel={entry.question}
                  onEdit={() => onEditEntry('questions', index)}
                  onRemove={() => onRemoveEntry('questions', index)}
                  onToggleVerified={() => onToggleEntryVerified('questions', index)}
                />
              )}
            </div>
            {entry.evidence && <EvidenceJump book={book} evidence={entry.evidence} title={entry.question} />}
          </li>
        ))}
        {data.questions.length === 0 && (
          <li className="font-label text-label-sm text-on-surface-faint">没有生成疑问</li>
        )}
      </ul>
    </Section>
  </div>
);

export default PaperBriefView;
