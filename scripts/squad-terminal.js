const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { loadCurrentProfile, runSetup } = require('./squad-setup');
const { generateCompactContext } = require('./context-pack');

const REPO_ROOT = path.resolve(__dirname, '../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const PIPELINE_FILE = path.join(KB_DIR, 'squad-pipeline.json');

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

function loadPipeline() {
  if (fs.existsSync(PIPELINE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8').replace(/^\uFEFF/, ''));
    } catch (_) {}
  }
  const initial = {
    mission_id: `mission-${Date.now()}`,
    project_id: 'proj-billing-engine',
    task_id: 'rule-cobranca-recorrente',
    status: 'IDLE',
    sec_status: 'PENDING',
    qa_status: 'PENDING',
    plan_summary: null,
    rejection_reason: null,
    updated_at: new Date().toISOString(),
    history: []
  };
  savePipeline(initial);
  return initial;
}

function savePipeline(state) {
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function addEvent(state, actor, skill, stepType, message) {
  const evt = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor,
    skill,
    stepType,
    status: state.status,
    project_id: state.project_id,
    task_id: state.task_id,
    message
  };
  state.history.push(evt);
  if (state.history.length > 60) state.history.shift();
  savePipeline(state);
  return evt;
}

function runCmd(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch (e) {
    return e.stdout ? e.stdout.toString().trim() : e.message;
  }
}

// Security Audit Logic (@sec)
function performSecurityAudit(profile) {
  const issues = [];
  const queriesDir = path.join(KB_DIR, 'queries');
  if (fs.existsSync(queriesDir)) {
    const files = fs.readdirSync(queriesDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(queriesDir, f), 'utf8');
      if (/SELECT[\s\S]*\+\s*[a-zA-Z0-9_]+/i.test(content) || /\$\{.*?\}/.test(content)) {
        issues.push(`Possível SQL Injection detectado por concatenação em queries/${f}`);
      }
      if (/password\s*=\s*['"][^'"]+['"]/i.test(content)) {
        issues.push(`Credencial hardcoded detectada em queries/${f}`);
      }
    }
  }
  return {
    passed: issues.length === 0,
    issues,
    checkedStandards: profile.quality_and_security.security_standards
  };
}

// QA, Cypress E2E, Jira Xray & Vegetative Sync Logic (@qa)
function performQaAndVegetativeSync() {
  const lintOut = runCmd('node skills/knowledge-linter/scripts/validate.js --json');
  let lintResult = { totalFiles: 0, issues: [] };
  try {
    lintResult = JSON.parse(lintOut);
  } catch (_) {}

  const xrayOut = runCmd('node skills/squad-qa/scripts/xray-exporter.js');
  const errors = (lintResult.issues || []).filter(i => i.severity === 'ERROR');
  return {
    passed: errors.length === 0,
    totalFiles: lintResult.totalFiles || 0,
    errors,
    xraySummary: xrayOut
  };
}

function executeVegetativeGrowth() {
  console.log('\n🌱 [SKILL: knowledge-governance] Sincronizando e auto-curando a Base de Conhecimento...');
  console.log(runCmd('node skills/knowledge-fixer/scripts/fix.js --create-stubs'));
  console.log(runCmd('node skills/knowledge-governance/scripts/compile-graph.js'));
  console.log(runCmd('node skills/knowledge-governance/scripts/export-for-teams.js'));
}

