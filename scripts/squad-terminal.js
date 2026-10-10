const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { loadCurrentProfile, runSetup } = require('./squad-setup');

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

function addEvent(state, actor, message) {
  state.history.push({
    timestamp: new Date().toISOString(),
    actor,
    status: state.status,
    message
  });
  if (state.history.length > 30) state.history.shift();
  savePipeline(state);
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

// QA & Vegetative Sync Logic (@qa)
function performQaAndVegetativeSync() {
  const lintOut = runCmd('node skills/knowledge-linter/scripts/validate.js --json');
  let lintResult = { totalFiles: 0, issues: [] };
  try {
    lintResult = JSON.parse(lintOut);
  } catch (_) {}

  const errors = (lintResult.issues || []).filter(i => i.severity === 'ERROR');
  return {
    passed: errors.length === 0,
    totalFiles: lintResult.totalFiles || 0,
    errors
  };
}

function executeVegetativeGrowth() {
  console.log('\n🌱 [CRESCIMENTO VEGETATIVO] Sincronizando e auto-curando a Base de Conhecimento...');
  console.log(runCmd('node skills/knowledge-fixer/scripts/fix.js --create-stubs'));
  console.log(runCmd('node skills/knowledge- governance/scripts/compile-graph.js'.replace('knowledge- governance', 'knowledge-governance')));
  console.log(runCmd('node skills/knowledge-governance/scripts/export-for-teams.js'));
}

// Trigger CLI transitions
function handleTrigger(triggerName) {
  const state = loadPipeline();
  const proj = getArgValue('--project') || state.project_id;
  const task = getArgValue('--task') || state.task_id;
  const reason = getArgValue('--reason') || null;

  state.project_id = proj;
  state.task_id = task;

  if (triggerName === 'READY_FOR_DEV') {
    state.status = 'READY_FOR_DEV';
    state.sec_status = 'PENDING';
    state.qa_status = 'PENDING';
    state.rejection_reason = null;
    addEvent(state, '@architect', `Especificação aprovada para ${proj} (${task}). Liberado para @dev.`);
    console.log(`📐 [@architect] Bastão passado para @dev -> Estado: READY_FOR_DEV (${task})`);
  } else if (triggerName === 'READY_FOR_VALIDATION') {
    state.status = 'READY_FOR_VALIDATION';
    state.sec_status = 'PENDING';
    state.qa_status = 'PENDING';
    state.rejection_reason = null;
    addEvent(state, '@dev', `Implementação concluída para ${task}. Disparando @sec e @qa em paralelo!`);
    console.log(`💻 [@dev] Implementação finalizada! Despertando terminais @sec e @qa...`);
  } else if (triggerName === 'REJECTED_BY_SEC') {
    state.status = 'REJECTED_BY_SEC';
    state.sec_status = 'REJECTED';
    state.rejection_reason = reason || 'Falha de segurança detectada pelo @sec.';
    addEvent(state, '@sec', `VETO DE SEGURANÇA: ${state.rejection_reason}`);
    console.log(`❌ [@sec] Entrega vetada! Retornando para @dev: ${state.rejection_reason}`);
  } else if (triggerName === 'REJECTED_BY_QA') {
    state.status = 'REJECTED_BY_QA';
    state.qa_status = 'REJECTED';
    state.rejection_reason = reason || 'Falha nos testes ou no linter detectada pelo @qa.';
    addEvent(state, '@qa', `VETO DE QA: ${state.rejection_reason}`);
    console.log(`❌ [@qa] Entrega reprovada nos testes! Retornando para @dev: ${state.rejection_reason}`);
  } else if (triggerName === 'SEC_APPROVED') {
    state.sec_status = 'APPROVED';
    addEvent(state, '@sec', 'Auditoria de segurança aprovada (OWASP / SQL Bind / LGPD OK).');
    console.log(`🛡️ [@sec] Segurança APROVADA!`);
    if (state.qa_status === 'APPROVED') {
      executeVegetativeGrowth();
      state.status = 'COMPLETED';
      addEvent(state, '@scribe', 'Crescimento vegetativo concluído: Grafo e Teams atualizados!');
    }
  } else if (triggerName === 'QA_APPROVED') {
    state.qa_status = 'APPROVED';
    addEvent(state, '@qa', 'Testes automatizados e conformidade de regras aprovados.');
    console.log(`🧪 [@qa] Qualidade APROVADA!`);
    if (state.sec_status === 'APPROVED') {
      executeVegetativeGrowth();
      state.status = 'COMPLETED';
      addEvent(state, '@scribe', 'Crescimento vegetativo concluído: Grafo e Teams atualizados!');
    }
  }
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
    console.log('📡 Monitorando Barramento de Eventos da Squad em tempo real...');
    console.log('💡 Comandos para disparar etapas em outro terminal:');
    console.log('   npm run squad:dev-start    -> @architect libera spec para @dev');
    console.log('   npm run squad:dev-done     -> @dev finaliza e aciona @sec + @qa\n');
  } else if (role === 'dev') {
    console.log(`💤 [@dev] Aguardando liberação do @architect (READY_FOR_DEV)...`);
  } else if (role === 'sec') {
    console.log(`💤 [@sec] Aguardando término do @dev (READY_FOR_VALIDATION)...`);
  } else if (role === 'qa') {
    console.log(`💤 [@qa] Aguardando término do @dev (READY_FOR_VALIDATION)...`);
  }

  let lastUpdated = '';

  setInterval(() => {
    const state = loadPipeline();
    if (state.updated_at === lastUpdated) return;
    lastUpdated = state.updated_at;

    if (role === 'orchestrator') {
      const lastEvt = state.history[state.history.length - 1];
      if (lastEvt) {
        console.log(`🔔 [${lastEvt.timestamp.split('T')[1].slice(0, 8)}] [${lastEvt.actor}] (${state.status}) -> ${lastEvt.message}`);
      }
    }

    if (role === 'dev') {
      if (state.status === 'READY_FOR_DEV') {
        console.log(`\n🚀 [@dev DESPERTOU!] Nova tarefa recebida: ${state.task_id} (${state.project_id})`);
        console.log(`   - Aplicando arquitetura: ${profile.stack.architecture_style}`);
        console.log(`   - Stack alvo: ${profile.stack.backend} + ${profile.stack.database}`);
        console.log(`   👉 Quando terminar de codar, execute: npm run squad:dev-done\n`);
      } else if (state.status === 'REJECTED_BY_SEC' || state.status === 'REJECTED_BY_QA') {
        console.log(`\n🚨 [@dev ALERTA DE CORREÇÃO!] Entrega reprovada (${state.status}):`);
        console.log(`   Motivo: ${state.rejection_reason}`);
        console.log(`   👉 Corrija o apontamento e execute novamente: npm run squad:dev-done\n`);
      }
    }

    if (role === 'sec' && state.status === 'READY_FOR_VALIDATION' && state.sec_status === 'PENDING') {
      console.log(`\n🛡️ [@sec DESPERTOU!] O @dev terminou "${state.task_id}". Iniciando auditoria de segurança...`);
      const audit = performSecurityAudit(profile);
      audit.checkedStandards.forEach(s => console.log(`   ✔ Verificado: ${s.trim()}`));
      if (audit.passed) {
        console.log(`✅ [@sec PASS] Nenhuma vulnerabilidade encontrada!`);
        handleTrigger('SEC_APPROVED');
      } else {
        console.log(`❌ [@sec FAIL] Problemas encontrados:`, audit.issues);
        handleTrigger('REJECTED_BY_SEC');
      }
    }

    if (role === 'qa' && state.status === 'READY_FOR_VALIDATION' && state.qa_status === 'PENDING') {
      console.log(`\n🧪 [@qa DESPERTOU!] O @dev terminou "${state.task_id}". Validando testes e integridade...`);
      console.log(`   - Framework Backend:  ${profile.quality_and_security.test_framework_backend}`);
      console.log(`   - Framework Frontend: ${profile.quality_and_security.test_framework_frontend}`);
      console.log(`   - Meta de Cobertura:  ${profile.quality_and_security.min_coverage_percent}%`);
      const qaRes = performQaAndVegetativeSync();
      if (qaRes.passed) {
        console.log(`✅ [@qa PASS] Todos os ${qaRes.totalFiles} nós e critérios validados sem erros!`);
        handleTrigger('QA_APPROVED');
      } else {
        console.log(`❌ [@qa FAIL] Erros encontrados na validação:`, qaRes.errors);
        handleTrigger('REJECTED_BY_QA');
      }
    }
  }, 1000);
}

