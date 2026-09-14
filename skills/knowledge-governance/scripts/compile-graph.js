const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const OUTPUT_FILE = path.join(KB_DIR, 'graph-index.json');

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

function cleanId(raw) {
  if (!raw) return null;
  const match = raw.match(/\[\[([a-zA-Z0-9_\-]+)\]\]/);
  return match ? match[1] : raw.replace(/[\[\]]/g, '').trim();
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

function compileGraph() {
  const files = getAllMarkdownFiles(KB_DIR);
  const nodes = {};
  const edges = [];
  const edgeSet = new Set();

  function addEdge(source, target, relation) {
    const s = cleanId(source);
    const t = cleanId(target);
    if (!s || !t || s === t) return;
    const key = `${s}->${t}:${relation}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ source: s, target: t, relation });
    }
  }

  // Pass 1: Parse and register nodes
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const basename = path.basename(file, '.md');
    const relPath = path.relative(REPO_ROOT, file).replace(/\\/g, '/');

    if (!frontmatter || !frontmatter.id) continue;

    const id = frontmatter.id;
    nodes[id] = {
      id,
      type: frontmatter.type || 'unknown',
      title: frontmatter.title || basename,
      path: relPath,
      updated_at: frontmatter.updated_at || null,
      tags: frontmatter.tags || [],
      metadata: {}
    };

    // Store type-specific metadata
    if (frontmatter.type === 'query') {
      nodes[id].metadata.database = frontmatter.database || null;
    } else if (frontmatter.type === 'project') {
      nodes[id].metadata.responsavel = frontmatter.responsavel || null;
      nodes[id].metadata.repositorio = frontmatter.repositorio || null;
    } else if (frontmatter.type === 'rule') {
      nodes[id].metadata.dominio = frontmatter.dominio || null;
    }

    // Capture frontmatter edges
    if (frontmatter.belongs_to) {
      addEdge(id, frontmatter.belongs_to, 'belongs_to');
    }
    if (frontmatter.implements_rule) {
      addEdge(id, frontmatter.implements_rule, 'implements_rule');
    }
    if (Array.isArray(frontmatter.depends_on)) {
      frontmatter.depends_on.forEach(dep => addEdge(id, dep, 'depends_on'));
    }
    if (Array.isArray(frontmatter.related_projects)) {
      frontmatter.related_projects.forEach(rel => addEdge(id, rel, 'related_to'));
    }

    // Capture body markdown wikilinks
    const bodyLinks = extractWikilinks(body);
    for (const link of bodyLinks) {
      addEdge(id, link, 'references');
    }
  }

  // Count by type
  const countsByType = {};
  for (const node of Object.values(nodes)) {
    countsByType[node.type] = (countsByType[node.type] || 0) + 1;
  }

  const graphData = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_nodes: Object.keys(nodes).length,
      total_edges: edges.length,
      counts_by_type: countsByType
    },
    nodes,
    edges
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(graphData, null, 2), 'utf8');

  return graphData;
}

const graph = compileGraph();
console.log(`\n🕸️ Grafo Compilado com Sucesso!`);
console.log(`Arquivo: knowledge-base/graph-index.json`);
console.log(`Total de Nós: ${graph.metadata.total_nodes}`);
console.log(`Total de Arestas (Conexões): ${graph.metadata.total_edges}`);
console.log('Distribuição:', graph.metadata.counts_by_type);
console.log('');
