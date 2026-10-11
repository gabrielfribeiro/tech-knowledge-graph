# 🧠 Tech Knowledge Graph & AI Engineering Squad-in-a-Box

Ecossistema autônomo que une uma **Squad Completa de Engenharia de IA** (comandada por um **Orquestrador Central** no GitHub Copilot e operando em **4 Terminais Reativos**) a um **Grafo de Conhecimento Vegetativo** de alta escala (suporte otimizado para **+2.000 nós**), integrado ao **VS Code**, **Obsidian**, **Cypress**, **Jira Xray** e **Microsoft Teams / Copilot Studio**.

---

## ✨ Principais Funcionalidades

### 1. 👑 Orquestrador Central da Squad (`👑 Squad Orquestrador (TL)`)
Em vez de o Tech Lead precisar alternar manualmente entre vários agentes no VS Code, o seletor do GitHub Copilot disponibiliza **um único Orquestrador Central** ([`.github/agents/squad.agent.md`](.github/agents/squad.agent.md)) que controla automaticamente as **4 Skills Especialistas**:
- **`📐 @architect` (`skills/squad-architect`):** Verifica se o projeto existe no grafo (rodando `repo-analyzer` para projetos legados ou iniciando a fundação *Greenfield*) e cria/atualiza `adr-*`, `table-*` e `rule-*` **antes** do código.
- **`💻 @dev` (`skills/squad-developer`):** Implementa código-fonte, APIs, migrations e queries SQL/PL-SQL parametrizadas seguindo estritamente a stack de [`spec/squad-profile.json`](spec/squad-profile.json) e os padrões de [`spec/company-standards.md`](spec/company-standards.md).
- **`🛡️ @sec` (`skills/squad-security`):** Audita entregas contra OWASP Top 10, SQL/PL-SQL Injection (exigindo *Bind Variables*), vazamento de Secrets, autenticação JWT/OAuth2 e mapeamento LGPD/PII nas tabelas (`table-*`). Possui **poder de veto** (`REJECTED_BY_SEC`).
- **`🧪 @qa` (`skills/squad-qa`):** Valida testes unitários (`xUnit` / `Vitest`), gera scripts de automação E2E no **Cypress** (`dist/xray/cypress/*.cy.ts` com `cy.screenshot()`) e exporta o pacote de execução e evidências para o **Jira Xray** (`dist/xray/`), disparando o **Crescimento Vegetativo do Grafo**.

---

### 2. 🚦 Governança "Plan-First" (Planejamento Obrigatório + Trava do Tech Lead)
O Orquestrador opera sempre em **2 etapas** para garantir controle total ao Tech Lead:
1. **Turno 1 — Planejamento (`PLAN_WAITING_APPROVAL`):**
   - Lê livremente a `knowledge-base/` e `spec/squad-profile.json`;
   - Registra o plano nos terminais da Sala de Guerra;
   - Exibe em tela os passos que serão executados por cada Skill (`@architect`, `@dev`, `@sec`, `@qa`) e **pausa a execução** aguardando o **"OK"** do Tech Lead.
2. **Turno 2 — Execução com Visibilidade Passo a Passo:**
   - Após o "OK" do Tech Lead, executa todas as etapas exibindo na tela do Chat e nos **4 Terminais** cada passo (`DEV_STEP`) e cada arquivo modificado em tempo real (`fs.watch`).

---

### 3. 🖥️ Sala de Guerra Multi-Terminal Sincronizada (War Room)
Quatro terminais dedicados (`orchestrator`, `dev`, `sec`, `qa`) monitoram o barramento de eventos ([`knowledge-base/squad-pipeline.json`](knowledge-base/squad-pipeline.json)) e o sistema de arquivos em tempo real:
- O terminal `[@dev]` mostra o plano recebido, aguarda o OK do Tech Lead e exibe cada passo de codificação e arquivo editado ao vivo;
- Os terminais `[@sec]` e `[@qa]` permanecem em espera e **despertam automaticamente em paralelo** assim que o `@dev` conclui a implementação (`READY_FOR_VALIDATION`);
- Quando `@sec` e `@qa` aprovam (`SEC_APPROVED` + `QA_APPROVED`), o terminal dispara sozinho o **Auto-Fixer**, a **Compilação do Grafo** e a **Exportação para o Microsoft Teams**.

