import React from 'react';

import { cn } from '@/utils/cn';
import { getAllPaperTypes } from '@/utils/paperTexture';
import type { PaperType, ReadingTheme, TextFontFamily, TextAlign, TextReadingMode } from '@/types';

export interface TextReaderBottomBarProps {
  fontSize: number;
  lineHeight: number;
  paperModeEnabled: boolean;
  paperType: PaperType;
  brightness: number;
  colorTemperature: number;
  readingTheme: ReadingTheme;
  textFontFamily: TextFontFamily;
  textAlign: TextAlign;
  firstLineIndent: boolean;
  tapZoneEnabled: boolean;
  autoAdvanceTextChapter: boolean;
  autoScrollSpeed: number;
  textReadingMode: TextReadingMode;
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (lineHeight: number) => void;
  onPaperModeToggle: () => void;
  onPaperTypeChange: (type: PaperType) => void;
  onBrightnessChange: (value: number) => void;
  onColorTemperatureChange: (value: number) => void;
  onReadingThemeChange: (theme: ReadingTheme) => void;
  onTextFontFamilyChange: (family: TextFontFamily) => void;
  onTextAlignChange: (align: TextAlign) => void;
  onFirstLineIndentToggle: () => void;
  onTapZoneEnabledToggle: () => void;
  onAutoAdvanceTextChapterToggle: () => void;
  onAutoScrollSpeedChange: (speed: number) => void;
  onTextReadingModeChange: (mode: TextReadingMode) => void;
  onClose: () => void;
  onBookmarkListOpen?: () => void;
  onAnnotationListOpen?: () => void;
  onFavoriteToggle?: () => void;
  isBookmarked?: boolean;
  isFavorite?: boolean;
}

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 28];
const LINE_HEIGHTS = [1.4, 1.6, 1.8, 2.0, 2.2];

const READING_THEMES: { theme: ReadingTheme; label: string; bg: string; color: string }[] = [
  { theme: 'light', label: '白色', bg: '#ffffff', color: '#1a1a1a' },
  { theme: 'green', label: '护眼', bg: '#c7edcc', color: '#2d3a2d' },
  { theme: 'sepia', label: '羊皮纸', bg: '#f5e6c8', color: '#5b4636' },
  { theme: 'dark', label: '暗夜', bg: '#1a1a1a', color: '#b8b8b8' },
];

const TEXT_FONTS: { family: TextFontFamily; label: string }[] = [
  { family: 'serif', label: '宋体' },
  { family: 'kaiti', label: '楷体' },
  { family: 'sans', label: '黑体' },
  { family: 'system', label: '系统' },
];

const READING_MODES: { mode: TextReadingMode; label: string; icon: string }[] = [
  { mode: 'scroll', label: '上下滚动', icon: 'swap_vert' },
  { mode: 'paginate', label: '左右翻页', icon: 'chevron_left' },
  { mode: 'columns', label: '双栏阅读', icon: 'view_week' },
  { mode: 'book', label: '模拟翻书', icon: 'menu_book' },
];

const AUTO_ADVANCE_TEXT_CHAPTER_LABELS = {
  title: '\u7ae0\u672b\u81ea\u52a8\u4e0b\u4e00\u7ae0',
  enabled: '\u6eda\u52a8\u5230\u5e95\u81ea\u52a8\u8fdb\u5165\u4e0b\u4e00\u7ae0',
  disabled: '\u6eda\u52a8\u5230\u5e95\u663e\u793a\u7ee7\u7eed\u63d0\u793a',
  enableAria: '\u5f00\u542f\u7ae0\u672b\u81ea\u52a8\u4e0b\u4e00\u7ae0',
  disableAria: '\u5173\u95ed\u7ae0\u672b\u81ea\u52a8\u4e0b\u4e00\u7ae0',
} as const;

