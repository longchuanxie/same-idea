import React, { useEffect, useState, useRef } from 'react';

import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { GestureLock } from '@/components/organisms/GestureLock';
import { Collapsible } from '@/components/atoms/Collapsible';
import { getStorageUsage } from '@/utils/storage';
import { getAllPaperTypes } from '@/utils/paperTexture';
import { STORAGE_KEYS } from '@/constants/storage';
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

const SECURITY_QUESTIONS = [
  '你第一只宠物的名字是什么？',
  '你出生的城市是哪里？',
  '你母亲的姓名是？',
  '你最喜欢的书是什么？',
  '你小学的名字是？',
  '你最好的朋友叫什么？',
  '你最喜欢的电影是什么？',
  '你第一个老师的名字是？',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { books, tags, subLibraries, readingProgress } = useLibraryStore();

  const handleExportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      books,
      tags,
      subLibraries,
      readingProgress,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuro-reader-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.version !== 1) {
          alert('不支持的备份文件版本');
          return;
        }
        if (!confirm('导入将覆盖当前所有数据，确定继续吗？')) return;
        if (data.settings) updateSettings(data.settings);
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.readingProgress || {}));
        alert('数据导入成功，请重启应用以生效');
      } catch {
        alert('备份文件格式错误');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const [showDirectionOptions, setShowDirectionOptions] = useState(false);
  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showLockTimeoutOptions, setShowLockTimeoutOptions] = useState(false);
  const [showMaxAttemptsOptions, setShowMaxAttemptsOptions] = useState(false);
  const [showGestureSetup, setShowGestureSetup] = useState(false);
  const [showGestureChange, setShowGestureChange] = useState(false);
  const [gestureError, setGestureError] = useState<string | null>(null);
  const [pendingGesturePoints, setPendingGesturePoints] = useState<number[] | null>(null);
  const [showQuestionsSetup, setShowQuestionsSetup] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState<{ question: string; answer: string }[]>([
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);

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

  const handleGestureSetupComplete = (points: number[]) => {
    setPendingGesturePoints(points);
    setGestureError(null);
    setShowGestureSetup(false);
    setShowQuestionsSetup(true);
  };

  const handleGestureChangeComplete = (points: number[]) => {
    setPendingGesturePoints(points);
    setGestureError(null);
    setShowGestureChange(false);
    setShowQuestionsSetup(true);
  };

  const handleSubmitSecurityQuestions = async () => {
    if (!pendingGesturePoints) return;
    const validQuestions = securityQuestions.filter((q) => q.question && q.answer.trim());
    if (validQuestions.length < 1) {
      setGestureError('请至少设置 1 个安全问题');
      return;
    }
    try {
      await setupGestureLock(pendingGesturePoints, validQuestions);
      setShowQuestionsSetup(false);
      setPendingGesturePoints(null);
      setGestureError(null);
      setSecurityQuestions([{ question: '', answer: '' }, { question: '', answer: '' }]);
    } catch {
      setGestureError('设置失败，请重试');
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

  if (showQuestionsSetup) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center noise-overlay antialiased relative">
        <main className="w-full max-w-[400px] px-margin-mobile flex flex-col items-center gap-6 z-10 py-12">
          <header className="flex flex-col items-center text-center gap-2 w-full">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant text-primary mb-2">
              <span className="material-symbols-outlined text-[24px]">question_mark</span>
            </div>
            <h1 className="font-display text-headline-md text-primary">设置安全问题</h1>
            <p className="font-body text-body-sm text-on-surface-variant">
              忘记密码时可通过安全问题重置，请至少设置 1 个
            </p>
          </header>

          <div className="w-full space-y-6">
            {securityQuestions.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <label className="font-label text-label-sm text-on-surface-variant">安全问题 {idx + 1}</label>
                <select
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors"
                  value={q.question}
                  onChange={(e) => {
                    const next = [...securityQuestions];
                    next[idx] = { ...next[idx], question: e.target.value };
                    setSecurityQuestions(next);
                  }}
                >
                  <option value="">-- 请选择问题 --</option>
                  {SECURITY_QUESTIONS.map((sq) => (
                    <option key={sq} value={sq} disabled={securityQuestions.some((o, i) => i !== idx && o.question === sq)}>
                      {sq}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-0 outline-none transition-colors"
                  placeholder="输入答案"
                  value={q.answer}
                  onChange={(e) => {
                    const next = [...securityQuestions];
                    next[idx] = { ...next[idx], answer: e.target.value };
                    setSecurityQuestions(next);
                  }}
                />
              </div>
            ))}
          </div>

          {gestureError && (
            <p className="font-body text-body-sm text-error text-center">{gestureError}</p>
          )}

          <div className="flex gap-3 w-full">
            <button
              className="flex-1 font-label text-label-md text-on-surface-variant border border-outline-variant rounded-xl py-3 hover:bg-surface-container transition-colors"
              onClick={() => {
                setShowQuestionsSetup(false);
                setPendingGesturePoints(null);
                setGestureError(null);
                setSecurityQuestions([{ question: '', answer: '' }, { question: '', answer: '' }]);
              }}
            >
              取消
            </button>
            <button
              className="flex-1 font-label text-label-md text-on-primary bg-primary rounded-xl py-3 hover:opacity-90 transition-opacity"
              onClick={handleSubmitSecurityQuestions}
            >
              完成设置
            </button>
          </div>
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

            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">swipe</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">滑动翻页</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                    {settings.pageTurnGestures ? '已启用，左右滑动翻页' : '已关闭，仅点击翻页'}
                  </p>
                </div>
              </div>
              <button
                className={`relative inline-block w-11 h-6 rounded-full toggle-spring ${
                  settings.pageTurnGestures ? 'bg-primary' : 'bg-surface-variant'
                }`}
                onClick={() => updateSettings({ pageTurnGestures: !settings.pageTurnGestures })}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border ${
                    settings.pageTurnGestures ? 'translate-x-5 border-primary' : 'border-outline-variant'
                  }`}
                />
              </button>
            </div>

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
            <div className="border-t border-outline-variant" />
            <div className="p-6 bg-surface-container-lowest">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">backup</span>
                </div>
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">数据备份</h3>
                  <p className="font-body text-body-md text-on-surface-variant text-sm leading-tight mt-1">
                    导出或导入应用数据
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-primary text-on-primary font-label text-label-md py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
                  onClick={handleExportData}
                >
                  导出备份
                </button>
                <button
                  className="flex-1 bg-transparent text-primary font-label text-label-md py-3 px-4 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  导入恢复
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportData}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