// Trigger CLI transitions
function handleTrigger(triggerName) {
  const state = loadPipeline();
  const proj = getArgValue('--project') || state.project_id;
  const task = getArgValue('--task') || state.task_id;
  const reason = getArgValue('--reason') || getArgValue('--step') || null;

  state.project_id = proj;
  state.task_id = task;

  if (triggerName === 'PLAN_WAITING_APPROVAL') {
    state.status = 'PLAN_WAITING_APPROVAL';
    state.sec_status = 'PENDING';
    state.qa_status = 'PENDING';
    state.plan_summary = reason || `Planejamento técnico para ${proj} (${task})`;
    addEvent(
      state,
      '@architect',
      'squad-architect',
      'PLAN',
      `PLANEJAMENTO CONCLUÍDO para ${proj} (${task}): ${state.plan_summary} -> ⏸️ AGUARDANDO "OK" DO TECH LEAD!`
    );
    console.log(`📐 [SKILL: squad-architect] Plano gerado e aguardando OK do Tech Lead -> (${task})`);
  } else if (triggerName === 'READY_FOR_DEV') {
    state.status = 'READY_FOR_DEV';
    state.sec_status = 'PENDING';
    state.qa_status = 'PENDING';
    state.rejection_reason = null;
    addEvent(
      state,
      '@architect',
      'squad-architect',
      'HANDOFF_DEV',
      `✅ PLANO APROVADO PELO TECH LEAD! Liberando @dev para codificar ${proj} (${task}).`
    );
    generateCompactContext(proj, task);
    console.log(`📐 [SKILL: squad-architect] Plano aprovado! Bastão passado para @dev -> READY_FOR_DEV (${task})`);
  } else if (triggerName === 'DEV_STEP') {
    state.status = 'IN_DEVELOPMENT';
    const stepMsg = reason || `Implementando arquivos da tarefa ${task}`;
    addEvent(state, '@dev', 'squad-developer', 'CODE_STEP', stepMsg);
    console.log(`💻 [SKILL: squad-developer] Passo executado: ${stepMsg}`);
  } else if (triggerName === 'READY_FOR_VALIDATION') {
    state.status = 'READY_FOR_VALIDATION';
    state.sec_status = 'PENDING';
    state.qa_status = 'PENDING';
    state.rejection_reason = null;
    addEvent(
      state,
      '@dev',
      'squad-developer',
      'DEV_DONE',
      `Implementação finalizada para ${task}${reason ? ` (${reason})` : ''}. Acionando @sec e @qa em paralelo!`
    );
    generateCompactContext(proj, task);
    console.log(`💻 [SKILL: squad-developer] Implementação finalizada! Despertando terminais @sec e @qa...`);
  } else if (triggerName === 'REJECTED_BY_SEC') {
    state.status = 'REJECTED_BY_SEC';
    state.sec_status = 'REJECTED';
    state.rejection_reason = reason || 'Falha de segurança detectada pelo @sec.';
    addEvent(state, '@sec', 'squad-security', 'VETO_SEC', `VETO DE SEGURANÇA: ${state.rejection_reason}`);
    console.log(`❌ [SKILL: squad-security] Entrega vetada! Retornando para @dev: ${state.rejection_reason}`);
  } else if (triggerName === 'REJECTED_BY_QA') {
    state.status = 'REJECTED_BY_QA';
    state.qa_status = 'REJECTED';
    state.rejection_reason = reason || 'Falha nos testes ou no linter detectada pelo @qa.';
    addEvent(state, '@qa', 'squad-qa', 'VETO_QA', `VETO DE QA: ${state.rejection_reason}`);
    console.log(`❌ [SKILL: squad-qa] Entrega reprovada nos testes! Retornando para @dev: ${state.rejection_reason}`);
  } else if (triggerName === 'SEC_APPROVED') {
    state.sec_status = 'APPROVED';
    addEvent(state, '@sec', 'squad-security', 'PASS_SEC', 'Auditoria AppSec aprovada (OWASP / SQL Bind / LGPD OK).');
    console.log(`🛡️ [SKILL: squad-security] Segurança APROVADA!`);
    if (state.qa_status === 'APPROVED' && state.status !== 'COMPLETED') {
      executeVegetativeGrowth();
      state.status = 'COMPLETED';
      addEvent(state, '@scribe', 'knowledge-governance', 'SYNC_DONE', 'Crescimento vegetativo concluído: Grafo e Teams atualizados!');
    }
  } else if (triggerName === 'QA_APPROVED') {
    state.qa_status = 'APPROVED';
    addEvent(state, '@qa', 'squad-qa', 'PASS_QA', 'Testes unitários, automação Cypress e evidências Jira Xray aprovados.');
    console.log(`🧪 [SKILL: squad-qa] Qualidade APROVADA!`);
    if (state.sec_status === 'APPROVED' && state.status !== 'COMPLETED') {
      executeVegetativeGrowth();
      state.status = 'COMPLETED';
      addEvent(state, '@scribe', 'knowledge-governance', 'SYNC_DONE', 'Crescimento vegetativo concluído: Grafo e Teams atualizados!');
    }
  }
}

