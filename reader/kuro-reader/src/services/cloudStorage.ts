import { CapacitorHttp } from '@capacitor/core';
import axios from 'axios';

import { t } from '@/i18n';
import type { CloudSourceConfig } from '@/types';
import { isNativePlatform } from '@/utils/capacitor';
import { joinCloudPath, normalizeCloudPath } from '@/utils/cloudPath';

import { downloadFile as transferDownloadFile } from './fileTransfer';
import { FTPClient } from './ftpClient';
import { looksLikeHtmlListing, parseHtmlFileListing } from './htmlFileListing';

export interface CloudFile {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: string;
}

export interface CloudStorageClient {
  listFiles(path: string): Promise<CloudFile[]>;
  downloadFile(path: string): Promise<Blob>;
  testConnection(): Promise<boolean>;
}

const CONNECT_TIMEOUT_MS = 10000;
const LIST_TIMEOUT_MS = 30000;

/** dev 代理前缀（server/httpProxy.ts）：Web 端跨源请求被服务器无 CORS 头拦死时的本地开发通道 */
const DEV_PROXY_PREFIX = '/api/http-proxy?url=';

function viaDevProxy(url: string): string {
  return import.meta.env.DEV ? `${DEV_PROXY_PREFIX}${encodeURIComponent(url)}` : url;
}

/** Basic 头（UTF-8 凭据安全编码）；匿名时返回空对象 */
function basicAuthHeaders(username: string, password: string): Record<string, string> {
  if (!username) return {};
  const token = btoa(
    String.fromCharCode(...new TextEncoder().encode(`${username}:${password}`))
  );
  return { Authorization: `Basic ${token}` };
}

interface TextResponse {
  body: string;
  contentType?: string;
}

class WebDAVClient implements CloudStorageClient {
  private baseUrl: string;
  private basePath: string;
  private authHeaders: Record<string, string>;

  constructor(config: CloudSourceConfig) {
    let url = config.serverAddress.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `http://${url}`;
    }
    if (config.port) {
      const urlObj = new URL(url);
      urlObj.port = config.port;
      url = urlObj.toString();
    }
    this.baseUrl = url.replace(/\/+$/, '');
    // 用户可能填入编码态路径（复制自浏览器地址栏），统一还原为解码态
    this.basePath = normalizeCloudPath(safeDecode(config.path || '/'));
    this.authHeaders = basicAuthHeaders(config.username, config.password);
  }

  /** 解码态路径 → 请求 URL：逐段编码，目录补尾斜杠（省一次 301 往返） */
  private urlFor(decodedPath: string, isDirectory: boolean): string {
    const segments = normalizeCloudPath(decodedPath)
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent);
    const path = `/${segments.join('/')}`;
    return `${this.baseUrl}${path}${isDirectory && path !== '/' ? '/' : ''}`;
  }

  /** GET 文本：原生走 CapacitorHttp（原生栈无 CORS）；Web 走 fetch（dev 经本地代理） */
  private async httpGetText(url: string): Promise<TextResponse> {
    if (isNativePlatform()) {
      const response = await CapacitorHttp.get({
        url,
        responseType: 'text',
        headers: this.authHeaders,
        connectTimeout: CONNECT_TIMEOUT_MS,
        readTimeout: LIST_TIMEOUT_MS,
      });
      const headers = (response.headers ?? {}) as Record<string, string>;
      const contentType =
        headers['Content-Type'] ?? headers['content-type'] ?? undefined;
      return {
        body: typeof response.data === 'string' ? response.data : String(response.data),
        contentType,
      };
    }

    const response = await fetch(viaDevProxy(url), {
      headers: this.authHeaders,
      signal: AbortSignal.timeout(LIST_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return {
      body: await response.text(),
      contentType: response.headers.get('content-type') ?? undefined,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.listFiles(this.basePath);
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(path: string): Promise<CloudFile[]> {
    const dirPath = normalizeCloudPath(path || this.basePath);
    const { body, contentType } = await this.httpGetText(this.urlFor(dirPath, true));

    if (looksLikeHtmlListing(contentType, body)) {
      const entries = parseHtmlFileListing(body);
      if (entries) {
        return entries.map((entry) => ({
          name: entry.name,
          path: joinCloudPath(dirPath, entry.name),
          isDirectory: entry.isDirectory,
          size: entry.size,
          modifiedTime: entry.modifiedTime,
        }));
      }
    }

    // 无 HTML 目录页（坚果云等纯 WebDAV）：Web 端回退 PROPFIND；
    // 原生栈 HttpURLConnection 不支持 PROPFIND，HTML 页是原生端唯一浏览通道
    if (isNativePlatform()) {
      throw new Error(t('服务器未返回可浏览的目录列表，请检查地址与端口'));
    }
    return this.listFilesViaPropfind(dirPath);
  }

  /** 标准 WebDAV PROPFIND（仅 Web 端可用；dev 下经本地代理绕开 CORS 预检） */
  private async listFilesViaPropfind(dirPath: string): Promise<CloudFile[]> {
    const response = await axios.request<string>({
      method: 'PROPFIND',
      url: viaDevProxy(this.urlFor(dirPath, true)),
      headers: {
        Depth: '1',
        'Content-Type': 'text/xml',
        ...this.authHeaders,
      },
      timeout: LIST_TIMEOUT_MS,
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, 'text/xml');
    const responses = xmlDoc.querySelectorAll('response');
    const files: CloudFile[] = [];
    const selfName = dirPath === '/' ? '' : dirPath.split('/').pop();

    responses.forEach((resp) => {
      const href = resp.querySelector('href')?.textContent || '';
      const displayName = safeDecode(href.split('/').filter(Boolean).pop() || '');
      if (!displayName || displayName === selfName) return;

      const isDir = resp.querySelector('collection') !== null;
      const sizeText = resp.querySelector('getcontentlength')?.textContent || '0';
      const modifiedText = resp.querySelector('getlastmodified')?.textContent || '';

      files.push({
        name: displayName,
        path: joinCloudPath(dirPath, displayName),
        isDirectory: isDir,
        size: parseInt(sizeText, 10) || 0,
        modifiedTime: modifiedText,
      });
    });

    return files;
  }

  async downloadFile(path: string): Promise<Blob> {
    const decodedPath = normalizeCloudPath(path);
    const url = this.urlFor(decodedPath, false);
    const fileName = decodedPath.split('/').pop();
    // 原生端 FileTransfer 插件走原生栈（无 CORS）；Web 端 fetch（dev 经本地代理）
    const result = await transferDownloadFile({
      url: isNativePlatform() ? url : viaDevProxy(url),
      headers: this.authHeaders,
      fileName,
    });
    return result.blob;
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function createCloudClient(config: CloudSourceConfig): CloudStorageClient {
  switch (config.protocol) {
    case 'webdav':
    case 'nas':
      return new WebDAVClient(config);
    case 'ftp':
      return new FTPClient(config);
    default:
      throw new Error(t('不支持的协议: {{protocol}}', { protocol: config.protocol }));
  }
}
