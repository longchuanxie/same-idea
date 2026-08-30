import React, { useEffect, useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNavBar } from '@/components/atoms/BottomNavBar';
import { TopAppBar } from '@/components/atoms/TopAppBar';
import { DesktopSideBar } from '@/components/layouts/DesktopSideBar';
import { useStatusBar } from '@/hooks/useStatusBar';
import { useAppStore } from '@/stores/useAppStore';
import type { NavItem } from '@/types';
import { cn } from '@/utils/cn';
import { computePaperOpacity, getPaperBaseOpacity, getPaperConfig } from '@/utils/paperTexture';

/** 底栏高亮显式映射（建议书 5.2）：按路由前缀匹配。
 *  stats/search/profile 不属于任何底栏 tab，就近归属其入口页：统计与检索从首页/书库顶栏进入。 */
const resolveNav = (pathname: string): NavItem => {
  if (pathname.startsWith('/library')) return 'library';
  if (pathname.startsWith('/import')) return 'import';
  if (pathname.startsWith('/settings') || pathname.startsWith('/profile')) return 'settings';
  if (pathname.startsWith('/stats')) return 'home';
  if (pathname.startsWith('/search')) return 'library';
  return 'home';
};

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

interface AppBarConfig {
  variant: 'home' | 'default' | 'back' | 'detail';
  title?: string;
}

const getAppBarConfig = (pathname: string): AppBarConfig => {
  if (pathname === '/') {
    return { variant: 'home' };
  }
  if (pathname === '/library') {
    return { variant: 'default', title: '书库' };
  }
  if (pathname.startsWith('/library/')) {
    return { variant: 'back', title: '子书库' };
  }
  if (pathname === '/import') {
    return { variant: 'back', title: '导入书籍' };
  }
  if (pathname === '/import/custom-cloud') {
    return { variant: 'back', title: '自定义云盘' };
  }
  if (pathname === '/settings') {
    return { variant: 'back', title: '设置' };
  }
  if (pathname === '/profile') {
    return { variant: 'back', title: '个人中心' };
  }
  if (pathname === '/stats') {
    return { variant: 'back', title: '阅读统计' };
  }
  if (pathname === '/search') {
    return { variant: 'back', title: '搜索' };
  }
  if (pathname === '/notes') {
    return { variant: 'back', title: '手记' };
  }
  if (pathname === '/tags') {
    return { variant: 'back', title: '分类目录' };
  }
  return { variant: 'back' };
};

const SIDEBAR_COLLAPSED_KEY = 'kuro-sidebar-collapsed';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { theme, settings } = useAppStore();
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia(SYSTEM_DARK_QUERY).matches
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleChange = () => setSystemPrefersDark(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const isDark = theme === 'dark' || (theme === 'auto' && systemPrefersDark);
  useStatusBar(isDark);

  const currentNav = resolveNav(location.pathname);
  const { variant, title } = getAppBarConfig(location.pathname);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, prev ? '0' : '1');
      } catch {
        // localStorage 不可用时仅内存态切换
      }
      return !prev;
    });
  };

  return (
    <div>
      <div
        className="bg-background text-on-background min-h-screen paper-texture relative"
        style={{ isolation: 'isolate' }}
      >
        {settings.paperMode && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[-1]"
            style={{
              backgroundImage: getPaperConfig('coated').svgFilter(
                computePaperOpacity(settings.textureIntensity, getPaperBaseOpacity('coated'), isDark)
              ),
              mixBlendMode: 'multiply',
            }}
          />
        )}
        <DesktopSideBar collapsed={sidebarCollapsed} onToggleCollapsed={toggleSidebar} />
        <div
          className={cn(
            'transition-[padding] duration-flow ease-flow',
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
          )}
        >
          <TopAppBar variant={variant} title={title} />
          <main className="pb-32 md:pb-24 lg:pb-12">
            <Outlet />
          </main>
        </div>
        <BottomNavBar active={currentNav} />
      </div>
    </div>
  );
};
