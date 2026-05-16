import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/utils/cn';
import { createCloudClient } from '@/services/cloudStorage';

interface ProtocolOption {
  id: 'webdav' | 'smb' | 'ftp' | 'onedrive' | 'nas';
  label: string;
  icon: string;
  description: string;
}

const PROTOCOLS: ProtocolOption[] = [
  { id: 'webdav', label: 'WebDAV', icon: 'cloud_sync', description: '通用云存储标准协议' },
  { id: 'nas', label: 'NAS', icon: 'storage', description: '群晖 / QNAP / 威联通' },
  { id: 'smb', label: 'SMB', icon: 'folder_open', description: 'Windows 文件共享' },
  { id: 'ftp', label: 'FTP', icon: 'transfer_within_a_station', description: '文件传输协议' },
  { id: 'onedrive', label: 'OneDrive', icon: 'cloud_download', description: '微软云存储 API' },
];

export const CustomCloudPage: React.FC = () => {
  const navigate = useNavigate();
  const [protocol, setProtocol] = useState<ProtocolOption['id']>('webdav');
  const [serverAddress, setServerAddress] = useState('');
  const [port, setPort] = useState('');
  const [path, setPath] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const currentProtocol = PROTOCOLS.find((p) => p.id === protocol)!;

  const getPlaceholder = (): { server: string; port: string } => {
    switch (protocol) {
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
  };

  const placeholders = getPlaceholder();

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('idle');
    try {
      const client = createCloudClient({
        protocol: protocol === 'nas' ? 'nas' : protocol,
        serverAddress,
        port: port || undefined,
        path: path || undefined,
        username,
        password,
      });
      const success = await client.testConnection();
      setTestResult(success ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const isFormValid = serverAddress.trim().length > 0 && username.trim().length > 0;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <header className="w-full max-w-max-width-content px-margin-mobile md:px-margin-desktop py-unit bg-surface flex justify-between items-center sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-4">
          <button className="text-primary hover:opacity-80 transition-opacity p-2 -ml-2" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display text-headline-md text-primary tracking-tight">自定义云端来源</h1>
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 -mr-2">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </header>

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
                  setTestResult('idle');
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
                {protocol === 'nas' ? 'NAS 地址 / IP' : protocol === 'onedrive' ? '授权方式' : '服务器地址'}
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
            {protocol !== 'onedrive' && (
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

          {protocol !== 'onedrive' && (
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

        {testResult === 'success' && (
          <section className="border border-primary rounded-lg p-4 bg-surface-bright">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-body text-body-md text-primary">连接测试成功</p>
            </div>
          </section>
        )}

        {testResult === 'error' && (
          <section className="border border-error rounded-lg p-4 bg-surface-bright">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="font-body text-body-md text-error">连接失败，请检查服务器地址和凭据</p>
            </div>
          </section>
        )}

        <section className="mt-8">
          <button
            className={cn(
              'w-full py-4 font-label text-label-md rounded active:scale-[0.98] transition-all flex justify-center items-center gap-2',
              isFormValid
                ? 'bg-primary text-on-primary hover:opacity-90'
                : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
            )}
            onClick={handleTestConnection}
            disabled={!isFormValid || isTesting}
          >
            {isTesting ? (
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
          <p className="text-center font-body text-body-md text-on-surface-variant text-sm mt-4">
            连接信息将安全地保存在本地设备上。
          </p>
        </section>
      </main>
    </div>
  );
};
