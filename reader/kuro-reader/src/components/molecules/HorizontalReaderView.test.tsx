import type { ComponentProps } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HorizontalReaderView } from './HorizontalReaderView';

const renderHorizontalReaderView = (
  overrides: Partial<ComponentProps<typeof HorizontalReaderView>> = {}
) => {
  const props: ComponentProps<typeof HorizontalReaderView> = {
    pageLayout: 'double',
    readingDirection: 'rtl',
    pageUrls: ['page-1.jpg', 'page-2.jpg'],
    currentPage: 1,
    currentPageLabel: '1-2',
    totalPages: 2,
    horizontalPageSpread: [2, 1],
    zoomScale: 1,
    zoomOrigin: { x: 0, y: 0 },
    paperConfig: null,
    onSurfaceClick: vi.fn(),
    onSurfaceTouchStart: vi.fn(),
    onSurfaceTouchMove: vi.fn(),
    onSurfaceTouchEnd: vi.fn(),
    onImageClick: vi.fn(),
    ...overrides,
  };

  render(<HorizontalReaderView {...props} />);
  return props;
};

describe('HorizontalReaderView', () => {
  it('should render double-page spread in visual order', () => {
    renderHorizontalReaderView();

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'Page 2');
    expect(images[1]).toHaveAttribute('alt', 'Page 1');
  });

  it('should keep a loading slot when one spread page is missing', () => {
    renderHorizontalReaderView({
      pageUrls: ['page-1.jpg', null],
    });

    expect(screen.getByRole('img', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByText('progress_activity')).toBeInTheDocument();
  });

  it('should apply single-page zoom transform on the content wrapper and emit image page index', () => {
    const onImageClick = vi.fn();
    renderHorizontalReaderView({
      pageLayout: 'single',
      readingDirection: 'ltr',
      currentPage: 2,
      currentPageLabel: '2',
      horizontalPageSpread: [2],
      zoomScale: 2,
      zoomOrigin: { x: 20, y: 30 },
      onImageClick,
    });

    const image = screen.getByRole('img', { name: 'Page 2' });
    // 缩放作用于内容容器（中心锚定 + 平移钳制），img 本身不再带 transform
    expect(image.parentElement).toHaveStyle({
      transform: 'translate(0px, 0px) scale(2)',
    });

    fireEvent.click(image);
    expect(onImageClick).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('should pan the zoomed content by drag within clamped bounds', () => {
    renderHorizontalReaderView({
      pageLayout: 'single',
      readingDirection: 'ltr',
      currentPage: 2,
      currentPageLabel: '2',
      horizontalPageSpread: [2],
      zoomScale: 2,
      zoomOrigin: { x: 0, y: 0 },
    });

    const surface = screen.getByTestId('horizontal-reader-surface');
    const content = screen.getByRole('img', { name: 'Page 2' }).parentElement as HTMLElement;
    // jsdom 无布局：桩定内容与视口尺寸，得到 maxX=(600*2-400)/2=400、maxY=(300*2-300)/2=150
    Object.defineProperty(content, 'offsetWidth', { value: 600 });
    Object.defineProperty(content, 'offsetHeight', { value: 300 });
    Object.defineProperty(surface, 'clientWidth', { value: 400 });
    Object.defineProperty(surface, 'clientHeight', { value: 300 });

    fireEvent.touchStart(surface, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(surface, { touches: [{ clientX: 340, clientY: 40 }] });

    // 拖拽 (240, -60)，在范围内原样生效
    expect(content).toHaveStyle({ transform: 'translate(240px, -60px) scale(2)' });

    fireEvent.touchStart(surface, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(surface, { touches: [{ clientX: 600, clientY: 400 }] });

    // 超出范围被钳制到 (400, 150)
    expect(content).toHaveStyle({ transform: 'translate(400px, 150px) scale(2)' });
  });

  it('should capture gestures on the blank reading surface', () => {
    const onSurfaceTouchStart = vi.fn();
    const onSurfaceTouchEnd = vi.fn();
    renderHorizontalReaderView({
      onSurfaceTouchStart,
      onSurfaceTouchEnd,
    });

    const surface = screen.getByTestId('horizontal-reader-surface');
    fireEvent.touchStart(surface);
    fireEvent.touchEnd(surface);

    expect(onSurfaceTouchStart).toHaveBeenCalled();
    expect(onSurfaceTouchEnd).toHaveBeenCalled();
  });

  it('should not emit a second page turn click after a swipe', () => {
    const onSurfaceClick = vi.fn();
    const onImageClick = vi.fn();
    renderHorizontalReaderView({
      onSurfaceClick,
      onImageClick,
    });

    const surface = screen.getByTestId('horizontal-reader-surface');
    const image = screen.getByRole('img', { name: 'Page 2' });
    fireEvent.touchStart(surface, {
      touches: [{ clientX: 240, clientY: 120 }],
    });
    fireEvent.touchMove(surface, {
      touches: [{ clientX: 120, clientY: 120 }],
    });
    fireEvent.touchEnd(surface, {
      changedTouches: [{ clientX: 120, clientY: 120 }],
    });
    fireEvent.click(image);

    expect(onImageClick).not.toHaveBeenCalled();
    expect(onSurfaceClick).not.toHaveBeenCalled();
  });
});
