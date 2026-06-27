import type { FC } from 'react';

import type { PaperType } from '@/types';
import { cn } from '@/utils/cn';
import { getAllPaperTypes } from '@/utils/paperTexture';

type ReadingDirection = 'rtl' | 'ltr';

const READING_DIRECTION_LABELS: Record<ReadingDirection, string> = {
  rtl: '\u4ece\u53f3\u81f3\u5de6',
  ltr: '\u4ece\u5de6\u81f3\u53f3',
};

const WARM_TEMPERATURE_THRESHOLD = 50;

export interface ReaderBottomBarProps {
  direction: 'vertical' | 'horizontal';
  pageLayout: 'single' | 'double';
  readingDirection: ReadingDirection;
  paperModeEnabled: boolean;
  paperType: PaperType;
  brightness: number;
  colorTemperature: number;
  onDirectionChange: (dir: 'vertical' | 'horizontal') => void;
  onPageLayoutChange: (layout: 'single' | 'double') => void;
  onReadingDirectionChange: (direction: ReadingDirection) => void;
  onPaperModeToggle: () => void;
  onPaperTypeChange: (type: PaperType) => void;
  onBrightnessChange: (value: number) => void;
  onColorTemperatureChange: (value: number) => void;
  onClose: () => void;
}

export const ReaderBottomBar: FC<ReaderBottomBarProps> = ({
  direction,
  pageLayout,
  readingDirection,
  paperModeEnabled,
  paperType,
  brightness,
  colorTemperature,
  onDirectionChange,
  onPageLayoutChange,
  onReadingDirectionChange,
  onPaperModeToggle,
  onPaperTypeChange,
  onBrightnessChange,
  onColorTemperatureChange,
  onClose,
}) => {
  const paperTypes = getAllPaperTypes();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-surface/95 backdrop-blur-md border-t border-outline-variant/50 px-margin-mobile py-5 pb-safe">
        <div className="max-w-max-width-content mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label text-label-md text-on-surface-variant">阅读设置</span>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
              onClick={onClose}
              aria-label="关闭"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              className={cn(
                'flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors',
                direction === 'vertical'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
              )}
              onClick={() => onDirectionChange('vertical')}
            >
              <span className="material-symbols-outlined text-[24px]">swap_vert</span>
              <span className="font-label text-label-sm">条漫</span>
            </button>
            <button
              className={cn(
                'flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors',
                direction === 'horizontal'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
              )}
              onClick={() => onDirectionChange('horizontal')}
            >
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
              <span className="font-label text-label-sm">水平翻页</span>
            </button>
          </div>

          {direction === 'horizontal' && (
            <div className="flex gap-3 mb-4">
              <button
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors',
                  pageLayout === 'single'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                )}
                onClick={() => onPageLayoutChange('single')}
              >
                <span className="material-symbols-outlined text-[24px]">crop_portrait</span>
                <span className="font-label text-label-sm">单页</span>
              </button>
              <button
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors',
                  pageLayout === 'double'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                )}
                onClick={() => onPageLayoutChange('double')}
              >
                <span className="material-symbols-outlined text-[24px]">auto_stories</span>
                <span className="font-label text-label-sm">双页</span>
              </button>
            </div>
          )}

          {direction === 'horizontal' && (
            <div className="flex gap-3 mb-4">
              <button
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors',
                  readingDirection === 'rtl'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                )}
                onClick={() => onReadingDirectionChange('rtl')}
              >
                <span className="material-symbols-outlined text-[24px]">format_textdirection_r_to_l</span>
                <span className="font-label text-label-sm">{READING_DIRECTION_LABELS.rtl}</span>
              </button>
              <button
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors',
                  readingDirection === 'ltr'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                )}
                onClick={() => onReadingDirectionChange('ltr')}
              >
                <span className="material-symbols-outlined text-[24px]">format_textdirection_l_to_r</span>
                <span className="font-label text-label-sm">{READING_DIRECTION_LABELS.ltr}</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">note</span>
              <div>
                <p className="font-label text-label-md text-on-surface">纸张模拟效果</p>
                <p className="font-body text-body-sm text-on-surface-variant">
                  {paperModeEnabled ? '已开启' : '已关闭'}
                </p>
              </div>
            </div>
            <button
              className={cn(
                'relative inline-block w-11 h-6 rounded-full toggle-spring',
                paperModeEnabled ? 'bg-primary' : 'bg-surface-variant'
              )}
              onClick={onPaperModeToggle}
              aria-label={paperModeEnabled ? '关闭纸张模式' : '开启纸张模式'}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border',
                  paperModeEnabled
                    ? 'translate-x-5 border-primary'
                    : 'border-outline-variant'
                )}
              />
            </button>
          </div>

          {paperModeEnabled && (
            <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
              <p className="font-label text-label-md text-on-surface mb-3">纸张类型</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {paperTypes.map(({ type, config }) => (
                  <button
                    key={type}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg border whitespace-nowrap transition-colors',
                      paperType === type
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                    )}
                    onClick={() => onPaperTypeChange(type)}
                  >
                    <span className="material-symbols-outlined text-[16px]">{config.icon}</span>
                    <span className="font-label text-label-sm">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">brightness_6</span>
                <p className="font-label text-label-md text-on-surface">亮度</p>
              </div>
              <span className="font-label text-label-sm text-on-surface-variant">{brightness}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={brightness}
              onChange={(e) => onBrightnessChange(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">thermostat</span>
                <p className="font-label text-label-md text-on-surface">色温</p>
              </div>
              <span className="font-label text-label-sm text-on-surface-variant">{colorTemperature === 0 ? '冷光' : colorTemperature <= WARM_TEMPERATURE_THRESHOLD ? '暖白' : '暖光'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={colorTemperature}
              onChange={(e) => onColorTemperatureChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
              style={{ background: `linear-gradient(to right, #ffffff, #ffcc80)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderBottomBar;