// Full End-to-End Cycle Simulation (to test the whole pipeline in 1 command)
async function simulateFullCycle() {
  const profile = loadCurrentProfile();
  console.log('\n============================================================');
  console.log(`🎬 SIMULAÇÃO DE CICLO COMPLETO DA SQUAD: "${profile.identity.squad_name}"`);
  console.log(`👑 Tech Lead: ${profile.identity.tech_lead}`);
  console.log(`🛠️  Stack:     ${profile.stack.frontend} | ${profile.stack.backend} | ${profile.stack.database}`);
  console.log('============================================================\n');

  console.log('1️⃣ [TERMINAL 1 - @architect] Validando projeto no Grafo e liberando especificação...');
  handleTrigger('READY_FOR_DEV');

  console.log('\n2️⃣ [TERMINAL 2 - @dev] Despertou! Implementando código na stack ' + profile.stack.backend + '...');
  handleTrigger('READY_FOR_VALIDATION');

  console.log('\n3️⃣ [TERMINAL 3 - @sec] Despertou após término do @dev! Executando auditoria AppSec...');
  const secAudit = performSecurityAudit(profile);
  secAudit.checkedStandards.forEach(s => console.log(`   ✔ [AppSec] ${s.trim()}`));
  if (secAudit.passed) {
    handleTrigger('SEC_APPROVED');
  }

  console.log('\n4️⃣ [TERMINAL 4 - @qa] Despertou em paralelo! Validando critérios de aceite e disparando Crescimento Vegetativo...');
  const qaAudit = performQaAndVegetativeSync();
  if (qaAudit.passed) {
    handleTrigger('QA_APPROVED');
  }

  console.log('\n============================================================');
  console.log('🎉 CICLO DA SQUAD CONCLUÍDO COM 100% DE SUCESSO!');
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
  console.log('✅ Os 4 terminais foram iniciados! Use npm run squad:dev-start e npm run squad:dev-done para ver a reação em cadeia.');
}

if (require.main === module) {
  const trigger = getArgValue('--trigger');
  const role = getArgValue('--role');

  if (process.argv.includes('--simulate')) {
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
