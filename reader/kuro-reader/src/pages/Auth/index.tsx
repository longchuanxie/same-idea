import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { GestureLock } from '@/components/organisms/GestureLock';
import { useAppStore } from '@/stores/useAppStore';
import { isLockedUntilExpired } from '@/services/gestureAuth';
import { ROUTES } from '@/constants/routes';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings,
    verifyGestureLock,
    setupGestureLock,
    clearAuthData,
    setAuthenticated,
  } = useAppStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [lockRemainingMs, setLockRemainingMs] = useState(0);

  const auth = settings.auth;
  const isLocked = isLockedUntilExpired(auth.lockUntil);

  useEffect(() => {
    if (!auth.isEnabled || !auth.gestureHash) {
      setNeedsSetup(true);
    }
  }, [auth.isEnabled, auth.gestureHash]);

  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      const remaining = (auth.lockUntil ?? 0) - Date.now();
      if (remaining <= 0) {
        setLockRemainingMs(0);
      } else {
        setLockRemainingMs(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, auth.lockUntil]);

  const handleVerify = useCallback(
    async (points: number[]) => {
      setErrorMessage(null);
      const isValid = await verifyGestureLock(points);
      if (isValid) {
        navigate(ROUTES.HOME, { replace: true });
      } else {
        setErrorMessage('手势密码错误');
      }
    },
    [verifyGestureLock, navigate]
  );

  const handleSetup = useCallback(
    async (points: number[]) => {
      try {
        await setupGestureLock(points);
        navigate(ROUTES.HOME, { replace: true });
      } catch {
        setErrorMessage('设置失败，请重试');
      }
    },
    [setupGestureLock, navigate]
  );

  const handleSkip = useCallback(() => {
    setAuthenticated(true);
    navigate(ROUTES.HOME, { replace: true });
  }, [setAuthenticated, navigate]);

  const handleReset = useCallback(() => {
    clearAuthData();
    setNeedsSetup(true);
    setErrorMessage(null);
  }, [clearAuthData]);

  if (needsSetup) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center noise-overlay antialiased relative">
        <main className="w-full max-w-[400px] px-margin-mobile flex flex-col items-center gap-8 z-10">
          <header className="flex flex-col items-center text-center gap-4 w-full">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant text-primary mb-2">
              <span className="material-symbols-outlined text-[24px]">book_4</span>
            </div>
            <h1 className="font-display text-headline-md text-primary">Kuro Reader</h1>
          </header>

          <GestureLock
            mode="setup"
            onComplete={handleSetup}
            onError={setErrorMessage}
          />

          {errorMessage && (
            <p className="font-body text-body-sm text-error text-center">{errorMessage}</p>
          )}

          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
            onClick={handleSkip}
          >
            跳过，稍后设置
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center noise-overlay antialiased relative">
      <main className="w-full max-w-[400px] px-margin-mobile flex flex-col items-center gap-8 z-10">
        <header className="flex flex-col items-center text-center gap-4 w-full">
          <div className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant text-primary mb-2">
            <span className="material-symbols-outlined text-[24px]">book_4</span>
          </div>
          <h1 className="font-display text-headline-md text-primary">Kuro Reader</h1>
        </header>

        <GestureLock
          mode="verify"
          onComplete={handleVerify}
          onError={setErrorMessage}
          isLocked={isLocked}
          lockRemainingMs={lockRemainingMs}
          failedAttempts={auth.failedAttempts}
          maxAttempts={auth.maxAttempts}
        />

        {errorMessage && (
          <p className="font-body text-body-sm text-error text-center">{errorMessage}</p>
        )}

        <div className="flex justify-between w-full max-w-[280px]">
          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
            onClick={handleReset}
          >
            忘记手势？
          </button>
        </div>
      </main>
    </div>
  );
};
