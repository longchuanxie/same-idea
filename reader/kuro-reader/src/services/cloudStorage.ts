import axios from 'axios';

import type { CloudSourceConfig } from '@/types';

import { FTPClient } from './ftpClient';

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

class WebDAVClient implements CloudStorageClient {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(config: CloudSourceConfig) {
    let url = config.serverAddress;
    if (!url.startsWith('http')) {
      url = `http://${url}`;
    }
    if (config.port) {
      const urlObj = new URL(url);
      urlObj.port = config.port;
      url = urlObj.toString();
    }
    this.baseUrl = url.replace(/\/$/, '');
    this.username = config.username;
    this.password = config.password;
  }

  async testConnection(): Promise<boolean> {
    try {
      await axios.request({
        method: 'PROPFIND',
        url: this.baseUrl,
        headers: {
          Depth: '0',
          'Content-Type': 'text/xml',
        },
        auth: { username: this.username, password: this.password },
        timeout: 10000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(path: string): Promise<CloudFile[]> {
    const fullPath = `${this.baseUrl}${path}`;
    const response = await axios.request({
      method: 'PROPFIND',
      url: fullPath,
      headers: {
        Depth: '1',
        'Content-Type': 'text/xml',
      },
      auth: { username: this.username, password: this.password },
      timeout: 30000,
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, 'text/xml');
    const responses = xmlDoc.querySelectorAll('response');
    const files: CloudFile[] = [];

    responses.forEach((resp) => {
      const href = resp.querySelector('href')?.textContent || '';
      const displayName = decodeURIComponent(href.split('/').pop() || '');
      if (!displayName || displayName === path.split('/').pop()) return;

      const isDir = resp.querySelector('collection') !== null;
      const sizeText = resp.querySelector('getcontentlength')?.textContent || '0';
      const modifiedText = resp.querySelector('getlastmodified')?.textContent || '';

      files.push({
        name: displayName,
        path: href,
        isDirectory: isDir,
        size: parseInt(sizeText, 10) || 0,
        modifiedTime: modifiedText,
      });
    });

    return files;
  }

  async downloadFile(path: string): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}${path}`, {
      auth: { username: this.username, password: this.password },
      responseType: 'blob',
      timeout: 120000,
    });
    return response.data as Blob;
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
      throw new Error(`不支持的协议: ${config.protocol}`);
  }
}