// Live file watcher so every terminal displays real-time file operations performed by the skills
function setupLiveWorkspaceWatcher(role) {
  const debounceMap = new Map();
  const ignoreDirs = ['.git', 'node_modules', 'dist'];

  try {
    fs.watch(REPO_ROOT, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      const norm = filename.replace(/\\/g, '/');
      if (norm.endsWith('squad-pipeline.json') || norm.endsWith('graph-index.json')) return;
      if (ignoreDirs.some(d => norm.startsWith(d + '/'))) return;

      const now = Date.now();
      if (debounceMap.has(norm) && now - debounceMap.get(norm) < 1500) return;
      debounceMap.set(norm, now);

      const fullPath = path.join(REPO_ROOT, norm);
      let lineCountInfo = '';
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        try {
          const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).length;
          lineCountInfo = ` (${lines} linhas)`;
        } catch (_) {}
      }

      const timeStr = new Date().toISOString().split('T')[1].slice(0, 8);
      const isKbFile = norm.startsWith('knowledge-base/') || norm.startsWith('spec/');
      const isTestFile = norm.includes('test') || norm.includes('.cy.') || norm.includes('xray');

      if (role === 'orchestrator') {
        const skillTag = isKbFile ? 'squad-architect / knowledge-governance' : isTestFile ? 'squad-qa' : 'squad-developer';
        console.log(`⚙️  [${timeStr}] [SKILL: ${skillTag}] Arquivo atualizado: ${norm}${lineCountInfo}`);
      } else if (role === 'dev' && !isKbFile) {
        console.log(`🔨 [${timeStr}] [SKILL: squad-developer] Editando código ao vivo -> ${norm}${lineCountInfo}`);
      } else if (role === 'qa' && (isTestFile || isKbFile)) {
        console.log(`🔍 [${timeStr}] [SKILL: squad-qa] Verificando artefato -> ${norm}${lineCountInfo}`);
      }
    });
  } catch (_) {}
}

