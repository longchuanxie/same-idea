import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isNeuralSupported, resolveEngine, type TtsEngineConfig } from '@/services/tts/engineSelector';
import { isNativeTtsAvailable } from '@/services/tts/nativeTtsEngine';
import { TtsCancelledError, TtsUnavailableError, type TtsEngine } from '@/services/tts/types';
import { isWebSpeechSupported } from '@/services/tts/webSpeechEngine';
import { useAppStore } from '@/stores/useAppStore';

/** 单个语音分块上限（字符）：规避长文本单 utterance 的浏览器限制与中断问题 */
const CHUNK_MAX_LENGTH = 200;
/** 倍速档位（数值即业务语义，豁免魔数检查） */
// eslint-disable-next-line no-magic-numbers
const RATES = [1, 1.25, 1.5, 2];
/** 句末标点：分块切分边界 */
const SENTENCE_END_PATTERN = /[。！？!?；;]/g;
/** 播报语言 */
const SPEECH_LANG = 'zh-CN';
/** 系统/设备类引擎起播看门狗：窗口内未收到 onStart 即判引擎哑火（部分内核对象存在却永不发声） */
const VOICE_START_WATCHDOG_MS = 8000;

/** 带原文偏移的语音分块：text 恒等于 sourceText.slice(start, end) */
export interface SpeechChunk {
  text: string;
  start: number;
  end: number;
}

/** 在单段文本（无硬边界）上按句边界切分并合并为不超过上限的分块，偏移相对段首 */
function splitSegmentWithOffsets(text: string, maxLength: number): SpeechChunk[] {
  const boundaries: number[] = [];
  SENTENCE_END_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SENTENCE_END_PATTERN.exec(text)) !== null) {
    boundaries.push(match.index + match[0].length);
  }
  boundaries.push(text.length);

  const chunks: SpeechChunk[] = [];
  let cursor = 0;
  for (const boundary of boundaries) {
    if (boundary <= cursor) continue;
    const sentenceLength = boundary - cursor;
    if (sentenceLength > maxLength) {
      // 超长句硬切：均分为不超过上限的连续片
      for (let start = cursor; start < boundary; start += maxLength) {
        const end = Math.min(start + maxLength, boundary);
        chunks.push({ text: text.slice(start, end), start, end });
      }
      cursor = boundary;
      continue;
    }
    const last = chunks[chunks.length - 1];
    if (last && last.text.length + sentenceLength <= maxLength) {
      // 与前一分块合并（分块在原文上天然相邻，偏移直接延展）
      chunks[chunks.length - 1] = { text: text.slice(last.start, boundary), start: last.start, end: boundary };
    } else {
      chunks.push({ text: text.slice(cursor, boundary), start: cursor, end: boundary });
    }
    cursor = boundary;
  }
  return chunks;
}

/**
 * 在原文上按句边界切分并合并为不超过上限的分块，同时记录每个分块在原文中的精确偏移。
 * 与 splitSpeechChunks 的差异：不做空白归一，保证 offset 与原文逐字符对应（供听书范围高亮定位）。
 * breakOffsets（相对本文本的偏移）是额外硬边界：分块永不横跨边界——分页阅读时传入各页起点，
 * 使「分块起点所在页」随播报实时推进，跟读翻页恰在新页文字起读的瞬间触发。
 */
export function splitSpeechChunksWithOffsets(
  text: string,
  maxLength = CHUNK_MAX_LENGTH,
  breakOffsets: number[] = []
): SpeechChunk[] {
  if (!text.trim()) return [];
  const breaks = [...new Set(breakOffsets)]
    .filter((offset) => Number.isInteger(offset) && offset > 0 && offset < text.length)
    .sort((a, b) => a - b);

  const chunks: SpeechChunk[] = [];
  let segmentStart = 0;
  for (const breakAt of breaks) {
    if (breakAt > segmentStart) {
      for (const chunk of splitSegmentWithOffsets(text.slice(segmentStart, breakAt), maxLength)) {
        chunks.push({ text: chunk.text, start: segmentStart + chunk.start, end: segmentStart + chunk.end });
      }
      segmentStart = breakAt;
    }
  }
  for (const chunk of splitSegmentWithOffsets(text.slice(segmentStart), maxLength)) {
    chunks.push({ text: chunk.text, start: segmentStart + chunk.start, end: segmentStart + chunk.end });
  }
  return chunks.filter((chunk) => chunk.text.trim());
}

