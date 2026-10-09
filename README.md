# Tech Knowledge Graph (Agent-Agnostic, Teams, Repo-Analyzer & Self-Healing)

Um ecossistema completo de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado para alimentar desenvolvedores no **Obsidian**, o **GitHub Copilot**, **Agentes corporativos no Microsoft Teams** e realizar **Engenharia Reversa Automatizada de Repositórios Git**.

---

## 🏛️ Os 6 Tipos de Nós Canônicos (First-Class Citizens)

A base é estritamente tipada em 6 nós atômicos de conhecimento:

| Prefixo | Diretório | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `proj-*` | `knowledge-base/projects/` | `project` | Serviços, microsserviços, APIs e aplicações da área. |
| `rule-*` | `knowledge-base/rules/` | `rule` | Regras de negócio formais, políticas de cobrança, SLAs e cálculos. |
| `qry-*` | `knowledge-base/queries/` | `query` | Consultas SQL críticas de suporte, relatórios e auditoria. |
| `proc-*` | `knowledge-base/processes/` | `process` | Processos operacionais, runbooks de incidente e guias de suporte. |
| `adr-*` | `knowledge-base/adrs/` | `adr` | Decisões de Arquitetura (Architectural Decision Records). |
| `table-*` | `knowledge-base/tables/` | `table` | Modelos de dados, schemas e tabelas de banco de dados. |

---

## 🎯 Destaques do Ecossistema

1. **Análise Automatizada de Repositórios (`skills/repo-analyzer`):**
   * Ativado pelo comando: *"Vamos analisar o projeto {nome ou link do repo}"*.
   * Clona o repositório temporariamente, extrai o Commit Hash e data, inspeciona arquitetura, regras de negócio, queries, schemas/tabelas e cobertura de testes.
   * Exclui o repositório clonado da máquina após a análise e registra o histórico em `spec/analyzed-repositories.md`.
2. **Exportador Otimizado para Microsoft Teams (`npm run export:teams`):**
   * Converte o grafo de notas atômicas em documentos enriquecidos (Self-Contained Chunks) divididos em `servicos/`, `regras/`, `queries/`, `processos/`, `tabelas/` e `adrs/` para o RAG do Copilot Studio / SharePoint.
3. **GitHub Copilot Specialist Nativo (`.github/copilot-instructions.md`):**
   * Transforma o Copilot da IDE em um especialista na arquitetura da sua área técnica.
4. **Visualizador em Grafo no Obsidian (via Plugin Juggl):**
   * Compatível com rótulos de arestas canônicas (`depends_on`, `implements_rule`, `owns_table`, `reads_from_table`, `decides_on`).
5. **Ciclo de Auto-Recuperação e Anti-Conflito:**
   * Detecção de duplicatas, stubs automatizados para links órfãos e governança de débito técnico.

---

## 🔬 Como Usar o Analista de Repositórios

Basta solicitar:
> **"Vamos analisar o projeto https://github.com/empresa/meu-servico.git"**

Ou executar via terminal:
```bash
npm run analyze:repo -- "https://github.com/empresa/meu-servico.git"
```

---

## 📁 Estrutura do Repositório

```text
.
├── skills/
│   ├── repo-analyzer/                # 🔬 Analista de Repositórios Git
│   │   ├── SKILL.md                  # Protocolo e gatilho do analista
│   │   └── scripts/analyze-repo.js   # Motor de clonagem, inspeção e limpeza
│   ├── copilot-specialist/           # Skill do Copilot Especialista
│   ├── knowledge-orchestrator/       # Triagem semântica e anti-conflito
│   ├── knowledge-creator/            # Criação de nós atômicos (templates de todos os 6 nós)
│   ├── knowledge-linter/             # Validação e integridade referencial
│   └── knowledge-fixer/              # Auto-reparo e stubs automáticos
├── spec/
│   ├── analyzed-repositories.md      # 📜 Tabela de repositórios e versões analisadas
│   ├── relations-catalog.json        # Catálogo de arestas canônicas (máquina)
│   └── relations-catalog.md          # Catálogo de arestas canônicas (humano)
├── dist/teams/                       # 📦 Exportação para Microsoft Teams / SharePoint
│   ├── 00_CATALOGO_E_MAPA_GERAL_DA_AREA.md
│   ├── CONFIGURACAO_AGENTE_COPILOT_STUDIO.md
│   ├── servicos/
│   ├── regras/
│   ├── queries/
│   ├── processos/
│   ├── tabelas/
│   └── adrs/
├── knowledge-base/                   # 💎 Vault canônico (Obsidian + Git)
│   ├── projects/                     # proj-*
│   ├── rules/                        # rule-*
│   ├── queries/                      # qry-*
│   ├── processes/                    # proc-*
│   ├── adrs/                         # adr-*
│   ├── tables/                       # table-*
│   ├── analyzed-repositories.json    # Log estruturado de versões analisadas
│   └── graph-index.json              # Topologia consolidada do grafo
└── README.md
```