---

### 4. 🧙‍♂️ Onboarding Interativo & Extrator de Plugins Corporativos do VS Code
- **Setup do Time (`npm run squad:setup`):** Configura o **Nome da Squad**, **Nome do Tech Lead**, **Stacks Padrão** (ex: *React + TypeScript*, *.NET*, *Oracle Database*, *Clean Architecture*), **Meta de Cobertura** e ferramentas de QA (**Cypress** + **Jira Xray**) em [`spec/squad-profile.json`](spec/squad-profile.json).
- **Extrator de Extensões VS Code (`npm run sync:standards`):** Varre automaticamente `~/.vscode/extensions/` na máquina da empresa para extrair regras, prompts, linters e snippets de plugins corporativos, consolidando tudo em [`spec/company-standards.md`](spec/company-standards.md).

---

### 5. ⚡ Otimização de Custo de IA e Escala para +2.000 Nós
- **Leitura Livre da Base + Saída "Zero Conversa Fiada":** Os agentes têm acesso irrestrito de leitura à `knowledge-base/` para máxima precisão de negócio, mas são proibidos de gerar textos prolixos ou saudações no chat — focando 100% em edição direta de arquivos.
- **Offload Determinístico (0 Tokens de LLM):** Linter, Auto-Fixer, Compilador do Grafo, Extrator de Padrões VS Code, Exportador do Teams e Gerador Cypress/Jira Xray rodam localmente via Node.js sem consumir tokens de IA.
- **`graph-index.json` Compactado (1 Linha por Item):** Reduz em **~87%** o número de linhas do índice (permitindo que uma base de 2.000 nós caiba em ~6.500 linhas em vez de 53.000 linhas) e elimina arestas genéricas `references` duplicadas quando já existe uma relação semântica forte entre dois nós.

---

## 🛠️ Comandos Importantes

> 💡 **Nota para Windows PowerShell:** Caso a política de execução bloqueie scripts `.ps1` do `npm`, utilize `npm.cmd run <script>` ou execute diretamente com `node`.

### Configuração e Onboarding
| Comando | Comando Direto (`node`) | O que faz |
| :--- | :--- | :--- |
| `npm run squad:setup` | `node scripts/squad-setup.js` | Abre o wizard interativo para definir Nome do Time, Tech Lead, Stacks e QA (Cypress/Xray). |
| `npm run sync:standards` | `node skills/standards-extractor/scripts/extract-vscode-standards.js` | Extrai padrões e regras dos plugins instalados no VS Code (`~/.vscode/extensions`). |

### Sala de Guerra Multi-Terminal e Execução da Squad
| Comando | Comando Direto (`node`) | O que faz |
| :--- | :--- | :--- |
| `npm run squad:war-room` | `node scripts/squad-terminal.js --spawn-terminals` | Abre 4 janelas de terminal dedicadas (`@orchestrator`, `@dev`, `@sec`, `@qa`). No VS Code: `Ctrl+Shift+P` ➔ `Tasks: Run Task` ➔ `🚀 [SQUAD] Abrir Sala de Guerra (4 Terminais de Agentes)`. |
| `npm run squad:simulate` | `node scripts/squad-terminal.js --simulate` | Simula o ciclo completo da Squad (Planejamento ➔ Dev ➔ Sec + QA Cypress/Xray ➔ Grafo). |
| `npm run squad:simulate-veto` | `node scripts/squad-terminal.js --simulate-veto` | Simula um veto de segurança do `@sec` (SQL Injection bloqueado), correção pelo `@dev` e aprovação final. |
| `npm run qa:xray` | `node skills/squad-qa/scripts/xray-exporter.js` | Gera scripts Cypress (`.cy.ts` com `cy.screenshot()`) e pacote de evidências do Jira Xray em `dist/xray/`. |
| `npm run squad:context` | `node scripts/context-pack.js` | Gera o pacote de contexto ultra-compacto da missão ativa em `dist/context/active-context.md`. |

