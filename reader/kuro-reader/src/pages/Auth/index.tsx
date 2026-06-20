import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { GestureLock } from '@/components/organisms/GestureLock';
import { useAppStore } from '@/stores/useAppStore';
import { isLockedUntilExpired } from '@/services/gestureAuth';
import { ROUTES } from '@/constants/routes';

/** 预设安全问题列表 */
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

type AuthView = 'verify' | 'setup-gesture' | 'setup-questions' | 'reset-questions';

interface QuestionEntry {
  question: string;
  answer: string;
}

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings,
    verifyGestureLock,
    setupGestureLock,
    setAuthenticated,
    verifySecurityQuestions,
    resetLockViaSecurityQuestions,
  } = useAppStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [view, setView] = useState<AuthView>('verify');
  const [lockRemainingMs, setLockRemainingMs] = useState(0);

  // 手势设置暂存的 points
  const [pendingGesturePoints, setPendingGesturePoints] = useState<number[] | null>(null);
  // 安全问题设置
  const [questions, setQuestions] = useState<QuestionEntry[]>([
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);
  // 重置时的答案
  const [resetAnswers, setResetAnswers] = useState<string[]>([]);

  const auth = settings.auth;
  const isLocked = isLockedUntilExpired(auth.lockUntil);
  const hasSecurityQuestions = !!auth.securityQuestions && auth.securityQuestions.length > 0;

  useEffect(() => {
    if (!auth.isEnabled || !auth.gestureHash) {
      setView('setup-gesture');
    } else {
      setView('verify');
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

  // 初始化重置答案输入框
  useEffect(() => {
    if (view === 'reset-questions' && hasSecurityQuestions) {
      setResetAnswers(auth.securityQuestions!.map(() => ''));
    }
  }, [view, hasSecurityQuestions, auth.securityQuestions]);

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

  /** 手势设置完成 -> 进入安全问题设置 */
  const handleGestureSetupComplete = useCallback(
    (points: number[]) => {
      setPendingGesturePoints(points);
      setErrorMessage(null);
      setView('setup-questions');
    },
    []
  );

  /** 提交安全问题并完成设置 */
  const handleSubmitQuestions = useCallback(async () => {
    if (!pendingGesturePoints) return;
    const validQuestions = questions.filter((q) => q.question && q.answer.trim());
    if (validQuestions.length < 1) {
      setErrorMessage('请至少设置 1 个安全问题');
      return;
    }
    try {
      await setupGestureLock(pendingGesturePoints, validQuestions);
      navigate(ROUTES.HOME, { replace: true });
    } catch {
      setErrorMessage('设置失败，请重试');
    }
  }, [pendingGesturePoints, questions, setupGestureLock, navigate]);

  /** 提交安全问题重置 */
  const handleResetSubmit = useCallback(async () => {
    const nonEmpty = resetAnswers.filter((a) => a.trim());
    if (nonEmpty.length === 0) {
      setErrorMessage('请回答所有安全问题');
      return;
    }
    const valid = await verifySecurityQuestions(resetAnswers);
    if (valid) {
      resetLockViaSecurityQuestions();
      setView('setup-gesture');
      setErrorMessage(null);
    } else {
      setErrorMessage('安全问题答案错误');
    }
  }, [resetAnswers, verifySecurityQuestions, resetLockViaSecurityQuestions]);

  const handleSkip = useCallback(() => {
    setAuthenticated(true);
    navigate(ROUTES.HOME, { replace: true });
  }, [setAuthenticated, navigate]);

  /** 点击"忘记手势？" */
  const handleForgot = useCallback(() => {
    if (!hasSecurityQuestions) {
      setErrorMessage('未设置安全问题，无法重置密码锁');
      return;
    }
    setErrorMessage(null);
    setView('reset-questions');
  }, [hasSecurityQuestions]);

  /** 返回验证页面 */
  const handleBackToVerify = useCallback(() => {
    setView('verify');
    setErrorMessage(null);
  }, []);

  // ─── 手势设置视图 ───
  if (view === 'setup-gesture') {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center noise-overlay antialiased relative">
        <main className="w-full max-w-[400px] px-margin-mobile flex flex-col items-center gap-8 z-10">
          <header className="flex flex-col items-center text-center gap-4 w-full">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant text-primary mb-2">
              <span className="material-symbols-outlined text-[24px]">book_4</span>
            </div>
            <h1 className="font-display text-headline-md text-primary">Kuro Reader</h1>
            <p className="font-body text-body-sm text-on-surface-variant">设置手势密码以保护您的阅读隐私</p>
          </header>

          <GestureLock mode="setup" onComplete={handleGestureSetupComplete} onError={setErrorMessage} />

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

  // ─── 安全问题设置视图 ───
  if (view === 'setup-questions') {
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
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <label className="font-label text-label-sm text-on-surface-variant">
                  安全问题 {idx + 1}
                </label>
                <select
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors"
                  value={q.question}
                  onChange={(e) => {
                    const next = [...questions];
                    next[idx] = { ...next[idx], question: e.target.value };
                    setQuestions(next);
                  }}
                >
                  <option value="">-- 请选择问题 --</option>
                  {SECURITY_QUESTIONS.map((sq) => (
                    <option key={sq} value={sq} disabled={questions.some((o, i) => i !== idx && o.question === sq)}>
                      {sq}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-0 outline-none transition-colors"
                  placeholder="输入答案"
                  value={q.answer}
                  onChange={(e) => {
                    const next = [...questions];
                    next[idx] = { ...next[idx], answer: e.target.value };
                    setQuestions(next);
                  }}
                />
              </div>
            ))}
          </div>

          {errorMessage && (
            <p className="font-body text-body-sm text-error text-center">{errorMessage}</p>
          )}

          <div className="flex gap-3 w-full">
            <button
              className="flex-1 font-label text-label-md text-on-surface-variant border border-outline-variant rounded-xl py-3 hover:bg-surface-container transition-colors"
              onClick={() => {
                setView('setup-gesture');
                setErrorMessage(null);
              }}
            >
              上一步
            </button>
            <button
              className="flex-1 font-label text-label-md text-on-primary bg-primary rounded-xl py-3 hover:opacity-90 transition-opacity"
              onClick={handleSubmitQuestions}
            >
              完成设置
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── 安全问题重置视图 ───
  if (view === 'reset-questions') {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center noise-overlay antialiased relative">
        <main className="w-full max-w-[400px] px-margin-mobile flex flex-col items-center gap-6 z-10 py-12">
          <header className="flex flex-col items-center text-center gap-2 w-full">
            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant text-primary mb-2">
              <span className="material-symbols-outlined text-[24px]">lock_reset</span>
            </div>
            <h1 className="font-display text-headline-md text-primary">验证安全问题</h1>
            <p className="font-body text-body-sm text-on-surface-variant">
              回答正确后可重新设置手势密码
            </p>
          </header>

          <div className="w-full space-y-4">
            {auth.securityQuestions?.map((sq, idx) => (
              <div key={idx} className="space-y-2">
                <label className="font-label text-label-sm text-on-surface-variant">{sq.question}</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-0 outline-none transition-colors"
                  placeholder="输入答案"
                  value={resetAnswers[idx] ?? ''}
                  onChange={(e) => {
                    const next = [...resetAnswers];
                    next[idx] = e.target.value;
                    setResetAnswers(next);
                  }}
                />
              </div>
            ))}
          </div>

          {errorMessage && (
            <p className="font-body text-body-sm text-error text-center">{errorMessage}</p>
          )}

          <div className="flex gap-3 w-full">
            <button
              className="flex-1 font-label text-label-md text-on-surface-variant border border-outline-variant rounded-xl py-3 hover:bg-surface-container transition-colors"
              onClick={handleBackToVerify}
            >
              返回
            </button>
            <button
              className="flex-1 font-label text-label-md text-on-primary bg-primary rounded-xl py-3 hover:opacity-90 transition-opacity"
              onClick={handleResetSubmit}
            >
              验证并重置
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── 验证视图（默认） ───
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
            onClick={handleForgot}
          >
            忘记手势？
          </button>
        </div>
      </main>
    </div>
  );
};
