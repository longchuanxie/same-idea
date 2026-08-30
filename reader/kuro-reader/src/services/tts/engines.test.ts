import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { resolveEngine, type TtsEngineConfig } from './engineSelector'
import { normalizeServerUrl, ServerTtsEngine } from './serverTtsEngine'
import { WebSpeechEngine } from './webSpeechEngine'

// ── speechSynthesis Fake(与 useSpeech.test 同模式) ──
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

// ── Audio Fake(合成音频经 HTMLAudioElement 播放) ──
class FakeAudio {
  static instances: FakeAudio[] = [];
  src = '';
  playbackRate = 1;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  removeAttribute = vi.fn();
  constructor() {
    FakeAudio.instances.push(this);
  }
}

const fetchMock = vi.fn();

beforeEach(() => {
  spoken.length = 0;
  FakeAudio.instances = [];
  vi.clearAllMocks();
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('normalizeServerUrl', () => {
  it('adds scheme, trims and strips trailing slashes', () => {
    expect(normalizeServerUrl(' 192.168.1.10:9880/ ')).toBe('http://192.168.1.10:9880');
    expect(normalizeServerUrl('https://tts.example.com/api//')).toBe('https://tts.example.com/api');
    expect(normalizeServerUrl('')).toBe('');
  });
});

describe('WebSpeechEngine', () => {
  it('flushes the queue, applies rate/lang and completes on end', () => {
    const engine = new WebSpeechEngine();
    const onDone = vi.fn();
    const onError = vi.fn();
    engine.speak('你好。', { rate: 1.5, lang: 'zh-CN' }, { onDone, onError });

    expect(synth.cancel).toHaveBeenCalled();
    expect(spoken).toHaveLength(1);
    expect(spoken[0].rate).toBe(1.5);
    expect(spoken[0].lang).toBe('zh-CN');

    spoken[0].onend?.();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports errors and drops stale callbacks after cancel', () => {
    const engine = new WebSpeechEngine();
    const onDone = vi.fn();
    const onError = vi.fn();
    engine.speak('正文。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    spoken[0].onerror?.({ error: 'synthesis-failed' });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onDone).not.toHaveBeenCalled();

    const onDone2 = vi.fn();
    const onError2 = vi.fn();
    engine.speak('正文二。', { rate: 1, lang: 'zh-CN' }, { onDone: onDone2, onError: onError2 });
    engine.cancel();
    spoken[1].onend?.();
    expect(onDone2).not.toHaveBeenCalled();
    expect(onError2).not.toHaveBeenCalled();
  });
});

describe('ServerTtsEngine', () => {
  const config = { url: 'http://nas:9880', model: 'gpt-sovits', voice: 'xiaoai' };

  it('is unavailable without a url', () => {
    expect(new ServerTtsEngine({ url: '', model: '', voice: '' }).isAvailable()).toBe(false);
    expect(new ServerTtsEngine(config).isAvailable()).toBe(true);
  });

  it('posts OpenAI-compatible payloads and plays the returned audio', async () => {
    const engine = new ServerTtsEngine(config);
    const onDone = vi.fn();
    const onError = vi.fn();
    fetchMock.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob(['audio'])) });

    engine.speak('第一句。', { rate: 1.25, lang: 'zh-CN' }, { onDone, onError });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      'http://nas:9880/v1/audio/speech',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"speed":1.25'),
      })
    );
    await vi.waitFor(() => expect(FakeAudio.instances.length).toBeGreaterThan(0));
    const audio = FakeAudio.instances[0];
    expect(audio.playbackRate).toBe(1.25);

    audio.onended?.();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports http errors', async () => {
    const engine = new ServerTtsEngine(config);
    const onDone = vi.fn();
    const onError = vi.fn();
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

    engine.speak('正文。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onDone).not.toHaveBeenCalled();
  });

  it('drops callbacks when cancelled mid-request', async () => {
    const engine = new ServerTtsEngine(config);
    let resolveFetch: (value: unknown) => void = () => undefined;
    fetchMock.mockReturnValueOnce(new Promise((resolve) => { resolveFetch = resolve; }));

    const onDone = vi.fn();
    const onError = vi.fn();
    engine.speak('正文。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    engine.cancel();
    resolveFetch({ ok: true, blob: () => Promise.resolve(new Blob(['audio'])) });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onDone).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(FakeAudio.instances).toHaveLength(0);
  });
});

describe('resolveEngine', () => {
  const baseConfig: TtsEngineConfig = { engine: 'auto', serverUrl: '', serverModel: '', serverVoice: '' };

  it('resolves auto to the system engine on web', () => {
    expect(resolveEngine(baseConfig).id).toBe('system');
  });

  it('reuses the system engine singleton', () => {
    expect(resolveEngine(baseConfig)).toBe(resolveEngine({ ...baseConfig, engine: 'system' }));
  });

  it('falls back to auto when the server url is unconfigured', () => {
    expect(resolveEngine({ ...baseConfig, engine: 'server', serverUrl: '  ' }).id).toBe('system');
  });

  it('creates a server engine when configured', () => {
    const engine = resolveEngine({ ...baseConfig, engine: 'server', serverUrl: 'http://nas:9880' });
    expect(engine.id).toBe('server');
    expect(engine.isAvailable()).toBe(true);
  });

  it('resolves neural directly', () => {
    expect(resolveEngine({ ...baseConfig, engine: 'neural' }).id).toBe('neural');
  });
})