### Gatilhos de Estado dos Terminais (`squad-terminal.js`)
| Gatilho CLI | Quando é acionado |
| :--- | :--- |
| `node scripts/squad-terminal.js --trigger PLAN_WAITING_APPROVAL --project "<proj>" --task "<rule>" --reason "<plano>"` | Registra o planejamento do `@architect` nos terminais e aguarda o "OK" do Tech Lead. |
| `node scripts/squad-terminal.js --trigger READY_FOR_DEV --project "<proj>" --task "<rule>"` | Acorda o terminal do `@dev` após o "OK" do Tech Lead. |
| `node scripts/squad-terminal.js --trigger DEV_STEP --step "<descrição do passo>"` | Exibe em tempo real no terminal do `@dev` o passo e o arquivo que está sendo codificado. |
| `node scripts/squad-terminal.js --trigger READY_FOR_VALIDATION` | Sinaliza término do `@dev` e desperta `@sec` e `@qa` simultaneamente. |
| `node scripts/squad-terminal.js --trigger REJECTED_BY_SEC --reason "<motivo>"` | Veta a entrega por falha de segurança e devolve alerta vermelho para o `@dev`. |
| `node scripts/squad-terminal.js --trigger REJECTED_BY_QA --reason "<motivo>"` | Reprova a entrega por falha de testes/linter e devolve para o `@dev`. |
| `node scripts/squad-terminal.js --trigger SEC_APPROVED` / `QA_APPROVED` | Aprova a entrega e, quando ambos aprovam, dispara o Crescimento Vegetativo do Grafo. |

### Governança do Grafo, Engenharia Reversa e Portal Web
| Comando | Comando Direto (`node`) | O que faz |
| :--- | :--- | :--- |
| `npm run analyze:repo -- "<url-ou-caminho>"` | `node skills/repo-analyzer/scripts/analyze-repo.js "<alvo>"` | Faz engenharia reversa de um repositório Git/local, extrai nós para o grafo, registra o commit em `spec/analyzed-repositories.md` e remove o clone temporário. |
| `npm run lint` | `node skills/knowledge-linter/scripts/validate.js` | Valida frontmatter YAML, schemas dos 6 tipos de nós, links quebrados e limite de palavras. |
| `npm run fix` | `node skills/knowledge-fixer/scripts/fix.js --create-stubs` | Auto-corrige metadados mecânicos e cria nós *stubs* para referências pendentes. |
| `npm run compile` | `node skills/knowledge-governance/scripts/compile-graph.js` | Compila a base em `knowledge-base/graph-index.json` (formato compacto 1 linha/item). |
| `npm run audit` | `node skills/knowledge-governance/scripts/audit-gaps.js` | Audita lacunas técnicas (projetos sem runbook, tabelas sem dono, queries sem regra). |
| `npm run export:teams` | `node skills/knowledge-governance/scripts/export-for-teams.js` | Gera os pacotes Markdown otimizados para Microsoft Teams e Copilot Studio em `dist/teams/`. |
| `npm start` | `node web/server.js` | Inicia a aplicação Web e visualizador do Grafo em `http://localhost:3333` (e `/app`). |

---

## 🏛️ Ontologia dos 6 Nós Canônicos e Relações

| Prefixo | Diretório | Tipo (`type`) | Descrição |
| :--- | :--- | :--- | :--- |
| `proj-*` | `knowledge-base/projects/` | `project` | Serviços, microsserviços, APIs, workers e aplicações. |
| `rule-*` | `knowledge-base/rules/` | `rule` | Regras de negócio, cálculos, políticas e critérios de aceite. |
| `qry-*` | `knowledge-base/queries/` | `query` | Consultas SQL/PL-SQL parametrizadas de negócio, suporte e auditoria. |
| `proc-*` | `knowledge-base/processes/` | `process` | Processos operacionais, runbooks de incidente e contingência. |
| `adr-*` | `knowledge-base/adrs/` | `adr` | Decisões de Arquitetura (*Architectural Decision Records*). |
| `table-*` | `knowledge-base/tables/` | `table` | Tabelas de banco de dados, schemas, chaves e mapeamento LGPD/PII. |

**Relações Canônicas (`spec/relations-catalog.json`):**
`depends_on` · `belongs_to` · `implements_rule` · `owns_table` · `reads_from_table` · `writes_to_table` · `foreign_key_to` · `decides_on` · `recovers_service` · `references`

---

## 🎮 Fluxo Recomendado no Dia a Dia (VS Code)

