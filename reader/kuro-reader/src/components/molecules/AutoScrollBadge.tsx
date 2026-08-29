import React from 'react';

/** 自动滚动进行中的右下角悬浮标识 */
export const AutoScrollBadge: React.FC = () => (
  <div className="fixed bottom-20 right-4 z-40 pointer-events-none">
    <div className="bg-primary/80 backdrop-blur-sm rounded-full px-3 py-1 animate-pulse">
      <span className="font-label text-label-sm text-on-primary">自动滚动中</span>
    </div>
  </div>
);
