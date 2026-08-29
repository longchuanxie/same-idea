const MAX_FILE_SIZE_MB = 2000;
const LOCK_DURATION_ON_MAX_FAIL_SECONDS = 30;
const DEFAULT_LOCK_TIMEOUT_MINUTES = 5;

export const APP_CONFIG = {
  name: 'Kuro Reader',
  version: '1.0.0',
  maxFileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  supportedFormats: ['.zip', '.cbz', '.rar', '.cbr', '.txt', '.md', '.markdown', '.epub'] as const,
  defaultTheme: 'light' as const,
  paperMode: {
    defaultIntensity: 50,
    minIntensity: 0,
    maxIntensity: 100,
  },
  auth: {
    minGesturePoints: 4,
    gridDotCount: 9,
    dotHitRadius: 30,
    lockDurationOnMaxFail: LOCK_DURATION_ON_MAX_FAIL_SECONDS * 1000,
    defaultLockTimeout: DEFAULT_LOCK_TIMEOUT_MINUTES * 60 * 1000,
    defaultMaxAttempts: 5,
  },
} as const;