1. **Na primeira execução (ou ao clonar no PC da empresa):**
   - Rode `node scripts/squad-setup.js` para configurar o nome do time e stacks;
   - Rode `node skills/standards-extractor/scripts/extract-vscode-standards.js` para absorver os plugins do VS Code.
2. **Abra a Sala de Guerra no VS Code:**
   - Pressione `Ctrl + Shift + P` ➔ `Tasks: Run Task` ➔ **`🚀 [SQUAD] Abrir Sala de Guerra (4 Terminais de Agentes)`**.
3. **Peça demandas ao Orquestrador no GitHub Copilot Chat:**
   - Selecione **`👑 Squad Orquestrador (TL)`** no dropdown do Copilot Chat;
   - Descreva a feature, regra ou projeto que deseja criar/alterar;
   - Revise o **Planejamento** apresentado na tela e responda **"OK"** para liberar o `@dev`, acompanhando todos os passos e validações (`@sec` + `@qa` Cypress/Xray) nos 4 terminais!

---

## 📁 Estrutura de Diretórios

```text
.
├── .github/
│   ├── copilot-instructions.md       # ⚡ Instruções globais (Plan-First, Visibilidade de Passos e Custo)
│   ├── agents/squad.agent.md         # 👑 Agente Único "Squad Orquestrador (TL)" no seletor do VS Code
│   ├── chatmodes/squad.chatmode.md   # 👑 Modo de chat compatível com VS Code
│   └── prompts/                      # 🚀 Slash commands (/onboarding, /arquitetar, /desenvolver, /validar-entrega)
├── .vscode/
│   ├── settings.json                 # 🔧 Habilita Custom Agents, Chat Modes e Prompt Files no VS Code
│   └── tasks.json                    # 🖥️ Tasks para abrir os 4 Terminais da Sala de Guerra
├── scripts/
│   ├── squad-setup.js                # 🧙‍♂️ Wizard de Onboarding (Time, Stack, Cypress, Jira Xray)
│   ├── squad-terminal.js             # ⚡ Motor Multi-Terminal Reativo + File Watcher ao vivo
│   └── context-pack.js               # 📦 Compactador de contexto da tarefa ativa
├── skills/
│   ├── squad-orchestrator/           # 👑 Skill Mestre do Orquestrador Central
│   ├── squad-architect/              # 📐 Skill do Arquiteto (@architect)
│   ├── squad-developer/              # 💻 Skill do Desenvolvedor (@dev)
│   ├── squad-security/               # 🛡️ Skill do Auditor AppSec (@sec)
│   ├── squad-qa/                     # 🧪 Skill de QA, Automação Cypress, Evidências Jira Xray e Grafo (@qa)
│   ├── standards-extractor/          # 🧲 Extrator de padrões dos plugins instalados no VS Code
│   ├── repo-analyzer/                # 🔬 Engenharia reversa de repositórios Git/locais
│   ├── copilot-specialist/           # 🤖 Especialista na ontologia do Grafo
│   ├── knowledge-orchestrator/       # Triagem semântica e ingestão
│   ├── knowledge-creator/            # Templates canônicos dos 6 tipos de nós
│   ├── knowledge-linter/             # Validador determinístico de integridade
│   ├── knowledge-fixer/              # Auto-reparo e criação de stubs
│   └── knowledge-governance/         # Compilador compacto do Grafo, Auditor e Exportador Teams
├── spec/
│   ├── squad-profile.json            # ⚙️ Perfil da Squad, Stacks, QA (Cypress/Xray) e Economia de Tokens
│   ├── company-standards.md          # 🏢 Padrões extraídos automaticamente das extensões do VS Code
│   ├── analyzed-repositories.md      # 📜 Registro de repositórios e commits analisados
│   └── relations-catalog.json        # 🔗 Catálogo de relações canônicas e sinônimos
├── dist/
│   ├── teams/                        # 📦 Pacote Markdown exportado para Microsoft Teams / Copilot Studio
│   ├── xray/                         # 📸 Scripts Cypress (.cy.ts) e Payloads de Evidência Jira Xray
│   └── context/                      # ⚡ Contexto compactado da tarefa ativa
├── knowledge-base/                   # 💎 Vault canônico de conhecimento (projects, rules, queries, processes, adrs, tables)
└── web/                              # 🌐 Servidor e interface visual do Grafo (http://localhost:3333)
```
