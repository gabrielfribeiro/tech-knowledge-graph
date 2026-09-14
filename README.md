# Tech Knowledge Graph (Agent-Agnostic & Self-Healing)

Um ecossistema completo de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado primariamente para ser mantido, auditado e consultado por **Agentes de IA** (com baixíssimo consumo de tokens), mas com interface web interativa e total compatibilidade com **Obsidian** e **Git**.

---

## 🎯 Destaques do Ecossistema

1. **Dashboard Web Interativo (`http://localhost:3333`):**
   * **Ingestão Inteligente com Anti-Conflito:** Cole textos livres, atas ou conversas do Slack e o sistema detecta se há duplicações ou contradições antes de alterar o repositório.
   * **Visualizador do Grafo:** Canvas interativo com física para explorar nós (projetos, regras, queries, processos, stubs).
   * **Central de Auditoria:** Métricas de débito de documentação e botões de auto-cura em um clique.
2. **Ciclo de Auto-Recuperação (Self-Healing Loop):**
   * Criação, validação de integridade, geração automática de stubs para links órfãos e compilação do grafo.
3. **Zero Vendor Lock-in & Zero Dependências:**
   * Arquivos Markdown locais com frontmatter YAML. Servidor e scripts em Node.js nativo (sem `node_modules`).

---

## 🖥️ Como Iniciar a Interface Web

Para abrir o dashboard interativo no seu navegador:

```bash
# Iniciar o servidor
npm start
# Ou diretamente:
node web/server.js
```

Acesse no navegador: **[http://localhost:3333](http://localhost:3333)**

---

## 🔄 O Ciclo Fechado de Governança

```text
       [Texto Livre / Slack / Ata de Reunião]
                         │
                         ▼
        5. knowledge-orchestrator    (Detecta duplicatas e contradições)
                         │
                   (Se aprovado)
                         ▼
        1. knowledge-creator         (Cria nós atômicos tipados)
                         │
                         ▼
        2. knowledge-linter          (Audita integridade e limites de tokens)
                         │
                   (Se houver erros)
                         ▼
        3. knowledge-fixer           (Auto-cura mecânica + stubs para órfãos)
                         │
                   (100% íntegro)
                         ▼
        4. knowledge-governance      (Compila graph-index.json e audita gaps)
```

---

## 📁 Estrutura do Repositório

```text
.
├── web/                              # Interface Web Interativa
│   ├── server.js                     # Servidor HTTP nativo com endpoints de API
│   └── public/index.html             # Dashboard (Tailwind + Vis-Network + Marked)
├── skills/
│   ├── knowledge-orchestrator/       # 5. Triagem semântica e anti-conflito
│   │   ├── SKILL.md                  # Protocolo do agente orquestrador
│   │   └── scripts/analyze-intake.js # Analisador de divergência semântica
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
├── package.json                      # Comandos npm rápidos
└── README.md
```

---

## 🚀 Comandos via Terminal (Custo Zero de Tokens)

```bash
# 1. Iniciar Web App
npm start

# 2. Analisar texto livre contra o grafo para detectar conflitos
npm run analyze -- "texto a ser analisado"

# 3. Validar a integridade da base
npm run lint

# 4. Auto-corrigir problemas e curar links órfãos com stubs
npm run fix

# 5. Recompilar o índice do grafo
npm run compile

# 6. Auditar débitos técnicos de documentação
npm run audit
```
