const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');

const FOLDER_MAP = {
  project: 'projects',
  rule: 'rules',
  query: 'queries',
  process: 'processes',
  adr: 'adrs'
};

function runCommand(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT }).toString();
  } catch (err) {
    if (err.stdout) return err.stdout.toString();
    throw err;
  }
}

function ingestNodes(nodes) {
  console.log(`\n🚀 Ingestão Autônoma de Conhecimento iniciada (${nodes.length} nós a gravar)...\n`);
  const writtenFiles = [];

  for (const node of nodes) {
    if (!node.id || !node.type || !node.content) {
      console.warn('⚠️ Nó inválido ignorado (campos id, type e content são obrigatórios):', node);
      continue;
    }

    const folder = FOLDER_MAP[node.type] || 'projects';
    const filePath = path.join(KB_DIR, folder, `${node.id}.md`);
    fs.writeFileSync(filePath, node.content.trim() + '\n', 'utf8');
    writtenFiles.push({ id: node.id, type: node.type, path: `knowledge-base/${folder}/${node.id}.md` });
    console.log(`📝 Gravado: knowledge-base/${folder}/${node.id}.md`);
  }

  // Step 2: Auto-fixer & stubs
  console.log('\n🔧 Executando Auto-Cura de links órfãos e stubs...');
  const fixOutput = runCommand('node skills/knowledge-fixer/scripts/fix.js --create-stubs');
  console.log(fixOutput.trim());

  // Step 3: Recompile graph index
  console.log('\n🕸️ Recompilando o índice do grafo...');
  const compileOutput = runCommand('node skills/knowledge-governance/scripts/compile-graph.js');
  console.log(compileOutput.trim());

  // Step 4: Final validation
  console.log('\n🩺 Validando integridade referencial...');
  const lintOutput = runCommand('node skills/knowledge-linter/scripts/validate.js');
  console.log(lintOutput.trim());

  console.log('\n🎉 Ingestão concluída com sucesso!');
  return { success: true, writtenFiles };
}

module.exports = { ingestNodes };

if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error('Uso: node ingest.js <caminho-do-json-com-nos> ou via stdin');
    process.exit(1);
  }

  let nodes = [];
  if (fs.existsSync(input)) {
    nodes = JSON.parse(fs.readFileSync(input, 'utf8'));
  } else {
    try {
      nodes = JSON.parse(input);
    } catch (e) {
      console.error('Erro ao fazer parse do JSON:', e.message);
      process.exit(1);
    }
  }

  ingestNodes(Array.isArray(nodes) ? nodes : [nodes]);
}
