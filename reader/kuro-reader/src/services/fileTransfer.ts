import { FileTransfer } from '@capacitor/file-transfer';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { isNativePlatform } from '@/utils/capacitor';

const DOWNLOAD_TIMEOUT = 120000;
/** base64 分块解码块长（4 的倍数，保证不劈开编码组） */
const BASE64_CHUNK_CHARS = 0x8000;
/** base64 编码率：4 字符编码 3 字节 */
const BASE64_CHARS_PER_GROUP = 4;
const BASE64_BYTES_PER_GROUP = 3;

/**
 * base64 → 字节：按块解码直写预分配 Uint8Array。
 * 旧实现经 number[] 逐字转换，百 MB 书会凭空多出两份全量拷贝（number[] 每元素 8 字节）。
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor((base64.length * BASE64_BYTES_PER_GROUP) / BASE64_CHARS_PER_GROUP));
  let offset = 0;
  for (let i = 0; i < base64.length; i += BASE64_CHUNK_CHARS) {
    const binary = atob(base64.slice(i, i + BASE64_CHUNK_CHARS));
    for (let j = 0; j < binary.length; j++) {
      bytes[offset + j] = binary.charCodeAt(j);
    }
    offset += binary.length;
  }
  return bytes.subarray(0, offset);
}

interface DownloadOptions {
  url: string;
  headers?: Record<string, string>;
  fileName?: string;
}

interface DownloadResult {
  blob: Blob;
  path?: string;
}

/**
 * 统一文件下载服务
 *
 * @description 根据平台自动选择下载方式：
 * - 原生平台（iOS/Android）：使用 @capacitor/file-transfer 插件
 * - Web 平台：使用 Fetch API
 */
export async function downloadFile(options: DownloadOptions): Promise<DownloadResult> {
  if (isNativePlatform()) {
    return downloadNative(options);
  }
  return downloadWeb(options);
}

async function downloadNative(options: DownloadOptions): Promise<DownloadResult> {
  const fileName = options.fileName || `download-${Date.now()}`;
  const filePath = `downloads/${fileName}`;

  try {
    const fileInfo = await Filesystem.getUri({
      directory: Directory.Cache,
      path: filePath,
    });

    // 插件无自带超时/取消：挂起时调用方永久转圈（busyFile 无退出路径）。
    // 与 web 路径同窗超时；超时后尽力清缓存残留，防下次同名下载读到半截文件
    try {
      await Promise.race([
        FileTransfer.downloadFile({
          url: options.url,
          path: fileInfo.uri,
          headers: options.headers,
          progress: false,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('下载超时，请重试')), DOWNLOAD_TIMEOUT)
        ),
      ]);
    } catch (e) {
      void Filesystem.deleteFile({ directory: Directory.Cache, path: filePath }).catch(() => {});
      throw e;
    }

    const readResult = await Filesystem.readFile({
      directory: Directory.Cache,
      path: filePath,
    });

    const base64Data = readResult.data as string;
    const blob = new Blob([base64ToUint8Array(base64Data)]);

    // 读到即成功：缓存清理失败不该回滚整个下载（best-effort，残留由系统缓存回收）
    void Filesystem.deleteFile({ directory: Directory.Cache, path: filePath }).catch(() => {});

    return { blob, path: fileInfo.uri };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Native download failed');
  }
}

async function downloadWeb(options: DownloadOptions): Promise<DownloadResult> {
  const response = await fetch(options.url, {
    method: 'GET',
    headers: options.headers,
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return { blob };
}
