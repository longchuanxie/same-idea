import React from 'react';

import { Button } from '@/components/atoms/Button';
import { t } from '@/i18n';

export interface SanitizeConfirmDialogProps {
  isOpen: boolean;
  /** 待确认的广告命中数 */
  hitCount: number;
  /** 命中样例（确认门前 20 条，弹窗最多展示 3 条） */
  samples: string[];
  onConfirm: () => void;
  /** 暂不：保持 pending，下次开书再问 */
  onCancel: () => void;
  /** 本书不再提示：该书广告净化关闭（排版清理不受影响） */
  onDisable: () => void;
}

const SAMPLE_DISPLAY_LIMIT = 3;

/**
 * 原文净化确认门（ConfirmDialog 形制 + 命中样例清单）。
 * 首开检测到疑似广告时弹出：立即净化 / 暂不 / 本书不再提示。
 */
export const SanitizeConfirmDialog: React.FC<SanitizeConfirmDialogProps> = ({
  isOpen,
  hitCount,
  samples,
  onConfirm,
  onCancel,
  onDisable,
}) => {
  if (!isOpen) return null;

  const shownSamples = samples.slice(0, SAMPLE_DISPLAY_LIMIT);
  const hiddenCount = Math.max(hitCount - shownSamples.length, 0);

  return (
    <div
      className="fixed inset-0 z-dialog flex items-center justify-center bg-on-background/40 animate-fade-in"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('净化原文')}
        className="bg-surface-bright rounded-card-lg shadow-raised p-6 mx-margin-mobile max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-md text-primary mb-3">{t('检测到疑似广告内容')}</h3>
        <p className="font-body text-body-md text-on-surface-variant mb-4">
          {t('共 {{count}} 处疑似广告或水印。净化后正文、听书与搜索同步生效；原始文件保留，随时可在设置里关闭还原。', { count: hitCount })}
        </p>
        {shownSamples.length > 0 && (
          <ul className="space-y-2 mb-6">
            {shownSamples.map((sample, index) => (
              <li
                key={`${index}-${sample}`}
                className="card-inner px-4 py-3 font-body text-body-sm text-on-surface-variant break-words line-clamp-2"
              >
                {sample}
              </li>
            ))}
            {hiddenCount > 0 && (
              <li className="font-label text-label-sm text-on-surface-faint px-1">
                {t('以上为部分样例，共 {{count}} 处', { count: hitCount })}
              </li>
            )}
          </ul>
        )}
        <div className="flex items-center justify-between gap-3">
          <button className="btn-ghost py-2 px-3" onClick={onDisable}>
            {t('本书不再提示')}
          </button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onCancel}>
              {t('暂不')}
            </Button>
            <Button variant="primary" onClick={onConfirm}>
              {t('立即净化')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanitizeConfirmDialog;
