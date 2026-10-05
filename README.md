# Tech Knowledge Graph (Agent-Agnostic, Teams, MCP & Self-Healing)

Um ecossistema completo de documentação técnica estruturado em **Grafo de Conhecimento Atômico**, projetado para alimentar tanto desenvolvedores no **Obsidian**, quanto o **GitHub Copilot**, **Agentes corporativos no Microsoft Teams** e **qualquer IA externa via Servidor MCP (Model Context Protocol)**.

---

## 🎯 Destaques do Ecossistema

1. **Servidor MCP com Busca Vetorial / GraphRAG (`mcp-server/index.js`):**
   * Servidor compatível com o protocolo aberto MCP (Anthropic). Conecta diretamente no **Claude Desktop**, **Cursor**, **Antigravity** e **VS Code**.
   * Expõe ferramentas de busca semântica vetorial (`search_knowledge_semantic`), leitura de nós (`get_entity`) e navegação de arestas (`traverse_graph`).
2. **Exportador Otimizado para Microsoft Teams (`npm run export:teams`):**
   * Converte o grafo de notas atômicas em documentos enriquecidos (Self-Contained Chunks) para o RAG do Copilot Studio / SharePoint.
3. **GitHub Copilot Specialist Nativo (`.github/copilot-instructions.md`):**
   * Transforma o Copilot da IDE em um especialista na arquitetura da sua área técnica.
4. **Visualizador em Grafo no Obsidian (via Plugin Juggl):**
   * Compatível com rótulos de arestas (`depends_on`, `implements_rule`, `belongs_to`).
5. **Ciclo de Auto-Recuperação e Anti-Conflito:**
   * Detecção de duplicatas e contradições semânticas em texto livre.

---

## 🔌 Como Conectar em IAs Externas via MCP (Claude, Cursor, etc.)

O servidor roda localmente via `stdio` com inicialização ultrarrápida:

```bash
# Iniciar o servidor MCP
node mcp-server/index.js
```

### Configuração no Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "tech-knowledge-graph": {
      "command": "node",
      "args": ["C:/Users/gabri/.gemini/antigravity/scratch/tech-knowledge-graph/mcp-server/index.js"]
    }
  }
}
```

### Configuração no Cursor (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "tech-knowledge": {
      "command": "node",
      "args": ["C:/Users/gabri/.gemini/antigravity/scratch/tech-knowledge-graph/mcp-server/index.js"]
    }
  }
}
```

---

## 📁 Estrutura do Repositório

```text
.
├── mcp-server/                       # 🔌 Servidor MCP (Model Context Protocol)
│   ├── index.js                      # Servidor JSON-RPC 2.0 (stdio) com Tools e Resources
│   ├── vector-indexer.js             # Motor de vetorização e busca semântica
│   ├── client-configs/               # Configurações prontas (Claude, Cursor, Antigravity)
│   └── README.md                     # Documentação do MCP Server
├── dist/teams/                       # 📦 Exportação gerada para o Microsoft Teams
├── skills/                           # 🤖 Skills do ecossistema de governança
├── web/                              # 🌐 Interface Web Interativa (localhost:3333)
├── knowledge-base/                   # 💎 Vault canônico (Obsidian + Git)
│   ├── graph-index.json              # Topologia consolidada do grafo
│   └── vector-store.json             # Banco vetorial local indexado
└── README.md
```
