import type { CloudSourceConfig } from '@/types';

import type { CloudFile, CloudStorageClient } from './cloudStorage';
import { downloadFile } from './fileTransfer';

const FTP_TIMEOUT = 30000;

const MIN_LIST_PARTS = 9;
const SIZE_INDEX = 4;
const DATE_START_INDEX = 5;
const DATE_MID_INDEX = 6;
const DATE_END_INDEX = 7;
const NAME_START_INDEX = 8;
const DEFAULT_FTP_PORT = 21;

interface FTPResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * FTP 客户端
 *
 * @description 基于 HTTP 代理的 FTP 客户端实现
 * 由于浏览器安全限制无法直接使用 FTP 协议，
 * 通过后端代理或 FTP-over-HTTP 服务进行通信
 */
export class FTPClient implements CloudStorageClient {
  private host: string;
  private port: number;
  private username: string;
  private password: string;
  private basePath: string;

  constructor(config: CloudSourceConfig) {
    let serverAddress = config.serverAddress.trim();

    if (serverAddress.startsWith('file://')) {
      serverAddress = serverAddress.replace('file://', '');
    }

    if (serverAddress.startsWith('ftp://')) {
      serverAddress = serverAddress.replace('ftp://', '');
    }

    const colonIndex = serverAddress.lastIndexOf(':');
    if (colonIndex > 0) {
      const portPart = serverAddress.substring(colonIndex + 1);
      if (/^\d+$/.test(portPart)) {
        this.host = serverAddress.substring(0, colonIndex);
        this.port = parseInt(portPart, 10);
      } else {
        this.host = serverAddress;
        this.port = DEFAULT_FTP_PORT;
      }
    } else {
      this.host = serverAddress;
      this.port = DEFAULT_FTP_PORT;
    }

    if (config.port) {
      this.port = parseInt(config.port, 10);
    }

    this.username = config.username;
    this.password = config.password;
    this.basePath = config.path || '/';
  }

  private getAuthHeaders(): Record<string, string> {
    const credentials = btoa(`${this.username}:${this.password}`);
    return {
      Authorization: `Basic ${credentials}`,
      'X-FTP-Host': this.host,
      'X-FTP-Port': String(this.port),
      'Content-Type': 'application/json',
    };
  }

  private async ftpRequest(
    action: string,
    path: string = ''
  ): Promise<FTPResponse> {
    const proxyUrl = this.getProxyUrl();

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action,
          path: path || this.basePath,
        }),
        signal: AbortSignal.timeout(FTP_TIMEOUT),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.text();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private getProxyUrl(): string {
    const proxyHost = import.meta.env.VITE_FTP_PROXY_URL || '';
    if (proxyHost) {
      return `${proxyHost}/ftp`;
    }

    return `/api/ftp`;
  }

  async testConnection(): Promise<boolean> {
    const result = await this.ftpRequest('list', this.basePath);
    return result.success;
  }

  async listFiles(path: string): Promise<CloudFile[]> {
    const targetPath = path.startsWith('/')
      ? path
      : `${this.basePath}${path}`;

    const result = await this.ftpRequest('list', targetPath);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to list files');
    }

    try {
      const lines = result.data.split('\n').filter((line) => line.trim());
      const files: CloudFile[] = [];

      for (const line of lines) {
        const parsed = this.parseUnixListLine(line.trim());
        if (parsed && parsed.name !== '.' && parsed.name !== '..') {
          files.push({
            name: parsed.name,
            path: `${targetPath}/${parsed.name}`.replace(/\/+/g, '/'),
            isDirectory: parsed.isDirectory,
            size: parsed.size,
            modifiedTime: parsed.modifiedTime,
          });
        }
      }

      return files;
    } catch {
      throw new Error('Failed to parse FTP directory listing');
    }
  }

  private parseUnixListLine(line: string): {
    name: string;
    isDirectory: boolean;
    size: number;
    modifiedTime: string;
  } | null {
    const parts = line.split(/\s+/);
    if (parts.length < MIN_LIST_PARTS) return null;

    const permissions = parts[0];
    const isDirectory = permissions.startsWith('d');
    const size = parseInt(parts[SIZE_INDEX], 10) || 0;
    const dateStr = `${parts[DATE_START_INDEX]} ${parts[DATE_MID_INDEX]} ${parts[DATE_END_INDEX]}`;
    const name = parts.slice(NAME_START_INDEX).join(' ');

    return {
      name,
      isDirectory,
      size,
      modifiedTime: dateStr,
    };
  }

  async downloadFile(path: string): Promise<Blob> {
    const proxyUrl = this.getProxyUrl();
    const downloadUrl = `${proxyUrl}?action=download&path=${encodeURIComponent(path)}`;

    const result = await downloadFile({
      url: downloadUrl,
      headers: this.getAuthHeaders(),
      fileName: path.split('/').pop(),
    });

    return result.blob;
  }
}
