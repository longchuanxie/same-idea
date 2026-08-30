import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useSpeech, splitSpeechChunks, splitSpeechChunksWithOffsets } from '@/hooks/useSpeech'
import { useAppStore } from '@/stores/useAppStore'


class FakeUtterance {
  text: string;
  rate = 1;
  lang = '';
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
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

describe('splitSpeechChunksWithOffsets', () => {
  it('produces offset chunks whose slices round-trip to the source text', () => {
    const text = '第一句。第二句！第三句？';
    const chunks = splitSpeechChunksWithOffsets(text, 20);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ start: 0, end: text.length });
    expect(text.slice(chunks[0].start, chunks[0].end)).toBe(chunks[0].text);
  });

  it('keeps exact offsets across merges, hard splits and whitespace', () => {
    const text = '甲。乙。\n\n丙丁戊己庚辛壬癸。';
    const chunks = splitSpeechChunksWithOffsets(text, 6);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(text.slice(chunk.start, chunk.end)).toBe(chunk.text);
      expect(chunk.text.length).toBeLessThanOrEqual(6);
    }
    // 分块按原文顺序衔接（允许块间跳过空白，但不得重叠或乱序）
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].start).toBeGreaterThanOrEqual(chunks[i - 1].end);
    }
  });

  it('hard-splits a single overlong sentence with contiguous offsets', () => {
    const long = '字'.repeat(450);
    const chunks = splitSpeechChunksWithOffsets(long, 200);
    expect(chunks.map((c) => c.end - c.start)).toEqual([200, 200, 50]);
    expect(chunks.map((c) => [c.start, c.end])).toEqual([[0, 200], [200, 400], [400, 450]]);
  });

  it('returns empty for blank text', () => {
    expect(splitSpeechChunksWithOffsets('  \n  ')).toEqual([]);
  });
})

describe('splitSpeechChunks (compat wrapper)', () => {
  it('maps offset chunks to plain texts', () => {
    expect(splitSpeechChunks('第一句。第二句！第三句？', 20)).toEqual(['第一句。第二句！第三句？']);
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

  it('exposes currentChunkRange/chunkCount matching the actual utterance text', () => {
    const { result } = renderHook(() => useSpeech());
    // 首句 200 字占满一个分块，第二句独立成块
    act(() => result.current.start('甲'.repeat(199) + '。乙丙。'));

    expect(result.current.chunkCount).toBe(2);
    expect(result.current.currentChunkRange).toEqual({ start: 0, end: 200 });
    expect(spoken[0].text).toBe('甲'.repeat(199) + '。');

    act(() => finishCurrent());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentChunkRange).toEqual({ start: 200, end: 203 });
    expect(spoken[1].text).toBe('乙丙。');

    act(() => finishCurrent());
    expect(result.current.speaking).toBe(false);
    expect(result.current.currentChunkRange).toBeNull();
    expect(result.current.chunkCount).toBe(0);
  });

  it('adds baseOffset to currentChunkRange for mid-chapter starts', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('甲'.repeat(199) + '。乙丙。', 100));

    expect(result.current.currentChunkRange).toEqual({ start: 100, end: 300 });
    expect(spoken[0].text).toBe('甲'.repeat(199) + '。');

    act(() => finishCurrent());
    expect(result.current.currentChunkRange).toEqual({ start: 300, end: 303 });
    expect(spoken[1].text).toBe('乙丙。');
  });

  it('stop clears currentChunkRange/chunkCount for highlight teardown', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('甲。乙。'));
    expect(result.current.currentChunkRange).not.toBeNull();

    act(() => result.current.stop());
    expect(result.current.currentChunkRange).toBeNull();
    expect(result.current.chunkCount).toBe(0);
    expect(result.current.currentIndex).toBeNull();
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

  it('exposes the engine label and keeps fallback to system for unconfigured server', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('甲。乙。'));
    expect(result.current.engineLabel).toBe('系统语音');

    // 切到未配置地址的自定义服务 → 回退系统语音(同一引擎),不打断当前播报
    act(() => {
      useAppStore.getState().updateSettings({ ttsEngine: 'server' });
    });
    expect(spoken).toHaveLength(1);
    expect(result.current.engineLabel).toBe('系统语音');

    act(() => {
      useAppStore.getState().updateSettings({ ttsEngine: 'auto' });
    });
    act(() => result.current.stop());
  });

  it('stops and reports engine errors via onError', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeech(undefined, onError));
    act(() => result.current.start('正文。'));
    const utterance = spoken[spoken.length - 1];

    act(() => utterance.onerror?.({ error: 'not-supported' }));
    expect(result.current.speaking).toBe(false);
    expect(result.current.currentChunkRange).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('系统语音'));
  });
})
