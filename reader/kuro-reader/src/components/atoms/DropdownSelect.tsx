import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { cn } from '@/utils/cn';

export interface DropdownSelectOption {
  value: string;
  label: string;
  /** 置灰不可选（如安全问题重复项）；键盘导航跳过 */
  disabled?: boolean;
}

export interface DropdownSelectProps {
  /** 供外部 label 的 htmlFor 指向，同时作弹层选项 id 前缀 */
  id?: string;
  ariaLabel: string;
  options: DropdownSelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** outline：透明底描边（表单卡）；filled：实底（密保等传统表单） */
  variant?: 'outline' | 'filled';
  /** 弹层最大高度（px），选项过多时滚动 */
  maxListHeight?: number;
  className?: string;
}

/** 弹层方向估算用的每行高度与边缘余量（px） */
const OPTION_ROW_HEIGHT = 40;
const LIST_EDGE_MARGIN = 8;

/**
 * 应用令牌样式的下拉选择。原生 <select> 的展开列表由操作系统渲染
 * （白底 + 系统蓝高亮），无法与纸感主题统一，故自绘弹层。
 * 键盘交互采用 listbox 惯例：焦点保持在触发钮上，方向键移动活动项，Enter/Space 选中。
 */
export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  id,
  ariaLabel,
  options,
  value,
  onChange,
  disabled = false,
  variant = 'outline',
  maxListHeight = 288,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  /** 'down' 向下展开；下方空间不足时翻转为 'up' */
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  /** 弹层固定定位坐标（Portal 渲染到 body，规避滚动容器/折叠区的 overflow 裁剪） */
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex].label : '';

  const close = useCallback(() => {
    setOpen(false);
    setShown(false);
    setActiveIndex(-1);
  }, []);

  /** 活动项滚入可视区（选中项在展开时也走这里） */
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  /** 弹层展开动画（进 120ms；收起直接卸载，菜单类惯例） */
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  /** 外点与页面滚动即收起（滚动弹层本身除外）；原生 select 同款行为 */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) close();
    };
    const onScroll = (e: Event) => {
      if (listRef.current?.contains(e.target as Node)) return;
      close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, close]);

  const firstEnabledIndex = () => options.findIndex((option) => !option.disabled);

  const openList = () => {
    // 弹层固定定位于视口（Portal 到 body）：依触发钮位置计算坐标，下方空间不足时向上翻
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const estimate = Math.min(maxListHeight, options.length * OPTION_ROW_HEIGHT + LIST_EDGE_MARGIN);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < estimate && rect.top > spaceBelow;
      setDirection(openUp ? 'up' : 'down');
      setPos(
        openUp
          ? { left: rect.left, width: rect.width, top: Math.max(LIST_EDGE_MARGIN, rect.top - estimate - LIST_EDGE_MARGIN) }
          : { left: rect.left, width: rect.width, top: rect.bottom + LIST_EDGE_MARGIN }
      );
    }
    setOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex());
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close();
    triggerRef.current?.focus();
  };

  /** 从 index 起按 step 方向找第一个可选项；Home 传 (-1, 1)、End 传 (options.length, -1) */
  const moveActive = (index: number, step: 1 | -1) => {
    let next = index;
    for (let i = 0; i < options.length; i += 1) {
      next = (next + step + options.length) % options.length;
      if (!options[next].disabled) {
        setActiveIndex(next);
        return;
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveActive(activeIndex, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(activeIndex, -1);
        break;
      case 'Home':
        e.preventDefault();
        moveActive(-1, 1);
        break;
      case 'End':
        e.preventDefault();
        moveActive(options.length, -1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(activeIndex);
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (open ? close() : openList())}
        className={cn(
          'flex w-full items-center justify-between gap-2 border rounded-lg text-left',
          'font-body focus:outline-none focus:border-primary transition-colors',
          variant === 'outline'
            ? 'bg-transparent border-outline-variant/50 px-3 py-2 text-body-sm text-primary'
            : 'bg-surface-container-low border-outline-variant px-4 py-3 text-body-sm text-on-surface',
          disabled && 'opacity-60 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
      >
        <span className={cn('truncate', !selectedLabel && 'text-on-surface-faint')}>{selectedLabel || '请选择'}</span>
        <span
          aria-hidden="true"
          className={cn(
            'material-symbols-outlined text-icon-sm text-on-surface-variant shrink-0 transition-transform duration-flow',
            open && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>
      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            aria-label={ariaLabel}
            style={{ maxHeight: maxListHeight, top: pos.top, left: pos.left, width: pos.width }}
            className={cn(
              'fixed z-50 py-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-paper-up overflow-y-auto',
              'transition-[opacity,transform] duration-instant ease-out',
              direction === 'down' ? 'origin-top' : 'origin-bottom',
              shown ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onPointerMove={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2 font-body text-body-sm cursor-pointer',
                    isActive || 'hover:bg-surface-container-low',
                    option.disabled && 'opacity-40 cursor-not-allowed',
                    isSelected ? 'text-primary' : 'text-on-surface'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <span aria-hidden="true" className="material-symbols-outlined text-icon-sm text-primary shrink-0">
                      check
                    </span>
                  )}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
};

export default DropdownSelect;
