import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { NavItem, UserSettings, AuthConfig } from '@/types';
import { APP_CONFIG } from '@/constants/config';
import { setupGesture, verifyGesture, isLockedUntilExpired, calculateLockUntil } from '@/services/gestureAuth';

interface AppState {
  theme: 'light' | 'dark' | 'auto';
  activeNav: NavItem;
  settings: UserSettings;
  isAuthenticated: boolean;
  lastAuthTime: number;

  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setActiveNav: (nav: NavItem) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setAuthenticated: (value: boolean) => void;
  togglePaperMode: () => void;
  toggleDarkMode: () => void;
  updateAuthConfig: (partial: Partial<AuthConfig>) => void;
  checkAuthTimeout: () => boolean;
  setupGestureLock: (points: number[]) => Promise<void>;
  verifyGestureLock: (points: number[]) => Promise<boolean>;
  disableGestureLock: () => void;
  clearAuthData: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  paperMode: true,
  paperType: 'coated',
  textureIntensity: 50,
  readingDirection: 'rtl',
  pageTurnGestures: true,
  cloudSync: false,
  fontSize: 16,
  fontFamily: 'literata',
  auth: {
    isEnabled: false,
    method: 'auto',
    lockTimeout: APP_CONFIG.auth.defaultLockTimeout,
    maxAttempts: APP_CONFIG.auth.defaultMaxAttempts,
    failedAttempts: 0,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      activeNav: 'home',
      settings: DEFAULT_SETTINGS,
      isAuthenticated: true,
      lastAuthTime: Date.now(),

      setTheme: (theme) =>
        set((state) => ({
          theme,
          settings: { ...state.settings, theme },
        })),
      setActiveNav: (nav) => set({ activeNav: nav }),
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      setAuthenticated: (value) =>
        set({ isAuthenticated: value, lastAuthTime: value ? Date.now() : 0 }),
      togglePaperMode: () =>
        set((state) => ({
          settings: { ...state.settings, paperMode: !state.settings.paperMode },
        })),
      toggleDarkMode: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          return { theme: newTheme, settings: { ...state.settings, theme: newTheme } };
        }),

      updateAuthConfig: (partial) =>
        set((state) => ({
          settings: {
            ...state.settings,
            auth: { ...state.settings.auth, ...partial },
          },
        })),

      checkAuthTimeout: () => {
        const { settings, isAuthenticated, lastAuthTime } = get();
        if (!settings.auth.isEnabled) return false;
        if (!isAuthenticated) return true;
        const elapsed = Date.now() - lastAuthTime;
        if (elapsed > settings.auth.lockTimeout) {
          set({ isAuthenticated: false });
          return true;
        }
        return false;
      },

      setupGestureLock: async (points: number[]) => {
        const { hash, salt } = await setupGesture(points);
        set((state) => ({
          settings: {
            ...state.settings,
            auth: {
              ...state.settings.auth,
              isEnabled: true,
              method: 'gesture',
              gestureHash: hash,
              gestureSalt: salt,
              failedAttempts: 0,
              lockUntil: undefined,
            },
          },
          isAuthenticated: true,
          lastAuthTime: Date.now(),
        }));
      },

      verifyGestureLock: async (points: number[]) => {
        const { settings } = get();
        const { gestureHash, gestureSalt, failedAttempts, maxAttempts, lockUntil } = settings.auth;

        if (isLockedUntilExpired(lockUntil)) {
          return false;
        }

        if (!gestureHash || !gestureSalt) return false;

        const isValid = await verifyGesture(points, gestureHash, gestureSalt);

        if (isValid) {
          set((state) => ({
            settings: {
              ...state.settings,
              auth: { ...state.settings.auth, failedAttempts: 0, lockUntil: undefined },
            },
            isAuthenticated: true,
            lastAuthTime: Date.now(),
          }));
        } else {
          const newFailedAttempts = failedAttempts + 1;
          const newLockUntil = calculateLockUntil(newFailedAttempts, maxAttempts);
          set((state) => ({
            settings: {
              ...state.settings,
              auth: {
                ...state.settings.auth,
                failedAttempts: newFailedAttempts,
                lockUntil: newLockUntil,
              },
            },
          }));
        }

        return isValid;
      },

      disableGestureLock: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            auth: {
              ...state.settings.auth,
              isEnabled: false,
              method: 'auto',
              gestureHash: undefined,
              gestureSalt: undefined,
              failedAttempts: 0,
              lockUntil: undefined,
            },
          },
        })),

      clearAuthData: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            auth: {
              isEnabled: false,
              method: 'auto',
              lockTimeout: APP_CONFIG.auth.defaultLockTimeout,
              maxAttempts: APP_CONFIG.auth.defaultMaxAttempts,
              failedAttempts: 0,
              gestureHash: undefined,
              gestureSalt: undefined,
              lockUntil: undefined,
            },
          },
          isAuthenticated: true,
          lastAuthTime: Date.now(),
        })),
    }),
    {
      name: 'kuro-reader-app',
    }
  )
);
