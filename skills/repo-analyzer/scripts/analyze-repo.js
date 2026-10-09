const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const LOG_JSON = path.join(KB_DIR, 'analyzed-repositories.json');
const LOG_MD = path.join(REPO_ROOT, 'spec/analyzed-repositories.md');

function runCmd(cmd, cwd = REPO_ROOT) {
  try {
    return execSync(cmd, { cwd, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch (err) {
    if (err.stdout) return err.stdout.toString().trim();
    return null;
  }
}

function cleanSlug(input) {
  let base = input.trim();
  if (base.endsWith('.git')) base = base.slice(0, -4);
  if (base.includes('/') || base.includes('\\')) {
    const parts = base.split(/[/\\]+/).filter(Boolean);
    base = parts[parts.length - 1];
  }
  return base.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'app';
}

function findFiles(dir, filterFn, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (['.git', 'node_modules', 'dist', 'vendor', 'target', '.idea', '.vscode'].includes(item)) continue;
    const fullPath = path.join(dir, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findFiles(fullPath, filterFn, fileList);
      } else if (filterFn(item, fullPath)) {
        fileList.push(fullPath);
      }
    } catch (_) {}
  }
  return fileList;
}

// 1. Inspect Stack & Manifests
function inspectStack(repoDir) {
  const stack = {
    languages: [],
    frameworks: [],
    databases: [],
    messaging: [],
    buildTools: []
  };

  // Node.js
  const pkgPath = path.join(repoDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    stack.languages.push('JavaScript/TypeScript');
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      
      if (allDeps.express) stack.frameworks.push('Express');
      if (allDeps['@nestjs/core']) stack.frameworks.push('NestJS');
      if (allDeps.fastify) stack.frameworks.push('Fastify');
      if (allDeps.koa) stack.frameworks.push('Koa');
      
      if (allDeps.prisma || allDeps['@prisma/client']) { stack.databases.push('PostgreSQL/Prisma'); stack.buildTools.push('Prisma'); }
      if (allDeps.typeorm) stack.databases.push('TypeORM');
      if (allDeps.mongoose) stack.databases.push('MongoDB (Mongoose)');
      if (allDeps.pg) stack.databases.push('PostgreSQL');
      if (allDeps.mysql || allDeps.mysql2) stack.databases.push('MySQL');
      if (allDeps.redis || allDeps.ioredis) stack.databases.push('Redis');
      
      if (allDeps.kafkajs) stack.messaging.push('Apache Kafka');
      if (allDeps.amqplib) stack.messaging.push('RabbitMQ');
      if (allDeps['@aws-sdk/client-sqs'] || allDeps['aws-sdk']) stack.messaging.push('AWS SQS');
    } catch (_) {}
  }

  // Go
  const goModPath = path.join(repoDir, 'go.mod');
  if (fs.existsSync(goModPath)) {
    stack.languages.push('Go');
    const content = fs.readFileSync(goModPath, 'utf8');
    if (content.includes('github.com/gin-gonic/gin')) stack.frameworks.push('Gin');
    if (content.includes('github.com/labstack/echo')) stack.frameworks.push('Echo');
    if (content.includes('github.com/gofiber/fiber')) stack.frameworks.push('Fiber');
    if (content.includes('gorm.io/gorm')) stack.databases.push('GORM');
    if (content.includes('github.com/lib/pq') || content.includes('github.com/jackc/pgx')) stack.databases.push('PostgreSQL');
    if (content.includes('segmentio/kafka-go')) stack.messaging.push('Kafka');
    if (content.includes('aws/aws-sdk-go')) stack.messaging.push('AWS SDK');
  }

  // Java / Kotlin
  if (fs.existsSync(path.join(repoDir, 'pom.xml')) || fs.existsSync(path.join(repoDir, 'build.gradle'))) {
    stack.languages.push('Java/Kotlin');
    stack.buildTools.push(fs.existsSync(path.join(repoDir, 'pom.xml')) ? 'Maven' : 'Gradle');
    const pomContent = fs.existsSync(path.join(repoDir, 'pom.xml')) ? fs.readFileSync(path.join(repoDir, 'pom.xml'), 'utf8') : '';
    if (pomContent.includes('spring-boot')) stack.frameworks.push('Spring Boot');
    if (pomContent.includes('postgresql')) stack.databases.push('PostgreSQL');
    if (pomContent.includes('kafka')) stack.messaging.push('Kafka');
  }

  // Python
  if (fs.existsSync(path.join(repoDir, 'requirements.txt')) || fs.existsSync(path.join(repoDir, 'pyproject.toml'))) {
    stack.languages.push('Python');
    const reqContent = fs.existsSync(path.join(repoDir, 'requirements.txt')) ? fs.readFileSync(path.join(repoDir, 'requirements.txt'), 'utf8') : '';
    if (/fastapi/i.test(reqContent)) stack.frameworks.push('FastAPI');
    if (/django/i.test(reqContent)) stack.frameworks.push('Django');
    if (/flask/i.test(reqContent)) stack.frameworks.push('Flask');
    if (/sqlalchemy/i.test(reqContent)) stack.databases.push('SQLAlchemy');
    if (/psycopg2/i.test(reqContent)) stack.databases.push('PostgreSQL');
  }

  // Docker & Infra
  if (fs.existsSync(path.join(repoDir, 'Dockerfile'))) stack.buildTools.push('Docker');
  if (fs.existsSync(path.join(repoDir, 'docker-compose.yml'))) {
    const dc = fs.readFileSync(path.join(repoDir, 'docker-compose.yml'), 'utf8');
    if (/postgres/i.test(dc)) stack.databases.push('PostgreSQL (Docker)');
    if (/redis/i.test(dc)) stack.databases.push('Redis');
    if (/kafka/i.test(dc)) stack.messaging.push('Kafka');
  }

  // Deduplicate
  stack.languages = [...new Set(stack.languages)];
  stack.frameworks = [...new Set(stack.frameworks)];
  stack.databases = [...new Set(stack.databases)];
  stack.messaging = [...new Set(stack.messaging)];
  stack.buildTools = [...new Set(stack.buildTools)];

  return stack;
}

