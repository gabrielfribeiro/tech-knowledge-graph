const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const GRAPH_FILE = path.join(KB_DIR, 'graph-index.json');
const DIST_TEAMS = path.join(REPO_ROOT, 'dist/teams');

function parseFrontmatter(content) {
  content = content.replace(/^\uFEFF/, '').trimStart();
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: null, body: content };
  const rawYaml = match[1];
  const body = content.slice(match[0].length).trim();
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
  if (!raw) return '';
  const match = raw.match(/\[\[([a-zA-Z0-9_\-]+)\]\]/);
  return match ? match[1] : raw.replace(/[\[\]]/g, '').trim();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function exportForTeams() {
  console.log('\n🚀 Iniciando Exportação Otimizada para Microsoft Teams & Copilot Studio...\n');

  if (!fs.existsSync(GRAPH_FILE)) {
    console.error('Arquivo graph-index.json não encontrado. Execute npm run compile primeiro.');
    process.exit(1);
  }

  const graph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8').replace(/^\uFEFF/, ''));
  const nodes = graph.nodes || {};
  const edges = graph.edges || [];

  // Recreate dist/teams directory
  if (fs.existsSync(DIST_TEAMS)) {
    fs.rmSync(DIST_TEAMS, { recursive: true, force: true });
  }
  ensureDir(DIST_TEAMS);
  ensureDir(path.join(DIST_TEAMS, 'servicos'));
  ensureDir(path.join(DIST_TEAMS, 'regras'));
  ensureDir(path.join(DIST_TEAMS, 'queries'));
  ensureDir(path.join(DIST_TEAMS, 'processos'));

  // Pre-load all node files
  const loadedNodes = {};
  for (const [id, meta] of Object.entries(nodes)) {
    const fullPath = path.join(REPO_ROOT, meta.path);
    if (fs.existsSync(fullPath)) {
      const rawContent = fs.readFileSync(fullPath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(rawContent);
      loadedNodes[id] = { meta, frontmatter: frontmatter || {}, body };
    }
  }

  // Helper to replace [[id]] with human readable string
  function replaceWikilinksWithHumanText(text) {
    return text.replace(/\[\[([a-zA-Z0-9_\-]+)\]\]/g, (match, linkId) => {
      const target = nodes[linkId];
      if (target) {
        return `**${target.title}** (\`${target.id}\`)`;
      }
      return `\`${linkId}\``;
    });
  }

  // Map incoming and outgoing connections
  const outEdges = {};
  const inEdges = {};
  for (const id of Object.keys(nodes)) {
    outEdges[id] = [];
    inEdges[id] = [];
  }
  for (const edge of edges) {
    if (outEdges[edge.source]) outEdges[edge.source].push(edge);
    if (inEdges[edge.target]) inEdges[edge.target].push(edge);
  }

  // 1. Generate Individual Enriched RAG Files
  const exportedFiles = [];

  for (const [id, node] of Object.entries(loadedNodes)) {
    const { meta, frontmatter, body } = node;
    const humanBody = replaceWikilinksWithHumanText(body);
    let categoryFolder = 'servicos';
    let typeName = 'SERVIÇO / MICROSSERVIÇO';

    if (meta.type === 'rule') {
      categoryFolder = 'regras';
      typeName = 'REGRA DE NEGÓCIO';
    } else if (meta.type === 'query') {
      categoryFolder = 'queries';
      typeName = 'CONSULTA SQL / AUDITORIA';
    } else if (meta.type === 'process') {
      categoryFolder = 'processos';
      typeName = 'RUNBOOK OPERACIONAL / PROCESSO';
    }

    let doc = `# [${typeName}] ${meta.title}\n\n`;
    doc += `> **ID Técnico:** \`${meta.id}\` | **Atualizado em:** ${meta.updated_at || 'N/A'}\n\n`;

    // Metadata Block
    doc += `## 📋 Metadados de Contexto\n`;
    if (frontmatter.responsavel) doc += `- **Squad / Responsável:** ${frontmatter.responsavel}\n`;
    if (frontmatter.repositorio) doc += `- **Repositório Git:** ${frontmatter.repositorio}\n`;
    if (frontmatter.dominio) doc += `- **Domínio de Negócio:** ${frontmatter.dominio}\n`;
    if (frontmatter.database) doc += `- **Banco de Dados:** ${frontmatter.database}\n`;
    if (frontmatter.tags && frontmatter.tags.length > 0) doc += `- **Tags:** ${frontmatter.tags.join(', ')}\n`;
    doc += `\n`;

    // Relationships Context Block (Self-Contained RAG Enrichment)
    doc += `## 🔗 Relações e Conexões com o Ecossistema\n`;
    const outgoing = outEdges[id] || [];
    const incoming = inEdges[id] || [];

    if (outgoing.length === 0 && incoming.length === 0) {
      doc += `*Este componente não possui dependências diretas registradas.*\n\n`;
    } else {
      if (outgoing.length > 0) {
        doc += `### Dependências e Saídas:\n`;
        for (const edge of outgoing) {
          const target = nodes[edge.target];
          const targetTitle = target ? target.title : edge.target;
          const targetType = target ? target.type.toUpperCase() : 'NÓ';
          doc += `- **[${edge.relation.toUpperCase()}]** Aponta para o ${targetType}: **${targetTitle}** (\`${edge.target}\`)\n`;
        }
        doc += `\n`;
      }
      if (incoming.length > 0) {
        doc += `### Componentes que Dependem ou Utilizam Este Nó:\n`;
        for (const edge of incoming) {
          const source = nodes[edge.source];
          const sourceTitle = source ? source.title : edge.source;
          const sourceType = source ? source.type.toUpperCase() : 'NÓ';
          doc += `- O ${sourceType} **${sourceTitle}** (\`${edge.source}\`) conecta via **${edge.relation.toUpperCase()}**\n`;
        }
        doc += `\n`;
      }
    }

    // Document Body
    doc += `## 📖 Conteúdo e Especificação Técnica\n\n`;
    doc += humanBody + `\n\n`;

    // Save File
    const targetPath = path.join(DIST_TEAMS, categoryFolder, `${id}.md`);
    fs.writeFileSync(targetPath, doc, 'utf8');
    exportedFiles.push(targetPath);
  }

  // 2. Generate Master Catalog (00_CATALOGO_E_MAPA_GERAL_DA_AREA.md)
  let catalog = `# 🗺️ Catálogo Mestre da Área Técnica (Visão Geral para IA & Equipe)\n\n`;
  catalog += `Este documento consolida toda a arquitetura, microsserviços, regras de negócio, queries críticas e processos da área técnica para alimentar consultas e agentes no **Microsoft Teams**.\n\n`;

  catalog += `## 📊 Resumo Executivo da Base\n`;
  catalog += `- **Total de Componentes:** ${Object.keys(nodes).length}\n`;
  catalog += `- **Total de Conexões Relacionais:** ${edges.length}\n`;
  catalog += `- **Última Compilação:** ${new Date().toISOString()}\n\n`;

  // Services Table
  catalog += `## 📦 Microsserviços e Sistemas\n\n`;
  catalog += `| ID | Nome do Serviço | Squad / Dono | Banco / Infra | Depende De |\n`;
  catalog += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const [id, n] of Object.entries(nodes)) {
    if (n.type === 'project') {
      const deps = (outEdges[id] || []).filter(e => e.relation === 'depends_on').map(e => `\`${e.target}\``).join(', ') || 'Nenhuma';
      const owner = n.metadata?.responsavel || 'Não definido';
      catalog += `| \`${id}\` | **${n.title}** | ${owner} | - | ${deps} |\n`;
    }
  }
  catalog += `\n`;

  // Rules Table
  catalog += `## 📜 Regras de Negócio e Políticas\n\n`;
  catalog += `| ID | Regra de Negócio | Domínio | Implementado No Serviço |\n`;
  catalog += `| :--- | :--- | :--- | :--- |\n`;
  for (const [id, n] of Object.entries(nodes)) {
    if (n.type === 'rule') {
      const domain = n.metadata?.dominio || 'Geral';
      const services = (inEdges[id] || []).map(e => `\`${e.source}\``).join(', ') || (outEdges[id] || []).map(e => `\`${e.target}\``).join(', ') || 'N/A';
      catalog += `| \`${id}\` | **${n.title}** | ${domain} | ${services} |\n`;
    }
  }
  catalog += `\n`;

  // Queries Table
  catalog += `## 🔍 Consultas SQL & Scripts de Banco Críticos\n\n`;
  catalog += `| ID | Nome da Consulta | Banco de Dados | Serviço Dono | Regra que Executa |\n`;
  catalog += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const [id, n] of Object.entries(nodes)) {
    if (n.type === 'query') {
      const db = n.metadata?.database || 'N/A';
      const service = (outEdges[id] || []).find(e => e.relation === 'belongs_to')?.target || 'N/A';
      const rule = (outEdges[id] || []).find(e => e.relation === 'implements_rule')?.target || 'N/A';
      catalog += `| \`${id}\` | **${n.title}** | ${db} | \`${service}\` | \`${rule}\` |\n`;
    }
  }
  catalog += `\n`;

  // Processes Table
  catalog += `## 🛠️ Processos Operacionais e Runbooks de Incidente\n\n`;
  catalog += `| ID | Nome do Processo | Serviços Envolvidos |\n`;
  catalog += `| :--- | :--- | :--- |\n`;
  for (const [id, n] of Object.entries(nodes)) {
    if (n.type === 'process') {
      const related = (outEdges[id] || []).map(e => `\`${e.target}\``).join(', ') || 'Geral';
      catalog += `| \`${id}\` | **${n.title}** | ${related} |\n`;
    }
  }
  catalog += `\n`;

  fs.writeFileSync(path.join(DIST_TEAMS, '00_CATALOGO_E_MAPA_GERAL_DA_AREA.md'), catalog, 'utf8');

  // 3. Generate Copilot Studio Configuration Guide
  let configGuide = `# 🤖 Guia de Configuração do Agente no Microsoft Teams / Copilot Studio\n\n`;
  configGuide += `Este documento contém as instruções exatas para configurar o seu agente corporativo no **Microsoft Copilot Studio** para responder pelo **Microsoft Teams**.\n\n`;

  configGuide += `## 1. Onde Fazer o Upload destes Arquivos\n`;
  configGuide += `1. Crie uma pasta no SharePoint da sua Squad (exemplo: \`Documentos/Base-Tecnica-Teams/\`).\n`;
  configGuide += `2. Faça o upload de **todos os arquivos desta pasta (\`dist/teams/\`)** para lá.\n`;
  configGuide += `3. No **Microsoft Copilot Studio**, abra o seu agente, vá em **Knowledge (Conhecimento)** > **Add Knowledge** > **SharePoint** e cole o link da pasta.\n\n`;

  configGuide += `## 2. Instruções do Sistema (System Prompt) para Colar no Copilot Studio\n`;
  configGuide += `Copie e cole o texto abaixo no campo **Instructions** (Instruções) do seu Agente no Copilot Studio:\n\n`;
  configGuide += `\`\`\`text\n`;
  configGuide += `Você é o Tech Lead Assistant e Especialista de Arquitetura da equipe de engenharia no Microsoft Teams. Seu papel é orientar desenvolvedores, suporte e liderança técnica sobre serviços, regras de negócio, queries de banco de dados e runbooks de incidentes.\n\n`;
  configGuide += `Diretrizes de resposta:\n`;
  configGuide += `1. Respostas Diretas e Objetivas: Vá direto ao ponto técnico. Use bullet points e tabelas para clareza.\n`;
  configGuide += `2. Formatação de Código: Sempre envolva códigos SQL, comandos curl/bash e endpoints em blocos de código formatados com syntax highlighting.\n`;
  configGuide += `3. Citação de Contexto: Ao citar um serviço ou processo, informe sempre a squad responsável e o ID técnico entre parênteses.\n`;
  configGuide += `4. Relações e Impacto: Se o usuário perguntar sobre uma falha ou incidente, consulte as relações de 'recovers_service' e 'depends_on' para sugerir o runbook correto.\n`;
  configGuide += `5. Fidelidade aos Fatos: NUNCA invente queries ou regras que não estejam documentadas. Se não encontrar o registro, responda honestamente: "Essa informação não está catalogada na base técnica da área."\n`;
  configGuide += `\`\`\`\n\n`;

  configGuide += `## 3. Perguntas de Teste Sugeridas (Conversation Starters)\n`;
  configGuide += `- "Quais são os microsserviços da squad de Monetização e suas dependências?"\n`;
  configGuide += `- "Como funciona a regra de cobrança recorrente e retentativas do Billing Engine?"\n`;
  configGuide += `- "Qual query SQL eu uso para identificar assinaturas travadas sem fatura?"\n`;
  configGuide += `- "Qual é o runbook para reprocessar cobranças quando a fila de eventos falha?"\n`;

  fs.writeFileSync(path.join(DIST_TEAMS, 'CONFIGURACAO_AGENTE_COPILOT_STUDIO.md'), configGuide, 'utf8');

  console.log(`✅ Exportação concluída com sucesso em: dist/teams/\n`);
  console.log(`📁 Arquivos gerados (${exportedFiles.length + 2} arquivos):`);
  console.log(`   - dist/teams/00_CATALOGO_E_MAPA_GERAL_DA_AREA.md`);
  console.log(`   - dist/teams/CONFIGURACAO_AGENTE_COPILOT_STUDIO.md`);
  console.log(`   - dist/teams/servicos/ (${fs.readdirSync(path.join(DIST_TEAMS, 'servicos')).length} serviços)`);
  console.log(`   - dist/teams/regras/ (${fs.readdirSync(path.join(DIST_TEAMS, 'regras')).length} regras)`);
  console.log(`   - dist/teams/queries/ (${fs.readdirSync(path.join(DIST_TEAMS, 'queries')).length} queries)`);
  console.log(`   - dist/teams/processos/ (${fs.readdirSync(path.join(DIST_TEAMS, 'processos')).length} processos)\n`);
}

module.exports = { exportForTeams };

if (require.main === module) {
  exportForTeams();
}
