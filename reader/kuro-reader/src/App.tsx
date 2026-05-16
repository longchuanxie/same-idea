import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '@/components/layouts/MainLayout';
import { AuthGuard } from '@/components/layouts/AuthGuard';
import { HomePage } from '@/pages/Home';
import { LibraryPage } from '@/pages/Library';
import { SubLibraryPage } from '@/pages/SubLibrary';
import { ComicDetailPage } from '@/pages/ComicDetail';
import { ReaderPage } from '@/pages/Reader';
import { ImportPage } from '@/pages/Import';
import { CustomCloudPage } from '@/pages/CustomCloud';
import { SettingsPage } from '@/pages/Settings';
import { StatsPage } from '@/pages/Stats';
import { ProfilePage } from '@/pages/Profile';
import { SearchPage } from '@/pages/Search';
import { TagsPage } from '@/pages/Tags';
import { AuthPage } from '@/pages/Auth';
import { ROUTES } from '@/constants/routes';

const App: React.FC = () => {
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
        <Route path={ROUTES.COMIC_DETAIL} element={<ComicDetailPage />} />
        <Route path={ROUTES.READER} element={<ReaderPage />} />
        <Route path={ROUTES.CUSTOM_CLOUD} element={<CustomCloudPage />} />
        <Route path={ROUTES.TAGS} element={<TagsPage />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
