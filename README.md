# Tech Knowledge Graph (Agent-Agnostic & Self-Healing)

Um ecossistema completo de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado primariamente para ser mantido, auditado e consultado por **Agentes de IA e GitHub Copilot** (com baixíssimo consumo de tokens), com dashboard web de ingestão e total compatibilidade com **Obsidian** e **Git**.

---

## 🎯 Destaques do Ecossistema

1. **GitHub Copilot Specialist Nativo (`.github/copilot-instructions.md`):**
   * Sempre que você colar um texto livre no Copilot Chat (VS Code / JetBrains), ele atua como **Especialista Sênior do Projeto**, decompondo o texto em nós atômicos e detectando contradições de regras automaticamente.
2. **Dashboard Web Interativo (`http://localhost:3333`):**
   * **Ingestão Inteligente com Anti-Conflito:** Cole textos livres, atas ou conversas do Slack e o sistema detecta se há duplicações ou contradições antes de alterar o repositório.
   * **Central de Auditoria:** Métricas de débito de documentação e botões de auto-cura em um clique.
3. **Ciclo de Auto-Recuperação (Self-Healing Loop):**
   * Criação, validação de integridade, geração automática de stubs para links órfãos e compilação do grafo.
4. **Zero Vendor Lock-in & Zero Dependências:**
   * Arquivos Markdown locais com frontmatter YAML. Servidor e scripts em Node.js nativo (sem `node_modules`).

---

## 🔄 O Ciclo de Ingestão Autônoma

```text
       [Texto Livre / Slack / Ata de Reunião]
                         │
                         ▼
        Copilot Specialist / Orchestrator   (Detecta duplicatas e contradições)
                         │
                   (Se aprovado)
                         ▼
        1. knowledge-creator                (Fatia em nós atômicos: 100-300 tokens)
                         │
                         ▼
        2. knowledge-linter                 (Audita integridade e limites de tokens)
                         │
                   (Se houver erros)
                         ▼
        3. knowledge-fixer                  (Auto-cura mecânica + stubs para órfãos)
                         │
                   (100% íntegro)
                         ▼
        4. knowledge-governance             (Compila graph-index.json e audita gaps)
```

---

## 📁 Estrutura do Repositório

```text
.
├── .github/
│   └── copilot-instructions.md       # Instruções nativas do GitHub Copilot
├── skills/
│   ├── copilot-specialist/           # 🌟 Skill do Copilot Especialista no Projeto
│   │   └── SKILL.md                  # Protocolo de ingestão autônoma de texto livre
│   ├── knowledge-orchestrator/       # 5. Triagem semântica e anti-conflito
│   │   ├── SKILL.md                  # Protocolo de resolução de divergências
│   │   └── scripts/
│   │       ├── analyze-intake.js     # Analisador de divergência semântica
│   │       └── ingest.js             # Pipeline de ingestão em 1 comando
│   ├── knowledge-creator/            # 1. Criação de nós atômicos
│   ├── knowledge-linter/             # 2. Validação e integridade
│   ├── knowledge-fixer/              # 3. Auto-reparo e stubs
│   └── knowledge-governance/         # 4. Compilação do grafo e gaps
├── web/                              # Interface Web Interativa (localhost:3333)
├── knowledge-base/                   # Vault de notas atômicas (compatível com Obsidian)
└── README.md
```

---

## 🚀 Comandos via Terminal

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
