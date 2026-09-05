import React, { useState } from 'react';

import { TEXT_READER_FONT_OPTIONS } from '@/constants/textReaderFonts';
import type { PaperType, TextFontFamily, TextAlign, TextReadingMode, TtsEngineOption } from '@/types';
import { cn } from '@/utils/cn';
import { getAllPaperTypes } from '@/utils/paperTexture';

/** 设置面板三 tab（建议书 6.9 动线五）：排版（高频）/ 外观 / 更多 */
type SettingsTab = 'typography' | 'appearance' | 'more';

const SETTINGS_TABS: { key: SettingsTab; label: string; icon: string }[] = [
  { key: 'typography', label: '排版', icon: 'format_size' },
  { key: 'appearance', label: '外观', icon: 'palette' },
  { key: 'more', label: '更多', icon: 'tune' },
];

export interface TextReaderBottomBarProps {
  fontSize: number;
  lineHeight: number;
  paperModeEnabled: boolean;
  paperType: PaperType;
  brightness: number;
  colorTemperature: number;
  textureIntensity: number;
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
  onTextureIntensityChange: (value: number) => void;
  onTextFontFamilyChange: (family: TextFontFamily) => void;
  onTextAlignChange: (align: TextAlign) => void;
  onFirstLineIndentToggle: () => void;
  verticalWriting: boolean;
  onVerticalWritingToggle: () => void;
  onTapZoneEnabledToggle: () => void;
  onAutoAdvanceTextChapterToggle: () => void;
  onAutoScrollSpeedChange: (speed: number) => void;
  onTextReadingModeChange: (mode: TextReadingMode) => void;
  ttsEngine: TtsEngineOption;
  ttsServerUrl: string;
  ttsServerModel: string;
  ttsServerVoice: string;
  onTtsEngineChange: (engine: TtsEngineOption) => void;
  onTtsServerFieldChange: (field: 'url' | 'model' | 'voice', value: string) => void;
  onClose: () => void;
}

// 字号 / 行距预设值（数值即业务含义，故豁免魔数检查）
// eslint-disable-next-line no-magic-numbers
const FONT_SIZES = [14, 16, 18, 20, 22, 24, 28];
// eslint-disable-next-line no-magic-numbers
const LINE_HEIGHTS = [1.4, 1.6, 1.8, 2.0, 2.2];

const LINE_HEIGHT_MATCH_EPSILON = 0.05;
const COLOR_TEMP_WARM_THRESHOLD = 50;

const READING_MODES: { mode: TextReadingMode; label: string; icon: string }[] = [
  { mode: 'scroll', label: '上下滚动', icon: 'swap_vert' },
  { mode: 'paginate', label: '左右翻页', icon: 'chevron_left' },
  { mode: 'columns', label: '双栏阅读', icon: 'view_week' },
  { mode: 'book', label: '模拟翻书', icon: 'menu_book' },
];

const TTS_ENGINE_OPTIONS: { option: TtsEngineOption; label: string; icon: string }[] = [
  { option: 'auto', label: '跟随系统', icon: 'auto_awesome' },
  { option: 'system', label: '系统语音', icon: 'record_voice_over' },
  { option: 'neural', label: '神经网络', icon: 'graphic_eq' },
  { option: 'server', label: '自定义服务', icon: 'dns' },
];

const TTS_INPUT_CLASS =
  'w-full h-10 rounded-lg border border-outline-variant bg-surface-container-high px-3 font-body text-body-sm text-on-surface placeholder:text-on-surface-faint focus:outline-none focus:border-primary';

const AUTO_ADVANCE_TEXT_CHAPTER_LABELS = {
  title: '章末自动衔接',
  enabled: '无缝续读：读完自动衔接下一章',
  disabled: '章末显示继续提示',
  enableAria: '开启章末自动衔接下一章',
  disableAria: '关闭章末自动衔接下一章',
} as const;

