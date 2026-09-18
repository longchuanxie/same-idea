import React, { useEffect, useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { BottomNavBar } from '@/components/atoms/BottomNavBar';
import { TopAppBar } from '@/components/atoms/TopAppBar';
import { DesktopSideBar } from '@/components/layouts/DesktopSideBar';
import { getAppBarConfig, resolveNav } from '@/components/layouts/mainLayoutChrome';
import { useStatusBar } from '@/hooks/useStatusBar';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/utils/cn';
import { computePaperOpacity, getPaperBaseOpacity, getPaperConfig } from '@/utils/paperTexture';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

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
    <div className="h-full">
      <div
        className="bg-background text-on-background h-full overflow-y-auto overscroll-contain paper-texture relative"
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
          {variant !== 'none' && <TopAppBar variant={variant} title={title} />}
          <main className="pb-32 md:pb-24 lg:pb-12">
            <Outlet />
          </main>
        </div>
        <BottomNavBar active={currentNav} />
      </div>
    </div>
  );
};
