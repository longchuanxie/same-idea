import React, { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { APP_CONFIG } from '@/constants/config';
import { ROUTES, subLibraryPath } from '@/constants/routes';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { cn } from '@/utils/cn';
import { formatBytes } from '@/utils/formatBytes';
import { getStorageUsage } from '@/utils/storage';


export interface DesktopSideBarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

interface NavItemConfig {
  label: string;
  icon: string;
  path: string;
  /** 激活匹配：pathname 等于或以 path + '/' 开头 */
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { label: '首页', icon: 'home', path: ROUTES.HOME, match: (p) => p === '/' },
  {
    label: '书库',
    icon: 'auto_stories',
    path: ROUTES.LIBRARY,
    match: (p) => p === '/library',
  },
  { label: '手记', icon: 'edit_note', path: ROUTES.NOTES, match: (p) => p.startsWith('/notes') },
  { label: '台账', icon: 'bar_chart', path: ROUTES.STATS, match: (p) => p.startsWith('/stats') },
  {
    label: '设置',
    icon: 'settings',
    path: ROUTES.SETTINGS,
    match: (p) => p.startsWith('/settings') || p.startsWith('/profile'),
  },
];

/** 桌面常驻侧边栏 ——「馆内导览牌」（建议书 5.2）：lg+ 显示，修复桌面端无导航。
 *  材质从「整面木底」修正为纸底 + 黄铜激活书脊线：白字落木底对比度不足 4.5:1，
 *  依「可用性胜过隐喻」总纲调整；木质保留为 logo 区下的木质细线。 */
export const DesktopSideBar: React.FC<DesktopSideBarProps> = ({ collapsed, onToggleCollapsed }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { books, subLibraries, tags } = useLibraryStore();
  const [storage, setStorage] = useState<{ used: number; quota: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStorageUsage().then((usage) => {
      if (!cancelled) setStorage(usage);
    });
    return () => {
      cancelled = true;
    };
  }, [books.length]);

  const inLibraryTree = pathname.startsWith('/library/');
  const storagePct =
    storage && storage.quota > 0 ? Math.min(100, (storage.used / storage.quota) * 100) : 0;

  return (
    <aside
      className={cn(
        'hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col',
        'bg-surface-container-low border-r border-outline-variant',
        'transition-[width] duration-flow ease-flow',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* 馆名牌 */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-headline-sm text-primary font-bold tracking-tight truncate">
              {APP_CONFIG.name}
            </div>
            <div className="font-label text-label-sm text-on-surface-faint mt-0.5">私人图书馆</div>
          </div>
        )}
        <button
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          onClick={onToggleCollapsed}
        >
          <span className="material-symbols-outlined text-icon-md">
            {collapsed ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>
      {/* 木质细线（黄铜备选）：结构性装饰，唯一木质元素 */}
      <div className="mx-4 h-px bg-wood/50" aria-hidden="true" />

      {/* 主导航 */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);
          return (
            <button
              key={item.path}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'relative w-full flex items-center gap-3 h-10 px-3 rounded transition-colors duration-instant',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-surface-container text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
              )}
              onClick={() => navigate(item.path)}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-lamp"
                />
              )}
              <span className="material-symbols-outlined text-icon-lg">{item.icon}</span>
              {!collapsed && <span className="font-label text-label-md">{item.label}</span>}
            </button>
          );
        })}

        {/* 特藏室（子书库树） */}
        {!collapsed && subLibraries.length > 0 && (
          <div className="pt-4">
            <div className="px-3 mb-1 font-label text-label-sm text-on-surface-faint">特藏室</div>
            {subLibraries.map((sl) => {
              const isActive = pathname === subLibraryPath(sl.id);
              return (
                <button
                  key={sl.id}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative w-full flex items-center justify-between gap-2 h-9 px-3 pl-6 rounded transition-colors duration-instant truncate',
                    isActive
                      ? 'bg-surface-container text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
                  )}
                  onClick={() => navigate(subLibraryPath(sl.id))}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-3 top-1.5 bottom-1.5 w-0.5 rounded-full bg-lamp"
                    />
                  )}
                  <span className="font-label text-label-sm truncate">{sl.name}</span>
                  <span className="font-mono text-label-sm text-on-surface-faint flex-shrink-0">
                    {sl.bookIds.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {collapsed && inLibraryTree && <div className="py-1 text-center">·</div>}

        {/* 分类目录 */}
        <button
          aria-current={pathname.startsWith('/tags') ? 'page' : undefined}
          title={collapsed ? '分类目录' : undefined}
          className={cn(
            'relative w-full flex items-center gap-3 h-10 px-3 rounded transition-colors duration-instant',
            collapsed && 'justify-center px-0',
            pathname.startsWith('/tags')
              ? 'bg-surface-container text-primary'
              : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
          )}
          onClick={() => navigate(ROUTES.TAGS)}
        >
          {pathname.startsWith('/tags') && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-lamp"
            />
          )}
          <span className="material-symbols-outlined text-icon-lg">sell</span>
          {!collapsed && (
            <span className="font-label text-label-md flex-1 text-left">分类目录</span>
          )}
          {!collapsed && (
            <span className="font-mono text-label-sm text-on-surface-faint">{tags.length}</span>
          )}
        </button>
      </nav>

      {/* 馆容量 */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-outline-variant">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-label text-label-sm text-on-surface-faint">馆容量</span>
            <span className="font-mono text-label-sm text-on-surface-variant">
              {books.length} 本藏书
            </span>
          </div>
          <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full bg-wood rounded-full transition-all duration-flow"
              style={{ width: `${storagePct}%` }}
            />
          </div>
          {storage && storage.quota > 0 && (
            <div className="font-mono text-label-sm text-on-surface-faint mt-1">
              {formatBytes(storage.used)} / {formatBytes(storage.quota)}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default DesktopSideBar;