// 2. Inspect Test Coverage & Quality Patterns
function inspectTests(repoDir) {
  const testFiles = findFiles(repoDir, (name) => {
    return /test|spec/i.test(name) && /\.(js|ts|go|java|py|cs|kt)$/i.test(name);
  });

  const testFrameworks = [];
  let unitCount = 0;
  let integrationCount = 0;
  let e2eCount = 0;

  for (const file of testFiles) {
    const lower = file.toLowerCase();
    if (lower.includes('e2e') || lower.includes('cypress') || lower.includes('playwright')) {
      e2eCount++;
    } else if (lower.includes('integration') || lower.includes('integ') || lower.includes('repo_test') || lower.includes('db_test')) {
      integrationCount++;
    } else {
      unitCount++;
    }

    try {
      const snippet = fs.readFileSync(file, 'utf8').slice(0, 1000);
      if (/jest|describe\(|it\(/i.test(snippet) && !testFrameworks.includes('Jest/Vitest')) testFrameworks.push('Jest/Vitest');
      if (/assert|testify/i.test(snippet) && !testFrameworks.includes('Testify (Go)')) testFrameworks.push('Testify (Go)');
      if (/pytest|unittest/i.test(snippet) && !testFrameworks.includes('PyTest')) testFrameworks.push('PyTest');
      if (/@Test|junit/i.test(snippet) && !testFrameworks.includes('JUnit')) testFrameworks.push('JUnit');
    } catch (_) {}
  }

  return {
    totalTestFiles: testFiles.length,
    testFrameworks: [...new Set(testFrameworks)],
    breakdown: {
      unitTests: unitCount,
      integrationTests: integrationCount,
      e2eTests: e2eCount
    },
    hasTests: testFiles.length > 0
  };
}

// 3. Inspect Routes / Endpoints
function inspectEndpoints(repoDir) {
  const endpoints = [];
  const codeFiles = findFiles(repoDir, name => /\.(js|ts|go|py|java|cs)$/i.test(name));

  const routePatterns = [
    /(?:router|app|r)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/gi,
    /@(Get|Post|Put|Delete|Patch)Mapping\(\s*['"]?([^'")]+)?/gi,
    /@(?:app|api)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/gi,
    /(?:r|router)\.Handle(?:Func)?\(\s*['"]([^'"]+)['"]/gi
  ];

  for (const file of codeFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      for (const pat of routePatterns) {
        let match;
        while ((match = pat.exec(content)) !== null) {
          const method = (match[1] || 'GET').toUpperCase();
          const route = match[2] || match[1];
          if (route && route.startsWith('/') && !endpoints.some(e => e.route === route && e.method === method)) {
            endpoints.push({ method, route });
          }
        }
      }
    } catch (_) {}
  }
  return endpoints.slice(0, 15);
}

// 4. Inspect Queries & DB Schemas
function inspectQueries(repoDir) {
  const queries = [];
  const sqlFiles = findFiles(repoDir, name => /\.sql$/i.test(name));

  for (const file of sqlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const sqlMatches = content.match(/SELECT\s+[\s\S]+?\s+FROM\s+[a-zA-Z0-9_\-]+[\s\S]*?;/gi) || [];
      for (const sql of sqlMatches.slice(0, 3)) {
        queries.push({
          file: path.relative(repoDir, file).replace(/\\/g, '/'),
          sql: sql.trim().replace(/\s+/g, ' ')
        });
      }
    } catch (_) {}
  }

  return queries.slice(0, 5);
}

// 4.1 Inspect Tables & Schemas
function inspectTables(repoDir) {
  const tables = [];
  const files = findFiles(repoDir, name => /\.(sql|prisma)$/i.test(name));

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // SQL CREATE TABLE
      const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_\.]+)\s*\(([\s\S]*?)\);/gi;
      let match;
      while ((match = createRegex.exec(content)) !== null) {
        let rawName = match[1].replace(/['"`]/g, '').trim();
        if (rawName.includes('.')) rawName = rawName.split('.').pop();
        const body = match[2];
        const pkMatch = body.match(/PRIMARY\s+KEY\s*\(([a-zA-Z0-9_,\s]+)\)/i) || body.match(/([a-zA-Z0-9_]+)\s+[^,\n]+PRIMARY\s+KEY/i);
        const pk = pkMatch ? pkMatch[1].trim() : 'id';

        if (!tables.some(t => t.name === rawName)) {
          tables.push({
            name: rawName,
            pk,
            file: path.relative(repoDir, file).replace(/\\/g, '/'),
            rawSchema: body.split(/\r?\n/).slice(0, 8).join('\n').trim()
          });
        }
      }

      // Prisma models
      if (file.endsWith('.prisma')) {
        const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{([\s\S]*?)\}/g;
        let pMatch;
        while ((pMatch = modelRegex.exec(content)) !== null) {
          const mName = pMatch[1].toLowerCase();
          if (!tables.some(t => t.name === mName)) {
            tables.push({
              name: mName,
              pk: 'id',
              file: path.relative(repoDir, file).replace(/\\/g, '/'),
              rawSchema: pMatch[2].split(/\r?\n/).slice(0, 8).join('\n').trim()
            });
          }
        }
      }
    } catch (_) {}
  }
  return tables.slice(0, 5);
}

// 5. Inspect Business Rules
function inspectRules(repoDir) {
  const rules = [];
  const domainFiles = findFiles(repoDir, (name, full) => {
    return /(?:domain|service|usecase|rule|business)/i.test(full) && /\.(js|ts|go|py|java)$/i.test(name);
  });

  for (const file of domainFiles.slice(0, 10)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        if (/(?:\/\/|\/\*|#)\s*(?:regra|rule|politica|criterio):\s*(.+)/i.test(line)) {
          const match = line.match(/(?:regra|rule|politica|criterio):\s*(.+)/i);
          if (match && match[1]) {
            rules.push({
              title: match[1].trim(),
              file: path.relative(repoDir, file).replace(/\\/g, '/')
            });
          }
        }
      }
    } catch (_) {}
  }
  return rules.slice(0, 5);
}

