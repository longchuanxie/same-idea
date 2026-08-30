import React, { useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { OpdsBrowser } from '@/components/molecules/OpdsBrowser';
import { ROUTES, bookDetailPath, readerPathForBook } from '@/constants/routes';
import { createCloudClient, type CloudFile, type CloudStorageClient } from '@/services/cloudStorage';
import { fetchOpdsFeed } from '@/services/opds';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { CloudSourceConfig } from '@/types';
import {
  cloudPathBreadcrumbs,
  normalizeCloudPath,
  parentCloudPath,
  sortCloudEntries,
} from '@/utils/cloudPath';
import { cn } from '@/utils/cn';
import { isSupportedBookFile, guessBookMimeType } from '@/utils/fileType';

interface ProtocolOption {
  id: 'webdav' | 'smb' | 'ftp' | 'onedrive' | 'nas' | 'opds';
  label: string;
  icon: string;
  description: string;
}

const PROTOCOLS: ProtocolOption[] = [
  { id: 'webdav', label: 'WebDAV', icon: 'cloud_sync', description: '通用云存储标准协议' },
  { id: 'nas', label: 'NAS', icon: 'storage', description: '群晖 / QNAP / 威联通' },
  { id: 'opds', label: 'OPDS', icon: 'rss_feed', description: 'Calibre / Komga / Kavita 书库目录' },
  { id: 'smb', label: 'SMB', icon: 'folder_open', description: 'Windows 文件共享（暂不支持浏览）' },
  { id: 'ftp', label: 'FTP', icon: 'transfer_within_a_station', description: '文件传输协议' },
  { id: 'onedrive', label: 'OneDrive', icon: 'cloud_download', description: '微软云存储 API（暂不支持浏览）' },
];

/** 浏览支持的协议（其余仅保留连接测试） */
const BROWSABLE_PROTOCOLS = new Set<ProtocolOption['id']>(['webdav', 'nas', 'ftp']);

const formatFileSize = (bytes: number): string => {
  if (bytes <= 0) return '-';
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / KB))} KB`;
};

const getFileIcon = (name: string): string => {
  if (name.toLowerCase().endsWith('.epub')) return 'book';
  if (/\.(txt|md|markdown)$/i.test(name)) return 'description';
  return 'folder_zip';
};

export const CustomCloudPage: React.FC = () => {
  const navigate = useNavigate();
  const { importFile } = useLibraryStore();

  const [protocol, setProtocol] = useState<ProtocolOption['id']>('webdav');
  const [serverAddress, setServerAddress] = useState('');
  const [port, setPort] = useState('');
  const [path, setPath] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // 浏览模式状态
  const [client, setClient] = useState<CloudStorageClient | null>(null);
  const [connectedLabel, setConnectedLabel] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [busyFile, setBusyFile] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [importedBook, setImportedBook] = useState<{ id: string; title: string; format?: string } | null>(null);
  // OPDS 浏览：连接成功标记（凭据经 state 传入 OpdsBrowser）
  const [isOpdsConnected, setIsOpdsConnected] = useState(false);

  const handleOpdsImportFile = useCallback(
    async (file: File) => {
      setActionError(null);
      setImportedBook(null);
      const book = await importFile(file);
      if (book) {
        setImportedBook({ id: book.id, title: book.title, format: book.format });
        return book;
      }
      setActionError(useLibraryStore.getState().error || '导入失败');
      return null;
    },
    [importFile]
  );


  const currentProtocol = PROTOCOLS.find((p) => p.id === protocol)!;
  const placeholders = getPlaceholder();

  function getPlaceholder(): { server: string; port: string } {
    switch (protocol) {
      case 'opds':
        return { server: 'http://192.168.1.100:8083/opds', port: '' };
      case 'webdav':
        return { server: 'https://dav.example.com', port: '443' };
      case 'nas':
        return { server: '192.168.1.100', port: '5000' };
      case 'smb':
        return { server: '\\\\192.168.1.100', port: '445' };
      case 'ftp':
        return { server: 'ftp.example.com', port: '21' };
      case 'onedrive':
        return { server: '授权登录', port: '' };
      default:
        return { server: '', port: '' };
    }
  }

  const loadDirectory = useCallback(async (target: CloudStorageClient, dir: string) => {
    setIsLoadingFiles(true);
    setFilesError(null);
    try {
      const list = await target.listFiles(dir);
      setFiles(sortCloudEntries(list.filter((f) => !f.name.startsWith('.'))));
      setCurrentPath(normalizeCloudPath(dir));
    } catch (e) {
      setFilesError((e as Error).message || '目录读取失败');
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      if (protocol === 'opds') {
        await fetchOpdsFeed(serverAddress, { username, password });
        setConnectedLabel(`OPDS · ${serverAddress}`);
        setIsOpdsConnected(true);
        setImportedBook(null);
        setActionError(null);
        return;
      }

      const config: CloudSourceConfig = {
        protocol: protocol === 'nas' ? 'nas' : protocol,
        serverAddress,
        port: port || undefined,
        path: path || undefined,
        username,
        password,
      };
      const created = createCloudClient(config);
      const ok = await created.testConnection();
      if (!ok) {
        setConnectError('连接失败，请检查服务器地址和凭据');
        return;
      }
      setClient(created);
      setConnectedLabel(`${currentProtocol.label} · ${serverAddress}`);
      setImportedBook(null);
      setActionError(null);
      await loadDirectory(created, path || '/');
    } catch (e) {
      setConnectError((e as Error).message || '连接失败');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setClient(null);
    setIsOpdsConnected(false);
    setFiles([]);
    setCurrentPath('/');
    setFilesError(null);
    setActionError(null);
    setImportedBook(null);
  };

  const handleOpenFolder = (folder: CloudFile) => {
    if (client) loadDirectory(client, folder.path);
  };

  const handleGoUp = () => {
    const parent = parentCloudPath(currentPath);
    if (parent !== null && client) loadDirectory(client, parent);
  };

  const handleDownloadAndImport = async (file: CloudFile) => {
    if (!client || busyFile) return;
    setBusyFile(file.name);
    setActionError(null);
    setImportedBook(null);
    try {
      const blob = await client.downloadFile(file.path);
      const bookFile = new File([blob], file.name, { type: guessBookMimeType(file.name) });
      const book = await importFile(bookFile);
      if (book) {
        setImportedBook({ id: book.id, title: book.title, format: book.format });
      } else {
        setActionError(useLibraryStore.getState().error || '导入失败');
      }
    } catch (e) {
      setActionError((e as Error).message || '下载失败');
    } finally {
      setBusyFile(null);
    }
  };

  const isFormValid = serverAddress.trim().length > 0 && username.trim().length > 0;
  const canBrowse = BROWSABLE_PROTOCOLS.has(protocol);
  const breadcrumbs = cloudPathBreadcrumbs(currentPath);

  const renderBrowser = () => (
    <main className="w-full max-w-max-width-content px-margin-mobile md:px-margin-desktop pt-6 pb-32 flex-grow flex flex-col gap-4">
      {/* 连接信息 + 断开 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-[20px]">cloud_done</span>
          <span className="font-label text-label-sm text-on-surface-variant truncate">{connectedLabel}</span>
        </div>
        <button
          className="font-label text-label-sm text-on-surface-variant hover:text-primary transition-colors py-2 px-3"
          onClick={handleDisconnect}
        >
          断开连接
        </button>
      </div>

      {/* 面包屑 */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <button
          className="font-label text-label-sm text-on-surface-variant hover:text-primary transition-colors py-1 px-1 whitespace-nowrap"
          onClick={() => client && loadDirectory(client, '/')}
        >
          根目录
        </button>
        {breadcrumbs.map((seg) => (
          <React.Fragment key={seg.path}>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
            <button
              className={cn(
                'font-label text-label-sm py-1 px-1 whitespace-nowrap transition-colors',
                seg.path === currentPath ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-primary'
              )}
              onClick={() => client && loadDirectory(client, seg.path)}
            >
              {seg.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* 上级目录 */}
      {currentPath !== '/' && (
        <button
          className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-surface-variant transition-colors text-left"
          onClick={handleGoUp}
          data-ui-control
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_upward</span>
          <span className="font-body text-body-md text-on-surface-variant">上级目录</span>
        </button>
      )}

      {isLoadingFiles && (
        <div className="flex items-center justify-center gap-2 py-12 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span className="font-label text-label-sm">正在读取目录...</span>
        </div>
      )}

      {filesError && (
        <div className="border border-error rounded-lg p-4 bg-surface-bright flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-body text-body-md text-error">{filesError}</p>
          </div>
          <button
            className="self-start font-label text-label-sm text-primary hover:opacity-80 transition-opacity"
            onClick={() => client && loadDirectory(client, currentPath)}
          >
            重试
          </button>
        </div>
      )}

      {!isLoadingFiles && !filesError && files.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">folder_open</span>
          <p className="font-body text-body-md text-on-surface-variant">此目录为空</p>
        </div>
      )}

      {/* 文件列表 */}
      {!isLoadingFiles && files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((file) => {
            const downloadable = !file.isDirectory && isSupportedBookFile(file.name);
            const isBusy = busyFile === file.name;
            return (
              <button
                key={file.path}
                className={cn(
                  'flex items-center gap-3 py-3 px-3 rounded-lg transition-colors text-left',
                  file.isDirectory || (downloadable && !busyFile)
                    ? 'hover:bg-surface-variant'
                    : 'opacity-50 cursor-default'
                )}
                onClick={() => {
                  if (file.isDirectory) handleOpenFolder(file);
                  else if (downloadable) handleDownloadAndImport(file);
                }}
                disabled={isBusy || (!file.isDirectory && !downloadable)}
                data-ui-control={downloadable || file.isDirectory ? true : undefined}
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  {file.isDirectory ? 'folder' : isBusy ? 'progress_activity animate-spin' : getFileIcon(file.name)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-body text-body-md text-on-surface block truncate">{file.name}</span>
                  {!file.isDirectory && (
                    <span className="font-label text-label-sm text-on-surface-variant">
                      {isBusy ? '下载并导入中...' : formatFileSize(file.size)}
                      {!downloadable && !isBusy && ' · 不支持的格式'}
                    </span>
                  )}
                </span>
                {file.isDirectory && (
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 导入成功 */}
      {importedBook && (
        <section className="border border-primary rounded-lg p-4 bg-surface-bright flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-body text-body-md text-primary">《{importedBook.title}》导入成功</p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-full bg-primary text-on-primary font-label text-label-sm hover:opacity-90 transition-opacity"
              onClick={() => navigate(readerPathForBook(importedBook))}
            >
              开始阅读
            </button>
            <button
              className="px-4 py-2 rounded-full border border-outline-variant font-label text-label-sm text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
              onClick={() => navigate(bookDetailPath(importedBook.id))}
            >
              查看详情
            </button>
          </div>
        </section>
      )}

      {actionError && (
        <div className="border border-error rounded-lg p-4 bg-surface-bright">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-body text-body-md text-error">{actionError}</p>
          </div>
        </div>
      )}
    </main>
  );

  const renderForm = () => (
    <main className="w-full max-w-max-width-content px-margin-mobile md:px-margin-desktop pt-8 pb-32 flex-grow flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 className="font-label text-label-md text-on-surface-variant uppercase tracking-wider">选择协议</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {PROTOCOLS.map((p) => (
              <button
                key={p.id}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-2 border rounded-lg transition-all gap-1',
                  protocol === p.id
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant hover:border-primary text-on-surface bg-transparent'
                )}
                onClick={() => {
                  setProtocol(p.id);
                  setConnectError(null);
                }}
              >
                <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                <span className="font-label text-label-sm">{p.label}</span>
              </button>
            ))}
          </div>
          <p className="font-body text-body-md text-on-surface-variant text-sm mt-1">
            {currentProtocol.description}
          </p>
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-grow flex flex-col gap-2">
              <label className="font-label text-label-sm text-on-surface-variant">
                {protocol === 'opds' ? '目录地址' : protocol === 'nas' ? 'NAS 地址 / IP' : protocol === 'onedrive' ? '授权方式' : '服务器地址'}
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body text-body-md text-primary placeholder:text-on-tertiary-container focus:ring-0 focus:border-primary transition-all outline-none"
                placeholder={placeholders.server}
                type={protocol === 'onedrive' ? 'text' : 'url'}
                value={serverAddress}
                onChange={(e) => setServerAddress(e.target.value)}
                readOnly={protocol === 'onedrive'}
              />
            </div>
            {protocol !== 'onedrive' && protocol !== 'opds' && (
              <div className="w-full md:w-32 flex flex-col gap-2">
                <label className="font-label text-label-sm text-on-surface-variant">端口 (选填)</label>
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body text-body-md text-primary placeholder:text-on-tertiary-container focus:ring-0 focus:border-primary transition-all outline-none"
                  placeholder={placeholders.port}
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
            )}
          </div>

          {protocol !== 'onedrive' && protocol !== 'opds' && (
            <div className="flex flex-col gap-2">
              <label className="font-label text-label-sm text-on-surface-variant">路径 (选填)</label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body text-body-md text-primary placeholder:text-on-tertiary-container focus:ring-0 focus:border-primary transition-all outline-none"
                placeholder={protocol === 'nas' ? '/Comics' : '/books'}
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </div>
          )}

          <hr className="border-t border-outline-variant opacity-50 my-2" />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label text-label-sm text-on-surface-variant">
                {protocol === 'onedrive' ? '账户邮箱' : '用户名'}
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body text-body-md text-primary placeholder:text-on-tertiary-container focus:ring-0 focus:border-primary transition-all outline-none"
                placeholder={protocol === 'onedrive' ? 'example@outlook.com' : '输入用户名'}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 relative">
              <label className="font-label text-label-sm text-on-surface-variant">
                {protocol === 'onedrive' ? '授权码 / Token' : '密码'}
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body text-body-md text-primary placeholder:text-on-tertiary-container focus:ring-0 focus:border-primary transition-all outline-none pr-10"
                placeholder="••••••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute right-0 top-8 text-on-surface-variant hover:text-primary transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {connectError && (
          <section className="border border-error rounded-lg p-4 bg-surface-bright">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="font-body text-body-md text-error">{connectError}</p>
            </div>
          </section>
        )}

        {canBrowse ? (
          <section className="mt-8">
            <button
              className={cn(
                'w-full py-4 font-label text-label-md rounded active:scale-[0.98] transition-all flex justify-center items-center gap-2',
                isFormValid
                  ? 'bg-primary text-on-primary hover:opacity-90'
                  : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              )}
              onClick={handleConnect}
              disabled={!isFormValid || isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  正在连接...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">cloud_sync</span>
                  连接并浏览
                </>
              )}
            </button>
            <p className="text-center font-body text-body-md text-on-surface-variant text-sm mt-4">
              连接后可浏览远端目录并直接导入书籍；连接信息仅保存在本地设备上。
            </p>
          </section>
        ) : (
          <section className="mt-8 flex flex-col gap-3">
            <button
              className={cn(
                'w-full py-4 font-label text-label-md rounded active:scale-[0.98] transition-all flex justify-center items-center gap-2',
                isFormValid
                  ? 'bg-primary text-on-primary hover:opacity-90'
                  : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              )}
              onClick={handleConnect}
              disabled={!isFormValid || isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  正在测试连接...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">cloud_sync</span>
                  测试并连接
                </>
              )}
            </button>
            <p className="text-center font-body text-body-md text-on-surface-variant text-sm">
              该协议暂不支持应用内浏览，敬请期待。
            </p>
          </section>
        )}
    </main>
  );

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <header className="w-full max-w-max-width-content px-margin-mobile md:px-margin-desktop py-unit bg-surface flex justify-between items-center sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-4">
          <button
            className="text-primary hover:opacity-80 transition-opacity p-2 -ml-2"
            onClick={() => (client || isOpdsConnected ? handleDisconnect() : navigate(ROUTES.IMPORT))}
            aria-label={client || isOpdsConnected ? '返回连接页' : '返回'}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display text-headline-md text-primary tracking-tight">自定义云端来源</h1>
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 -mr-2">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </header>

      {isOpdsConnected ? (
        <OpdsBrowser
          catalogUrl={serverAddress}
          username={username}
          password={password}
          onImportFile={handleOpdsImportFile}
        />
      ) : client ? (
        renderBrowser()
      ) : (
        renderForm()
      )}
    </div>
  );
};