/** 兼容导出：仅需要分块文本时的旧接口 */
export function splitSpeechChunks(text: string, maxLength = CHUNK_MAX_LENGTH): string[] {
  return splitSpeechChunksWithOffsets(text, maxLength).map((chunk) => chunk.text);
}

export interface SpeechController {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  rate: number;
  /** 当前正在播报的分块下标（未播报时为 null） */
  currentIndex: number | null;
  /** 当前分块在传入文本中的偏移范围（未播报时为 null） */
  currentChunkRange: { start: number; end: number } | null;
  /** 当前会话的分块总数（供进度比例兜底） */
  chunkCount: number;
  /** 当前引擎显示名（播报中非空） */
  engineLabel: string;
  /** 合成进行中（神经网络/服务端引擎的合成耗时可见） */
  synthesizing: boolean;
  /** 从 text 起播；baseOffset 为 text 首字符在章节坐标系中的偏移；breakOffsets 为相对
   *  text 的硬边界（分页模式下各页起点），分块不跨界以便跟读翻页即时触发 */
  start: (text: string, baseOffset?: number, breakOffsets?: number[]) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  cycleRate: () => void;
}

/**
 * 听书播报编排器：分块队列 × 可插拔 TTS 引擎。
 * - 章节文本按句分块顺序播报，天然规避单 utterance 长度限制
 * - 引擎由 useAppStore 的 ttsEngine 设置解析（engineSelector），播报中切换设置会从当前分块续播
 * - 流水线：当前分块起播时即预合成下一分块（prepare），合成型引擎的解析耗时藏进播放时长里
 * - 会话令牌：stop/倍速切换后，旧分块的回调不再推进队列
 * - onFinished 仅在全部分块自然播完时触发（用于自动续播下一章）；引擎失败经 onError 上报
 * - currentChunkRange 叠加 baseOffset 后即「章节坐标系」的播报范围，供正文范围高亮跟读
 */