// Main Analysis Function
async function analyzeRepository(repoInput, options = {}) {
  console.log(`\n============================================================`);
  console.log(`🔎 INICIANDO ANÁLISE DE CÓDIGO DO REPOSITÓRIO: ${repoInput}`);
  console.log(`============================================================\n`);

  const timestamp = new Date().toISOString();
  const repoSlug = cleanSlug(repoInput);
  const tempDir = path.join(REPO_ROOT, `.temp-analysis`, `${repoSlug}-${Date.now()}`);

  let isRemote = false;
  let targetPath = repoInput;

  try {
    // 1. Clone or local path
    if (/^(https?:\/\/|git@)/.test(repoInput)) {
      isRemote = true;
      console.log(`📥 [1/6] Clonando repositório de forma efêmera (--depth 1)...`);
      fs.mkdirSync(path.dirname(tempDir), { recursive: true });
      const cloneCmd = `git clone --depth 1 "${repoInput}" "${tempDir}"`;
      const res = runCmd(cloneCmd);
      if (!fs.existsSync(tempDir)) {
        throw new Error(`Falha ao clonar o repositório "${repoInput}". Verifique a URL e as permissões de acesso.`);
      }
      targetPath = tempDir;
    } else {
      console.log(`📂 [1/6] Analisando caminho local: "${repoInput}"...`);
    }

    // 2. Extract Git Fingerprint
    console.log(`🏷️  [2/6] Extraindo Fingerprint Git (Commit, Tags, Timestamp)...`);
    const commitHash = runCmd('git rev-parse HEAD', targetPath) || 'desconhecido';
    const versionTag = runCmd('git describe --tags --always', targetPath) || 'dev-head';
    const commitDate = runCmd('git log -1 --format=%cI', targetPath) || timestamp;

    console.log(`   - Commit Hash (HEAD): ${commitHash}`);
    console.log(`   - Versão/Tag:         ${versionTag}`);
    console.log(`   - Data do Commit:     ${commitDate}`);

    // 3. Inspect Codebase
    console.log(`🔬 [3/6] Mapeando Arquitetura, Regras, Queries e Testes...`);
    const stack = inspectStack(targetPath);
    const tests = inspectTests(targetPath);
    const endpoints = inspectEndpoints(targetPath);
    const queries = inspectQueries(targetPath);
    const tables = inspectTables(targetPath);
    const rules = inspectRules(targetPath);

    console.log(`   - Stack Detectada: ${stack.languages.join(', ') || 'Não identificada'}`);
    console.log(`   - Frameworks:      ${stack.frameworks.join(', ') || 'Nenhum identificado'}`);
    console.log(`   - Banco de Dados:  ${stack.databases.join(', ') || 'Nenhum identificado'}`);
    console.log(`   - Tabelas/Schemas: ${tables.length} mapeadas`);
    console.log(`   - Mensageria:      ${stack.messaging.join(', ') || 'Nenhuma identificada'}`);
    console.log(`   - Arquivos Testes: ${tests.totalTestFiles} (${tests.testFrameworks.join(', ') || 'Sem framework claro'})`);
    console.log(`   - Endpoints/Rotas: ${endpoints.length} mapeados`);

    // 4. Generate Atomic Knowledge Nodes
    console.log(`📝 [4/6] Gerando Nós Atômicos na Base de Conhecimento...`);
    const entitiesCreated = [];

    // 4.1 Project Node
    const projId = `proj-${repoSlug}`;
    const projFile = path.join(KB_DIR, 'projects', `${projId}.md`);
    const projContent = `---
id: ${projId}
type: project
title: ${repoSlug.toUpperCase()}
responsavel: Squad ${repoSlug}
repositorio: ${repoInput}
updated_at: ${timestamp.split('T')[0]}
tags: [${stack.languages.map(l => l.toLowerCase()).concat(stack.frameworks.map(f => f.toLowerCase())).join(', ')}]
---

# Projeto: ${repoSlug.toUpperCase()}

## Finalidade e Arquitetura
Aplicação extraída automaticamente a partir da análise do repositório \`${repoInput}\`.

## Tecnologias e Infra
- **Linguagens:** ${stack.languages.join(', ') || 'N/A'}
- **Frameworks:** ${stack.frameworks.join(', ') || 'N/A'}
- **Banco de Dados:** ${stack.databases.join(', ') || 'N/A'}
- **Mensageria:** ${stack.messaging.join(', ') || 'N/A'}
- **Build / Infra:** ${stack.buildTools.join(', ') || 'N/A'}

## Cobertura e Qualidade de Testes
- **Total de Arquivos de Teste:** ${tests.totalTestFiles}
- **Frameworks de Teste:** ${tests.testFrameworks.join(', ') || 'Nenhum identificado'}
- **Divisão:** Unitários (${tests.breakdown.unitTests}), Integração (${tests.breakdown.integrationTests}), E2E (${tests.breakdown.e2eTests})

## Endpoints e Rotas Principais
${endpoints.length > 0 ? endpoints.map(e => `- \`${e.method} ${e.route}\``).join('\n') : '*Nenhum endpoint explícito mapeado.*'}
`;
    fs.writeFileSync(projFile, projContent, 'utf8');
    entitiesCreated.push(projId);

    // 4.2 Rules Nodes
    if (rules.length > 0) {
      for (let i = 0; i < rules.length; i++) {
        const r = rules[i];
        const ruleId = `rule-${repoSlug}-${cleanSlug(r.title).slice(0, 25)}`;
        const ruleFile = path.join(KB_DIR, 'rules', `${ruleId}.md`);
        const ruleContent = `---
