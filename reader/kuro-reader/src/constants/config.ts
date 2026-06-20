export const APP_CONFIG = {
  name: 'Kuro Reader',
  version: '1.0.0',
  maxFileSize: 2000 * 1024 * 1024,
  supportedFormats: ['.zip', '.cbz', '.rar', '.cbr', '.txt', '.epub'] as const,
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
    lockDurationOnMaxFail: 30 * 1000,
    defaultLockTimeout: 5 * 60 * 1000,
    defaultMaxAttempts: 5,
  },
} as const;
