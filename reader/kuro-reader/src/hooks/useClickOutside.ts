import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * 点击外部关闭：open 期间在 document 监听 mousedown，落点不在 ref 内即触发 onClose。
 * 收敛各页手写的「⋯ 菜单点外关闭」监听（BookDetail/Home/SubLibraryMenu/TopAppBar）。
 * onClose 走 ref 转发，调用方可传任意闭包而不引起重复订阅。
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void
): void {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [ref, open]);
}
