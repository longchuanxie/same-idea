import React from 'react';

interface SpeechBadgeProps {
  rate: number;
  paused: boolean;
  onCycleRate: () => void;
  onPauseResume: () => void;
  onStop: () => void;
}

/** 听书进行中的悬浮控制条：倍速 / 暂停恢复 / 停止 */
export const SpeechBadge: React.FC<SpeechBadgeProps> = ({
  rate,
  paused,
  onCycleRate,
  onPauseResume,
  onStop,
}) => (
  <div className="fixed bottom-36 right-4 z-40">
    <div className="bg-primary/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-lg">
      <span className="font-label text-label-sm text-on-primary pl-1.5">听书 {rate}x</span>
      <button
        className="w-7 h-7 rounded-full flex items-center justify-center text-on-primary hover:bg-on-primary/20 transition-colors"
        onClick={onCycleRate}
        aria-label="切换倍速"
        data-ui-control
      >
        <span className="material-symbols-outlined text-[16px]">speed</span>
      </button>
      <button
        className="w-7 h-7 rounded-full flex items-center justify-center text-on-primary hover:bg-on-primary/20 transition-colors"
        onClick={onPauseResume}
        aria-label={paused ? '继续播报' : '暂停播报'}
        data-ui-control
      >
        <span className="material-symbols-outlined text-[18px]">{paused ? 'play_arrow' : 'pause'}</span>
      </button>
      <button
        className="w-7 h-7 rounded-full flex items-center justify-center text-on-primary hover:bg-on-primary/20 transition-colors"
        onClick={onStop}
        aria-label="停止听书"
        data-ui-control
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  </div>
);
