import React, { useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/stores/useAppStore';
import type { NavItem } from '@/types';
import { cn } from '@/utils/cn';

interface NavConfig {
  key: NavItem;
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavConfig[] = [
  { key: 'home', label: '首页', icon: 'home', path: '/' },
  { key: 'library', label: '书库', icon: 'auto_stories', path: '/library' },
  { key: 'import', label: '导入', icon: 'upload_file', path: '/import' },
  { key: 'settings', label: '设置', icon: 'settings', path: '/settings' },
];

export interface BottomNavBarProps {
  active?: NavItem;
}

/** 贴边实心底栏（建议书 5.1）——馆内楼层指示：纸底 + 顶部细线，
 *  激活项 = 图标填充 + 下方 2px 书脊线；不再悬浮、不再遮挡批量操作条。 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({ active = 'home' }) => {
  const navigate = useNavigate();
  const { setActiveNav } = useAppStore();
  const navRef = useRef<HTMLElement>(null);

  const handleClick = (item: NavConfig) => {
    setActiveNav(item.key);
    navigate(item.path);
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        'lg:hidden',
        'fixed bottom-0 inset-x-0 z-50',
        'bg-surface border-t border-outline-variant',
        'flex items-stretch px-2 pt-1',
        'pb-safe'
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            data-nav-item
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded',
              'transition-colors duration-instant ease-instant',
              isActive ? 'text-primary' : 'text-on-surface-variant'
            )}
            onClick={() => handleClick(item)}
          >
            <span
              className="material-symbols-outlined text-icon-lg transition-[font-variation-settings] duration-flow"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-label text-label-sm">{item.label}</span>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
