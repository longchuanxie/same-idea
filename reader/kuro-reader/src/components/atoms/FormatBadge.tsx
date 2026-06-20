import React from 'react';
import type { BookFormat } from '@/types';

const FORMAT_CONFIG: Record<BookFormat, { label: string; color: string }> = {
  comic: { label: '漫画', color: 'bg-blue-500/15 text-blue-600' },
  pdf:   { label: 'PDF',  color: 'bg-red-500/15 text-red-600' },
  text:  { label: '文本', color: 'bg-emerald-500/15 text-emerald-600' },
};

interface FormatBadgeProps {
  format?: BookFormat;
  /** 默认尺寸较小用于卡片角落，large 用于详情页 */
  size?: 'small' | 'large';
  className?: string;
}

/**
 * 书籍格式标签。
 * - comic / undefined → 不显示（默认格式，保持 UI 简洁）
 * - text → 绿色 "文本"
 * - pdf → 红色 "PDF"
 */
export const FormatBadge: React.FC<FormatBadgeProps> = ({ format, size = 'small', className = '' }) => {
  // comic 和 undefined 不显示标签（向后兼容）
  if (!format || format === 'comic') return null;

  const config = FORMAT_CONFIG[format];
  if (!config) return null;

  const sizeClass = size === 'small'
    ? 'text-[10px] px-1.5 py-0.5 leading-none'
    : 'text-label-sm px-2 py-1';

  return (
    <span
      className={`inline-block font-label font-medium rounded ${config.color} ${sizeClass} ${className}`}
    >
      {config.label}
    </span>
  );
};
