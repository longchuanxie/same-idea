import { FileTransfer } from '@capacitor/file-transfer';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { isNativePlatform } from '@/utils/capacitor';

const DOWNLOAD_TIMEOUT = 120000;

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

    await FileTransfer.downloadFile({
      url: options.url,
      path: fileInfo.uri,
      headers: options.headers,
      progress: false,
    });

    const readResult = await Filesystem.readFile({
      directory: Directory.Cache,
      path: filePath,
    });

    const base64Data = readResult.data as string;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);

    await Filesystem.deleteFile({
      directory: Directory.Cache,
      path: filePath,
    });

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
