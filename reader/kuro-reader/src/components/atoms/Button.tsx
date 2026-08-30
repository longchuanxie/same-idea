import React, { type ButtonHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

/** 统一按钮（建议书 7.1）——收敛全应用 21 处自造按钮样式的唯一入口。
 *  variant：primary 墨底 / accent 朱砂底（每屏至多一个）/ secondary 纸片 / ghost 文字 / destructive 摘除。
 *  primary 与 accent 带书签切角（品牌母题，每元素至多一处）。 */
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-label-sm gap-1',
  md: 'h-10 px-4 text-label-md gap-1.5',
  lg: 'h-12 px-5 text-label-md gap-2',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90 active:opacity-80',
  accent: 'bg-seal text-on-primary hover:bg-seal-deep',
  secondary:
    'bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container',
  ghost: 'text-primary hover:bg-surface-container',
  destructive: 'text-seal hover:bg-seal-soft',
};

/** 书签切角：右下 45° 裁切 8px */
const RIBBON_CUT = 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  style,
  children,
  ...rest
}) => {
  const cutCorner = variant === 'primary' || variant === 'accent';
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-label transition-all duration-instant ease-instant select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      style={cutCorner ? { clipPath: RIBBON_CUT, ...style } : style}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