export const TextReaderBottomBar: React.FC<TextReaderBottomBarProps> = ({
  fontSize,
  lineHeight,
  paperModeEnabled,
  paperType,
  brightness,
  colorTemperature,
  readingTheme,
  textFontFamily,
  textAlign,
  firstLineIndent,
  tapZoneEnabled,
  autoAdvanceTextChapter,
  autoScrollSpeed,
  textReadingMode,
  onFontSizeChange,
  onLineHeightChange,
  onPaperModeToggle,
  onPaperTypeChange,
  onBrightnessChange,
  onColorTemperatureChange,
  onReadingThemeChange,
  onTextFontFamilyChange,
  onTextAlignChange,
  onFirstLineIndentToggle,
  onTapZoneEnabledToggle,
  onAutoAdvanceTextChapterToggle,
  onAutoScrollSpeedChange,
  onTextReadingModeChange,
  onClose,
  onBookmarkListOpen,
  onAnnotationListOpen,
  onFavoriteToggle,
  isBookmarked,
  isFavorite,
}) => {
  const paperTypes = getAllPaperTypes();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-surface/95 backdrop-blur-md border-t border-outline-variant/50 px-margin-mobile">
        <div className="max-w-max-width-content mx-auto">
          {/* 标题栏 */}
          <div className="pt-4 pb-3 flex items-center justify-between">
            <span className="font-label text-label-md text-on-surface-variant">阅读设置</span>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
              onClick={onClose}
              aria-label="关闭"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* 可滚动内容 */}
          <div
            className="overflow-y-auto scrollbar-hide"
            style={{
              WebkitOverflowScrolling: 'touch',
              maxHeight: 'calc(100vh - 220px)',
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
            }}
          >

          {/* 阅读模式 */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">last_page</span>
              <div>
                <p className="font-label text-label-md text-on-surface">{AUTO_ADVANCE_TEXT_CHAPTER_LABELS.title}</p>
                <p className="font-body text-body-sm text-on-surface-variant">
                  {autoAdvanceTextChapter ? AUTO_ADVANCE_TEXT_CHAPTER_LABELS.enabled : AUTO_ADVANCE_TEXT_CHAPTER_LABELS.disabled}
                </p>
              </div>
            </div>
            <button
              className={cn(
                'relative inline-block w-11 h-6 rounded-full toggle-spring',
                autoAdvanceTextChapter ? 'bg-primary' : 'bg-surface-variant'
              )}
              onClick={onAutoAdvanceTextChapterToggle}
              aria-label={autoAdvanceTextChapter ? AUTO_ADVANCE_TEXT_CHAPTER_LABELS.disableAria : AUTO_ADVANCE_TEXT_CHAPTER_LABELS.enableAria}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border',
                  autoAdvanceTextChapter
                    ? 'translate-x-5 border-primary'
                    : 'border-outline-variant'
                )}
              />
            </button>
          </div>

          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <p className="font-label text-label-md text-on-surface mb-3">阅读模式</p>
            <div className="grid grid-cols-4 gap-2">
              {READING_MODES.map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  className={cn(
                    'flex-1 h-12 rounded-lg border text-label-sm font-label transition-colors flex flex-col items-center justify-center gap-1',
                    textReadingMode === mode
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                  )}
                  onClick={() => onTextReadingModeChange(mode)}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  <span className="text-[11px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 字号控制 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">format_size</span>
                <p className="font-label text-label-md text-on-surface">字号</p>
              </div>
              <span className="font-label text-label-sm text-on-surface-variant">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-30"
                onClick={() => {
                  const idx = FONT_SIZES.indexOf(fontSize);
                  if (idx > 0) onFontSizeChange(FONT_SIZES[idx - 1]);
                  else if (fontSize > FONT_SIZES[0]) onFontSizeChange(fontSize - 2);
                }}
                disabled={fontSize <= FONT_SIZES[0]}
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <div className="flex-1 flex gap-1.5 justify-center">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    className={cn(
                      'h-8 px-2 rounded-lg border text-label-sm font-label transition-colors',
                      fontSize === size
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                    )}
                    onClick={() => onFontSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-30"
                onClick={() => {
                  const idx = FONT_SIZES.indexOf(fontSize);
                  if (idx >= 0 && idx < FONT_SIZES.length - 1) onFontSizeChange(FONT_SIZES[idx + 1]);
                  else onFontSizeChange(fontSize + 2);
                }}
                disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* 行高控制 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">format_line_spacing</span>
                <p className="font-label text-label-md text-on-surface">行距</p>
              </div>
              <span className="font-label text-label-sm text-on-surface-variant">{lineHeight.toFixed(1)}</span>
            </div>
            <div className="flex gap-2">
              {LINE_HEIGHTS.map((lh) => (
                <button
                  key={lh}
                  className={cn(
                    'flex-1 h-9 rounded-lg border text-label-sm font-label transition-colors',
                    Math.abs(lineHeight - lh) < 0.05
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                  )}
                  onClick={() => onLineHeightChange(lh)}
                >
                  {lh.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 纸张模拟 */}
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

          {/* 纸张类型 */}
          {paperModeEnabled && (
            <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
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

          {/* 亮度 */}
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

          {/* 色温 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">thermostat</span>
                <p className="font-label text-label-md text-on-surface">色温</p>
              </div>
              <span className="font-label text-label-sm text-on-surface-variant">
                {colorTemperature === 0 ? '冷光' : colorTemperature <= 50 ? '暖白' : '暖光'}
              </span>
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

          {/* 阅读主题 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <p className="font-label text-label-md text-on-surface mb-3">阅读主题</p>
            <div className="flex gap-3">
              {READING_THEMES.map(({ theme, label, bg, color }) => (
                <button
                  key={theme}
                  className={cn(
                    'flex-1 h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1',
                    readingTheme === theme
                      ? 'border-primary shadow-md scale-105'
                      : 'border-outline-variant hover:border-primary/50'
                  )}
                  style={{ backgroundColor: bg }}
                  onClick={() => onReadingThemeChange(theme)}
                >
                  <span className="text-xs font-medium" style={{ color }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 字体 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <p className="font-label text-label-md text-on-surface mb-3">字体</p>
            <div className="flex gap-2">
              {TEXT_FONTS.map(({ family, label }) => (
                <button
                  key={family}
                  className={cn(
                    'flex-1 h-10 rounded-lg border text-label-sm font-label transition-colors',
                    textFontFamily === family
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                  )}
                  onClick={() => onTextFontFamilyChange(family)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 文字对齐 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <p className="font-label text-label-md text-on-surface mb-3">文字对齐</p>
            <div className="flex gap-2">
              <button
                className={cn(
                  'flex-1 h-10 rounded-lg border text-label-sm font-label transition-colors flex items-center justify-center gap-2',
                  textAlign === 'left'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                )}
                onClick={() => onTextAlignChange('left')}
              >
                <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                左对齐
              </button>
              <button
                className={cn(
                  'flex-1 h-10 rounded-lg border text-label-sm font-label transition-colors flex items-center justify-center gap-2',
                  textAlign === 'justify'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                )}
                onClick={() => onTextAlignChange('justify')}
              >
                <span className="material-symbols-outlined text-[18px]">format_align_justify</span>
                两端对齐
              </button>
            </div>
          </div>

          {/* 首行缩进 */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">format_indent_increase</span>
              <div>
                <p className="font-label text-label-md text-on-surface">首行缩进</p>
                <p className="font-body text-body-sm text-on-surface-variant">
                  {firstLineIndent ? '已开启（2字符）' : '已关闭'}
                </p>
              </div>
            </div>
            <button
              className={cn(
                'relative inline-block w-11 h-6 rounded-full toggle-spring',
                firstLineIndent ? 'bg-primary' : 'bg-surface-variant'
              )}
              onClick={onFirstLineIndentToggle}
              aria-label={firstLineIndent ? '关闭首行缩进' : '开启首行缩进'}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border',
                  firstLineIndent
                    ? 'translate-x-5 border-primary'
                    : 'border-outline-variant'
                )}
              />
            </button>
          </div>

          {/* 点击区域翻页 */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">touch_app</span>
              <div>
                <p className="font-label text-label-md text-on-surface">点击区域翻页</p>
                <p className="font-body text-body-sm text-on-surface-variant">
                  {tapZoneEnabled ? '上下翻页，中间显隐菜单' : '点击仅显隐菜单'}
                </p>
              </div>
            </div>
            <button
              className={cn(
                'relative inline-block w-11 h-6 rounded-full toggle-spring',
                tapZoneEnabled ? 'bg-primary' : 'bg-surface-variant'
              )}
              onClick={onTapZoneEnabledToggle}
              aria-label={tapZoneEnabled ? '关闭点击区域翻页' : '开启点击区域翻页'}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border',
                  tapZoneEnabled
                    ? 'translate-x-5 border-primary'
                    : 'border-outline-variant'
                )}
              />
            </button>
          </div>

          {/* 工具入口：书签列表 / 批注列表 / 收藏 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <p className="font-label text-label-md text-on-surface mb-3">工具</p>
            <div className="flex gap-2">
              <button
                className={cn(
                  'flex-1 h-12 rounded-lg border text-label-sm font-label transition-colors flex flex-col items-center justify-center gap-1',
                  isBookmarked
                    ? 'bg-primary/10 text-primary border-primary/50'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                )}
                onClick={onBookmarkListOpen}
              >
                <span className="material-symbols-outlined text-[18px]">bookmarks</span>
                <span className="text-[11px]">书签列表</span>
              </button>
              <button
                className="flex-1 h-12 rounded-lg border text-label-sm font-label transition-colors flex flex-col items-center justify-center gap-1 bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50"
                onClick={onAnnotationListOpen}
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span className="text-[11px]">批注列表</span>
              </button>
              <button
                className={cn(
                  'flex-1 h-12 rounded-lg border text-label-sm font-label transition-colors flex flex-col items-center justify-center gap-1',
                  isFavorite
                    ? 'bg-primary/10 text-primary border-primary/50'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                )}
                onClick={onFavoriteToggle}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {isFavorite ? 'favorite' : 'favorite_border'}
                </span>
                <span className="text-[11px]">{isFavorite ? '已收藏' : '收藏'}</span>
              </button>
            </div>
          </div>

          {/* 自动滚动速度 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">speed</span>
                <p className="font-label text-label-md text-on-surface">自动滚动速度</p>
              </div>
              <span className="font-label text-label-sm text-on-surface-variant">{autoScrollSpeed}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={autoScrollSpeed}
              onChange={(e) => onAutoScrollSpeedChange(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TextReaderBottomBar;
