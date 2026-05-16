import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAppStore } from '@/stores/useAppStore';
import { ROUTES } from '@/constants/routes';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, settings, checkAuthTimeout } = useAppStore();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const auth = settings.auth;

    if (!auth.isEnabled) {
      setShouldRender(true);
      return;
    }

    if (isAuthenticated && !checkAuthTimeout()) {
      setShouldRender(true);
      return;
    }

    setShouldRender(false);
    navigate(ROUTES.AUTH, { replace: true, state: { from: location.pathname } });
  }, [isAuthenticated, settings.auth.isEnabled, checkAuthTimeout, navigate, location.pathname]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const { settings: currentSettings, isAuthenticated: currentlyAuth, checkAuthTimeout: checkTimeout } = useAppStore.getState();
        if (currentSettings.auth.isEnabled && currentlyAuth && checkTimeout()) {
          navigate(ROUTES.AUTH, { replace: true });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [navigate]);

  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const setupAppListener = async () => {
      const { isNativePlatform } = await import('@/utils/capacitor');
      if (!isNativePlatform()) return;

      try {
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            const { settings: currentSettings, isAuthenticated: currentlyAuth, checkAuthTimeout: checkTimeout } = useAppStore.getState();
            if (currentSettings.auth.isEnabled && currentlyAuth && checkTimeout()) {
              navigate(ROUTES.AUTH, { replace: true });
            }
          }
        });
        removeListener = () => listener.remove();
      } catch {
        // App plugin not available
      }
    };

    setupAppListener();
    return () => {
      if (removeListener) removeListener();
    };
  }, [navigate]);

  if (!shouldRender) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  return <>{children}</>;
};
