# Tech Knowledge Graph (Agent-Agnostic)

Um ecossistema de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado primariamente para ser mantido e consultado por **Agentes de IA** (com baixíssimo consumo de tokens), mas totalmente legível e navegável por humanos através do **Obsidian** ou **Git**.

---

## 🎯 Objetivo

Centralizar o conhecimento técnico da área (projetos, regras de negócio, queries de banco com regras específicas, processos internos e ADRs) com:
1. **Zero Vendor Lock-in:** Arquivos Markdown locais padronizados com YAML frontmatter.
2. **Alta Eficiência para IA:** Notas atômicas (100–300 tokens) e índice compilado (`graph-index.json`) para evitar sobrecarga de contexto.
3. **Interoperabilidade Total:** Funciona em qualquer LLM ou agente (Antigravity, Claude, OpenAI, Cursor, Copilot, scripts Node/Python).

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
│   └── knowledge-governance/         # 3. Governança e inteligência do grafo
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

## 🤖 As 3 Skills do Ecossistema

### 1. Criação (`knowledge-creator`)
Transforma textos soltos, documentações antigas, código e queries em nós atômicos devidamente tipados e interligados por `[[wikilinks]]`.

### 2. Validação (`knowledge-linter`)
Garante que a documentação não quebre, conferindo integridade referencial (sem links órfãos), conformidade de schemas YAML e tamanho de tokens.
```bash
node skills/knowledge-linter/scripts/validate.js
```

### 3. Governança e Análise de Impacto (`knowledge-governance`)
Mantém o `graph-index.json` atualizado para que qualquer agente possa responder perguntas complexas de dependência e *blast radius* lendo apenas um único arquivo JSON leve, sem gastar tokens abrindo dezenas de arquivos markdown.
```bash
# Compila o grafo
node skills/knowledge-governance/scripts/compile-graph.js

# Audita débitos de documentação
node skills/knowledge-governance/scripts/audit-gaps.js
```
