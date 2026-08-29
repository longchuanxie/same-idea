import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** 单个语音分块上限（字符）：规避长文本单 utterance 的浏览器限制与中断问题 */
const CHUNK_MAX_LENGTH = 200;
/** 倍速档位 */
const RATES = [1, 1.25, 1.5, 2];

/** 按句子边界切分并合并为不超过上限的分块 */
export function splitSpeechChunks(text: string, maxLength = CHUNK_MAX_LENGTH): string[] {
  const sentences = text
    .replace(/\s*\n\s*/g, '\n')
    .split(/(?<=[。！？!?；;])/)
    .filter((s) => s.trim());
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (sentence.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      for (let i = 0; i < sentence.length; i += maxLength) {
        chunks.push(sentence.slice(i, i + maxLength));
      }
      continue;
    }
    if (current.length + sentence.length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

export interface SpeechController {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  rate: number;
  start: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  cycleRate: () => void;
}

/**
 * Web Speech API 听书控制器。
 * - 章节文本按句分块顺序播报，天然规避单 utterance 长度限制
 * - 会话令牌：用户停止后，已在播放的 utterance 的 onend 不再推进队列
 * - onFinished 仅在全部分块自然播完时触发（用于自动续播下一章）
 */
export function useSpeech(onFinished?: () => void): SpeechController {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(RATES[0]);
  const sessionRef = useRef(0);
  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const rateRef = useRef(RATES[0]);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const speakNext = useCallback(() => {
    const synth = window.speechSynthesis;
    const session = sessionRef.current;
    if (indexRef.current >= chunksRef.current.length) {
      setSpeaking(false);
      setPaused(false);
      onFinishedRef.current?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunksRef.current[indexRef.current]);
    utterance.rate = rateRef.current;
    utterance.lang = 'zh-CN';
    utterance.onend = () => {
      if (sessionRef.current !== session) return;
      indexRef.current += 1;
      speakNext();
    };
    utterance.onerror = () => {
      if (sessionRef.current !== session) return;
      setSpeaking(false);
    };
    synth.speak(utterance);
  }, []);

  const start = useCallback(
    (text: string) => {
      if (!supported) return;
      sessionRef.current += 1;
      window.speechSynthesis.cancel();
      chunksRef.current = splitSpeechChunks(text);
      indexRef.current = 0;
      if (chunksRef.current.length === 0) {
        setSpeaking(false);
        return;
      }
      setSpeaking(true);
      setPaused(false);
      speakNext();
    },
    [supported, speakNext]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported || !speaking) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported, speaking]);

  const resume = useCallback(() => {
    if (!supported || !paused) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported, paused]);

  const cycleRate = useCallback(() => {
    const next = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length];
    rateRef.current = next;
    setRate(next);
    // 倍速对当前 utterance 不生效，从当前分块起以新倍速重启
    if (speaking) {
      sessionRef.current += 1;
      window.speechSynthesis.cancel();
      speakNext();
    }
  }, [speaking, speakNext]);

  // 卸载时停止播报，避免离开阅读器后仍在朗读
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 返回稳定引用：消费方（如章节切换 effect）可安全将其列入依赖
  return useMemo(
    () => ({ supported, speaking, paused, rate, start, stop, pause, resume, cycleRate }),
    [supported, speaking, paused, rate, start, stop, pause, resume, cycleRate]
  );
}
