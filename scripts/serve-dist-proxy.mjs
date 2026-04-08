import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || '5173');
const backendHost = process.env.FRONTEND_PROXY_HOST || '127.0.0.1';
const backendPort = Number(process.env.FRONTEND_PROXY_PORT || '8082');

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.map', 'application/json; charset=utf-8'],
]);

const proxyPrefixes = ['/api/', '/api', '/health', '/v3/', '/swagger-ui', '/uploads/'];

function isProxyRequest(pathname) {
  return proxyPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function isWithinDist(filePath) {
  const relative = path.relative(distDir, filePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function serveStatic(req, res, pathname) {
  let filePath = pathname === '/' ? path.join(distDir, 'index.html') : path.resolve(distDir, `.${pathname}`);

  if (!isWithinDist(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes.get(ext) || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(filePath).on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Failed to read frontend asset.');
  }).pipe(res);
}

function proxyRequest(req, res) {
  const proxy = http.request(
    {
      hostname: backendHost,
      port: backendPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${backendHost}:${backendPort}`,
      },
    },
    (backendRes) => {
      res.writeHead(backendRes.statusCode || 502, backendRes.headers);
      backendRes.pipe(res);
    }
  );

  proxy.on('error', (error) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end(`Proxy error: ${error.message}`);
  });

  req.pipe(proxy);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${host}:${port}`}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (isProxyRequest(pathname)) {
    proxyRequest(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed.');
    return;
  }

  await serveStatic(req, res, pathname);
});

server.listen(port, host, () => {
  console.log(`Frontend proxy server listening on http://${host}:${port}`);
  console.log(`Proxying API traffic to http://${backendHost}:${backendPort}`);
});
