import React, { useState, useCallback, useRef } from 'react';

import { APP_CONFIG } from '@/constants/config';
import { cn } from '@/utils/cn';

export type GestureLockMode = 'setup' | 'verify' | 'change';

export interface GestureLockProps {
  mode: GestureLockMode;
  onComplete: (points: number[]) => void;
  onError?: (message: string) => void;
  onBack?: () => void;
  isLocked?: boolean;
  lockRemainingMs?: number;
  failedAttempts?: number;
  maxAttempts?: number;
}

type SetupStep = 'first' | 'confirm';

const GRID_SIZE = 3;
const SVG_SIZE = 280;
const CELL_SIZE = SVG_SIZE / GRID_SIZE;
const DOT_CENTER_OFFSET = CELL_SIZE / 2;

const getPointPosition = (index: number): { x: number; y: number } => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  return {
    x: col * CELL_SIZE + DOT_CENTER_OFFSET,
    y: row * CELL_SIZE + DOT_CENTER_OFFSET,
  };
};

export const GestureLock: React.FC<GestureLockProps> = ({
  mode,
  onComplete,
  onError,
  onBack,
  isLocked = false,
  lockRemainingMs = 0,
  failedAttempts = 0,
  maxAttempts = APP_CONFIG.auth.defaultMaxAttempts,
}) => {
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [setupStep, setSetupStep] = useState<SetupStep>('first');
  const [firstPattern, setFirstPattern] = useState<number[] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const showFeedback = useCallback(
    (type: 'success' | 'error', duration: number = 800) => {
      clearFeedback();
      setFeedback(type);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback('idle');
      }, duration);
    },
    [clearFeedback]
  );

  const resetPattern = useCallback(() => {
    setSelectedPoints([]);
    setIsDrawing(false);
  }, []);

  const handleTouchStart = useCallback(
    (index: number) => {
      if (isLocked || feedback !== 'idle') return;
      setIsDrawing(true);
      setSelectedPoints([index]);
    },
    [isLocked, feedback]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDrawing || !gridRef.current || isLocked || feedback !== 'idle') return;
      const touch = e.touches[0];
      const elements = gridRef.current.querySelectorAll('[data-dot]');
      elements.forEach((el, idx) => {
        if (selectedPoints.includes(idx)) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt((touch.clientX - cx) ** 2 + (touch.clientY - cy) ** 2);
        if (dist < APP_CONFIG.auth.dotHitRadius) {
          setSelectedPoints((prev) => [...prev, idx]);
        }
      });
    },
    [isDrawing, selectedPoints, isLocked, feedback]
  );

  const handleMouseDown = useCallback(
    (index: number) => {
      if (isLocked || feedback !== 'idle') return;
      setIsDrawing(true);
      setSelectedPoints([index]);
    },
    [isLocked, feedback]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !gridRef.current || isLocked || feedback !== 'idle') return;
      const elements = gridRef.current.querySelectorAll('[data-dot]');
      elements.forEach((el, idx) => {
        if (selectedPoints.includes(idx)) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
        if (dist < APP_CONFIG.auth.dotHitRadius) {
          setSelectedPoints((prev) => [...prev, idx]);
        }
      });
    },
    [isDrawing, selectedPoints, isLocked, feedback]
  );

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (selectedPoints.length < APP_CONFIG.auth.minGesturePoints) {
      showFeedback('error');
      onError?.(`至少需要连接 ${APP_CONFIG.auth.minGesturePoints} 个点`);
      setTimeout(resetPattern, 600);
      return;
    }

    if (mode === 'verify') {
      onComplete(selectedPoints);
      setTimeout(resetPattern, 300);
      return;
    }

    if (mode === 'setup' || mode === 'change') {
      if (setupStep === 'first') {
        setFirstPattern(selectedPoints);
        setSetupStep('confirm');
        showFeedback('success', 400);
        setTimeout(resetPattern, 400);
      } else {
        const isMatch =
          firstPattern !== null &&
          firstPattern.length === selectedPoints.length &&
          firstPattern.every((p, i) => p === selectedPoints[i]);

        if (isMatch) {
          showFeedback('success');
          onComplete(selectedPoints);
          setTimeout(() => {
            resetPattern();
            setSetupStep('first');
            setFirstPattern(null);
          }, 600);
        } else {
          showFeedback('error');
          onError?.('两次手势不一致，请重新设置');
          setTimeout(() => {
            resetPattern();
            setSetupStep('first');
            setFirstPattern(null);
          }, 800);
        }
      }
    }
  }, [isDrawing, selectedPoints, mode, setupStep, firstPattern, onComplete, onError, showFeedback, resetPattern]);

  const getSubtitle = (): string => {
    if (isLocked) {
      const seconds = Math.ceil(lockRemainingMs / 1000);
      return `已锁定，请 ${seconds} 秒后重试`;
    }
    if (feedback === 'error') {
      return mode === 'verify' ? '手势错误，请重试' : '手势不一致，请重试';
    }
    if (feedback === 'success') {
      return mode === 'verify' ? '验证成功' : '设置成功';
    }
    if (mode === 'verify') {
      return '请输入手势密码';
    }
    if (mode === 'setup' || mode === 'change') {
      return setupStep === 'first' ? '请绘制手势密码' : '请再次绘制以确认';
    }
    return '请输入手势密码';
  };

  const lineColor = feedback === 'error' ? 'stroke-error' : feedback === 'success' ? 'stroke-primary' : 'stroke-on-surface-variant';
  const dotSelectedClass = feedback === 'error'
    ? 'bg-error ring-error'
    : feedback === 'success'
      ? 'bg-primary ring-primary'
      : 'bg-primary ring-primary';

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col items-center text-center gap-2">
        <h2 className="font-display text-headline-md text-primary">
          {mode === 'verify' ? '验证手势' : mode === 'change' ? '修改手势' : '设置手势'}
        </h2>
        <p className={cn(
          'font-body text-body-md transition-colors',
          feedback === 'error' ? 'text-error' : 'text-on-surface-variant'
        )}>
          {getSubtitle()}
        </p>
        {mode === 'verify' && failedAttempts > 0 && !isLocked && (
          <p className="font-label text-label-sm text-on-surface-variant">
            剩余尝试次数：{maxAttempts - failedAttempts}
          </p>
        )}
      </div>

      <div
        ref={gridRef}
        className="relative select-none touch-none"
        style={{ width: SVG_SIZE, height: SVG_SIZE }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseUp={handleEnd}
        onMouseLeave={isDrawing ? handleEnd : undefined}
        onMouseMove={handleMouseMove}
      >
        {selectedPoints.length > 1 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          >
            {selectedPoints.slice(0, -1).map((point, idx) => {
              const from = getPointPosition(point);
              const to = getPointPosition(selectedPoints[idx + 1]);
              return (
                <line
                  key={`line-${idx}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className={cn(lineColor, 'transition-colors duration-200')}
                  strokeLinecap="round"
                  strokeWidth="3"
                  opacity="0.6"
                />
              );
            })}
          </svg>
        )}

        <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
          {Array.from({ length: APP_CONFIG.auth.gridDotCount }, (_, idx) => {
            const isSelected = selectedPoints.includes(idx);
            return (
              <div
                key={idx}
                className="flex items-center justify-center w-full h-full"
                data-dot={idx}
                onTouchStart={() => handleTouchStart(idx)}
                onMouseDown={() => handleMouseDown(idx)}
              >
                <div
                  className={cn(
                    'rounded-full transition-all duration-200',
                    isSelected
                      ? cn('w-4 h-4 ring-1 ring-offset-4 ring-offset-background scale-125', dotSelectedClass)
                      : 'w-3 h-3 bg-on-surface-variant opacity-25 hover:opacity-50 hover:scale-125'
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between w-full" style={{ maxWidth: SVG_SIZE }}>
        {onBack ? (
          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
            onClick={onBack}
          >
            返回
          </button>
        ) : (
          <div />
        )}
        {(mode === 'setup' || mode === 'change') && setupStep === 'confirm' && firstPattern ? (
          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => {
              setSetupStep('first');
              setFirstPattern(null);
              resetPattern();
            }}
          >
            重新绘制
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
