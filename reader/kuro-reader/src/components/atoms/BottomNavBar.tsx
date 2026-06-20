import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import type { NavItem } from '@/types';
import { useAppStore } from '@/stores/useAppStore';

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
        'md:hidden',
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
        'flex justify-around items-center p-2 gap-2',
        'bg-surface-container border border-outline-variant',
        'w-[calc(100%-48px)] max-w-max-width-content rounded-full',
        'mb-safe',
        'relative'
      )}
    >
     
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            data-nav-item
            className={cn(
              'relative z-10 flex flex-col items-center justify-center px-4 py-1 rounded-full transition-colors duration-200',
              isActive
                ? 'text-on-primary'
                : 'text-on-surface-variant'
            )}
            onClick={() => handleClick(item)}
          >
            <span
              className="material-symbols-outlined text-[24px] transition-[font-variation-settings] duration-300"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-label text-label-sm mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
