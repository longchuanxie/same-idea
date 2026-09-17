import { useRef, useState } from 'react';

import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'


import { useClickOutside } from './useClickOutside'

function Harness({ onClose, startOpen }: { onClose: () => void; startOpen?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(startOpen ?? true);
  useClickOutside(ref, open, () => {
    onClose();
    setOpen(false);
  });
  return (
    <div>
      <div ref={ref} data-testid="inside">inside</div>
      <div data-testid="outside">outside</div>
      <button data-testid="reopen" onClick={() => setOpen(true)}>reopen</button>
    </div>
  );
}

describe('useClickOutside', () => {
  it('open 时点击 ref 外部触发 onClose', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('点击 ref 内部不触发', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.mouseDown(document.querySelector('[data-testid="inside"]')!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('关闭后不再监听；重开后恢复', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Harness onClose={onClose} />);
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(onClose).toHaveBeenCalledTimes(1);

    // 已关闭状态再点外部：不触发
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(onClose).toHaveBeenCalledTimes(1);

    // 重开后恢复监听
    fireEvent.click(document.querySelector('[data-testid="reopen"]')!);
    rerender(<Harness onClose={onClose} />);
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('onClose 闭包变化不重复订阅（ref 转发）', () => {
    const first = vi.fn();
    const { rerender } = render(<Harness onClose={first} />);
    const second = vi.fn();
    rerender(<Harness onClose={second} />);
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
})
