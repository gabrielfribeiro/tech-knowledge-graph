# Tech Knowledge Graph & AI Engineering Squad-in-a-Box

Um ecossistema completo que combina uma **Squad de Engenharia de IA (`@architect`, `@dev`, `@sec`, `@qa`)** operando em **Múltiplos Terminais Reativos** com um **Grafo de Conhecimento Vegetativo** (`proj-*`, `rule-*`, `qry-*`, `proc-*`, `adr-*`, `table-*`) integrado ao **Obsidian**, **GitHub Copilot** e **Microsoft Teams**.

---

## 🚀 1. Onboarding Inicial da Squad (`npm run squad:setup`)

### Conheça o projeto

Inicie a aplicação web com `npm start` e abra `http://localhost:3333` para conhecer a história e a proposta do Tech Knowledge Graph. O produto de ingestão e governança continua disponível em `http://localhost:3333/app`.

Ao iniciar o projeto pela primeira vez, execute o **Wizard de Onboarding**:
```bash
npm run squad:setup
```
O assistente perguntará:
1. **Nome do seu Time / Squad de IA** (ex: *Squad Jarvis Core*);
2. **Seu nome como Tech Lead**;
3. **Stacks Padrão do Ecossistema** (ex: *React + TypeScript*, *.NET 8 (C#)*, *Oracle Database*, *Clean Architecture*);
4. **Meta de Cobertura de Testes** (ex: *80%*);
5. **Absorção automática dos Plugins do VS Code** (`~/.vscode/extensions/`), extraindo regras, snippets e instruções corporativas para `spec/company-standards.md`.

---

## 🖥️ 2. Operação em Múltiplos Terminais Sincronizados (War Room)

Você pode rodar cada agente em um terminal dedicado onde **um aguarda o término do outro** através do barramento reativo (`knowledge-base/squad-pipeline.json`):

```bash
# Abre automaticamente 4 janelas de terminal (Orquestrador, @dev, @sec, @qa):
npm run squad:war-room

# Ou pelo VS Code: Ctrl+Shift+P -> Tasks: Run Task -> "🚀 Iniciar War Room da Squad (4 Terminais Split)"
```

### Fluxo Reativo Entre os Terminais:
1. **Terminal 1 (`Orquestrador & @architect`):** Verifica se o projeto já existe no Grafo (se não existir, dispara o `repo-analyzer` ou cria a fundação inicial) e libera a especificação (`npm run squad:dev-start`).
2. **Terminal 2 (`@dev`):** Desperta ao receber a spec, orienta a implementação na stack configurada e, ao finalizar (`npm run squad:dev-done`), aciona simultaneamente Segurança e QA.
3. **Terminal 3 (`@sec`):** Desperta apenas quando o `@dev` termina. Audita OWASP Top 10, SQL/PL-SQL Injection, Secrets e LGPD nas `table-*`. Possui poder de veto.
4. **Terminal 4 (`@qa` & Guardião Vegetativo):** Desperta em paralelo com o `@sec`, valida testes contra as `rule-*` e, quando **SEC + QA aprovam**, dispara sozinho o **Crescimento Vegetativo da Base** (Linter ➔ Fixer ➔ Compilação do Grafo ➔ Exportação Teams).

Para simular o ciclo inteiro em um único terminal:
```bash
npm run squad:simulate
```

---

## 🏛️ 3. Os 6 Tipos de Nós Canônicos (First-Class Citizens)

| Prefixo | Diretório | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `proj-*` | `knowledge-base/projects/` | `project` | Serviços, microsserviços, APIs e aplicações da área. |
| `rule-*` | `knowledge-base/rules/` | `rule` | Regras de negócio formais, políticas de cobrança, SLAs e cálculos. |
| `qry-*` | `knowledge-base/queries/` | `query` | Consultas SQL/PL-SQL críticas de suporte, relatórios e auditoria. |
| `proc-*` | `knowledge-base/processes/` | `process` | Processos operacionais, runbooks de incidente e guias de suporte. |
| `adr-*` | `knowledge-base/adrs/` | `adr` | Decisões de Arquitetura (Architectural Decision Records). |
| `table-*` | `knowledge-base/tables/` | `table` | Modelos de dados, schemas e tabelas de banco de dados. |

---

## 📁 4. Estrutura do Repositório

```text
.
├── .vscode/tasks.json                # 🖥️ Split Terminals automáticos da War Room no VS Code
├── scripts/
│   ├── squad-setup.js                # 🧙‍♂️ Onboarding interativo (Nome do Time + Stack)
│   └── squad-terminal.js             # ⚡ Orquestrador reativo Multi-Terminal (@dev, @sec, @qa)
├── skills/
│   ├── squad-architect/              # 📐 Skill do Arquiteto (@architect)
│   ├── squad-developer/              # 💻 Skill do Desenvolvedor (@dev)
│   ├── squad-security/               # 🛡️ Skill do Auditor de Segurança (@sec)
│   ├── squad-qa/                     # 🧪 Skill do Engenheiro de QA & Grafo (@qa)
│   ├── standards-extractor/          # 🧲 Extrator de padrões dos plugins do VS Code
│   ├── repo-analyzer/                # 🔬 Engenharia reversa de repositórios Git
│   ├── copilot-specialist/           # 🤖 Especialista Canônico do Grafo
│   ├── knowledge-orchestrator/       # Triagem semântica e anti-conflito
│   ├── knowledge-creator/            # Templates dos 6 nós atômicos
│   ├── knowledge-linter/             # Validador de schemas e integridade
│   └── knowledge-fixer/              # Auto-reparo e geração de stubs
├── spec/
│   ├── squad-profile.json            # ⚙️ DNA configurável do Time e Stacks
│   ├── company-standards.md          # 🏢 Regras extraídas dos plugins do VS Code
│   ├── analyzed-repositories.md      # 📜 Histórico de repositórios e versões analisadas
│   └── relations-catalog.md          # Catálogo de arestas canônicas
├── dist/teams/                       # 📦 Pacote RAG otimizado para Microsoft Teams
└── knowledge-base/                   # 💎 Vault canônico (Obsidian + Git)
```
