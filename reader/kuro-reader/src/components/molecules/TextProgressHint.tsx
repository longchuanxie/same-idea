import React from 'react';

import { cn } from '@/utils/cn';

interface TextProgressHintProps {
  visible: boolean;
  overallPercent: number;
  estimatedTimeLeft: string;
}

/** 页末常驻阅读进度指示器（拖动进度条或翻页时浮现；Toast 层级，盖过阅读器底栏） */
export const TextProgressHint: React.FC<TextProgressHintProps> = ({
  visible,
  overallPercent,
  estimatedTimeLeft,
}) => (
  <div
    aria-hidden={!visible}
    className={cn(
      'fixed bottom-gutter right-margin-mobile z-toast pointer-events-none mb-safe transition-all duration-300',
      visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
    )}
  >
    <div className="bg-on-surface/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
      {estimatedTimeLeft && (
        <span className="font-label text-label-sm text-surface opacity-80">{estimatedTimeLeft}</span>
      )}
      <span className="font-label text-label-sm text-surface tabular-nums">
        全书 {overallPercent}%
      </span>
    </div>
  </div>
);