id: ${ruleId}
type: rule
title: Regra: ${r.title}
dominio: ${repoSlug}
updated_at: ${timestamp.split('T')[0]}
tags: [regras, ${repoSlug}]
related_projects:
  - "[[${projId}]]"
---

# Regra: ${r.title}

## Definição
Regra de negócio identificada na camada de domínio da aplicação (\`${r.file}\`).

## Referências
- Implementado em: \`[[${projId}]]\`
`;
        fs.writeFileSync(ruleFile, ruleContent, 'utf8');
        entitiesCreated.push(ruleId);
      }
    }

    // 4.3 Query Nodes
    if (queries.length > 0) {
      for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        const qryId = `qry-${repoSlug}-query-${i + 1}`;
        const qryFile = path.join(KB_DIR, 'queries', `${qryId}.md`);
        const qryContent = `---
id: ${qryId}
type: query
title: Consulta SQL ${repoSlug} #${i + 1}
database: ${stack.databases[0] || 'postgres-prod'}
updated_at: ${timestamp.split('T')[0]}
tags: [sql, ${repoSlug}]
belongs_to: "[[${projId}]]"
---

# Query: Consulta SQL #${i + 1} (${repoSlug})

## Arquivo de Origem
Localizada em: \`${q.file}\`

## SQL
\`\`\`sql
${q.sql}
\`\`\`
`;
        fs.writeFileSync(qryFile, qryContent, 'utf8');
        entitiesCreated.push(qryId);
      }
    }

    // 4.4 Table Nodes
    if (tables.length > 0) {
      for (let i = 0; i < tables.length; i++) {
        const t = tables[i];
        const tableId = `table-${repoSlug}-${cleanSlug(t.name)}`;
        const tableFile = path.join(KB_DIR, 'tables', `${tableId}.md`);
        const tableContent = `---
id: ${tableId}
type: table
title: Tabela ${t.name.toUpperCase()} (${repoSlug})
database: ${stack.databases[0] || 'postgres-prod'}
schema: public
service_owner: "[[${projId}]]"
primary_key: ${t.pk}
updated_at: ${timestamp.split('T')[0]}
tags: [database, table, ${repoSlug}]
---

# Tabela: ${t.name.toUpperCase()}

## Descrição e Domínio
Tabela de banco de dados extraída a partir das migrações / schemas do projeto \`${repoSlug}\` (\`${t.file}\`).

## Chave Primária e Definição
- **Primary Key:** \`${t.pk}\`
- **Microsserviço Proprietário:** \`[[${projId}]]\`

\`\`\`sql
-- Definição detectada
${t.rawSchema}
\`\`\`
`;
        fs.writeFileSync(tableFile, tableContent, 'utf8');
        entitiesCreated.push(tableId);
      }
    }

    // 5. Cleanup
    if (isRemote && fs.existsSync(tempDir)) {
      console.log(`🧹 [5/6] Excluindo repositório clonado da máquina (Limpeza total)...`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // 6. Update Tracking Logs
    console.log(`📊 [6/6] Atualizando Log de Auditoria de Versões e Compilando Grafo...`);
    const logData = fs.existsSync(LOG_JSON) ? JSON.parse(fs.readFileSync(LOG_JSON, 'utf8').replace(/^\uFEFF/, '')) : { total_repositories: 0, repositories: [] };
    
    const analysisRecord = {
      repo_name: repoSlug,
      repo_url: repoInput,
      commit_hash: commitHash,
      version_tag: versionTag,
      commit_date: commitDate,
      analyzed_at: timestamp,
      stack,
      tests,
      endpoints_count: endpoints.length,
      entities_created: entitiesCreated
    };

    logData.repositories.unshift(analysisRecord);
    logData.total_repositories = logData.repositories.length;
    fs.writeFileSync(LOG_JSON, JSON.stringify(logData, null, 2), 'utf8');

    // Update spec/analyzed-repositories.md
    let mdTable = `# Histórico de Repositórios Analisados\n\n`;
    mdTable += `Total de Análises Realizadas: **${logData.total_repositories}** | Última Atualização: \`${timestamp}\`\n\n`;
    mdTable += `| Repositório | Versão / Commit | Data da Análise | Stack Principal | Testes Detectados | Nós Gerados |\n`;
    mdTable += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    for (const r of logData.repositories) {
      const commitShort = r.commit_hash.slice(0, 7);
      const stackShort = r.stack.languages.concat(r.stack.frameworks).slice(0, 3).join(', ') || 'N/A';
      const testsShort = `${r.tests.totalTestFiles} arqs (${r.tests.testFrameworks[0] || 'Geral'})`;
      const entitiesShort = r.entities_created.map(e => `\`${e}\``).join(', ');
      mdTable += `| **${r.repo_name}** | \`${commitShort}\` (${r.version_tag}) | ${r.analyzed_at.split('T')[0]} | ${stackShort} | ${testsShort} | ${entitiesShort} |\n`;
    }
    fs.writeFileSync(LOG_MD, mdTable, 'utf8');

    // Run Auto-Healing and Compilation
    runCmd('node skills/knowledge-fixer/scripts/fix.js --create-stubs');
    runCmd('node skills/knowledge-governance/scripts/compile-graph.js');

    console.log(`\n============================================================`);
    console.log(`🎉 ANÁLISE CONCLUÍDA COM SUCESSO!`);
    console.log(`   - Projeto Gerado:  knowledge-base/projects/${projId}.md`);
    console.log(`   - Total de Nós:    ${entitiesCreated.length} nós inseridos no Grafo`);
    console.log(`   - Log Registrado:  spec/analyzed-repositories.md`);
    console.log(`   - Código Deletado: Sim (Espaço em disco liberado)`);
    console.log(`============================================================\n`);

    return analysisRecord;

  } catch (err) {
    if (isRemote && fs.existsSync(tempDir)) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
    }
    console.error(`\n❌ ERRO NA ANÁLISE DO REPOSITÓRIO: ${err.message}\n`);
    throw err;
  }
}

module.exports = { analyzeRepository };

if (require.main === module) {
  const repoArg = process.argv[2];
  if (!repoArg) {
    console.error('Uso: node analyze-repo.js <URL-DO-GIT-OU-CAMINHO-LOCAL>');
    process.exit(1);
  }
  analyzeRepository(repoArg);
}
