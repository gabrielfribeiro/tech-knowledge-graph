# Tech Knowledge Graph (Agent-Agnostic, Teams & Self-Healing)

Um ecossistema completo de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado para alimentar tanto desenvolvedores no **Obsidian**, quanto o **GitHub Copilot** e **Agentes corporativos no Microsoft Teams** (via Copilot Studio).

---

## 🎯 Destaques do Ecossistema

1. **Exportador Otimizado para Microsoft Teams (`npm run export:teams`):**
   * Converte o grafo de notas atômicas em documentos enriquecidos (Self-Contained Chunks) para o RAG do Copilot Studio / SharePoint.
   * Gera o catálogo mestre `00_CATALOGO_E_MAPA_GERAL_DA_AREA.md` e o System Prompt corporativo.
2. **GitHub Copilot Specialist Nativo (`.github/copilot-instructions.md`):**
   * Transforma o Copilot da IDE em um especialista na arquitetura da sua área técnica.
3. **Visualizador em Grafo no Obsidian (via Plugin Juggl):**
   * Compatível com rótulos de arestas (`depends_on`, `implements_rule`, `belongs_to`).
4. **Ciclo de Auto-Recuperação e Anti-Conflito:**
   * Detecção de duplicatas e contradições semânticas em texto livre.

---

## 🚀 Como Exportar a Base para o Agente do Microsoft Teams

Para gerar a versão otimizada para o Copilot Studio / Teams:

```bash
# Executa a compilação e exportação semântica
npm run export:teams
# Ou diretamente:
node skills/knowledge-governance/scripts/export-for-teams.js
```

Os arquivos prontos serão gerados na pasta **`dist/teams/`**:
1. `dist/teams/00_CATALOGO_E_MAPA_GERAL_DA_AREA.md` (Catálogo mestre)
2. `dist/teams/CONFIGURACAO_AGENTE_COPILOT_STUDIO.md` (Prompt do sistema e instruções)
3. `dist/teams/servicos/` (Fichas técnicas dos microsserviços)
4. `dist/teams/regras/` (Regras de negócio e critérios)
5. `dist/teams/queries/` (Queries SQL com serviço e regra associados)
6. `dist/teams/processos/` (Runbooks com passos operacionais)

👉 **Basta fazer o upload da pasta `dist/teams/` para a pasta do SharePoint associada ao seu Agente no Teams / Copilot Studio!**

---

## 📁 Estrutura do Repositório

```text
.
├── dist/teams/                       # 📦 Exportação gerada para o Microsoft Teams
├── skills/
│   ├── knowledge-governance/scripts/export-for-teams.js  # Pipeline de exportação
│   ├── copilot-specialist/           # Skill do Copilot Especialista
│   ├── knowledge-orchestrator/       # Triagem semântica e anti-conflito
│   ├── knowledge-creator/            # Criação de nós atômicos
│   ├── knowledge-linter/             # Validação e integridade
│   └── knowledge-fixer/              # Auto-reparo e stubs
├── web/                              # Interface Web Interativa (localhost:3333)
├── knowledge-base/                   # Vault canônico (Obsidian + Git)
└── README.md
```
