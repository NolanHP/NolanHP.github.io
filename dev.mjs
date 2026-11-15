// Local preview: builds, serves dist/ at http://localhost:4000, rebuilds on change.
// Run: npm run dev

import http from 'node:http';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

async function rebuild() {
  try {
    await build();
  } catch (err) {
    console.error(`Build failed.\n${err.message}`);
  }
}

await rebuild();

let timer;
for (const dir of ['content', 'src', 'public']) {
  watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
}

http
  .createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.join(DIST, path.normalize(urlPath));
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      const body = await readFile(path.join(DIST, '404.html')).catch(() => 'Not found');
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end(body);
    }
  })
  .listen(PORT, () => console.log(`Preview at http://localhost:${PORT} (Ctrl+C to stop)`));
