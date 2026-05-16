import React, { useEffect, useState } from 'react';

import { useAppStore } from '@/stores/useAppStore';
import { GestureLock } from '@/components/organisms/GestureLock';
import { Collapsible } from '@/components/atoms/Collapsible';
import { getStorageUsage } from '@/services/storageService';
import { getAllPaperTypes } from '@/utils/paperTexture';
import type { PaperType } from '@/types';

const LOCK_TIMEOUT_OPTIONS = [
  { value: 60 * 1000, label: '1 分钟' },
  { value: 3 * 60 * 1000, label: '3 分钟' },
  { value: 5 * 60 * 1000, label: '5 分钟' },
  { value: 15 * 60 * 1000, label: '15 分钟' },
  { value: 30 * 60 * 1000, label: '30 分钟' },
];

const MAX_ATTEMPTS_OPTIONS = [
  { value: 3, label: '3 次' },
  { value: 5, label: '5 次' },
  { value: 10, label: '10 次' },
];

export const SettingsPage: React.FC = () => {
  const {
    settings,
    togglePaperMode,
    updateSettings,
    setTheme,
    updateAuthConfig,
    setupGestureLock,
    disableGestureLock,
  } = useAppStore();
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number }>({ used: 0, quota: 0 });
  const [showDirectionOptions, setShowDirectionOptions] = useState(false);
  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showLockTimeoutOptions, setShowLockTimeoutOptions] = useState(false);
  const [showMaxAttemptsOptions, setShowMaxAttemptsOptions] = useState(false);
  const [showGestureSetup, setShowGestureSetup] = useState(false);
  const [showGestureChange, setShowGestureChange] = useState(false);
  const [gestureError, setGestureError] = useState<string | null>(null);

  useEffect(() => {
    getStorageUsage().then(setStorageInfo);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const directionLabel = settings.readingDirection === 'rtl' ? '从右至左 (日式传统)' : '从左至右';
  const fontLabel = `${settings.fontFamily === 'literata' ? 'Literata' : 'Inter'}, ${settings.fontSize}px`;
  const themeLabel = settings.theme === 'dark' ? '深色' : settings.theme === 'light' ? '浅色' : '跟随系统';
  const auth = settings.auth;
  const lockTimeoutLabel = LOCK_TIMEOUT_OPTIONS.find((o) => o.value === auth.lockTimeout)?.label ?? '5 分钟';
  const maxAttemptsLabel = MAX_ATTEMPTS_OPTIONS.find((o) => o.value === auth.maxAttempts)?.label ?? '5 次';

  const handleGestureSetupComplete = async (points: number[]) => {
    try {
      await setupGestureLock(points);
      setShowGestureSetup(false);
      setGestureError(null);
    } catch {
      setGestureError('设置失败，请重试');
    }
  };

  const handleGestureChangeComplete = async (points: number[]) => {
    try {
      await setupGestureLock(points);
      setShowGestureChange(false);
      setGestureError(null);
    } catch {
      setGestureError('修改失败，请重试');
    }
  };

  const handleDisableLock = () => {
    disableGestureLock();
  };

  if (showGestureSetup || showGestureChange) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center noise-overlay antialiased relative">
        <main className="w-full max-w-[400px] px-margin-mobile flex flex-col items-center gap-8 z-10">
          <GestureLock
            mode={showGestureChange ? 'change' : 'setup'}
            onComplete={showGestureChange ? handleGestureChangeComplete : handleGestureSetupComplete}
            onError={setGestureError}
            onBack={() => {
              setShowGestureSetup(false);
              setShowGestureChange(false);
              setGestureError(null);
            }}
          />
          {gestureError && (
            <p className="font-body text-body-sm text-error text-center">{gestureError}</p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-16">
      <header className="mb-12">
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-2">设置</h1>
        <p className="font-body text-body-md text-on-surface-variant">个性化您的阅读体验。</p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="font-label text-label-md text-secondary uppercase tracking-widest mb-4 ml-2">隐私与安全</h2>
          <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">应用锁</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                    {auth.isEnabled ? '已启用手势密码保护' : '未启用，任何人均可访问'}
                  </p>
                </div>
              </div>
              <button
                className={`relative inline-block w-11 h-6 rounded-full toggle-spring ${
                  auth.isEnabled ? 'bg-primary' : 'bg-surface-variant'
                }`}
                onClick={() => {
                  if (auth.isEnabled) {
                    handleDisableLock();
                  } else {
                    setShowGestureSetup(true);
                  }
                }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border ${
                    auth.isEnabled ? 'translate-x-5 border-primary' : 'border-outline-variant'
                  }`}
                />
              </button>
            </div>

            {auth.isEnabled && (
              <>
                <button
                  className="w-full p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors group text-left"
                  onClick={() => setShowGestureChange(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">gesture</span>
                    </div>
                    <div>
                      <h3 className="font-display text-headline-sm text-on-surface">修改手势密码</h3>
                      <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                        更换当前的手势密码
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                </button>

                <button
                  className="w-full p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors group text-left"
                  onClick={() => setShowLockTimeoutOptions(!showLockTimeoutOptions)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">timer</span>
                    </div>
                    <div>
                      <h3 className="font-display text-headline-sm text-on-surface">自动锁定</h3>
                      <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                        离开应用后 {lockTimeoutLabel} 需重新验证
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    {showLockTimeoutOptions ? 'expand_less' : 'chevron_right'}
                  </span>
                </button>

                <Collapsible isOpen={showLockTimeoutOptions}>
                  <div className="bg-surface-container-low px-6 py-3 space-y-2">
                    {LOCK_TIMEOUT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          auth.lockTimeout === option.value
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                        }`}
                        onClick={() => {
                          updateAuthConfig({ lockTimeout: option.value });
                          setShowLockTimeoutOptions(false);
                        }}
                      >
                        <span className="material-symbols-outlined">schedule</span>
                        <span className="font-label text-label-md">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </Collapsible>

                <button
                  className="w-full p-6 flex justify-between items-center bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors group text-left"
                  onClick={() => setShowMaxAttemptsOptions(!showMaxAttemptsOptions)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">pin</span>
                    </div>
                    <div>
                      <h3 className="font-display text-headline-sm text-on-surface">最大尝试次数</h3>
                      <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                        连续错误 {maxAttemptsLabel} 后临时锁定
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    {showMaxAttemptsOptions ? 'expand_less' : 'chevron_right'}
                  </span>
                </button>

                <Collapsible isOpen={showMaxAttemptsOptions}>
                  <div className="bg-surface-container-low px-6 py-3 space-y-2">
                    {MAX_ATTEMPTS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          auth.maxAttempts === option.value
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                        }`}
                        onClick={() => {
                          updateAuthConfig({ maxAttempts: option.value });
                          setShowMaxAttemptsOptions(false);
                        }}
                      >
                        <span className="material-symbols-outlined">numbers</span>
                        <span className="font-label text-label-md">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </Collapsible>
              </>
            )}

            {!auth.isEnabled && (
              <div className="p-6 bg-surface-container-lowest">
                <p className="font-body text-body-md text-on-surface-variant">
                  启用应用锁后，每次打开应用或从后台返回时需要验证手势密码，保护您的阅读隐私。
                </p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-label text-label-md text-secondary uppercase tracking-widest mb-4 ml-2">外观</h2>
          <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
            <button
              className="w-full p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors group text-left"
              onClick={() => {
                const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
                const currentIndex = themes.indexOf(settings.theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setTheme(nextTheme);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">brightness_medium</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">主题</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">{themeLabel}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
            </button>

            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>note</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">纸张模式</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                    模拟真实纸张的纹理与色调，减少视觉疲劳。
                  </p>
                </div>
              </div>
              <button
                className={`relative inline-block w-11 h-6 rounded-full toggle-spring ${
                  settings.paperMode ? 'bg-primary' : 'bg-surface-variant'
                }`}
                onClick={togglePaperMode}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border ${
                    settings.paperMode ? 'translate-x-5 border-primary' : 'border-outline-variant'
                  }`}
                />
              </button>
            </div>

            <Collapsible isOpen={settings.paperMode}>
              <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">category</span>
                  </div>
                  <h3 className="font-display text-headline-sm text-on-surface">纸张类型</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {getAllPaperTypes().map(({ type, config }) => (
                    <button
                      key={type}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all ${
                        settings.paperType === type
                          ? 'bg-primary/10 border-primary ring-1 ring-primary'
                          : 'bg-surface-container-high border-outline-variant hover:border-primary/50'
                      }`}
                      onClick={() => updateSettings({ paperType: type as PaperType })}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{config.icon}</span>
                        <span className="font-label text-label-md text-on-surface">{config.label}</span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant text-left leading-snug">{config.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </Collapsible>

            <div className="p-6 bg-surface-container-lowest">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">texture</span>
                  </div>
                  <h3 className="font-display text-headline-sm text-on-surface">纹理强度</h3>
                </div>
                <span className="font-label text-label-sm text-on-surface-variant">
                  {settings.textureIntensity <= 33 ? '弱' : settings.textureIntensity <= 66 ? '中等' : '强'}
                </span>
              </div>
              <div className="px-2 pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.textureIntensity}
                  onChange={(e) => updateSettings({ textureIntensity: Number(e.target.value) })}
                  className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-on-surface-variant mt-2 font-label text-label-sm">
                  <span>弱</span>
                  <span>强</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-label text-label-md text-secondary uppercase tracking-widest mb-4 ml-2">阅读偏好</h2>
          <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
            <button
              className="w-full p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors group text-left"
              onClick={() => setShowDirectionOptions(!showDirectionOptions)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">swap_horiz</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">阅读方向</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                    {directionLabel}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                {showDirectionOptions ? 'expand_less' : 'chevron_right'}
              </span>
            </button>

            <Collapsible isOpen={showDirectionOptions}>
              <div className="bg-surface-container-low px-6 py-3 space-y-2">
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    settings.readingDirection === 'rtl'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                  }`}
                  onClick={() => {
                    updateSettings({ readingDirection: 'rtl' });
                    setShowDirectionOptions(false);
                  }}
                >
                  <span className="material-symbols-outlined">format_textdirection_r_to_l</span>
                  <span className="font-label text-label-md">从右至左 (日式传统)</span>
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    settings.readingDirection === 'ltr'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                  }`}
                  onClick={() => {
                    updateSettings({ readingDirection: 'ltr' });
                    setShowDirectionOptions(false);
                  }}
                >
                  <span className="material-symbols-outlined">format_textdirection_l_to_r</span>
                  <span className="font-label text-label-md">从左至右</span>
                </button>
              </div>
            </Collapsible>

            <button
              className="w-full p-6 flex justify-between items-center bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors group text-left"
              onClick={() => setShowFontOptions(!showFontOptions)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">text_format</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">排版与字体</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">{fontLabel}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                {showFontOptions ? 'expand_less' : 'chevron_right'}
              </span>
            </button>

            <Collapsible isOpen={showFontOptions}>
              <div className="bg-surface-container-low px-6 py-3 space-y-2">
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    settings.fontFamily === 'literata'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                  }`}
                  onClick={() => {
                    updateSettings({ fontFamily: 'literata' });
                    setShowFontOptions(false);
                  }}
                >
                  <span className="font-body text-body-lg" style={{ fontFamily: 'Literata, serif' }}>Aa</span>
                  <span className="font-label text-label-md">Literata</span>
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    settings.fontFamily === 'inter'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                  }`}
                  onClick={() => {
                    updateSettings({ fontFamily: 'inter' });
                    setShowFontOptions(false);
                  }}
                >
                  <span className="font-body text-body-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Aa</span>
                  <span className="font-label text-label-md">Inter</span>
                </button>
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label text-label-sm text-on-surface-variant">字号</span>
                    <span className="font-label text-label-sm text-on-surface">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-on-surface-variant mt-1 font-label text-label-sm">
                    <span>12px</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>
            </Collapsible>
          </div>
        </section>

        <section>
          <h2 className="font-label text-label-md text-secondary uppercase tracking-widest mb-4 ml-2">系统管理</h2>
          <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
            <button
              className="w-full p-6 flex justify-between items-center bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors group text-left"
              onClick={() => alert('存储管理功能即将上线')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">storage</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">存储管理</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                    已使用 {formatBytes(storageInfo.used)} / 共 {formatBytes(storageInfo.quota)}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
