# Tech Knowledge Graph (Agent-Agnostic, Teams, Repo-Analyzer & Self-Healing)

Um ecossistema completo de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado para alimentar desenvolvedores no **Obsidian**, o **GitHub Copilot**, **Agentes corporativos no Microsoft Teams** e realizar **Engenharia Reversa Automatizada de Repositórios Git**.

---

## 🎯 Destaques do Ecossistema

1. **Análise Automatizada de Repositórios (`skills/repo-analyzer`):**
   * Ativado pelo comando: *"Vamos analisar o projeto {nome ou link do repo}"*.
   * Clona o repositório temporariamente, extrai o Commit Hash e data, inspeciona arquitetura, regras de negócio, queries, endpoints e cobertura de testes.
   * Exclui o repositório clonado da máquina após a análise e registra o histórico em `spec/analyzed-repositories.md`.
2. **Exportador Otimizado para Microsoft Teams (`npm run export:teams`):**
   * Converte o grafo de notas atômicas em documentos enriquecidos (Self-Contained Chunks) para o RAG do Copilot Studio / SharePoint.
3. **GitHub Copilot Specialist Nativo (`.github/copilot-instructions.md`):**
   * Transforma o Copilot da IDE em um especialista na arquitetura da sua área técnica.
4. **Visualizador em Grafo no Obsidian (via Plugin Juggl):**
   * Compatível com rótulos de arestas (`depends_on`, `implements_rule`, `belongs_to`).
5. **Ciclo de Auto-Recuperação e Anti-Conflito:**
   * Detecção de duplicatas e contradições semânticas em texto livre.

---

## 🔬 Como Usar o Analista de Repositórios

Basta solicitar:
> **"Vamos analisar o projeto https://github.com/empresa/meu-servico.git"**

Ou executar via terminal:
```bash
npm run analyze:repo -- "https://github.com/empresa/meu-servico.git"
```

O agente:
1. Clona o código de forma efêmera;
2. Extrai Commit Hash, Tag e Timestamp;
3. Gera os nós (`projects/`, `rules/`, `queries/`, etc.);
4. **Exclui a pasta clonada (zero resíduo no disco)**;
5. Registra a análise no histórico de versões (`spec/analyzed-repositories.md`).

---

## 📁 Estrutura do Repositório

```text
.
├── skills/
│   ├── repo-analyzer/                # 🔬 Nova Skill: Analista de Repositórios Git
│   │   ├── SKILL.md                  # Protocolo e gatilho do analista
│   │   └── scripts/analyze-repo.js   # Motor de clonagem, inspeção e limpeza
│   ├── copilot-specialist/           # Skill do Copilot Especialista
│   ├── knowledge-orchestrator/       # Triagem semântica e anti-conflito
│   ├── knowledge-creator/            # Criação de nós atômicos
│   ├── knowledge-linter/             # Validação e integridade
│   └── knowledge-fixer/              # Auto-reparo e stubs
├── spec/
│   ├── analyzed-repositories.md      # 📜 Tabela de repositórios e versões analisadas
│   └── relations-catalog.md          # Catálogo de arestas canônicas
├── dist/teams/                       # 📦 Exportação para Microsoft Teams
├── knowledge-base/                   # 💎 Vault canônico (Obsidian + Git)
│   ├── analyzed-repositories.json    # Log estruturado de versões analisadas
│   └── graph-index.json              # Topologia consolidada do grafo
└── README.md
```
