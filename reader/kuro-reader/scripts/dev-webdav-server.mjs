/**
 * 最小 WebDAV 测试服务器（仅用于本地端到端冒烟）：
 * - PROPFIND (Depth: 1)：返回目录列表（多状态 XML）
 * - GET：返回文件内容
 * - 全量 CORS 头：允许开发页面跨域访问
 * 用法：node scripts/dev-webdav-server.mjs [port] [rootDir]
 */
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const PORT = Number(process.argv[2] || 6180);
const ROOT = path.resolve(process.argv[3] || './.webdav-fixture');

const MIME = {
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.epub': 'application/epub+zip',
  '.zip': 'application/zip',
};

function xmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function entryXml(href, display, isDir, size) {
  return `<D:response>
<D:href>${xmlEscape(href)}</D:href>
<D:propstat><D:prop>
<D:displayname>${xmlEscape(display)}</D:displayname>
<D:getcontentlength>${size}</D:getcontentlength>
<D:resourcetype><D:collection/></D:resourcetype>
</D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat>
</D:response>`;
}

function fileXml(href, display, size) {
  return `<D:response>
<D:href>${xmlEscape(href)}</D:href>
<D:propstat><D:prop>
<D:displayname>${xmlEscape(display)}</D:displayname>
<D:getcontentlength>${size}</D:getcontentlength>
<D:resourcetype/>
</D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat>
</D:response>`;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PROPFIND, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Depth, Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const fsPath = path.join(ROOT, urlPath);

  try {
    const stat = await fs.stat(fsPath);

    if (req.method === 'PROPFIND' && stat.isDirectory()) {
      const entries = await fs.readdir(fsPath, { withFileTypes: true });
      const parts = [];
      const selfHref = urlPath.endsWith('/') ? urlPath : `${urlPath}/`;
      const selfName = urlPath === '/' ? 'root' : path.basename(urlPath);
      parts.push(entryXml(selfHref, selfName, true, 0));
      for (const e of entries) {
        const childFs = path.join(fsPath, e.name);
        const childHref = `${selfHref}${encodeURIComponent(e.name)}`;
        if (e.isDirectory()) {
          parts.push(entryXml(childHref, e.name, true, 0));
        } else {
          const s = await fs.stat(childFs);
          parts.push(fileXml(childHref, e.name, s.size));
        }
      }
      const body = `<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:">${parts.join('')}</D:multistatus>`;
      res.writeHead(207, { 'Content-Type': 'application/xml; charset=utf-8' });
      res.end(body);
      return;
    }

    if (req.method === 'GET' && stat.isFile()) {
      const ext = path.extname(fsPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stat.size,
      });
      const buf = await fs.readFile(fsPath);
      res.end(buf);
      return;
    }

    res.writeHead(405);
    res.end();
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(PORT, () => console.log(`webdav test server at http://localhost:${PORT} -> ${ROOT}`));
