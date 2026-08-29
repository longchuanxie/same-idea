import { useEffect, useRef } from 'react';

import { registerBackHandler } from '@/services/backHandler';

/**
 * 组件存活期间注册 Android 返回键处理器。
 * handler 每次渲染后自动指向最新闭包，无需关心 stale state。
 */
export function useBackHandler(handler: () => boolean): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(
    () => registerBackHandler(() => handlerRef.current()),
    []
  );
}
