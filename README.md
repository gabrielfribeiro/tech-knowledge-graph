# Tech Knowledge Graph (Agent-Agnostic & Self-Healing)

Um ecossistema de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado primariamente para ser mantido, corrigido e consultado por **Agentes de IA** (com baixíssimo consumo de tokens), mas totalmente legível e navegável por humanos através do **Obsidian** ou **Git**.

---

## 🎯 Objetivo

Centralizar o conhecimento técnico da área (projetos, regras de negócio, queries de banco com regras específicas, processos internos e ADRs) com:
1. **Zero Vendor Lock-in:** Arquivos Markdown locais padronizados com YAML frontmatter.
2. **Alta Eficiência para IA:** Notas atômicas (100–300 tokens) e índice compilado (`graph-index.json`) para evitar sobrecarga de contexto.
3. **Ciclo de Auto-Recuperação (Self-Healing):** Criação, validação, auto-reparo e governança totalmente orquestrados.
4. **Interoperabilidade Total:** Funciona em qualquer LLM ou agente (Antigravity, Claude, OpenAI, Cursor, Copilot, scripts Node/Python).

---

## 🔄 O Ciclo Fechado (Self-Healing Loop)

```text
    [Entrada Bruta / Documentação]
                  │
                  ▼
       1. knowledge-creator         (Gera nós atômicos tipados)
                  │
                  ▼
       2. knowledge-linter          (Audita integridade e orçamento de tokens)
                  │
            (Se houver erros)
                  ▼
       3. knowledge-fixer           (Corrige mecânica, links órfãos e stubs)
                  │
            (Re-valida 100%)
                  ▼
       4. knowledge-governance      (Compila graph-index.json e audita gaps)
```

---

## 📁 Estrutura do Repositório

```text
.
├── skills/
│   ├── knowledge-creator/            # 1. Criação de nós atômicos
│   │   ├── SKILL.md                  # Protocolo de decomposição atômica
│   │   └── templates/                # Templates (project, rule, query, process)
│   ├── knowledge-linter/             # 2. Validação e integridade
│   │   ├── SKILL.md                  # Regras de auditoria e conformidade
│   │   └── scripts/validate.js       # Linter executável (zero dependências)
│   ├── knowledge-fixer/              # 3. Auto-reparo e auto-cura (Auto-Healing)
│   │   ├── SKILL.md                  # Protocolo de remediação cognitiva
│   │   └── scripts/fix.js            # Auto-fixer mecânico (com criação de stubs)
│   └── knowledge-governance/         # 4. Governança e inteligência do grafo
│       ├── SKILL.md                  # Guia de análise de impacto e blast radius
│       └── scripts/
│           ├── compile-graph.js      # Compila o grafo para graph-index.json
│           └── audit-gaps.js         # Identifica débito técnico e lacunas
├── spec/
│   └── architecture.md               # Racional técnico de tokens e arquitetura
├── knowledge-base/                   # Vault de notas atômicas (compatível com Obsidian)
│   ├── projects/                     # Microsserviços, APIs, Frontends
│   ├── rules/                        # Regras e políticas de negócio
│   ├── queries/                      # SQLs críticos e scripts de banco
│   ├── processes/                    # Runbooks, SOPs, fluxos operacionais
│   ├── adrs/                         # Architectural Decision Records
│   └── graph-index.json              # Grafo compilado para leitura ultrarrápida
└── README.md
```

---

## 🚀 Comandos Rápidos do Ecossistema

Todos os scripts utilizam **Node.js puro (sem npm install nem node_modules)**:

```bash
# 1. Validar a base de conhecimento
node skills/knowledge-linter/scripts/validate.js

# 2. Auto-corrigir problemas mecânicos e curar links órfãos com stubs
node skills/knowledge-fixer/scripts/fix.js --create-stubs

# 3. Compilar o grafo em JSON para consumo rápido do agente
node skills/knowledge-governance/scripts/compile-graph.js

# 4. Auditar lacunas técnicas e débito de documentação
node skills/knowledge-governance/scripts/audit-gaps.js
```
