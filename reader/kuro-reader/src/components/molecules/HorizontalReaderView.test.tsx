import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HorizontalReaderView } from './HorizontalReaderView';

const renderHorizontalReaderView = (
  overrides: Partial<React.ComponentProps<typeof HorizontalReaderView>> = {}
) => {
  const props: React.ComponentProps<typeof HorizontalReaderView> = {
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
    onImageClick: vi.fn(),
    onImageTouchStart: vi.fn(),
    onImageTouchMove: vi.fn(),
    onImageTouchEnd: vi.fn(),
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

  it('should apply single-page zoom styles and emit image page index', () => {
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
    expect(image).toHaveStyle({
      transform: 'scale(2)',
      transformOrigin: '20px 30px',
    });

    fireEvent.click(image);
    expect(onImageClick).toHaveBeenCalledWith(1, expect.any(Object));
  });
});
