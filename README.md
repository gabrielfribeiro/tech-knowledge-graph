# Tech Knowledge Graph (Agent-Agnostic)

Um ecossistema de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado primariamente para ser mantido e consultado por **Agentes de IA** (com baixíssimo consumo de tokens), mas totalmente legível e navegável por humanos através do **Obsidian** ou **Git**.

---

## 🎯 Objetivo

Centralizar o conhecimento técnico da área (projetos, regras de negócio, queries de banco com regras específicas, processos internos e ADRs) com:
1. **Zero Vendor Lock-in:** Arquivos Markdown locais padronizados.
2. **Alta Eficiência para IA:** Notas atômicas (100–300 tokens) para evitar sobrecarga de contexto.
3. **Interoperabilidade Total:** Funciona em qualquer LLM ou agente (Antigravity, Claude, OpenAI, Cursor, Copilot, scripts Node/Python).

---

## 📁 Estrutura do Repositório

```text
.
├── skills/
│   ├── knowledge-creator/            # 1. Skill de Criação de Nós
│   │   ├── SKILL.md                  # Protocolo de decomposição atômica e regras do agente
│   │   └── templates/                # Templates prontos (project, rule, query, process)
│   └── knowledge-linter/             # 2. Skill de Validação / Linter
│       ├── SKILL.md                  # Regras de linting cognitivo para agentes
│       └── scripts/
│           └── validate.js           # Validador executável determinístico (zero dependências)
├── spec/
│   └── architecture.md               # Documentação técnica e racional de economia de tokens
├── knowledge-base/                   # Vault de notas atômicas (pode ser aberto no Obsidian)
│   ├── projects/                     # Microsserviços, APIs, Frontends
│   ├── rules/                        # Regras e políticas de negócio
│   ├── queries/                      # SQLs críticos e scripts de banco
│   ├── processes/                    # Runbooks, SOPs, fluxos operacionais
│   └── adrs/                         # Architectural Decision Records
└── README.md
```

---

## 🤖 Como Usar as Skills

### 1. Criação de Conhecimento (`knowledge-creator`)
Passe qualquer texto bruto, código ou dúvida para o agente instruído com `skills/knowledge-creator/SKILL.md`. O agente dividirá o conteúdo em notas atômicas interligadas.

### 2. Validação da Base (`knowledge-linter`)
Para auditar a integridade da base, links órfãos e orçamentos de tokens:
- **Via linha de comando / CI (Custo 0 de tokens):**
  ```bash
  node skills/knowledge-linter/scripts/validate.js
  # Ou com saída JSON para automações:
  node skills/knowledge-linter/scripts/validate.js --json
  ```
- **Via Agente de IA:** Aponte o agente para `skills/knowledge-linter/SKILL.md` para auditoria contextual e semântica.
