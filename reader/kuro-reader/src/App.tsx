import React, { useEffect } from 'react';

import { App as CapacitorApp } from '@capacitor/app';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ToastHost } from '@/components/atoms/Toast';
import { AuthGuard } from '@/components/layouts/AuthGuard';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ROUTES } from '@/constants/routes';
import { AuthPage } from '@/pages/Auth';
import { BookDetailPage } from '@/pages/BookDetail';
import { CustomCloudPage } from '@/pages/CustomCloud';
import { HomePage } from '@/pages/Home';
import { ImportPage } from '@/pages/Import';
import { LibraryPage } from '@/pages/Library';
import { NotesPage } from '@/pages/Notes';
import { ProfilePage } from '@/pages/Profile';
import { ReaderPage } from '@/pages/Reader';
import { SearchPage } from '@/pages/Search';
import { SettingsPage } from '@/pages/Settings';
import { StatsPage } from '@/pages/Stats';
import { SubLibraryPage } from '@/pages/SubLibrary';
import { TagsPage } from '@/pages/Tags';
import { TextReaderPage } from '@/pages/TextReader';
import { consumeBackPress } from '@/services/backHandler';
import { useAppStore } from '@/stores/useAppStore';
import { isNativePlatform } from '@/utils/capacitor';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
const FONT_SCALE_BASE = 16;
const BODY_LINE_HEIGHT_RATIO = 1.75;
const BODY_SMALL_SCALE = 0.875;
const BODY_LARGE_SCALE = 1.125;

const getBodyFontFamily = (fontFamily: 'literata' | 'inter'): string =>
  fontFamily === 'literata' ? "'Literata', serif" : "'Inter', sans-serif";

const App: React.FC = () => {
  const { theme, settings } = useAppStore();

  // Android 硬件返回键：浮层优先关闭 → 路由后退 → 退出应用
  useEffect(() => {
    if (!isNativePlatform()) return;
    let removeListener: (() => void) | undefined;

    CapacitorApp.addListener('backButton', () => {
      if (consumeBackPress()) return;
      // react-router v6 在 history.state.idx 记录栈内位置
      if (window.history.state?.idx > 0) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    }).then((listener) => {
      removeListener = () => listener.remove();
    });

    return () => removeListener?.();
  }, []);

  // Web/桌面 Escape：与 Android 返回键同源消费（统一返回协议，建议书 4.2）——
  // 浮层（已注册 backHandler）优先逐层关闭，无浮层时路由后退
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (consumeBackPress()) return;
      if (window.history.state?.idx > 0) {
        window.history.back();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);

    const applyTheme = () => {
      const shouldUseDarkTheme = theme === 'dark' || (theme === 'auto' && mediaQuery.matches);
      root.classList.toggle('dark', shouldUseDarkTheme);
      root.dataset.theme = shouldUseDarkTheme ? 'dark' : 'light';
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const bodyFontSize = settings.fontSize;
    const bodyLineHeight = Math.round(bodyFontSize * BODY_LINE_HEIGHT_RATIO);

    root.style.setProperty('--app-body-font-family', getBodyFontFamily(settings.fontFamily));
    root.style.setProperty('--app-body-font-size', `${bodyFontSize}px`);
    root.style.setProperty('--app-body-line-height', `${bodyLineHeight}px`);
    root.style.setProperty('--app-body-sm-font-size', `${Math.round(bodyFontSize * BODY_SMALL_SCALE)}px`);
    root.style.setProperty('--app-body-lg-font-size', `${Math.round(bodyFontSize * BODY_LARGE_SCALE)}px`);
    root.style.setProperty('--app-font-scale', `${bodyFontSize / FONT_SCALE_BASE}`);
  }, [settings.fontFamily, settings.fontSize]);

  return (
    <BrowserRouter>
      <ToastHost />
      <Routes>
        <Route path={ROUTES.AUTH} element={<AuthPage />} />
        <Route
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
          <Route path={ROUTES.SUB_LIBRARY} element={<SubLibraryPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path={ROUTES.IMPORT} element={<ImportPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.STATS} element={<StatsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.NOTES} element={<NotesPage />} />
          <Route path={ROUTES.TAGS} element={<TagsPage />} />
        </Route>
        <Route path={ROUTES.BOOK_DETAIL} element={<BookDetailPage />} />
        <Route path={ROUTES.READER} element={<ReaderPage />} />
        <Route path={ROUTES.TEXT_READER} element={<TextReaderPage />} />
        <Route path={ROUTES.CUSTOM_CLOUD} element={<CustomCloudPage />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
