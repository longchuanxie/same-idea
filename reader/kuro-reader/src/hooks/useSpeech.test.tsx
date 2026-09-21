import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useSpeech, splitSpeechChunks, splitSpeechChunksWithOffsets } from '@/hooks/useSpeech'
import { useAppStore } from '@/stores/useAppStore'

// 兜底/无 Web Speech 场景会落到神经网络引擎：测试内一律让 piper 动态导入失败
vi.mock('@mintplex-labs/piper-tts-web', () => {
  throw new Error('piper unavailable in test env')
})


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

  it('分块不跨硬边界：边界两侧各自合并，偏移仍逐字符对应', () => {
    const text = '第一句。第二句。第三句。第四句。'; // 每句 4 字，句末边界 4/8/12/16
    const clean = splitSpeechChunksWithOffsets(text, 200, [8]);
    expect(clean.map((chunk) => [chunk.start, chunk.end])).toEqual([[0, 8], [8, 16]]);
    const midSentence = splitSpeechChunksWithOffsets(text, 200, [10]);
    expect(midSentence.map((chunk) => [chunk.start, chunk.end])).toEqual([[0, 10], [10, 16]]);
    for (const chunk of [...clean, ...midSentence]) {
      expect(chunk.text).toBe(text.slice(chunk.start, chunk.end));
    }
  });

  it('硬边界落在无标点长句中：按边界硬切，不等满 maxLength', () => {
    const text = '甲'.repeat(90) + '乙'.repeat(60); // 150 字无句读，无边界时本会是一整块
    const chunks = splitSpeechChunksWithOffsets(text, 200, [90]);
    expect(chunks.map((chunk) => [chunk.start, chunk.end])).toEqual([[0, 90], [90, 150]]);
  });

  it('零/负/越界/重复的硬边界被忽略，不产生空分块', () => {
    const text = '第一句。第二句。第三句。'; // 12 字，句末边界 4/8/12
    const chunks = splitSpeechChunksWithOffsets(text, 200, [0, -5, 4, 4, 999]);
    expect(chunks.map((chunk) => [chunk.start, chunk.end])).toEqual([[0, 4], [4, 12]]);
    for (const chunk of chunks) {
      expect(chunk.text).toBe(text.slice(chunk.start, chunk.end));
    }
  });

  it('不传硬边界时行为与旧版一致（按句合并）', () => {
    const text = '第一句。第二句。第三句。';
    expect(splitSpeechChunksWithOffsets(text, 200, [])).toEqual(splitSpeechChunksWithOffsets(text, 200));
    expect(splitSpeechChunksWithOffsets(text, 200).map((chunk) => chunk.start)).toEqual([0]);
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

  it('暂停挂起当前块，恢复后块结束仍续播下一块（onend 迟到不丢）', () => {
    const { result } = renderHook(() => useSpeech());
    // 405 字 → 拆为 3 个分块（与链式用例同款文本）
    act(() => result.current.start('甲。乙。丙。'.repeat(81)));
    expect(spoken).toHaveLength(1);
    const first = spoken[0];

    act(() => result.current.pause());
    // 真实引擎语义：暂停期间 onend 不送达
    act(() => result.current.resume());
    // 恢复后当前块播完 → onend 迟到送达
    act(() => first.onend?.());

    expect(spoken).toHaveLength(2);
    expect(result.current.speaking).toBe(true);
  });

  it('单块暂停恢复后播完仍触发 onFinished', () => {
    const onFinished = vi.fn();
    const { result } = renderHook(() => useSpeech(onFinished));
    act(() => result.current.start('甲。'));
    const first = spoken[0];

    act(() => result.current.pause());
    act(() => result.current.resume());
    act(() => first.onend?.());

    expect(onFinished).toHaveBeenCalledTimes(1);
    expect(result.current.speaking).toBe(false);
  });

  it('暂停中切倍速不出声，resume 以新倍速重播当前块', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('甲。乙。'));
    const before = spoken.length;

    act(() => result.current.pause());
    act(() => result.current.cycleRate());
    // 暂停中不出声：不重建 utterance、保持暂停态
    expect(spoken.length).toBe(before);
    expect(result.current.paused).toBe(true);
    expect(result.current.rate).toBe(1.25);

    act(() => result.current.resume());
    // resume 以新倍速重播当前块：新 utterance 立即入队（cancel 内部的
    // synth.resume 解冻不在此断言——那是 WebSpeech 的既有 workaround）
    expect(spoken.length).toBe(before + 1);
    expect(spoken[spoken.length - 1].rate).toBe(1.25);
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

  it('falls through to the neural engine and surfaces its failure without speechSynthesis', async () => {
    vi.unstubAllGlobals();
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeech(undefined, onError));
    // 神经网络引擎在浏览器环境恒可用：支持位不受 speechSynthesis 缺失影响
    expect(result.current.supported).toBe(true);
    act(() => result.current.start('正文。'));
    // auto 链落到神经网络，测试内 piper 导入失败 → 错误如实上报
    await act(async () => {
      await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    });
    expect(result.current.speaking).toBe(false);
    expect(result.current.engineLabel).toBe('神经网络');
  });

  it('switches to neural with a notice when the system voice never starts', async () => {
    vi.useFakeTimers();
    try {
      const onNotice = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() => useSpeech(undefined, onError, onNotice));
      act(() => result.current.start('正文。'));
      expect(spoken).toHaveLength(1);

      // 浏览器语音入队后始终不 onstart（部分内核静默哑火）：看门狗到点兜底换神经网络
      act(() => vi.advanceTimersByTime(8000));
      expect(onNotice).toHaveBeenCalledTimes(1);
      expect(onNotice).toHaveBeenCalledWith(expect.stringContaining('浏览器语音'));
      expect(result.current.engineLabel).toBe('神经网络');
      expect(result.current.speaking).toBe(true);

      // 兜底引擎（测试内 piper 不可用）失败后如实上报，且不再二次兜底
      await act(async () => {
        await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      });
      expect(onNotice).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stops and reports engine errors via onError without fallback for explicit server setting', () => {
    const onError = vi.fn();
    act(() => {
      useAppStore.getState().updateSettings({ ttsEngine: 'server' });
    });
    const { result } = renderHook(() => useSpeech(undefined, onError));
    act(() => result.current.start('正文。'));
    const utterance = spoken[spoken.length - 1];

    act(() => utterance.onerror?.({ error: 'not-supported' }));
    // 显式指定自定义服务（未配置地址时解析为浏览器语音）不兜底：调参场景失败应如实上报
    expect(result.current.speaking).toBe(false);
    expect(result.current.currentChunkRange).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('浏览器语音'));

    act(() => {
      useAppStore.getState().updateSettings({ ttsEngine: 'auto' });
    });
  });

  it('exposes the engine label and keeps fallback to browser voice for unconfigured server', () => {
    const { result } = renderHook(() => useSpeech());
    act(() => result.current.start('甲。乙。'));
    expect(result.current.engineLabel).toBe('浏览器语音');

    // 切到未配置地址的自定义服务 → 回退浏览器语音(同一引擎),不打断当前播报
    act(() => {
      useAppStore.getState().updateSettings({ ttsEngine: 'server' });
    });
    expect(spoken).toHaveLength(1);
    expect(result.current.engineLabel).toBe('浏览器语音');

    act(() => {
      useAppStore.getState().updateSettings({ ttsEngine: 'auto' });
    });
    act(() => result.current.stop());
  });
})
