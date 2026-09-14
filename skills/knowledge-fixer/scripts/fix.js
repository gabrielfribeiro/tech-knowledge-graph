const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');

const PREFIX_CONFIG = {
  'proj-': { folder: 'projects', type: 'project', defaultTitle: 'Serviço' },
  'rule-': { folder: 'rules', type: 'rule', defaultTitle: 'Regra de Negócio' },
  'qry-': { folder: 'queries', type: 'query', defaultTitle: 'Query' },
  'proc-': { folder: 'processes', type: 'process', defaultTitle: 'Processo / Runbook' },
  'adr-': { folder: 'adrs', type: 'adr', defaultTitle: 'ADR' }
};

const isDryRun = process.argv.includes('--dry-run');
const createStubs = process.argv.includes('--create-stubs');

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
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { hasFrontmatter: false, rawYaml: '', body: content, data: {} };
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
  return { hasFrontmatter: true, rawYaml, body, data };
}

function serializeFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - "${item}"`);
        }
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
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

function runFixer() {
  console.log(`\n🔧 Iniciando Auto-Fixer da Base de Conhecimento ${isDryRun ? '(Modo Simulação: DRY-RUN)' : ''}...\n`);
  const files = getAllMarkdownFiles(KB_DIR);
  const existingIds = new Set();
  const allReferencedLinks = new Set();
  const actions = [];

  // Pass 1: Scan existing notes and check file moves / frontmatter fixes
  for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let basename = path.basename(file, '.md');
    let { hasFrontmatter, body, data } = parseFrontmatter(content);
    let modified = false;

    // Detect prefix
    let prefixMatch = Object.keys(PREFIX_CONFIG).find(p => basename.startsWith(p));
    let expectedConfig = prefixMatch ? PREFIX_CONFIG[prefixMatch] : null;

    // Fix 1: Relocate file if in wrong folder
    if (expectedConfig) {
      const currentDir = path.basename(path.dirname(file));
      if (currentDir !== expectedConfig.folder) {
        const newPath = path.join(KB_DIR, expectedConfig.folder, path.basename(file));
        actions.push({
          type: 'MOVE_FILE',
          detail: `Mover de "${path.relative(REPO_ROOT, file)}" para "${path.relative(REPO_ROOT, newPath)}"`
        });
        if (!isDryRun) {
          fs.renameSync(file, newPath);
          file = newPath;
        }
      }
    }

    // Fix 2: Add Frontmatter if completely missing
    if (!hasFrontmatter) {
      data = {
        id: basename,
        type: expectedConfig ? expectedConfig.type : 'project',
        title: basename,
        updated_at: new Date().toISOString().split('T')[0],
        tags: []
      };
      modified = true;
      actions.push({ type: 'ADD_FRONTMATTER', file: basename, detail: 'Injetado frontmatter YAML padrão ausente.' });
    }

    // Fix 3: Sync ID with filename
    if (data.id !== basename) {
      actions.push({ type: 'SYNC_ID', file: basename, detail: `Ajustado id de "${data.id}" para "${basename}".` });
      data.id = basename;
      modified = true;
    }

    // Fix 4: Inject type if missing
    if (!data.type && expectedConfig) {
      data.type = expectedConfig.type;
      modified = true;
      actions.push({ type: 'INJECT_TYPE', file: basename, detail: `Tipo inferido e adicionado: "${expectedConfig.type}".` });
    }

    // Fix 5: Inject updated_at if missing
    if (!data.updated_at) {
      data.updated_at = new Date().toISOString().split('T')[0];
      modified = true;
      actions.push({ type: 'INJECT_DATE', file: basename, detail: `Injetada data de atualização: ${data.updated_at}.` });
    }

    // Fix 6: Ensure tags array exists
    if (!data.tags) {
      data.tags = [];
      modified = true;
      actions.push({ type: 'INJECT_TAGS', file: basename, detail: 'Injetado campo tags vazio.' });
    }

    if (modified && !isDryRun) {
      const newContent = `${serializeFrontmatter(data)}\n${body.replace(/^\r?\n/, '')}`;
      fs.writeFileSync(file, newContent, 'utf8');
    }

    existingIds.add(data.id || basename);

    // Collect references for stub generation
    const wikilinks = extractWikilinks(content);
    wikilinks.forEach(link => allReferencedLinks.add(link));
  }

  // Pass 2: Stub creation for orphan links
  if (createStubs) {
    for (const linkId of allReferencedLinks) {
      if (!existingIds.has(linkId)) {
        let prefixMatch = Object.keys(PREFIX_CONFIG).find(p => linkId.startsWith(p));
        let config = prefixMatch ? PREFIX_CONFIG[prefixMatch] : { folder: 'projects', type: 'project', defaultTitle: 'Item' };
        const stubPath = path.join(KB_DIR, config.folder, `${linkId}.md`);

        actions.push({
          type: 'CREATE_STUB',
          file: linkId,
          detail: `Criada nota stub placeholder em "knowledge-base/${config.folder}/${linkId}.md"`
        });

        if (!isDryRun) {
          const stubFrontmatter = {
            id: linkId,
            type: config.type,
            title: `${config.defaultTitle}: ${linkId}`,
            status: 'stub',
            updated_at: new Date().toISOString().split('T')[0],
            tags: ['stub', 'pendente']
          };

          const stubBody = `# ${config.defaultTitle}: ${linkId}\n\n> [!NOTE]\n> Esta nota é um **stub gerado automaticamente** para resolver um link órfão. Atualize com o conteúdo técnico detalhado assim que disponível.\n`;
          fs.writeFileSync(stubPath, `${serializeFrontmatter(stubFrontmatter)}\n\n${stubBody}`, 'utf8');
          existingIds.add(linkId);
        }
      }
    }
  }

  // Summary
  if (actions.length === 0) {
    console.log('✅ Nenhuma inconsistência mecânica detectada para auto-correção.\n');
  } else {
    console.log(`Foram aplicadas/planejadas ${actions.length} ação(ões) de reparo:\n`);
    for (const act of actions) {
      console.log(`✔️ [${act.type}] ${act.file ? act.file + ' - ' : ''}${act.detail}`);
    }
    console.log('\nBase corrigida com sucesso!\n');
  }
}

runFixer();
