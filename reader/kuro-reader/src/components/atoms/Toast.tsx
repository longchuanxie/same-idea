import React, { useEffect, useRef, useState } from 'react';

import { TOAST_EVENT, type ToastPayload } from '@/utils/toast';

/** Toast 展示层：发送方使用 utils/toast 的 toast()（建议书 7.2）。 */
export const ToastHost: React.FC = () => {
  const [current, setCurrent] = useState<ToastPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      setCurrent(detail);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCurrent(null), detail.durationMs);
    };

    window.addEventListener(TOAST_EVENT, handler);
    return () => {
      window.removeEventListener(TOAST_EVENT, handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-toast bg-primary text-on-primary font-label text-label-md pl-4 pr-3 py-2.5 rounded-card shadow-raised animate-slide-up max-w-[calc(100%-48px)] flex items-center gap-3"
    >
      <span className="text-center flex-1">{current.message}</span>
      {current.action && (
        <button
          className="flex-shrink-0 font-label text-label-md text-lamp underline underline-offset-4 hover:opacity-80 transition-opacity"
          onClick={() => {
            current.action?.onAction();
            if (timerRef.current) clearTimeout(timerRef.current);
            setCurrent(null);
          }}
        >
          {current.action.label}
        </button>
      )}
    </div>
  );
};

export default ToastHost;
