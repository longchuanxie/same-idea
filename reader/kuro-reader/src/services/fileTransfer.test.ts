import { Filesystem } from '@capacitor/filesystem';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/file-transfer', () => ({
  FileTransfer: { downloadFile: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    getUri: vi.fn().mockResolvedValue({ uri: 'file:///cache/downloads/x' }),
    readFile: vi.fn(),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  },
  Directory: { Cache: 'CACHE' },
}));

vi.mock('@/utils/capacitor', () => ({ isNativePlatform: () => true }));

import { base64ToUint8Array, downloadFile } from './fileTransfer';

describe('base64ToUint8Array', () => {
  it('短串正确解码', () => {
    const bytes = base64ToUint8Array(btoa('hello kuro'));
    expect(new TextDecoder().decode(bytes)).toBe('hello kuro');
  });

  it('跨块（>0x8000 字符）解码与逐字节转换一致', () => {
    // 10 万字节伪随机 latin1 序列：覆盖多块边界（块长 0x8000）
    const raw = Array.from({ length: 100_000 }, (_, i) => String.fromCharCode((i * 31 + 7) % 256)).join('');
    const encoded = btoa(raw);
    expect(encoded.length).toBeGreaterThan(0x8000);

    const chunked = base64ToUint8Array(encoded);
    const reference = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    expect(chunked.length).toBe(reference.length);
    expect(Buffer.from(chunked).equals(Buffer.from(reference))).toBe(true);
  });
});

describe('downloadFile 原生通道', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('读取缓存文件按 base64 解码为 Blob，随后清理缓存', async () => {
    vi.mocked(Filesystem.readFile).mockResolvedValue({ data: btoa('book-bytes') });

    const { blob } = await downloadFile({ url: 'http://nas/book.epub' });

    expect(await blob.text()).toBe('book-bytes');
    expect(Filesystem.deleteFile).toHaveBeenCalledTimes(1);
  });
});
