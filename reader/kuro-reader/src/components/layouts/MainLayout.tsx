import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopAppBar } from '@/components/atoms/TopAppBar';
import { BottomNavBar } from '@/components/atoms/BottomNavBar';
import { useAppStore } from '@/stores/useAppStore';
import { useStatusBar } from '@/hooks/useStatusBar';
import type { NavItem } from '@/types';

const PATH_TO_NAV: Record<string, NavItem> = {
  '/': 'home',
  '/library': 'library',
  '/import': 'import',
  '/settings': 'settings',
  '/profile': 'settings',
  '/stats': 'home',
  '/search': 'library',
  '/batch': 'library',
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
    return { variant: 'back', title: '导入漫画' };
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
  if (pathname === '/batch') {
    return { variant: 'back', title: '批量管理' };
  }
  return { variant: 'back' };
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { theme } = useAppStore();
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia(SYSTEM_DARK_QUERY).matches
  );

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

  const currentNav = PATH_TO_NAV[location.pathname] ?? 'home';
  const { variant, title } = getAppBarConfig(location.pathname);

  return (
    <div>
      <div className="bg-background text-on-background min-h-screen paper-texture relative">
        <TopAppBar variant={variant} title={title} />
        <main className="pb-32 md:pb-24">
          <Outlet />
        </main>
        <BottomNavBar active={currentNav} />
      </div>
    </div>
  );
};
