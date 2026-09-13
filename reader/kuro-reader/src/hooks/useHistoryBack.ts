import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

/**
 * 应用内返回的统一语义，与 App.tsx 硬件返回键同一判定（window.history.state.idx）：
 * 历史栈可退则 navigate(-1) 回到来路（书详情/检索/聚合页……哪里来回哪里）；
 * 深链/刷新直进栈底时，用 fallbackPath 顶替当前条目，不再向栈里压入重复页面。
 * 返回键压栈会让 Android 硬件返回把用户弹回刚离开的页面（死循环），故返回动作一律不 push。
 */
export function useHistoryBack(): (fallbackPath: string) => void {
  const navigate = useNavigate();

  return useCallback(
    (fallbackPath: string) => {
      if ((window.history.state?.idx ?? 0) > 0) {
        navigate(-1);
      } else {
        navigate(fallbackPath, { replace: true });
      }
    },
    [navigate]
  );
}