export function useSpeech(
  onFinished?: () => void,
  onError?: (message: string) => void,
  onNotice?: (message: string) => void
): SpeechController {
  const ttsEngineSetting = useAppStore((state) => state.settings.ttsEngine);
  const ttsServerUrl = useAppStore((state) => state.settings.ttsServerUrl);
  const ttsServerModel = useAppStore((state) => state.settings.ttsServerModel);
  const ttsServerVoice = useAppStore((state) => state.settings.ttsServerVoice);

  // 神经网络引擎在任何浏览器可用：无 Web Speech 的环境也视为支持（auto 链会落到神经网络）
  const supported = isWebSpeechSupported() || isNativeTtsAvailable() || isNeuralSupported();
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(RATES[0]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [currentChunkRange, setCurrentChunkRange] = useState<{ start: number; end: number } | null>(null);
  const [chunkCount, setChunkCount] = useState(0);
  const [engineLabel, setEngineLabel] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);

  const sessionRef = useRef(0);
  const chunksRef = useRef<SpeechChunk[]>([]);
  const indexRef = useRef(0);
  const rateRef = useRef(RATES[0]);
  const baseOffsetRef = useRef(0);
  const engineRef = useRef<TtsEngine | null>(null);
  const speakingRef = useRef(false);
  const pausedRef = useRef(false);
  /** 系统/设备类引擎的起播看门狗定时器 */
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 神经网络兜底每会话至多一次，防失败引擎与兜底引擎互相拉扯 */
  const fallbackTriedRef = useRef(false);
  /** 暂停期间调过倍速：resume 时以新倍速重播当前块 */
  const pendingRateRestartRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onNoticeRef = useRef(onNotice);
  onNoticeRef.current = onNotice;
  const speakNextRef = useRef<() => void>(() => undefined);

  const haltWithError = useCallback((message: string) => {
    speakingRef.current = false;
    pausedRef.current = false;
    setSpeaking(false);
    setPaused(false);
    setCurrentIndex(null);
    setCurrentChunkRange(null);
    setChunkCount(0);
    setSynthesizing(false);
    onErrorRef.current?.(message);
  }, []);

  const clearVoiceWatchdog = useCallback(() => {
    if (watchdogRef.current != null) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  /** 当前引擎哑火/失败后的兜底：换神经网络引擎从当前分块续播，并以 notice 告知换挡原因 */
  const tryNeuralFallback = useCallback((notice: string): boolean => {
    if (fallbackTriedRef.current) return false;
    const setting = useAppStore.getState().settings.ttsEngine;
    // 显式指定神经网络/自定义服务时不兜底：用户在调这两者，失败应如实上报
    if (setting === 'neural' || setting === 'server') return false;
    if (engineRef.current?.id === 'neural') return false;
    fallbackTriedRef.current = true;
    sessionRef.current += 1;
    clearVoiceWatchdog();
    engineRef.current?.cancel();
    engineRef.current = resolveEngine({ engine: 'neural', serverUrl: '', serverModel: '', serverVoice: '' });
    setEngineLabel(engineRef.current.label);
    onNoticeRef.current?.(notice);
    speakNextRef.current();
    return true;
  }, [clearVoiceWatchdog]);

  const speakNext = useCallback(() => {
    const session = sessionRef.current;
    const engine = engineRef.current;
    if (indexRef.current >= chunksRef.current.length) {
      speakingRef.current = false;
      pausedRef.current = false;
      setSpeaking(false);
      setPaused(false);
      setCurrentIndex(null);
      setCurrentChunkRange(null);
      setChunkCount(0);
      setSynthesizing(false);
      onFinishedRef.current?.();
      return;
    }
    setCurrentIndex(indexRef.current);
    const chunk = chunksRef.current[indexRef.current];
    setCurrentChunkRange({
      start: baseOffsetRef.current + chunk.start,
      end: baseOffsetRef.current + chunk.end,
    });
    setSynthesizing(true);
    clearVoiceWatchdog();
    // 系统/设备类引擎起播无声（部分内核对象存在却永不回调）时兜底换引擎，避免听书卡死转圈
    if (engine?.id === 'system' || engine?.id === 'native') {
      watchdogRef.current = setTimeout(() => {
        if (sessionRef.current !== session) return;
        engineRef.current?.cancel();
        if (tryNeuralFallback(`「${engine.label}」长时间无响应，已改用神经网络朗读`)) return;
        haltWithError(`「${engine.label}」长时间无响应，请换用其他发音引擎`);
      }, VOICE_START_WATCHDOG_MS);
    }
    engine?.speak(chunk.text, { rate: rateRef.current, lang: SPEECH_LANG }, {
      onStart: clearVoiceWatchdog,
      onDone: () => {
        if (sessionRef.current !== session) return;
        clearVoiceWatchdog();
        indexRef.current += 1;
        setSynthesizing(false);
        speakNext();
      },
      onError: (error) => {
        if (sessionRef.current !== session) return;
        clearVoiceWatchdog();
        setSynthesizing(false);
        if (error instanceof TtsCancelledError) return;
        // 系统语音引擎终态不可用（设备未装/未启用 TTS 引擎）:出路文案换神经网络续播
        if (error instanceof TtsUnavailableError) {
          if (tryNeuralFallback('本机没有可用的系统语音引擎，已改用神经网络朗读；安装系统语音引擎后可在发音引擎设置切回')) return;
          haltWithError(error.message);
          return;
        }
        if (tryNeuralFallback(`「${engine?.label ?? '当前引擎'}」朗读失败，已改用神经网络朗读`)) return;
        haltWithError(error.message || '语音播报失败');
      },
    });
    // 当前分块起播的同时后台预合成下一分块（神经网络/服务端引擎实现），消除块间解析间隙
    const nextChunk = chunksRef.current[indexRef.current + 1];
    if (nextChunk) engine?.prepare?.(nextChunk.text, { rate: rateRef.current, lang: SPEECH_LANG });
  }, [clearVoiceWatchdog, tryNeuralFallback, haltWithError]);
  speakNextRef.current = speakNext;

  const start = useCallback(
    (text: string, baseOffset = 0, breakOffsets?: number[]) => {
      if (!supported) return;
      sessionRef.current += 1;
      fallbackTriedRef.current = false;
      const engine = resolveEngine({
        engine: ttsEngineSetting,
        serverUrl: ttsServerUrl,
        serverModel: ttsServerModel,
        serverVoice: ttsServerVoice,
      });
      engineRef.current?.cancel();
      engineRef.current = engine;
      setEngineLabel(engine.label);
      chunksRef.current = splitSpeechChunksWithOffsets(text, CHUNK_MAX_LENGTH, breakOffsets);
      indexRef.current = 0;
      baseOffsetRef.current = baseOffset;
      setChunkCount(chunksRef.current.length);
      if (chunksRef.current.length === 0) {
        speakingRef.current = false;
        setSpeaking(false);
        setCurrentIndex(null);
        setCurrentChunkRange(null);
        return;
      }
      speakingRef.current = true;
      pausedRef.current = false;
      setSpeaking(true);
      setPaused(false);
      speakNext();
    },
    [supported, ttsEngineSetting, ttsServerUrl, ttsServerModel, ttsServerVoice, speakNext]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    sessionRef.current += 1;
    engineRef.current?.cancel();
    clearVoiceWatchdog();
    speakingRef.current = false;
    pausedRef.current = false;
    pendingRateRestartRef.current = false;
    setSpeaking(false);
    setPaused(false);
    setCurrentIndex(null);
    setCurrentChunkRange(null);
    setChunkCount(0);
    setSynthesizing(false);
  }, [supported, clearVoiceWatchdog]);

  const pause = useCallback(() => {
    if (!supported || !speakingRef.current || pausedRef.current) return;
    engineRef.current?.pause();
    pausedRef.current = true;
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported || !pausedRef.current) return;
    pausedRef.current = false;
    setPaused(false);
    if (pendingRateRestartRef.current) {
      // 暂停期间调过倍速：以新倍速重播当前块（原生引擎 resume 本就会从头重播，
      // 显式重建还能让 blob 引擎的旧倍速音频不再续播）
      pendingRateRestartRef.current = false;
      sessionRef.current += 1;
      engineRef.current?.cancel();
      speakNext();
      return;
    }
    engineRef.current?.resume();
  }, [supported, speakNext]);

  const cycleRate = useCallback(() => {
    const next = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length];
    rateRef.current = next;
    setRate(next);
    // 暂停中调倍速：不出声（原实现会立刻开播但 UI 仍显示暂停）；标记后由
    // resume 以新倍速重播当前块
    if (pausedRef.current) {
      pendingRateRestartRef.current = true;
      return;
    }
    // 倍速对当前播报不生效：取消当前块并以新倍速重启
    if (speakingRef.current) {
      sessionRef.current += 1;
      engineRef.current?.cancel();
      speakNext();
    }
  }, [speakNext]);

  // 播报中切换引擎/服务配置：取消当前块，换引擎从当前分块续播
  const ttsConfigRef = useRef<TtsEngineConfig>({
    engine: ttsEngineSetting,
    serverUrl: ttsServerUrl,
    serverModel: ttsServerModel,
    serverVoice: ttsServerVoice,
  });
  ttsConfigRef.current = {
    engine: ttsEngineSetting,
    serverUrl: ttsServerUrl,
    serverModel: ttsServerModel,
    serverVoice: ttsServerVoice,
  };
  useEffect(() => {
    if (!speakingRef.current) return;
    const engine = resolveEngine(ttsConfigRef.current);
    if (engine.id === engineRef.current?.id && engine.id !== 'server') return;
    sessionRef.current += 1;
    // 用户手动换引擎：新引擎重新获得一次哑火兜底机会
    fallbackTriedRef.current = false;
    engineRef.current?.cancel();
    engineRef.current = engine;
    setEngineLabel(engine.label);
    pausedRef.current = false;
    setPaused(false);
    speakNext();
  }, [ttsEngineSetting, ttsServerUrl, ttsServerModel, ttsServerVoice, speakNext]);

  // 卸载时停止播报，避免离开阅读器后仍在朗读
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (watchdogRef.current != null) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
    };
  }, []);

  // 返回稳定引用：消费方（如章节切换 effect）可安全将其列入依赖
  return useMemo(
    () => ({
      supported,
      speaking,
      paused,
      rate,
      currentIndex,
      currentChunkRange,
      chunkCount,
      engineLabel,
      synthesizing,
      start,
      stop,
      pause,
      resume,
      cycleRate,
    }),
    [supported, speaking, paused, rate, currentIndex, currentChunkRange, chunkCount, engineLabel, synthesizing, start, stop, pause, resume, cycleRate]
  );
}
