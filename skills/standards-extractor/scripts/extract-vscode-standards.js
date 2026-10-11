const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '../../../');
const PROFILE_FILE = path.join(REPO_ROOT, 'spec/squad-profile.json');
const STANDARDS_JSON = path.join(REPO_ROOT, 'spec/company-standards.json');
const STANDARDS_MD = path.join(REPO_ROOT, 'spec/company-standards.md');

// Ignorar extensões genéricas de idioma/tema sem regras de engenharia
const IGNORED_PUBLISHERS = new Set([
  'ms-ceintl',
  'pkief',
  'zhuangtongfa',
  'dracula-theme',
  'enkia',
  'ritwickdey'
]);

function getExtensionDirs() {
  const home = os.homedir();
  const candidates = [
    path.join(home, '.vscode', 'extensions'),
    path.join(home, '.vscode-insiders', 'extensions'),
    path.join(home, '.cursor', 'extensions')
  ];
  return candidates.filter(d => fs.existsSync(d));
}

function findRuleFiles(dir, fileList = [], depth = 0) {
  if (depth > 3 || !fs.existsSync(dir)) return fileList;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (['node_modules', '.git', 'dist', 'out', 'images', 'media', 'icons'].includes(item)) continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findRuleFiles(fullPath, fileList, depth + 1);
      } else if (
        /\.(prompt\.md|instructions\.md|skill\.md|rules\.md)$/i.test(item) ||
        (/^(rules|guidelines|standards|prompts|instructions|architecture).*\.md$/i.test(item))
      ) {
        fileList.push(fullPath);
      }
    }
  } catch (_) {}
  return fileList;
}

