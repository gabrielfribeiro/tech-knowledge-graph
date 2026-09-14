# Tech Knowledge Graph (Agent-Agnostic)

Um ecossistema de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado primariamente para ser mantido e consultado por **Agentes de IA** (com baixíssimo consumo de tokens), mas totalmente legível e navegável por humanos através do **Obsidian** ou **Git**.

---

## 🎯 Objetivo

Centralizar o conhecimento técnico da área (projetos, regras de negócio, queries de banco com regras específicas, processos internos e ADRs) com:
1. **Zero Vendor Lock-in:** Arquivos Markdown locais padronizados.
2. **Alta Eficiência para IA:** Notas atômicas (100–300 tokens) para evitar sobrecarga de contexto.
3. **Interoperabilidade Total:** Funciona em qualquer LLM ou agente (Antigravity, Claude, OpenAI, Cursor, Copilot, scripts Python).

---

## 📁 Estrutura do Repositório

```text
.
├── skills/
│   └── knowledge-creator/            # Skill de Criação de Nós
│       ├── SKILL.md                  # Especificação e protocolo do agente
│       └── templates/                # Templates prontos (projetos, regras, queries, processos)
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

## 🤖 Como Usar as Skills com Qualquer Agente

### Opção 1: Em Ambientes com Suporte a Skills (ex: Antigravity / Claude Code)
Aponte o agente para a pasta `skills/knowledge-creator/SKILL.md` ou use-a como instrução de contexto.

### Opção 2: Em Qualquer Chatbot / LLM (Cursor, ChatGPT, Gemini, etc.)
Copie o conteúdo de `skills/knowledge-creator/SKILL.md` como **System Prompt** ou instrução inicial e passe a documentação bruta que você deseja converter.

---

## 🚀 Como Conectar com o seu Repositório no GitHub

Para subir este projeto para o GitHub:

1. Crie um novo repositório vazio no seu [GitHub](https://github.com/new) (ex: `tech-knowledge-graph`).
2. No seu terminal, dentro desta pasta:
   ```bash
   git remote add origin https://github.com/<seu-usuario>/tech-knowledge-graph.git
   git add .
   git commit -m "feat: initial commit with knowledge-creator skill and base structure"
   git branch -M main
   git push -u origin main
   ```
