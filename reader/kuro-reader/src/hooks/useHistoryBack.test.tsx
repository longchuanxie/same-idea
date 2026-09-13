import { act, renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';

import { useHistoryBack } from './useHistoryBack';

/** 读取当前路由位置的小探针 */
const LocationProbe: React.FC<{ onLocation: (pathname: string) => void }> = ({ onLocation }) => {
  const location = useLocation();
  onLocation(location.pathname);
  return null;
};

describe('useHistoryBack', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('历史栈可退时 navigate(-1) 回到来路', async () => {
    window.history.pushState({ idx: 1 }, '', '/book/1');
    const paths: string[] = [];
    const { result } = renderHook(
      () => {
        const back = useHistoryBack();
        return back;
      },
      {
        wrapper: ({ children }) => (
          <BrowserRouter>
            <LocationProbe onLocation={(p) => paths.push(p)} />
            {children}
          </BrowserRouter>
        ),
      }
    );

    act(() => {
      result.current('/library');
    });

    await waitFor(() => {
      expect(paths[paths.length - 1]).toBe('/');
    });
  });

  it('栈底（深链直进）时用 fallbackPath 顶替当前条目，不压栈', async () => {
    // idx=0 的栈底场景：无前驱可退
    window.history.replaceState({ idx: 0 }, '', '/knowledge/x/y');
    const paths: string[] = [];
    const { result } = renderHook(
      () => useHistoryBack(),
      {
        wrapper: ({ children }) => (
          <BrowserRouter>
            <LocationProbe onLocation={(p) => paths.push(p)} />
            {children}
          </BrowserRouter>
        ),
      }
    );

    act(() => {
      result.current('/book/x');
    });

    await waitFor(() => {
      expect(paths[paths.length - 1]).toBe('/book/x');
    });
    // 顶替而非压栈：栈仍在原位（idx 未增长）
    expect(window.history.state?.idx ?? 0).toBeLessThanOrEqual(0);
  });
});