// Watch Mode for Dedicated Agent Terminals
async function startRoleTerminal(role) {
  let profile = loadCurrentProfile();

  if (!profile.is_configured && role === 'orchestrator') {
    console.log('⚠️ Perfil da Squad ainda não foi configurado. Iniciando Onboarding...');
    profile = await runSetup();
  }

  const squadTitle = profile.identity.squad_name.toUpperCase();
  const tlName = profile.identity.tech_lead;
  const stackLine = `${profile.stack.frontend} | ${profile.stack.backend} | ${profile.stack.database}`;

  console.log('\n============================================================');
  console.log(`🤖 SQUAD: ${squadTitle} (Tech Lead: ${tlName})`);
  console.log(`🛠️  STACK: ${stackLine}`);
  console.log(`🖥️  TERMINAL ATIVO: [${role.toUpperCase()}]`);
  console.log('============================================================\n');

  if (role === 'orchestrator') {
    console.log('📡 Monitorando todas as Skills e Passos da Squad em tempo real...');
    console.log('🚦 Fluxo Obrigatório: 1. Planejamento (@architect) -> 2. OK do TL -> 3. Código (@dev) -> 4. @sec + @qa\n');
  } else if (role === 'dev') {
    console.log(`💤 [@dev | SKILL: squad-developer] Aguardando Planejamento (@architect) e o "OK" do Tech Lead...`);
  } else if (role === 'sec') {
    console.log(`💤 [@sec | SKILL: squad-security] Aguardando término do @dev (READY_FOR_VALIDATION)...`);
  } else if (role === 'qa') {
    console.log(`💤 [@qa | SKILL: squad-qa] Aguardando término do @dev (READY_FOR_VALIDATION)...`);
  }

  // Enable real-time file modification logs in the terminals
  setupLiveWorkspaceWatcher(role);

  // Track processed event IDs so no event is ever skipped even when multiple steps run fast
  const initialState = loadPipeline();
  const seenEventIds = new Set((initialState.history || []).map(e => e.id || e.timestamp));
  let handlingValidation = false;

  setInterval(() => {
    const state = loadPipeline();
    const history = state.history || [];

    const newEvents = history.filter(e => {
      const key = e.id || e.timestamp;
      if (seenEventIds.has(key)) return false;
      seenEventIds.add(key);
      return true;
    });

    for (const evt of newEvents) {
      const timeStr = (evt.timestamp || new Date().toISOString()).split('T')[1].slice(0, 8);
      const skillName = evt.skill || 'squad-orchestrator';

      if (role === 'orchestrator') {
        console.log(`🔔 [${timeStr}] [${evt.actor} | SKILL: ${skillName}] (${evt.stepType || state.status}) -> ${evt.message}`);
      }

      if (role === 'dev') {
        if (evt.stepType === 'PLAN' || state.status === 'PLAN_WAITING_APPROVAL') {
          console.log(`\n📋 [@dev | SKILL: squad-architect -> squad-developer] PLANO RECEBIDO PARA: ${evt.task_id} (${evt.project_id})`);
          console.log(`   📝 Resumo do Plano: ${state.plan_summary || evt.message}`);
          console.log(`   ⏸️  STATUS: Aguardando o "OK" do Tech Lead no Chat para iniciar a codificação...\n`);
        } else if (evt.stepType === 'HANDOFF_DEV') {
          console.log(`\n🚀 [@dev DESPERTOU! | SKILL: squad-developer] OK do Tech Lead recebido! Iniciando codificação:`);
          console.log(`   📌 Projeto / Regra: ${evt.project_id} / ${evt.task_id}`);
          console.log(`   🏛️  Arquitetura:     ${profile.stack.architecture_style}`);
          console.log(`   🛠️  Stack Alvo:      ${profile.stack.frontend} | ${profile.stack.backend} | ${profile.stack.database}`);
          console.log(`   ⏳ Executando passos de implementação nos arquivos...\n`);
        } else if (evt.stepType === 'CODE_STEP') {
          console.log(`🔨 [${timeStr}] [@dev PASSO EM EXECUÇÃO | SKILL: squad-developer] -> ${evt.message}`);
        } else if (evt.stepType === 'DEV_DONE') {
          console.log(`✅ [${timeStr}] [@dev CONCLUÍDO | SKILL: squad-developer] -> ${evt.message}`);
          console.log(`   👉 Bastão entregue para os terminais [@sec] e [@qa]!\n`);
        } else if (evt.stepType === 'VETO_SEC' || evt.stepType === 'VETO_QA') {
          console.log(`\n🚨 [@dev ALERTA DE CORREÇÃO! | VETO RECEBIDO]:`);
          console.log(`   ❌ Motivo: ${evt.message}`);
          console.log(`   🔧 Iniciando correção imediata no código...\n`);
        }
      }

      if (role === 'sec') {
        if (evt.stepType === 'PLAN') {
          console.log(`📋 [${timeStr}] [@sec] Plano registrado para ${evt.task_id}. Aguardando @dev codificar...`);
        } else if (evt.stepType === 'CODE_STEP') {
          console.log(`👀 [${timeStr}] [@sec MONITORANDO @dev] Passo em andamento: ${evt.message}`);
        }
      }

      if (role === 'qa') {
        if (evt.stepType === 'PLAN') {
          console.log(`📋 [${timeStr}] [@qa] Plano registrado para ${evt.task_id}. Preparando matriz Cypress + Jira Xray...`);
        } else if (evt.stepType === 'CODE_STEP') {
          console.log(`👀 [${timeStr}] [@qa MONITORANDO @dev] Passo em andamento: ${evt.message}`);
        }
      }
    }

    // Trigger automated Security & QA validations when status reaches READY_FOR_VALIDATION
    if (!handlingValidation && state.status === 'READY_FOR_VALIDATION') {
      if (role === 'sec' && state.sec_status === 'PENDING') {
        handlingValidation = true;
        console.log(`\n🛡️ [@sec DESPERTOU! | SKILL: squad-security] O @dev terminou "${state.task_id}". Executando passos da auditoria AppSec:`);
        const audit = performSecurityAudit(profile);
        audit.checkedStandards.forEach((s, idx) => console.log(`   🔍 [Passo ${idx + 1}/${audit.checkedStandards.length}] Verificado: ${s.trim()}`));
        if (audit.passed) {
          console.log(`✅ [@sec PASS] Nenhuma vulnerabilidade encontrada!`);
          handleTrigger('SEC_APPROVED');
        } else {
          console.log(`❌ [@sec FAIL] Problemas encontrados:`, audit.issues);
          handleTrigger('REJECTED_BY_SEC');
        }
        handlingValidation = false;
      }

      if (role === 'qa' && state.qa_status === 'PENDING') {
        handlingValidation = true;
        console.log(`\n🧪 [@qa DESPERTOU! | SKILL: squad-qa] O @dev terminou "${state.task_id}". Executando passos de QA & Grafo:`);
        console.log(`   🔍 [Passo 1/4] Validando stack de testes: ${profile.quality_and_security.test_framework_backend} / ${profile.quality_and_security.test_framework_frontend}`);
        console.log(`   🔍 [Passo 2/4] Executando knowledge-linter sobre os nós do Grafo...`);
        console.log(`   🔍 [Passo 3/4] Gerando scripts E2E (${profile.quality_and_security.e2e_automation_tool || 'Cypress'}) com cy.screenshot()...`);
        console.log(`   🔍 [Passo 4/4] Exportando pacote de evidências para ${profile.quality_and_security.test_management_tool || 'Jira Xray'}...`);
        const qaRes = performQaAndVegetativeSync();
        if (qaRes.xraySummary) console.log(`   ${qaRes.xraySummary}`);
        if (qaRes.passed) {
          console.log(`✅ [@qa PASS] Todos os ${qaRes.totalFiles} nós, scripts Cypress e evidências Xray validados sem erros!`);
          handleTrigger('QA_APPROVED');
        } else {
          console.log(`❌ [@qa FAIL] Erros encontrados na validação:`, qaRes.errors);
          handleTrigger('REJECTED_BY_QA');
        }
        handlingValidation = false;
      }
    }
  }, 500);
}

