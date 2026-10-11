const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { extractStandards } = require('../skills/standards-extractor/scripts/extract-vscode-standards');

const REPO_ROOT = path.resolve(__dirname, '../');
const PROFILE_FILE = path.join(REPO_ROOT, 'spec/squad-profile.json');

function loadCurrentProfile() {
  if (fs.existsSync(PROFILE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf8').replace(/^\uFEFF/, ''));
    } catch (_) {}
  }
  return {
    is_configured: false,
    updated_at: new Date().toISOString().split('T')[0],
    identity: {
      squad_name: 'AI Core Squad',
      tech_lead: 'Tech Lead',
      mission: 'Desenvolvimento autônomo com crescimento vegetativo da base de conhecimento'
    },
    stack: {
      frontend: 'React + TypeScript',
      backend: '.NET 8 (C#)',
      database: 'Oracle Database',
      orm_data_access: 'Dapper / Entity Framework Core',
      architecture_style: 'Clean Architecture + CQRS',
      messaging: 'RabbitMQ / AWS SQS'
    },
    quality_and_security: {
      test_framework_backend: 'xUnit + Moq + FluentAssertions',
      test_framework_frontend: 'Vitest + React Testing Library',
      min_coverage_percent: 80,
      security_standards: [
        'OWASP Top 10',
        'Queries parametrizadas obrigatórias (proibido concatenação SQL/PL-SQL)',
        'Autenticação JWT / OAuth2 em rotas privadas',
        'Mapeamento de dados sensíveis (LGPD/PII) em todas as tabelas (table-*)'
      ]
    },
    vscode_extensions_synced: false,
    synced_extensions_count: 0
  };
}

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

async function runSetup() {
  const current = loadCurrentProfile();
  const isQuick = process.argv.includes('--defaults') || process.argv.includes('--quick');

  console.log('\n============================================================');
  console.log('🚀 ONBOARDING & CONFIGURAÇÃO DA SUA SQUAD DE IA');
  console.log('============================================================\n');

  if (isQuick) {
    const teamArg = getArgValue('--team');
    const tlArg = getArgValue('--tl');
    const feArg = getArgValue('--frontend');
    const beArg = getArgValue('--backend');
    const dbArg = getArgValue('--db');
    const archArg = getArgValue('--arch');

    if (teamArg) current.identity.squad_name = teamArg;
    if (tlArg) current.identity.tech_lead = tlArg;
    if (feArg) current.stack.frontend = feArg;
    if (beArg) current.stack.backend = beArg;
    if (dbArg) current.stack.database = dbArg;
    if (archArg) current.stack.architecture_style = archArg;

    current.is_configured = true;
    current.updated_at = new Date().toISOString().split('T')[0];

    fs.writeFileSync(PROFILE_FILE, JSON.stringify(current, null, 2), 'utf8');
    console.log(`✅ Squad "${current.identity.squad_name}" configurada com sucesso!`);
    console.log(`   - Tech Lead:   ${current.identity.tech_lead}`);
    console.log(`   - Frontend:    ${current.stack.frontend}`);
    console.log(`   - Backend:     ${current.stack.backend}`);
    console.log(`   - Database:    ${current.stack.database}`);
    console.log(`   - Arquitetura: ${current.stack.architecture_style}\n`);

    if (process.argv.includes('--sync-vscode')) {
      extractStandards();
    }
    return current;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question, defaultVal) =>
    new Promise(resolve => {
      rl.question(`${question} [${defaultVal}]: `, answer => {
        resolve(answer.trim() || defaultVal);
      });
    });

  console.log('Responda às perguntas abaixo para moldar o seu time (Enter mantém o padrão entre colchetes):\n');

  current.identity.squad_name = await ask('1. Qual nome você quer dar para o seu Time / Squad de IA?', current.identity.squad_name);
  current.identity.tech_lead = await ask('2. Como o time deve chamar você (Tech Lead)?', current.identity.tech_lead);
  current.stack.frontend = await ask('3. Qual é a Stack de Frontend padrão? (ex: React, Angular, Next.js, Nenhum)', current.stack.frontend);
  current.stack.backend = await ask('4. Qual é a Stack de Backend padrão? (ex: .NET 8, Node/TS, Go, Java, Python)', current.stack.backend);
  current.stack.database = await ask('5. Qual é o Banco de Dados principal? (ex: Oracle, PostgreSQL, SQL Server)', current.stack.database);
  current.stack.orm_data_access = await ask('6. Qual ORM / Acesso a dados padrão? (ex: Dapper/EF Core, Prisma, GORM)', current.stack.orm_data_access);
  current.stack.architecture_style = await ask('7. Qual é o padrão de Arquitetura? (ex: Clean Architecture, Hexagonal, MVC)', current.stack.architecture_style);
  current.stack.messaging = await ask('8. Qual é a tecnologia de Mensageria/Eventos? (ex: RabbitMQ, Kafka, SQS)', current.stack.messaging);

  current.quality_and_security.e2e_automation_tool = await ask('9. Qual a ferramenta de Automação E2E / UI do QA? (ex: Cypress, Playwright)', current.quality_and_security.e2e_automation_tool || 'Cypress');
  current.quality_and_security.test_management_tool = await ask('10. Qual a ferramenta para subir Evidências e Planos de Teste? (ex: Jira Xray, Zephyr, Azure Test Plans)', current.quality_and_security.test_management_tool || 'Jira Xray');

  const covStr = await ask('11. Qual a cobertura mínima de testes exigida pelo QA (%)?', String(current.quality_and_security.min_coverage_percent));
  current.quality_and_security.min_coverage_percent = parseInt(covStr, 10) || 80;

  const syncAns = await ask('12. Deseja varrer os plugins instalados neste VS Code agora para absorver os padrões? (S/n)', 'S');

  rl.close();

  current.is_configured = true;
  current.updated_at = new Date().toISOString().split('T')[0];
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(current, null, 2), 'utf8');

  if (syncAns.toLowerCase().startsWith('s') || syncAns.toLowerCase().startsWith('y')) {
    extractStandards();
  }

  console.log('\n============================================================');
  console.log(`🎉 TIME "${current.identity.squad_name.toUpperCase()}" PRONTO PARA OPERAR!`);
  console.log('============================================================');
  console.log(`👑 Tech Lead:   ${current.identity.tech_lead}`);
  console.log(`🎨 Frontend:    ${current.stack.frontend}`);
  console.log(`⚙️  Backend:     ${current.stack.backend}`);
  console.log(`🗄️  Banco:       ${current.stack.database} (${current.stack.orm_data_access})`);
  console.log(`🏛️  Arquitetura: ${current.stack.architecture_style}`);
  console.log(`🧪 Automação:   ${current.quality_and_security.e2e_automation_tool} + ${current.quality_and_security.test_management_tool} (${current.quality_and_security.min_coverage_percent}% cov)`);
  console.log(`📄 Perfil salvo em: spec/squad-profile.json\n`);
}

if (require.main === module) {
  runSetup();
}

module.exports = { runSetup, loadCurrentProfile };
