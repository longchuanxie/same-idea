import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useSpeech, splitSpeechChunks } from '@/hooks/useSpeech'

class FakeUtterance {
  text: string;
  rate = 1;
  lang = '';
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

const spoken: FakeUtterance[] = [];
const synth = {
  speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
};

beforeEach(() => {
  spoken.length = 0;
  vi.clearAllMocks();
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** 触发当前正在播放的 utterance 的自然结束 */
const finishCurrent = () => {
  const current = spoken[spoken.length - 1];
  current.onend?.();
};

describe('splitSpeechChunks', () => {
  it('splits by sentence boundaries and merges under limit', () => {
    const chunks = splitSpeechChunks('第一句。第二句！第三句？', 20);
    expect(chunks).toEqual(['第一句。第二句！第三句？']);
  });

  it('emits multiple chunks when text exceeds limit', () => {
    const sentence = '这是一段足够长的测试句子。';
    const text = sentence.repeat(30);
    const chunks = splitSpeechChunks(text, 200);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(200);
    }
    expect(chunks.join('')).toBe(text.replace(/\n/g, '\n'));
  });

  it('hard-splits a single overlong sentence', () => {
    const long = '字'.repeat(450);
    const chunks = splitSpeechChunks(long, 200);
    expect(chunks.map((c) => c.length)).toEqual([200, 200, 50]);
  });
})

describe('useSpeech', () => {
  it('reports supported when speechSynthesis exists', () => {
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(true);
  });

  it('start speaks the first chunk and marks speaking', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('第一句。第二句。'));
    expect(synth.cancel).toHaveBeenCalled();
    expect(spoken).toHaveLength(1);
    expect(result.current.speaking).toBe(true);
    expect(result.current.paused).toBe(false);
  });

  it('chains chunks via onend and fires onFinished after the last one', () => {
    const onFinished = vi.fn();
    const { result } = renderHook(() => useSpeech(onFinished));
    // 405 字 → 拆为 3 个分块（200/200/5）
    act(() => result.current.start('甲。乙。丙。'.repeat(81)));
    expect(spoken).toHaveLength(1);

    act(() => finishCurrent());
    expect(spoken).toHaveLength(2);
    act(() => finishCurrent());
    expect(spoken).toHaveLength(3);
    expect(onFinished).not.toHaveBeenCalled();
    act(() => finishCurrent());

    expect(onFinished).toHaveBeenCalledTimes(1);
    expect(result.current.speaking).toBe(false);
  });

  it('stop invalidates the session: stale onend does not advance', () => {
    const onFinished = vi.fn();
    const { result } = renderHook(() => useSpeech(onFinished));
    act(() => result.current.start('甲。乙。'));
    const stale = spoken[spoken.length - 1];

    act(() => result.current.stop());
    expect(result.current.speaking).toBe(false);
    expect(spoken).toHaveLength(1);

    act(() => stale.onend?.());
    // 会话已失效：不推进队列、不触发完成回调
    expect(spoken).toHaveLength(1);
    expect(onFinished).not.toHaveBeenCalled();
  });

  it('pause and resume delegate to speechSynthesis', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('正文。'));

    act(() => result.current.pause());
    expect(synth.pause).toHaveBeenCalled();
    expect(result.current.paused).toBe(true);

    act(() => result.current.resume());
    expect(synth.resume).toHaveBeenCalled();
    expect(result.current.paused).toBe(false);
  });

  it('cycleRate rotates rates and restarts current chunk', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('甲。乙。'));
    const before = spoken.length;

    act(() => result.current.cycleRate());
    expect(result.current.rate).toBe(1.25);
    // 重启当前分块：新 utterance 入队
    expect(spoken.length).toBe(before + 1);
    expect(spoken[spoken.length - 1].rate).toBe(1.25);
  });

  it('is a no-op without speechSynthesis support', () => {
    vi.unstubAllGlobals();
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(false);
    act(() => result.current.start('正文。'));
    expect(result.current.speaking).toBe(false);
    expect(spoken).toHaveLength(0);
  });
})