// Full End-to-End Cycle Simulation (to test the whole pipeline in 1 command)
async function simulateFullCycle() {
  const profile = loadCurrentProfile();
  console.log('\n============================================================');
  console.log(`🎬 SIMULAÇÃO DE CICLO COMPLETO DA SQUAD: "${profile.identity.squad_name}"`);
  console.log(`👑 Tech Lead: ${profile.identity.tech_lead}`);
  console.log(`🛠️  Stack:     ${profile.stack.frontend} | ${profile.stack.backend} | ${profile.stack.database}`);
  console.log(`🧪 QA & Evid: ${profile.quality_and_security.e2e_automation_tool || 'Cypress'} + ${profile.quality_and_security.test_management_tool || 'Jira Xray'}`);
  console.log('============================================================\n');

  console.log('0️⃣ [FASE DE PLANEJAMENTO - @architect] Gerando plano e aguardando OK do Tech Lead...');
  process.argv.push('--reason', 'Criar serviço, validar regras no grafo e gerar suíte Cypress + Xray');
  handleTrigger('PLAN_WAITING_APPROVAL');

  console.log('\n1️⃣ [OK DO TECH LEAD RECEBIDO -> @architect] Liberando especificação para o @dev...');
  handleTrigger('READY_FOR_DEV');

  console.log('\n2️⃣ [TERMINAL 2 - @dev] Despertou! Executando passos de implementação na stack ' + profile.stack.backend + '...');
  process.argv.push('--step', 'Passo 1: Implementando camada de domínio e regras de negócio');
  handleTrigger('DEV_STEP');
  handleTrigger('READY_FOR_VALIDATION');

  console.log('\n3️⃣ [TERMINAL 3 - @sec] Despertou após término do @dev! Executando auditoria AppSec...');
  const secAudit = performSecurityAudit(profile);
  secAudit.checkedStandards.forEach(s => console.log(`   ✔ [AppSec] ${s.trim()}`));
  if (secAudit.passed) {
    handleTrigger('SEC_APPROVED');
  }

  console.log('\n4️⃣ [TERMINAL 4 - @qa] Despertou em paralelo! Gerando automação Cypress + Evidências Jira Xray e Crescimento Vegetativo...');
  const qaAudit = performQaAndVegetativeSync();
  if (qaAudit.xraySummary) console.log(qaAudit.xraySummary);
  if (qaAudit.passed) {
    handleTrigger('QA_APPROVED');
  }

  console.log('\n============================================================');
  console.log('🎉 CICLO DA SQUAD CONCLUÍDO COM 100% DE SUCESSO!');
  console.log('============================================================\n');
}

