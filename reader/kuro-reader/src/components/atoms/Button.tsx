import React, { type ButtonHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

/** 统一按钮（建议书 7.1）——收敛全应用自造按钮样式的唯一入口。
 *  variant：primary 墨底 / accent 朱砂底（每屏至多一个）/ secondary 透明描边 / ghost 文字 / destructive 摘除。
 *  形状统一 6px 方角（rounded-card）；品牌感由色板承担，形上不做装饰性裁切（§0.3/§0.11 判例）。 */
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-label-sm gap-1',
  md: 'h-10 px-4 text-label-md gap-1.5',
  lg: 'h-12 px-5 text-label-md gap-2',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-seal-strong text-on-seal hover:bg-seal-deep active:opacity-80',
  accent: 'bg-seal-strong text-on-seal hover:bg-seal-deep',
  secondary: 'bg-transparent text-primary border border-outline-variant hover:bg-surface-container',
  ghost: 'text-primary hover:bg-surface-container',
  destructive: 'text-seal hover:bg-seal-soft',
};

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
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-card font-label transition-all duration-instant ease-instant select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
