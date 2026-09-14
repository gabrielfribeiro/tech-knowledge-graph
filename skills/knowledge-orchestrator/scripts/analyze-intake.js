const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const GRAPH_FILE = path.join(KB_DIR, 'graph-index.json');

function cleanText(txt) {
  return txt.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(txt) {
  const stopWords = new Set(['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'que', 'se', 'e', 'ou', 'um', 'uma', 'uns', 'umas']);
  return cleanText(txt)
    .split(' ')
    .filter(t => t.length > 2 && !stopWords.has(t));
}

function jaccardSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function extractNumberPatterns(text) {
  const matches = text.match(/\b\d+\s*(?:dias|horas|tentativas|vezes|minutos|meses|anos|h|d)\b/gi) || [];
  return matches.map(m => m.toLowerCase().replace(/\s+/g, ' '));
}

function extractStatusPatterns(text) {
  const matches = text.match(/['"]([A-Z0-9_\-]+)['"]|status\s+(?:vai\s+para\s+|vira\s+|é\s+|muda\s+para\s+)([A-Za-z0-9_\-]+)/gi) || [];
  return matches.map(m => m.toUpperCase().replace(/[^A-Z0-9_\-]/g, ''));
}

function analyzeIntake(rawText) {
  if (!fs.existsSync(GRAPH_FILE)) {
    return { error: 'graph-index.json não encontrado. Execute o compilador do grafo.' };
  }

  const graph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8'));
  const existingNodes = graph.nodes || {};
  const intakeTokens = getTokens(rawText);
  const intakeNumbers = extractNumberPatterns(rawText);
  const intakeStatuses = extractStatusPatterns(rawText);

  // Load existing node contents
  const loadedNodes = {};
  for (const [id, meta] of Object.entries(existingNodes)) {
    const fullPath = path.join(REPO_ROOT, meta.path);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      loadedNodes[id] = {
        meta,
        content,
        tokens: getTokens(content),
        numbers: extractNumberPatterns(content),
        statuses: extractStatusPatterns(content)
      };
    }
  }

  const actions = [];
  const checkedExistingIds = new Set();

  // 1. Detect candidate matches against existing nodes
  for (const [id, node] of Object.entries(loadedNodes)) {
    const similarity = jaccardSimilarity(intakeTokens, node.tokens);
    const titleTokens = getTokens(node.meta.title);
    const titleMatch = titleTokens.some(t => intakeTokens.includes(t));

    // High relevance if Jaccard similarity > 0.15 or direct title/ID match
    if (similarity > 0.12 || rawText.toLowerCase().includes(id.toLowerCase()) || titleMatch) {
      checkedExistingIds.add(id);

      // Check for contradictions: numbers / SLA / status
      const conflicts = [];
      
      // Check number/duration divergence
      if (intakeNumbers.length > 0 && node.numbers.length > 0) {
        for (const inNum of intakeNumbers) {
          const type = inNum.replace(/\d+\s*/, '');
          const existingSameType = node.numbers.find(ex => ex.includes(type));
          if (existingSameType && existingSameType !== inNum) {
            conflicts.push(`Divergência de parâmetro temporal: Texto propõe "${inNum}", enquanto a documentação atual em "${id}" define "${existingSameType}".`);
          }
        }
      }

      // Check status outcome divergence
      if (intakeStatuses.length > 0 && node.statuses.length > 0) {
        for (const inSt of intakeStatuses) {
          if (inSt && !node.statuses.includes(inSt) && ['BLOQUEADO', 'CANCELADO', 'INADIMPLENTE', 'SUSPENSO', 'PENDENTE'].includes(inSt)) {
            conflicts.push(`Divergência de status/desfecho: Texto cita status "${inSt}", enquanto a documentação atual prevê "${node.statuses.join(', ')}".`);
          }
        }
      }

      if (conflicts.length > 0) {
        actions.push({
          status: 'CONFLICT',
          target_id: id,
          type: node.meta.type,
          title: node.meta.title,
          similarity: Math.round(similarity * 100),
          reason: 'Contradição de regras ou parâmetros técnicos detectada.',
          details: conflicts
        });
      } else {
        actions.push({
          status: 'UPDATE',
          target_id: id,
          type: node.meta.type,
          title: node.meta.title,
          similarity: Math.round(similarity * 100),
          reason: 'Entidade já existente identificada. O texto contém detalhes que podem enriquecer este nó sem contradições.',
          details: [`Similaridade de contexto: ${Math.round(similarity * 100)}%`]
        });
      }
    }
  }

  // 2. Identify brand-new components from text
  const hasSql = /SELECT\s+[\s\S]+?\s+FROM\s+/i.test(rawText);
  const mentionsNewProject = /(?:novo\s+serviço|nova\s+api|criamos\s+o|criada\s+a\s+api|microsserviço)\s+([a-zA-Z0-9_\-]+)/i.exec(rawText);
  const mentionsNewRule = /(?:nova\s+regra|regra\s+de\s+negócio|política\s+de)\s+([a-zA-Z0-9_\-]+)/i.exec(rawText);

  if (hasSql && !actions.some(a => a.type === 'query')) {
    actions.push({
      status: 'NEW',
      target_id: 'qry-nova-consulta',
      type: 'query',
      title: 'Nova Consulta SQL Detectada',
      reason: 'Bloco SQL identificado no texto sem correspondência no grafo.',
      details: ['Recomendado extrair para nó atômico em queries/']
    });
  }

  if (mentionsNewProject && !checkedExistingIds.has(`proj-${mentionsNewProject[1]}`)) {
    actions.push({
      status: 'NEW',
      target_id: `proj-${mentionsNewProject[1].toLowerCase()}`,
      type: 'project',
      title: `Novo Serviço: ${mentionsNewProject[1]}`,
      reason: 'Menção a novo microsserviço ou API identificada.',
      details: ['Recomendado criar nó atômico em projects/']
    });
  }

  // Fallback: If no match at all, classify as potential new rule or note
  if (actions.length === 0) {
    actions.push({
      status: 'NEW',
      target_id: 'rule-novo-conceito',
      type: 'rule',
      title: 'Novo Conhecimento Inédito',
      reason: 'O conteúdo não possui conflitos nem sobreposição com a base atual.',
      details: ['Pronto para ser decomposto e criado como novo nó.']
    });
  }

  return {
    timestamp: new Date().toISOString(),
    total_actions: actions.length,
    has_conflicts: actions.some(a => a.status === 'CONFLICT'),
    actions
  };
}

module.exports = { analyzeIntake };

if (require.main === module) {
  const inputArg = process.argv[2];
  let text = '';

  if (inputArg && fs.existsSync(inputArg)) {
    text = fs.readFileSync(inputArg, 'utf8');
  } else if (inputArg) {
    text = inputArg;
  } else {
    // Read from stdin
    text = fs.readFileSync(0, 'utf8');
  }

  const result = analyzeIntake(text);
  console.log(JSON.stringify(result, null, 2));
}
