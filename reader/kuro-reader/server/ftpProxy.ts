import { Client } from 'basic-ftp';
import type { ServerResponse } from 'http';
import type { Connect } from 'vite';

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;

const FTP_TYPE_DIRECTORY = 2;
const FTP_DEFAULT_PORT = 21;
const DATE_PAD_LENGTH = 2;

interface FTPRequestBody {
  action: 'list' | 'download';
  path: string;
}

interface FTPHeaders {
  'x-ftp-host': string;
  'x-ftp-port': string;
  authorization?: string;
}

/**
 * FTP 代理服务
 *
 * @description 内建于 Vite Dev Server 的 FTP 代理中间件
 * 使用 basic-ftp 库连接远程 FTP 服务器，通过 HTTP API 暴露给前端
 */
export async function handleFTPProxy(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction
): Promise<void> {
  if (req.method === 'POST') {
    await handlePostRequest(req, res, next);
  } else if (req.method === 'GET') {
    await handleGetRequest(req, res, next);
  } else {
    next();
  }
}

async function handlePostRequest(
  req: Connect.IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  let body = '';
  req.on('data', (chunk: Buffer) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body) as FTPRequestBody;
      const headers = req.headers as unknown as FTPHeaders;

      const host = headers['x-ftp-host'];
      const port = parseInt(headers['x-ftp-port'] || String(FTP_DEFAULT_PORT), 10);
      const auth = parseAuthHeader(headers.authorization);

      if (!host) {
        sendError(res, HTTP_STATUS.BAD_REQUEST, 'Missing X-FTP-Host header');
        return;
      }

      const client = await createFTPClient(host, port, auth);

      try {
        if (data.action === 'list') {
          await handleListAction(client, data.path, res);
        } else if (data.action === 'download') {
          await handleDownloadAction(client, data.path, res);
        } else {
          sendError(res, HTTP_STATUS.BAD_REQUEST, `Unknown action: ${data.action}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'FTP operation failed';
        sendError(res, HTTP_STATUS.BAD_GATEWAY, message);
      } finally {
        client.close();
      }
    } catch {
      sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid request body');
    }
  });
}

async function handleGetRequest(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction
): Promise<void> {
  try {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const path = url.searchParams.get('path') || '/';

    if (action !== 'download') {
      next();
      return;
    }

    const headers = req.headers as unknown as FTPHeaders;
    const host = headers['x-ftp-host'];
    const port = parseInt(headers['x-ftp-port'] || String(FTP_DEFAULT_PORT), 10);
    const auth = parseAuthHeader(headers.authorization);

    if (!host) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, 'Missing X-FTP-Host header');
      return;
    }

    const client = await createFTPClient(host, port, auth);

    try {
      await handleDownloadAction(client, path, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'FTP download failed';
      sendError(res, HTTP_STATUS.BAD_GATEWAY, message);
    } finally {
      client.close();
    }
  } catch {
    next();
  }
}

async function createFTPClient(
  host: string,
  port: number,
  auth: { username: string; password: string }
): Promise<Client> {
  const client = new Client();
  client.ftp.verbose = false;

  await client.access({
    host,
    port,
    user: auth.username,
    password: auth.password,
    secure: false,
    secureOptions: { rejectUnauthorized: false },
  });

  return client;
}

function parseAuthHeader(authHeader?: string): { username: string; password: string } {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return { username: '', password: '' };
  }

  const base64 = authHeader.replace('Basic ', '');
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const colonIndex = decoded.indexOf(':');

  if (colonIndex === -1) {
    return { username: decoded, password: '' };
  }

  return {
    username: decoded.substring(0, colonIndex),
    password: decoded.substring(colonIndex + 1),
  };
}

async function handleListAction(
  client: Client,
  path: string,
  res: ServerResponse
): Promise<void> {
  try {
    const list = await client.list(path);
    const lines = list.map((item) => formatListItem(item));

    res.writeHead(HTTP_STATUS.OK, { 'Content-Type': 'text/plain' });
    res.end(lines.join('\n'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list directory';
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}

function formatListItem(item: {
  name: string;
  type: number;
  size: number;
  rawModifiedAt?: string;
  date: string;
}): string {
  const type = item.type === FTP_TYPE_DIRECTORY ? 'd' : '-';
  const perms = type === 'd' ? 'drwxr-xr-x' : '-rw-r--r--';
  const size = item.size;
  const date = item.rawModifiedAt || item.date || new Date().toISOString();
  const dateObj = new Date(date);
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const day = String(dateObj.getDate()).padStart(DATE_PAD_LENGTH, '0');
  const hours = String(dateObj.getHours()).padStart(DATE_PAD_LENGTH, '0');
  const minutes = String(dateObj.getMinutes()).padStart(DATE_PAD_LENGTH, '0');
  const time = `${hours}:${minutes}`;

  return `${perms} 1 owner group ${size} ${month} ${day} ${time} ${item.name}`;
}

async function handleDownloadAction(
  client: Client,
  path: string,
  res: ServerResponse
): Promise<void> {
  try {
    const chunks: Buffer[] = [];

    await client.downloadTo(
      {
        write(chunk: Buffer) {
          chunks.push(chunk);
          return true;
        },
        end() {
          return;
        },
        destroy() {
          return;
        },
      } as unknown as NodeJS.WritableStream,
      path
    );

    const buffer = Buffer.concat(chunks);

    res.writeHead(HTTP_STATUS.OK, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(buffer.length),
    });
    res.end(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to download file';
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}

function sendError(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
}
