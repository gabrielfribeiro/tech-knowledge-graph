const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const SPEC_DIR = path.join(REPO_ROOT, 'spec');
const OUT_DIR = path.join(REPO_ROOT, 'dist', 'context');

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

function readJsonSafe(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch (_) {
    return fallback;
  }
}

function compactMarkdownBody(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  // Strip frontmatter
  const body = raw.replace(/^---[\s\S]*?---\s*/, '');
  // Compress whitespace, remove decorative blockquotes and empty lines
  return body
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('> ') && !l.startsWith('---'))
    .slice(0, 18) // Keep only high-density top lines per node
    .join(' | ');
}

function generateCompactContext(projectOverride, taskOverride) {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const profile = readJsonSafe(path.join(SPEC_DIR, 'squad-profile.json'), {});
  const pipeline = readJsonSafe(path.join(KB_DIR, 'squad-pipeline.json'), {});
  const graph = readJsonSafe(path.join(KB_DIR, 'graph-index.json'), { nodes: [], edges: [] });

  const projectId = projectOverride || pipeline.project_id || 'proj-billing-engine';
  const taskId = taskOverride || pipeline.task_id || 'rule-cobranca-recorrente';

  // Find 1-hop connected nodes in the graph for this project & task
  const relevantIds = new Set([projectId, taskId]);
  for (const edge of graph.edges || []) {
    if (edge.source === projectId || edge.source === taskId) relevantIds.add(edge.target);
    if (edge.target === projectId || edge.target === taskId) relevantIds.add(edge.source);
  }

  const nodesList = Array.isArray(graph.nodes)
    ? graph.nodes
    : Object.entries(graph.nodes || {}).map(([id, val]) => ({ id, ...val }));

  const relevantNodes = nodesList.filter(n => relevantIds.has(n.id));

  const stack = profile.stack || {};
  const qaSec = profile.quality_and_security || {};

  const lines = [
    `# ⚡ CONTEXTO ULTRA-COMPACTO (TOKEN-SAVER)`,
    `SQUAD: ${profile.identity?.squad_name || 'Squad'} | TL: ${profile.identity?.tech_lead || 'TL'} | STATUS: ${pipeline.status || 'IDLE'}`,
    `STACK: FE=${stack.frontend} | BE=${stack.backend} | DB=${stack.database} | ORM=${stack.orm_data_access || stack.orm_or_data_access} | ARCH=${stack.architecture_style}`,
    `QA/SEC: Unit=${qaSec.test_framework_backend}/${qaSec.test_framework_frontend} (${qaSec.min_coverage_percent}%) | E2E=${qaSec.e2e_automation_tool || 'Cypress'} | Evid=${qaSec.test_management_tool || 'Jira Xray'} | Sec=OWASP+BindParams+LGPD`,
    `MISSÃO ATIVA: Projeto=${projectId} | Tarefa=${taskId}`,
    `NÓS CONECTADOS (${relevantNodes.length}):`
  ];

  for (const node of relevantNodes) {
    const relPath = node.file || node.path || '';
    const absPath = path.join(KB_DIR, relPath);
    const summary = compactMarkdownBody(absPath);
    lines.push(`- [${(node.type || 'node').toUpperCase()}] ${node.id} (${relPath}): ${summary}`);
  }

  lines.push(`DIRETIVA DE CUSTO: Proibido texto longo/saudações. Edite os arquivos direto e responda em <= 4 linhas (STATUS / ARQUIVOS / PRÓXIMO).`);

  const content = lines.join('\n');
  const outPath = path.join(OUT_DIR, 'active-context.md');
  fs.writeFileSync(outPath, content, 'utf8');

  const approxTokens = Math.ceil(content.length / 4);
  console.log(`⚡ [Token-Saver] Contexto minificado gerado em dist/context/active-context.md (~${approxTokens} tokens vs ~4.500 tokens brutos = -${Math.round((1 - approxTokens / 4500) * 100)}% custo)`);
  return { outPath, approxTokens, relevantCount: relevantNodes.length };
}

if (require.main === module) {
  const proj = getArgValue('--project');
  const task = getArgValue('--task');
  generateCompactContext(proj, task);
}

module.exports = { generateCompactContext };
