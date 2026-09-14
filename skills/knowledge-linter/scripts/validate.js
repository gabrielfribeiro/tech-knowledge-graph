const fs = require('fs');
const path = require('path');

const KB_DIR = path.resolve(__dirname, '../../../knowledge-base');

const PREFIX_FOLDER_MAP = {
  'proj-': { folder: 'projects', type: 'project' },
  'rule-': { folder: 'rules', type: 'rule' },
  'qry-': { folder: 'queries', type: 'query' },
  'proc-': { folder: 'processes', type: 'process' },
  'adr-': { folder: 'adrs', type: 'adr' },
};

function getAllMarkdownFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllMarkdownFiles(fullPath, fileList);
    } else if (item.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function parseFrontmatter(content) {
  content = content.replace(/^\uFEFF/, '').trimStart();
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: null, body: content };
  const rawYaml = match[1];
  const body = content.slice(match[0].length);
  const data = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;
  let isArray = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(trimmed.slice(2).replace(/^['"]|['"]$/g, ''));
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      currentKey = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (val === '') {
        isArray = true;
        data[currentKey] = [];
      } else if (val.startsWith('[') && val.endsWith(']')) {
        data[currentKey] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        data[currentKey] = val.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return { frontmatter: data, body };
}

function extractWikilinks(text) {
  const links = [];
  const regex = /\[\[([a-zA-Z0-9_\-]+)\]\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function runLint() {
  const files = getAllMarkdownFiles(KB_DIR);
  const issues = [];
  const existingIds = new Set();
  const parsedNodes = [];

  // Pass 1: Collect IDs and parse files
  for (const file of files) {
    const relPath = path.relative(KB_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const basename = path.basename(file, '.md');

    if (frontmatter && frontmatter.id) {
      existingIds.add(frontmatter.id);
    }
    parsedNodes.push({ file, relPath, basename, frontmatter, body, content });
  }

  // Pass 2: Lint rules
  for (const node of parsedNodes) {
    const { relPath, basename, frontmatter, body, content } = node;

    if (!frontmatter) {
      issues.push({ severity: 'ERROR', file: relPath, rule: 'LINT-003', detail: 'Arquivo sem Frontmatter YAML delimitado por ---.' });
      continue;
    }

    // LINT-001: ID matches filename
    if (frontmatter.id !== basename) {
      issues.push({
        severity: 'ERROR',
        file: relPath,
        rule: 'LINT-001',
        detail: `ID "${frontmatter.id}" no frontmatter difere do nome do arquivo "${basename}".`
      });
    }

    // LINT-002: Folder and prefix match
    let validPrefix = false;
    for (const [prefix, config] of Object.entries(PREFIX_FOLDER_MAP)) {
      if (basename.startsWith(prefix)) {
        validPrefix = true;
        const expectedFolder = config.folder;
        if (!relPath.startsWith(expectedFolder + '/')) {
          issues.push({
            severity: 'ERROR',
            file: relPath,
            rule: 'LINT-002',
            detail: `Nó com prefixo "${prefix}" deve estar na pasta "knowledge-base/${expectedFolder}/".`
          });
        }
        if (frontmatter.type !== config.type) {
          issues.push({
            severity: 'ERROR',
            file: relPath,
            rule: 'LINT-002',
            detail: `Tipo incorreto: esperado "${config.type}", encontrado "${frontmatter.type}".`
          });
        }
        break;
      }
    }
    if (!validPrefix) {
      issues.push({
        severity: 'ERROR',
        file: relPath,
        rule: 'LINT-002',
        detail: `Nome "${basename}" não inicia com prefixo reconhecido (proj-, rule-, qry-, proc-, adr-).`
      });
    }

    // LINT-003: Required global fields
    for (const field of ['id', 'type', 'title', 'updated_at']) {
      if (!frontmatter[field]) {
        issues.push({ severity: 'ERROR', file: relPath, rule: 'LINT-003', detail: `Campo obrigatório ausente: "${field}".` });
      }
    }

    // LINT-004: Specific fields
    if (frontmatter.type === 'query') {
      if (!frontmatter.database) issues.push({ severity: 'ERROR', file: relPath, rule: 'LINT-004', detail: 'Query sem campo "database".' });
      if (!frontmatter.belongs_to) issues.push({ severity: 'ERROR', file: relPath, rule: 'LINT-004', detail: 'Query sem campo "belongs_to".' });
    } else if (frontmatter.type === 'project') {
      if (!frontmatter.responsavel) issues.push({ severity: 'WARN', file: relPath, rule: 'LINT-004', detail: 'Projeto sem campo "responsavel".' });
    }

    // LINT-005: Referential integrity
    const allLinks = extractWikilinks(content);
    for (const link of allLinks) {
      if (!existingIds.has(link)) {
        issues.push({
          severity: 'ERROR',
          file: relPath,
          rule: 'LINT-005',
          detail: `Link órfão: refere-se a "[[${link}]]" que não existe na base.`
        });
      }
    }

    // LINT-007: Token budget
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    if (words > 400) {
      issues.push({
        severity: 'WARN',
        file: relPath,
        rule: 'LINT-007',
        detail: `Nota longa (${words} palavras). Considere desagregar para manter notas atômicas.`
      });
    }
  }

  return { totalFiles: files.length, issues };
}

const isJson = process.argv.includes('--json');
const { totalFiles, issues } = runLint();

if (isJson) {
  console.log(JSON.stringify({ totalFiles, issues }, null, 2));
} else {
  console.log(`\n🩺 Validação da Base de Conhecimento: ${totalFiles} arquivo(s) analisado(s).`);
  if (issues.length === 0) {
    console.log('✅ Tudo perfeito! Nenhum erro ou aviso encontrado.\n');
    process.exit(0);
  } else {
    console.log(`\nForam encontrados ${issues.length} apontamento(s):\n`);
    for (const issue of issues) {
      const icon = issue.severity === 'ERROR' ? '❌' : '⚠️';
      console.log(`${icon} [${issue.rule}] [${issue.severity}] ${issue.file}: ${issue.detail}`);
    }
    console.log('');
    const hasErrors = issues.some(i => i.severity === 'ERROR');
    process.exit(hasErrors ? 1 : 0);
  }
}
