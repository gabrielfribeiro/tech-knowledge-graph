const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { searchVectorStore, indexKnowledgeBase } = require('./vector-indexer');

const REPO_ROOT = path.resolve(__dirname, '../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const GRAPH_FILE = path.join(KB_DIR, 'graph-index.json');
const CATALOG_FILE = path.join(REPO_ROOT, 'spec/relations-catalog.json');

function loadGraph() {
  if (!fs.existsSync(GRAPH_FILE)) return { nodes: {}, edges: [] };
  return JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8').replace(/^\uFEFF/, ''));
}

function loadCatalog() {
  if (!fs.existsSync(CATALOG_FILE)) return {};
  return JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8').replace(/^\uFEFF/, ''));
}

// Tool definitions for MCP
const TOOLS = [
  {
    name: 'search_knowledge_semantic',
    description: 'Busca semântica vetorial na base de conhecimento técnico. Retorna os nós mais relevantes com score de similaridade para qualquer pergunta técnica em linguagem natural.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'A pergunta ou termos de busca (ex: "como funciona a cobrança quando o webhook falha", "qual a query do postgres")'
        },
        limit: {
          type: 'number',
          description: 'Número máximo de resultados (padrão: 5)',
          default: 5
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_entity',
    description: 'Recupera o conteúdo completo em Markdown, regras, código SQL e metadados de uma entidade técnica específica pelo seu ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'O ID técnico da entidade (ex: "proj-billing-engine", "rule-cobranca-recorrente", "qry-assinaturas-pendentes-faturamento")'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'traverse_graph',
    description: 'Navega nas conexões relacionais do grafo técnico a partir de um nó, retornando dependências diretas, serviços donos, regras implementadas e processos associados.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'O ID do nó de partida (ex: "proj-billing-engine")'
        },
        direction: {
          type: 'string',
          enum: ['outgoing', 'incoming', 'both'],
          description: 'Direção da navegação: "outgoing" (o que este nó consome/aponta), "incoming" (quem aponta para este nó), ou "both" (ambos). Padrão: "both"',
          default: 'both'
        },
        relation: {
          type: 'string',
          description: 'Filtro opcional por tipo de aresta (ex: "depends_on", "implements_rule", "belongs_to")'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'list_entities_by_type',
    description: 'Lista todos os nós cadastrados de uma determinada categoria na base de conhecimento.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['project', 'rule', 'query', 'process', 'adr'],
          description: 'Tipo da entidade: "project" (serviços/APIs), "rule" (regras de negócio), "query" (SQLs), "process" (runbooks), "adr" (decisões)'
        }
      },
      required: ['type']
    }
  },
  {
    name: 'audit_knowledge_gaps',
    description: 'Audita a base de conhecimento e retorna débitos técnicos, serviços sem runbook de suporte mapeado e queries sem regra de negócio formalizada.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Tool Executors
async function executeTool(name, args) {
  const graph = loadGraph();
  const nodes = graph.nodes || {};
  const edges = graph.edges || [];

  if (name === 'search_knowledge_semantic') {
    const results = await searchVectorStore(args.query, args.limit || 5);
    return {
      total: results.length,
      query: args.query,
      results
    };
  }

  if (name === 'get_entity') {
    const node = nodes[args.id];
    if (!node) {
      return { error: `Entidade com ID "${args.id}" não encontrada no grafo.` };
    }
    const fullPath = path.join(REPO_ROOT, node.path);
    if (!fs.existsSync(fullPath)) {
      return { error: `Arquivo da entidade não encontrado em: ${node.path}` };
    }
    const content = fs.readFileSync(fullPath, 'utf8');

    // Also attach connected edges for instant graph context
    const connectedEdges = edges.filter(e => e.source === args.id || e.target === args.id);
    return {
      entity: node,
      connected_edges: connectedEdges,
      markdown_content: content
    };
  }

  if (name === 'traverse_graph') {
    const targetId = args.id;
    const direction = args.direction || 'both';
    const relationFilter = args.relation || null;

    if (!nodes[targetId]) {
      return { error: `Nó "${targetId}" não encontrado.` };
    }

    let outgoing = edges.filter(e => e.source === targetId);
    let incoming = edges.filter(e => e.target === targetId);

    if (relationFilter) {
      outgoing = outgoing.filter(e => e.relation === relationFilter);
      incoming = incoming.filter(e => e.relation === relationFilter);
    }

    const enrichEdge = (edge, otherId) => {
      const otherNode = nodes[otherId] || { id: otherId, title: otherId, type: 'unknown' };
      return {
        relation: edge.relation,
        target_id: otherId,
        target_title: otherNode.title,
        target_type: otherNode.type
      };
    };

    return {
      node: nodes[targetId],
      outgoing: (direction === 'incoming') ? [] : outgoing.map(e => enrichEdge(e, e.target)),
      incoming: (direction === 'outgoing') ? [] : incoming.map(e => enrichEdge(e, e.source))
    };
  }

  if (name === 'list_entities_by_type') {
    const matched = Object.values(nodes).filter(n => n.type === args.type);
    return {
      type: args.type,
      total: matched.length,
      entities: matched
    };
  }

  if (name === 'audit_knowledge_gaps') {
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
    const queriesWithoutRules = [];
    const isolatedNodes = [];

    for (const [id, node] of Object.entries(nodes)) {
      if (inDegrees[id] === 0 && outDegrees[id] === 0) isolatedNodes.push(node);
      if (node.type === 'project') {
        const incoming = edgesByTarget[id] || [];
        const hasProcess = incoming.some(e => nodes[e.source]?.type === 'process');
        if (!hasProcess) projectsWithoutRunbooks.push({ id: node.id, title: node.title });
      }
      if (node.type === 'query') {
        const outgoing = edgesBySource[id] || [];
        const hasRule = outgoing.some(e => e.relation === 'implements_rule');
        if (!hasRule) queriesWithoutRules.push({ id: node.id, title: node.title });
      }
    }

    return {
      total_nodes: Object.keys(nodes).length,
      total_edges: edges.length,
      projects_without_runbooks: projectsWithoutRunbooks,
      queries_without_rules: queriesWithoutRules,
      isolated_nodes: isolatedNodes.map(n => n.id)
    };
  }

  throw new Error(`Ferramenta desconhecida: "${name}"`);
}

// MCP JSON-RPC Server over stdio
function sendResponse(id, result, error = null) {
  const response = {
    jsonrpc: '2.0',
    id
  };
  if (error) {
    response.error = { code: -32603, message: error.message || String(error) };
  } else {
    response.result = result;
  }
  const jsonStr = JSON.stringify(response);
  process.stdout.write(jsonStr + '\n');
}

function sendNotification(method, params = {}) {
  const notif = {
    jsonrpc: '2.0',
    method,
    params
  };
  process.stdout.write(JSON.stringify(notif) + '\n');
}

async function handleMessage(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false }
      },
      serverInfo: {
        name: 'tech-knowledge-graph-mcp',
        version: '1.0.0'
      }
    });
  }

  if (method === 'notifications/initialized') {
    return; // Acknowledged
  }

  if (method === 'ping') {
    return sendResponse(id, {});
  }

  if (method === 'tools/list') {
    return sendResponse(id, { tools: TOOLS });
  }

  if (method === 'tools/call') {
    try {
      const output = await executeTool(params.name, params.arguments || {});
      return sendResponse(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(output, null, 2)
          }
        ]
      });
    } catch (err) {
      return sendResponse(id, {
        content: [
          {
            type: 'text',
            text: `Erro ao executar ferramenta: ${err.message}`
          }
        ],
        isError: true
      });
    }
  }

  if (method === 'resources/list') {
    return sendResponse(id, {
      resources: [
        {
          uri: 'knowledge://graph',
          name: 'Grafo Técnico Consolidado',
          description: 'Topologia completa do grafo com todos os nós e arestas relacionais.',
          mimeType: 'application/json'
        },
        {
          uri: 'knowledge://relations-catalog',
          name: 'Catálogo de Relações Canônicas',
          description: 'Dicionário de arestas canônicas e sinônimos permitidos no grafo.',
          mimeType: 'application/json'
        }
      ]
    });
  }

  if (method === 'resources/read') {
    const uri = params.uri;
    if (uri === 'knowledge://graph') {
      return sendResponse(id, {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(loadGraph(), null, 2)
          }
        ]
      });
    }
    if (uri === 'knowledge://relations-catalog') {
      return sendResponse(id, {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(loadCatalog(), null, 2)
          }
        ]
      });
    }
    return sendResponse(id, null, new Error(`Recurso não encontrado: ${uri}`));
  }

  // Fallback for unknown methods
  if (id !== undefined) {
    sendResponse(id, null, new Error(`Método não suportado: ${method}`));
  }
}

// Start stdio reader
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', line => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg = JSON.parse(trimmed);
    handleMessage(msg);
  } catch (err) {
    // If Content-Length header framing was used, handle buffering
    console.error('Erro de parse JSON-RPC:', err.message);
  }
});

// Diagnostic startup message to stderr (stdout is strictly for JSON-RPC)
process.stderr.write('🚀 Servidor MCP Tech Knowledge Graph iniciado e escutando via stdio...\n');
