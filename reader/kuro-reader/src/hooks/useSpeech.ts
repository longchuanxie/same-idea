import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { resolveEngine, type TtsEngineConfig } from '@/services/tts/engineSelector';
import { isNativeTtsAvailable } from '@/services/tts/nativeTtsEngine';
import { TtsCancelledError, type TtsEngine } from '@/services/tts/types';
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

/** 带原文偏移的语音分块：text 恒等于 sourceText.slice(start, end) */
export interface SpeechChunk {
  text: string;
  start: number;
  end: number;
}

/**
 * 在原文上按句边界切分并合并为不超过上限的分块，同时记录每个分块在原文中的精确偏移。
 * 与 splitSpeechChunks 的差异：不做空白归一，保证 offset 与原文逐字符对应（供听书范围高亮定位）。
 */
export function splitSpeechChunksWithOffsets(text: string, maxLength = CHUNK_MAX_LENGTH): SpeechChunk[] {
  if (!text.trim()) return [];
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
  start: (text: string, baseOffset?: number) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  cycleRate: () => void;
}

/**
 * 听书播报编排器：分块队列 × 可插拔 TTS 引擎。
 * - 章节文本按句分块顺序播报，天然规避单 utterance 长度限制
 * - 引擎由 useAppStore 的 ttsEngine 设置解析（engineSelector），播报中切换设置会从当前分块续播
 * - 会话令牌：stop/倍速切换后，旧分块的回调不再推进队列
 * - onFinished 仅在全部分块自然播完时触发（用于自动续播下一章）；引擎失败经 onError 上报
 * - currentChunkRange 叠加 baseOffset 后即「章节坐标系」的播报范围，供正文范围高亮跟读
 */
export function useSpeech(onFinished?: () => void, onError?: (message: string) => void): SpeechController {
  const ttsEngineSetting = useAppStore((state) => state.settings.ttsEngine);
  const ttsServerUrl = useAppStore((state) => state.settings.ttsServerUrl);
  const ttsServerModel = useAppStore((state) => state.settings.ttsServerModel);
  const ttsServerVoice = useAppStore((state) => state.settings.ttsServerVoice);

  const supported = isWebSpeechSupported() || isNativeTtsAvailable();
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
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

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
    engine?.speak(chunk.text, { rate: rateRef.current, lang: SPEECH_LANG }, {
      onDone: () => {
        if (sessionRef.current !== session) return;
        indexRef.current += 1;
        setSynthesizing(false);
        speakNext();
      },
      onError: (error) => {
        if (sessionRef.current !== session) return;
        setSynthesizing(false);
        if (error instanceof TtsCancelledError) return;
        speakingRef.current = false;
        pausedRef.current = false;
        setSpeaking(false);
        setPaused(false);
        setCurrentIndex(null);
        setCurrentChunkRange(null);
        setChunkCount(0);
        onErrorRef.current?.(error.message || '语音播报失败');
      },
    });
  }, []);

  const start = useCallback(
    (text: string, baseOffset = 0) => {
      if (!supported) return;
      sessionRef.current += 1;
      const engine = resolveEngine({
        engine: ttsEngineSetting,
        serverUrl: ttsServerUrl,
        serverModel: ttsServerModel,
        serverVoice: ttsServerVoice,
      });
      engineRef.current?.cancel();
      engineRef.current = engine;
      setEngineLabel(engine.label);
      chunksRef.current = splitSpeechChunksWithOffsets(text);
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
    speakingRef.current = false;
    pausedRef.current = false;
    setSpeaking(false);
    setPaused(false);
    setCurrentIndex(null);
    setCurrentChunkRange(null);
    setChunkCount(0);
    setSynthesizing(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported || !speakingRef.current || pausedRef.current) return;
    engineRef.current?.pause();
    pausedRef.current = true;
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported || !pausedRef.current) return;
    engineRef.current?.resume();
    pausedRef.current = false;
    setPaused(false);
  }, [supported]);

  const cycleRate = useCallback(() => {
    const next = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length];
    rateRef.current = next;
    setRate(next);
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