export const TextReaderBottomBar: React.FC<TextReaderBottomBarProps> = ({
  fontSize,
  lineHeight,
  paperModeEnabled,
  paperType,
  brightness,
  colorTemperature,
  textureIntensity,
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
  onTextureIntensityChange,
  onTextFontFamilyChange,
  onTextAlignChange,
  onFirstLineIndentToggle,
  verticalWriting,
  onVerticalWritingToggle,
  onTapZoneEnabledToggle,
  onAutoAdvanceTextChapterToggle,
  onAutoScrollSpeedChange,
  onTextReadingModeChange,
  ttsEngine,
  ttsServerUrl,
  ttsServerModel,
  ttsServerVoice,
  onTtsEngineChange,
  onTtsServerFieldChange,
  onClose,
}) => {
  const paperTypes = getAllPaperTypes();
  const [activeTab, setActiveTab] = useState<SettingsTab>('typography');

  // ── 排版 tab：字号 / 行距 / 字体 / 对齐 / 首行缩进 / 竖排 ──
  const typographyPanel = (
    <>
          {/* 字号控制 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-card-lg border border-outline-variant mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-icon-md">format_size</span>
                <p className="font-label text-label-md text-on-surface">字号</p>
                <span className="font-label text-label-sm text-on-surface-faint">（仅本书正文）</span>
              </div>
              <span className="font-mono text-label-sm text-on-surface-variant">{fontSize}px</span>
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
                    Math.abs(lineHeight - lh) < LINE_HEIGHT_MATCH_EPSILON
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

          {/* 字体 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <p className="font-label text-label-md text-on-surface mb-3">字体</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEXT_READER_FONT_OPTIONS.map(({ family, label, fontFamily }) => (
                <button
                  key={family}
                  className={cn(
                    'h-12 rounded-lg border text-label-sm transition-colors',
                    textFontFamily === family
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                  )}
                  style={{ fontFamily }}
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

          {/* 竖排书写 */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-lowest rounded-xl border border-outline-variant mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">view_agenda</span>
              <div>
                <p className="font-label text-label-md text-on-surface">竖排书写</p>
                <p className="font-body text-body-sm text-on-surface-variant">
                  {verticalWriting ? '已开启（滚动模式）' : '已关闭'}
                </p>
              </div>
            </div>
            <button
              className={cn(
                'relative inline-block w-11 h-6 rounded-full toggle-spring',
                verticalWriting ? 'bg-primary' : 'bg-surface-variant'
              )}
              onClick={onVerticalWritingToggle}
              aria-label={verticalWriting ? '关闭竖排书写' : '开启竖排书写'}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full toggle-thumb-spring border',
                  verticalWriting
                    ? 'translate-x-5 border-primary'
                    : 'border-outline-variant'
                )}
              />
            </button>
          </div>

          {/* ── 排版 tab 结束 ── */}
          </>
  );

  // ── 外观 tab：纸张模拟 / 纸张类型 / 纹理强度 / 亮度 / 色温 ──
  const appearancePanel = (
    <>
          {/* 纸张模拟 */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-lowest rounded-card-lg border border-outline-variant mb-4">
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
                {colorTemperature === 0 ? '冷光' : colorTemperature <= COLOR_TEMP_WARM_THRESHOLD ? '暖白' : '暖光'}
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


          {/* 纹理强度 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-card-lg border border-outline-variant mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-icon-md">texture</span>
                <p className="font-label text-label-md text-on-surface">纹理强度</p>
              </div>
              <span className="font-mono text-label-sm text-on-surface-variant">{textureIntensity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={textureIntensity}
              onChange={(e) => onTextureIntensityChange(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>






          {/* ── 外观 tab 结束 ── */}
          </>
  );

  // ── 更多 tab：阅读模式 / 章末连读 / 点击翻页 / 滚动速度 ──
  const morePanel = (
    <>
          <div className="py-3 px-4 bg-surface-container-lowest rounded-card-lg border border-outline-variant mb-4">
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
                  <span className="material-symbols-outlined text-icon-md">{icon}</span>
                  <span className="text-[11px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 章末自动下一章 */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-lowest rounded-card-lg border border-outline-variant mb-4">
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

          {/* 自动滚动速度 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-card-lg border border-outline-variant">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-icon-md">speed</span>
                <p className="font-label text-label-md text-on-surface">自动滚动速度</p>
              </div>
              <span className="font-mono text-label-sm text-on-surface-variant">{autoScrollSpeed}</span>
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

          {/* 听书发音引擎 */}
          <div className="py-3 px-4 bg-surface-container-lowest rounded-card-lg border border-outline-variant mb-4">
            <p className="font-label text-label-md text-on-surface mb-3">听书发音</p>
            <div className="grid grid-cols-4 gap-2">
              {TTS_ENGINE_OPTIONS.map(({ option, label, icon }) => (
                <button
                  key={option}
                  className={cn(
                    'flex-1 h-12 rounded-lg border text-label-sm font-label transition-colors flex flex-col items-center justify-center gap-1',
                    ttsEngine === option
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary/50'
                  )}
                  onClick={() => onTtsEngineChange(option)}
                >
                  <span className="material-symbols-outlined text-icon-md">{icon}</span>
                  <span className="text-[11px]">{label}</span>
                </button>
              ))}
            </div>
            {ttsEngine === 'neural' && (
              <p className="font-body text-body-sm text-on-surface-variant mt-3">
                离线神经网络中文语音（huayan）。首次使用需下载约 60-80MB 音色包，仅下载一次。
              </p>
            )}
            {ttsEngine === 'server' && (
              <div className="mt-3 space-y-2">
                <input
                  type="url"
                  value={ttsServerUrl}
                  placeholder="服务地址，如 http://192.168.1.10:9880"
                  className={TTS_INPUT_CLASS}
                  onChange={(e) => onTtsServerFieldChange('url', e.target.value)}
                />
                <input
                  type="text"
                  value={ttsServerModel}
                  placeholder="模型名（可选，默认 tts-1）"
                  className={TTS_INPUT_CLASS}
                  onChange={(e) => onTtsServerFieldChange('model', e.target.value)}
                />
                <input
                  type="text"
                  value={ttsServerVoice}
                  placeholder="音色名（可选，默认 alloy）"
                  className={TTS_INPUT_CLASS}
                  onChange={(e) => onTtsServerFieldChange('voice', e.target.value)}
                />
                <p className="font-body text-body-sm text-on-surface-variant">
                  兼容 OpenAI /v1/audio/speech 接口的自部署 TTS 服务
                </p>
              </div>
            )}
          </div>

          {/* ── 更多 tab 结束 ── */}
          </>
  );

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-sheet animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-surface/95 backdrop-blur-md border-t border-outline-variant/50 px-margin-mobile pb-safe">
        <div className="max-w-max-width-content mx-auto">
          {/* 标题栏 + tab 导航 */}
          <div className="pt-3 flex items-center justify-between">
            <span className="font-label text-label-md text-on-surface-variant">阅读设置</span>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
              onClick={onClose}
              aria-label="关闭"
            >
              <span className="material-symbols-outlined text-icon-md">close</span>
            </button>
          </div>
          <div className="flex gap-1 mt-1 mb-3 border-b border-outline-variant/50" role="tablist" aria-label="设置分组">
            {SETTINGS_TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                className={cn(
                  'relative flex-1 h-10 flex items-center justify-center gap-1.5 font-label text-label-md transition-colors',
                  activeTab === key ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                )}
                onClick={() => setActiveTab(key)}
              >
                <span className="material-symbols-outlined text-icon-md">{icon}</span>
                {label}
                {activeTab === key && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* 当前 tab 内容 */}
          <div
            className="overflow-y-auto scrollbar-hide pb-6"
            style={{
              WebkitOverflowScrolling: 'touch',
              maxHeight: 'calc(100vh - 260px)',
            }}
          >
            {activeTab === 'typography' && typographyPanel}
            {activeTab === 'appearance' && appearancePanel}
            {activeTab === 'more' && morePanel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextReaderBottomBar;
