const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execSync } = require('child_process');
const { analyzeIntake } = require('../skills/knowledge-orchestrator/scripts/analyze-intake');

const PORT = process.env.PORT || 3333;
const REPO_ROOT = path.resolve(__dirname, '../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // API: Graph Index
    if (pathname === '/api/graph' && req.method === 'GET') {
      const graphFile = path.join(KB_DIR, 'graph-index.json');
      if (fs.existsSync(graphFile)) {
        const data = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
        return sendJson(res, 200, data);
      }
      return sendJson(res, 404, { error: 'Grafo ainda não compilado.' });
    }

    // API: Audit Gaps
    if (pathname === '/api/audit' && req.method === 'GET') {
      try {
        const output = execSync('node skills/knowledge-governance/scripts/audit-gaps.js --json', { cwd: REPO_ROOT }).toString();
        return sendJson(res, 200, JSON.parse(output));
      } catch (e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // API: Validate (Linter)
    if (pathname === '/api/validate' && req.method === 'GET') {
      try {
        const output = execSync('node skills/knowledge-linter/scripts/validate.js --json', { cwd: REPO_ROOT }).toString();
        return sendJson(res, 200, JSON.parse(output));
      } catch (e) {
        // validate.js exits with code 1 if errors, but still outputs valid JSON
        if (e.stdout) {
          try { return sendJson(res, 200, JSON.parse(e.stdout.toString())); } catch (_) {}
        }
        return sendJson(res, 500, { error: e.message });
      }
    }

    // API: Get Single Node Content
    if (pathname === '/api/node' && req.method === 'GET') {
      const id = parsedUrl.query.id;
      if (!id) return sendJson(res, 400, { error: 'ID do nó é obrigatório.' });

      const graphFile = path.join(KB_DIR, 'graph-index.json');
      if (fs.existsSync(graphFile)) {
        const graph = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
        const node = graph.nodes[id];
        if (node) {
          const filePath = path.join(REPO_ROOT, node.path);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return sendJson(res, 200, { node, content });
          }
        }
      }
      return sendJson(res, 404, { error: 'Nó não encontrado.' });
    }

    // API: Analyze Text for Ingestion (Conflict & Deduplication)
    if (pathname === '/api/analyze' && req.method === 'POST') {
      const body = await parseBody(req);
      const text = body.text || '';
      if (!text.trim()) {
        return sendJson(res, 400, { error: 'Texto não fornecido.' });
      }
      const result = analyzeIntake(text);
      return sendJson(res, 200, result);
    }

    // API: Trigger Actions (Fixer, Compiler)
    if (pathname === '/api/action/fix' && req.method === 'POST') {
      try {
        const output = execSync('node skills/knowledge-fixer/scripts/fix.js --create-stubs', { cwd: REPO_ROOT }).toString();
        execSync('node skills/knowledge-governance/scripts/compile-graph.js', { cwd: REPO_ROOT });
        return sendJson(res, 200, { success: true, output });
      } catch (e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    if (pathname === '/api/action/compile' && req.method === 'POST') {
      try {
        const output = execSync('node skills/knowledge-governance/scripts/compile-graph.js', { cwd: REPO_ROOT }).toString();
        return sendJson(res, 200, { success: true, output });
      } catch (e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // Static Files Handler
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      return fs.createReadStream(filePath).pipe(res);
    }

    sendJson(res, 404, { error: 'Rota não encontrada.' });
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Tech Knowledge Graph Web App rodando em: http://localhost:${PORT}`);
  console.log(`Pressione Ctrl+C para encerrar.\n`);
});
