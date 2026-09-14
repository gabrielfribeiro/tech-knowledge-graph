const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const GRAPH_FILE = path.join(KB_DIR, 'graph-index.json');

function loadGraph() {
  if (!fs.existsSync(GRAPH_FILE)) {
    console.error('Arquivo graph-index.json não encontrado. Execute primeiro: node skills/knowledge-governance/scripts/compile-graph.js');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8'));
}

function auditGaps() {
  const graph = loadGraph();
  const { nodes, edges } = graph;

  const inDegrees = {};
  const outDegrees = {};
  const edgesBySource = {};
  const edgesByTarget = {};

  for (const id of Object.keys(nodes)) {
    inDegrees[id] = 0;
    outDegrees[id] = 0;
    edgesBySource[id] = [];
    edgesByTarget[id] = [];
  }

  for (const edge of edges) {
    if (outDegrees[edge.source] !== undefined) outDegrees[edge.source]++;
    if (inDegrees[edge.target] !== undefined) inDegrees[edge.target]++;
    if (edgesBySource[edge.source]) edgesBySource[edge.source].push(edge);
    if (edgesByTarget[edge.target]) edgesByTarget[edge.target].push(edge);
  }

  const projectsWithoutRunbooks = [];
  const projectsWithoutQueries = [];
  const queriesWithoutRules = [];
  const rulesWithoutProjects = [];
  const isolatedNodes = [];

  for (const [id, node] of Object.entries(nodes)) {
    // Check isolated
    if (inDegrees[id] === 0 && outDegrees[id] === 0) {
      isolatedNodes.push(node);
    }

    // Projects
    if (node.type === 'project') {
      const incoming = edgesByTarget[id] || [];
      const hasQuery = incoming.some(e => e.relation === 'belongs_to' && nodes[e.source]?.type === 'query');
      const hasProcess = incoming.some(e => nodes[e.source]?.type === 'process');
      if (!hasQuery) projectsWithoutQueries.push(node);
      if (!hasProcess) projectsWithoutRunbooks.push(node);
    }

    // Queries
    if (node.type === 'query') {
      const outgoing = edgesBySource[id] || [];
      const hasRule = outgoing.some(e => e.relation === 'implements_rule');
      if (!hasRule) queriesWithoutRules.push(node);
    }

    // Rules
    if (node.type === 'rule') {
      const outgoing = edgesBySource[id] || [];
      const incoming = edgesByTarget[id] || [];
      const hasProject = outgoing.some(e => e.relation === 'related_to' && nodes[e.target]?.type === 'project') ||
                         incoming.some(e => nodes[e.source]?.type === 'project');
      if (!hasProject) rulesWithoutProjects.push(node);
    }
  }

  return {
    summary: {
      totalNodes: Object.keys(nodes).length,
      totalEdges: edges.length,
      isolatedCount: isolatedNodes.length,
      projectsWithoutRunbooksCount: projectsWithoutRunbooks.length,
      projectsWithoutQueriesCount: projectsWithoutQueries.length,
      queriesWithoutRulesCount: queriesWithoutRules.length
    },
    gaps: {
      isolatedNodes,
      projectsWithoutRunbooks,
      projectsWithoutQueries,
      queriesWithoutRules,
      rulesWithoutProjects
    }
  };
}

const isJson = process.argv.includes('--json');
const report = auditGaps();

if (isJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('\n📊 Relatório de Governança e Lacunas Técnicas (Knowledge Debt)\n');
  console.log(`Total de Nós: ${report.summary.totalNodes} | Total de Conexões: ${report.summary.totalEdges}`);
  console.log('------------------------------------------------------------');

  if (report.summary.totalNodes === 0) {
    console.log('A base de conhecimento ainda não possui nós cadastrados.');
    console.log('Use a skill knowledge-creator para criar os primeiros nós.\n');
    process.exit(0);
  }

  console.log(`\n1. Projetos sem Runbooks / Processos Mapeados (${report.gaps.projectsWithoutRunbooks.length}):`);
  if (report.gaps.projectsWithoutRunbooks.length === 0) console.log('   ✅ Todos os projetos possuem ao menos um runbook.');
  else report.gaps.projectsWithoutRunbooks.forEach(p => console.log(`   ⚠️  ${p.id} (${p.title})`));

  console.log(`\n2. Queries sem Regra de Negócio Associada (${report.gaps.queriesWithoutRules.length}):`);
  if (report.gaps.queriesWithoutRules.length === 0) console.log('   ✅ Todas as queries documentam a regra que implementam.');
  else report.gaps.queriesWithoutRules.forEach(q => console.log(`   ⚠️  ${q.id} (${q.title})`));

  console.log(`\n3. Nós Isolados no Grafo (Sem nenhuma conexão) (${report.gaps.isolatedNodes.length}):`);
  if (report.gaps.isolatedNodes.length === 0) console.log('   ✅ Nenhum nó isolado encontrado.');
  else report.gaps.isolatedNodes.forEach(n => console.log(`   ⚠️  [${n.type}] ${n.id}`));

  console.log('\n------------------------------------------------------------\n');
}