function extractStandards(filterKeyword = '') {
  console.log('\n============================================================');
  console.log('🧲 EXTRATOR DE PADRÕES DOS PLUGINS DO VS CODE');
  console.log('============================================================\n');

  const extDirs = getExtensionDirs();
  if (extDirs.length === 0) {
    console.log('⚠️ Nenhuma pasta de extensões do VS Code encontrada nesta máquina.');
    return { extractedCount: 0, extensions: [] };
  }

  const filter = filterKeyword.trim().toLowerCase();
  const discovered = [];

  for (const baseDir of extDirs) {
    console.log(`📂 Inspecionando diretório: ${baseDir}`);
    const folders = fs.readdirSync(baseDir);

    for (const folder of folders) {
      const extPath = path.join(baseDir, folder);
      const pkgPath = path.join(extPath, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;

      try {
        const rawPkg = fs.readFileSync(pkgPath, 'utf8').replace(/^\uFEFF/, '');
        const pkg = JSON.parse(rawPkg);
        const publisher = (pkg.publisher || 'unknown').toLowerCase();
        const name = (pkg.name || folder).toLowerCase();
        const displayName = pkg.displayName || pkg.name || folder;
        const description = pkg.description || '';

        if (!filter && IGNORED_PUBLISHERS.has(publisher)) continue;
        if (filter && !`${publisher}.${name} ${displayName} ${description}`.toLowerCase().includes(filter)) {
          continue;
        }

        const contributes = pkg.contributes || {};
        const extractedInfo = {
          id: `${publisher}.${name}`,
          displayName,
          version: pkg.version || '1.0.0',
          description,
          chatParticipants: [],
          snippets: [],
          configurations: [],
          instructionFiles: []
        };

        // 1. Chat Participants / Agents inside the extension
        if (Array.isArray(contributes.chatParticipants)) {
          for (const cp of contributes.chatParticipants) {
            extractedInfo.chatParticipants.push({
              id: cp.id,
              name: cp.name,
              description: cp.description || '',
              commands: (cp.commands || []).map(c => ({ name: c.name, description: c.description }))
            });
          }
        }

        // 2. Snippets
        if (Array.isArray(contributes.snippets)) {
          for (const snip of contributes.snippets.slice(0, 5)) {
            const snipFile = path.join(extPath, snip.path || '');
            if (fs.existsSync(snipFile)) {
              try {
                const snipJson = JSON.parse(fs.readFileSync(snipFile, 'utf8').replace(/^\uFEFF/, ''));
                const keys = Object.keys(snipJson).slice(0, 8);
                extractedInfo.snippets.push({
                  language: snip.language || 'all',
                  templates: keys.map(k => ({
                    name: k,
                    prefix: snipJson[k].prefix,
                    description: snipJson[k].description || ''
                  }))
                });
              } catch (_) {}
            }
          }
        }

        // 3. Configuration Rules
        const configObj = Array.isArray(contributes.configuration)
          ? contributes.configuration[0]
          : contributes.configuration;
        if (configObj && configObj.properties) {
          const propKeys = Object.keys(configObj.properties).slice(0, 10);
          for (const pk of propKeys) {
            const prop = configObj.properties[pk];
            if (prop.description || prop.default !== undefined) {
              extractedInfo.configurations.push({
                key: pk,
                default: prop.default,
                description: prop.description || prop.markdownDescription || ''
              });
            }
          }
        }

        // 4. Custom Prompt / Instruction Markdown files
        const ruleFiles = findRuleFiles(extPath);
        for (const rf of ruleFiles.slice(0, 5)) {
          const content = fs.readFileSync(rf, 'utf8').replace(/^\uFEFF/, '').slice(0, 1500);
          extractedInfo.instructionFiles.push({
            file: path.relative(extPath, rf).replace(/\\/g, '/'),
            preview: content.trim()
          });
        }

        // Include if it has relevant contributions or matches filter
        if (
          filter ||
          extractedInfo.chatParticipants.length > 0 ||
          extractedInfo.snippets.length > 0 ||
          extractedInfo.instructionFiles.length > 0 ||
          extractedInfo.configurations.length > 0
        ) {
          discovered.push(extractedInfo);
        }
      } catch (_) {}
    }
  }

  // Save JSON
  const timestamp = new Date().toISOString();
  const outputData = {
    synced_at: timestamp,
    filter_applied: filter || 'all',
    total_extensions_extracted: discovered.length,
    extensions: discovered
  };
  fs.writeFileSync(STANDARDS_JSON, JSON.stringify(outputData, null, 2), 'utf8');

  // Generate Markdown Catalog
  let md = `# 🏢 Padrões Extraídos dos Plugins do VS Code\n\n`;
  md += `> **Sincronizado em:** \`${timestamp}\` | **Plugins Mapeados:** **${discovered.length}**\n\n`;
  md += `Este documento consolida automaticamente as regras, participantes de chat, snippets e configurações extraídos das extensões instaladas no VS Code desta máquina para guiar a **Squad de Agentes (\`@architect\`, \`@dev\`, \`@sec\`, \`@qa\`)**.\n\n`;
  md += `---\n\n`;

  if (discovered.length === 0) {
    md += `*Nenhum plugin específico encontrado com o filtro atual. Quando estiver no PC da empresa, execute \`npm run sync:standards\` para importar os padrões corporativos.*\n`;
  } else {
    for (const ext of discovered) {
      md += `## 🔌 ${ext.displayName} (\`${ext.id}\` v${ext.version})\n`;
      if (ext.description) md += `> ${ext.description}\n\n`;

      if (ext.chatParticipants.length > 0) {
        md += `### 🤖 Agentes / Chat Participants do Plugin:\n`;
        for (const cp of ext.chatParticipants) {
          md += `- **@${cp.name}** (\`${cp.id}\`): ${cp.description}\n`;
          for (const cmd of cp.commands) {
            md += `  - \`/${cmd.name}\`: ${cmd.description}\n`;
          }
        }
        md += `\n`;
      }

      if (ext.snippets.length > 0) {
        md += `### 📝 Templates & Snippets de Código:\n`;
        for (const s of ext.snippets) {
          md += `- **Linguagem (${s.language}):** ${s.templates.map(t => `\`${t.prefix}\` (${t.name})`).join(', ')}\n`;
        }
        md += `\n`;
      }

      if (ext.configurations.length > 0) {
        md += `### ⚙️ Regras e Configurações Padrão:\n`;
        for (const c of ext.configurations.slice(0, 6)) {
          md += `- \`${c.key}\` = \`${JSON.stringify(c.default)}\` — ${c.description.replace(/\r?\n/g, ' ')}\n`;
        }
        md += `\n`;
      }

      if (ext.instructionFiles.length > 0) {
        md += `### 📜 Instruções Embutidas:\n`;
        for (const inf of ext.instructionFiles) {
          md += `#### Arquivo: \`${inf.file}\`\n\`\`\`markdown\n${inf.preview}\n\`\`\`\n\n`;
        }
      }

      md += `---\n\n`;
    }
  }

  fs.writeFileSync(STANDARDS_MD, md, 'utf8');

  // Update squad-profile.json
  if (fs.existsSync(PROFILE_FILE)) {
    try {
      const profile = JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf8').replace(/^\uFEFF/, ''));
      profile.vscode_extensions_synced = true;
      profile.synced_extensions_count = discovered.length;
      profile.updated_at = timestamp.split('T')[0];
      fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf8');
    } catch (_) {}
  }

  console.log(`\n✅ Sincronização concluída! ${discovered.length} extensão(ões) mapeada(s).`);
  console.log(`📄 Relatório legível gerado em: spec/company-standards.md`);
  console.log(`📦 Dados estruturados salvos em: spec/company-standards.json\n`);

  return { extractedCount: discovered.length, extensions: discovered };
}

module.exports = { extractStandards };

if (require.main === module) {
  const filterArg = process.argv[2] || '';
  extractStandards(filterArg);
}