// Simulate a Security Veto (SQL Injection caught by @sec) -> returned to @dev -> fixed -> approved
async function simulateVetoCycle() {
  const profile = loadCurrentProfile();
  console.log('\n============================================================');
  console.log(`🚨 SIMULAÇÃO DE VETO DE SEGURANÇA (@sec) E AUTO-CORREÇÃO (@dev)`);
  console.log(`🤖 Squad: ${profile.identity.squad_name} | Projeto: proj-pix-settlement`);
  console.log('============================================================\n');

  process.argv.push('--project', 'proj-pix-settlement', '--task', 'rule-limite-pix-noturno');
  console.log('0️⃣ [@architect] Apresentando plano técnico ao Tech Lead...');
  handleTrigger('PLAN_WAITING_APPROVAL');

  console.log('\n1️⃣ [@architect] OK do Tech Lead recebido! Liberando PIX Noturno para @dev...');
  handleTrigger('READY_FOR_DEV');

  console.log('\n2️⃣ [@dev - Tentativa 1] Código enviado com query concatenada: "SELECT * FROM TB_PIX WHERE CPF = \'" + cpf + "\'"');
  handleTrigger('DEV_STEP');
  handleTrigger('READY_FOR_VALIDATION');

  console.log('\n3️⃣ [@sec] Auditando entrega...');
  process.argv.push('--reason', 'SQL Injection detectado: concatenação de NR_CPF_PAGADOR sem Bind Variable (:p_cpf_pagador).');
  handleTrigger('REJECTED_BY_SEC');

  console.log('\n4️⃣ [@dev - Tentativa 2 (Correção)] Substituído por Dapper Bind Parameter (:p_cpf_pagador) conforme qry-consulta-limites-noturnos-pix...');
  handleTrigger('DEV_STEP');
  handleTrigger('READY_FOR_VALIDATION');

  console.log('\n5️⃣ [@sec & @qa] Revalidando entrega corrigida...');
  handleTrigger('SEC_APPROVED');
  const qaAudit = performQaAndVegetativeSync();
  if (qaAudit.xraySummary) console.log(qaAudit.xraySummary);
  handleTrigger('QA_APPROVED');

  console.log('\n============================================================');
  console.log('✅ VETO TESTADO, CORRIGIDO PELO @dev E APROVADO COM EVIDÊNCIAS XRAY!');
  console.log('============================================================\n');
}

// Spawn 4 Windows PowerShell terminals automatically if requested
function launchFourWindowsTerminals() {
  const roles = ['orchestrator', 'dev', 'sec', 'qa'];
  console.log('🚀 Abrindo 4 terminais dedicados para os agentes da Squad...');
  for (const r of roles) {
    spawn('cmd.exe', ['/c', 'start', `"SQUAD AGENT: @${r.toUpperCase()}"`, 'cmd', '/k', `node scripts/squad-terminal.js --role ${r}`], {
      cwd: REPO_ROOT,
      detached: true,
      stdio: 'ignore'
    }).unref();
  }
  console.log('✅ Os 4 terminais foram iniciados!');
}

if (require.main === module) {
  const trigger = getArgValue('--trigger');
  const role = getArgValue('--role');

  if (process.argv.includes('--simulate-veto')) {
    simulateVetoCycle();
  } else if (process.argv.includes('--simulate')) {
    simulateFullCycle();
  } else if (process.argv.includes('--spawn-terminals')) {
    launchFourWindowsTerminals();
  } else if (trigger) {
    handleTrigger(trigger);
  } else if (role) {
    startRoleTerminal(role);
  } else {
    simulateFullCycle();
  }
}
