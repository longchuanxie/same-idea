import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '@/components/layouts/MainLayout';
import { AuthGuard } from '@/components/layouts/AuthGuard';
import { HomePage } from '@/pages/Home';
import { LibraryPage } from '@/pages/Library';
import { SubLibraryPage } from '@/pages/SubLibrary';
import { BookDetailPage } from '@/pages/BookDetail';
import { ReaderPage } from '@/pages/Reader';
import { TextReaderPage } from '@/pages/TextReader';
import { ImportPage } from '@/pages/Import';
import { CustomCloudPage } from '@/pages/CustomCloud';
import { SettingsPage } from '@/pages/Settings';
import { StatsPage } from '@/pages/Stats';
import { ProfilePage } from '@/pages/Profile';
import { SearchPage } from '@/pages/Search';
import { TagsPage } from '@/pages/Tags';
import { AuthPage } from '@/pages/Auth';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
const FONT_SCALE_BASE = 16;
const BODY_LINE_HEIGHT_RATIO = 1.75;
const BODY_SMALL_SCALE = 0.875;
const BODY_LARGE_SCALE = 1.125;

const getBodyFontFamily = (fontFamily: 'literata' | 'inter'): string =>
  fontFamily === 'literata' ? "'Literata', serif" : "'Inter', sans-serif";

const App: React.FC = () => {
  const { theme, settings } = useAppStore();

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
        </Route>
        <Route path={ROUTES.BOOK_DETAIL} element={<BookDetailPage />} />
        <Route path={ROUTES.READER} element={<ReaderPage />} />
        <Route path={ROUTES.TEXT_READER} element={<TextReaderPage />} />
        <Route path={ROUTES.CUSTOM_CLOUD} element={<CustomCloudPage />} />
        <Route path={ROUTES.TAGS} element={<TagsPage />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
