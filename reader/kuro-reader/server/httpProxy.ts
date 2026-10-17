import type { ServerResponse } from 'http';
import http from 'node:http';
import https from 'node:https';
import type { Connect } from 'vite';

/**
 * HTTP 透传代理（仅 Vite Dev Server 内建，生产包不含）
 *
 * @description GET/PROPFIND /api/http-proxy?url=<encoded absolute url>
 * rclone 等自建文件服务器不带 CORS 头，浏览器/WebView 内跨源请求必被拦；
 * 开发期经 Node 中转（无 CORS 概念）保证 Web 端可验证完整浏览/下载管线。
 * App 原生端走 CapacitorHttp/FileTransfer 原生栈（同样无 CORS），不依赖本代理。
 */

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  BAD_GATEWAY: 502,
} as const;

/** 空闲超时：列表页小响应即断；下载流持续有数据不触发 */
const IDLE_TIMEOUT_MS = 30000;

export function handleHttpProxy(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction
): void {
  if (req.method !== 'GET' && req.method !== 'PROPFIND') {
    next();
    return;
  }

  let target: URL;
  try {
    const query = new URL(req.url || '', `http://${req.headers.host}`);
    const raw = query.searchParams.get('url');
    if (!raw) throw new Error('missing url');
    target = new URL(raw);
    if (target.protocol !== 'http:' && target.protocol !== 'https:') throw new Error('bad protocol');
  } catch {
    res.writeHead(HTTP_STATUS.BAD_REQUEST, { 'Content-Type': 'text/plain' });
    res.end('Expected /api/http-proxy?url=<encoded http(s) url>');
    return;
  }

  // host 由 Node 按目标 URL 自设；Authorization 等其余头原样透传
  const { host: _host, ...upstreamHeaders } = req.headers;
  const transport = target.protocol === 'https:' ? https : http;
  const upstream = transport.request(
    target,
    { method: req.method, headers: upstreamHeaders },
    (upRes) => {
      res.writeHead(upRes.statusCode ?? HTTP_STATUS.BAD_GATEWAY, upRes.headers);
      upRes.pipe(res);
    }
  );

  upstream.setTimeout(IDLE_TIMEOUT_MS, () => upstream.destroy(new Error('upstream idle timeout')));
  upstream.on('error', (error) => {
    if (!res.headersSent) {
      res.writeHead(HTTP_STATUS.BAD_GATEWAY, { 'Content-Type': 'text/plain' });
    }
    res.end(`Upstream error: ${error.message}`);
  });

  req.pipe(upstream);
}
