# Servidor MCP (Model Context Protocol) - Tech Knowledge Graph

Este servidor implementa o protocolo aberto **Model Context Protocol (MCP)** sobre `stdio` com **busca vetorial híbrida (GraphRAG)**. Ele permite que qualquer IA externa (Claude Desktop, Cursor, Antigravity, VS Code, etc.) consulte a base de conhecimento técnico, faça buscas semânticas vetoriais e navegue nas dependências do grafo.

---

## 🛠️ Ferramentas (Tools) Expostas para as IAs

| Ferramenta | Descrição | Parâmetros |
| :--- | :--- | :--- |
| **`search_knowledge_semantic`** | Busca vetorial com cosine similarity sobre as notas e regras. | `query` (string), `limit` (number, opcional) |
| **`get_entity`** | Retorna o conteúdo Markdown completo, SQL e metadados de um nó. | `id` (string, ex: `proj-billing-engine`) |
| **`traverse_graph`** | Navega no grafo retornando dependências e conexões relacionais. | `id` (string), `direction` (`outgoing`/`incoming`/`both`), `relation` (opcional) |
| **`list_entities_by_type`** | Lista todas as entidades de uma categoria. | `type` (`project`, `rule`, `query`, `process`, `adr`) |
| **`audit_knowledge_gaps`** | Retorna débitos técnicos, serviços sem runbook e queries sem regra. | Nenhum |

---

## 🚀 Como Conectar nas IAs

### 1. No Claude Desktop
Abra o seu arquivo `%APPDATA%\Claude\claude_desktop_config.json` e adicione:

```json
{
  "mcpServers": {
    "tech-knowledge-graph": {
      "command": "node",
      "args": [
        "C:/Users/gabri/.gemini/antigravity/scratch/tech-knowledge-graph/mcp-server/index.js"
      ]
    }
  }
}
```

### 2. No Cursor
No Cursor, vá em **Settings > Features > MCP Servers > Add New MCP Server**:
- **Name:** `tech-knowledge`
- **Type:** `command`
- **Command:** `node C:/Users/gabri/.gemini/antigravity/scratch/tech-knowledge-graph/mcp-server/index.js`

### 3. No Antigravity / VS Code
Adicione no arquivo de configuração do MCP:

```json
{
  "mcpServers": {
    "tech-knowledge": {
      "command": "node",
      "args": [
        "C:/Users/gabri/.gemini/antigravity/scratch/tech-knowledge-graph/mcp-server/index.js"
      ]
    }
  }
}
```

---

## 🧠 Vetorização e Embeddings

O servidor possui um motor de vetorização integrado em `mcp-server/vector-indexer.js`:

1. **Modo Local (Padrão / 100% Gratuito e Offline):**
   - Usa representação vetorial densa de 256 dimensões com normalização L2 e hash semântico de subpalavras.
   - Não requer chaves de API nem conexão externa.
2. **Modo OpenAI (Opcional):**
   - Se a variável de ambiente `OPENAI_API_KEY` estiver definida, ele utiliza automaticamente o modelo `text-embedding-3-small`.

### Para re-indexar os vetores manualmente:
```bash
node mcp-server/vector-indexer.js
# Ou:
npm run index:vectors
```
