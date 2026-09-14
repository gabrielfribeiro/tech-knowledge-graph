# Arquitetura do Knowledge Graph Agnóstico para Agentes de IA

Este documento descreve a arquitetura técnica da base de conhecimento projetada para ser consultada e mantida primordialmente por **Agentes de IA**, mantendo compatibilidade nativa com visualizadores humanos como **Obsidian** e repositórios **Git**.

---

## 1. Problema de Engenharia

Quando agentes de IA consomem documentação técnica em grafos tradicionais:
- **Sobrecarga de Contexto (Token Bloat):** Documentos monolíticos ou navegação cega de link em link aumentam drasticamente o custo e a latência.
- **Incompatibilidade de Plugins:** Recursos como Dataview do Obsidian executam no runtime do aplicativo desktop; agentes lendo arquivos brutos no disco não enxergam esses resultados dinâmicos.

## 2. A Solução: Tríade de Governança

A solução adota três skills operacionais com responsabilidades isoladas:

```
                  ┌────────────────────────┐
                  │    Entrada de Dados    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   1. Skill de Criação  │ ──► Gera nós atômicos (100-300 tokens)
                  │  (knowledge-creator)   │     com Frontmatter YAML estrito.
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │  2. Skill de Validação │ ──► Linter de integridade referencial,
                  │   (knowledge-linter)   │     validação de schemas e links órfãos.
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ 3. Skill de Governança │ ──► Compila o graph-index.json consolidado
                  │ (knowledge-governance) │     e expõe API de consulta em O(1).
                  └────────────────────────┘
```

## 3. O Conceito de Grafo Compilado (`graph-index.json`)

Para evitar que o agente faça "hopping" (abrir arquivo A -> achar link B -> abrir arquivo B), a Skill de Governança compila um índice estático leve:

```json
{
  "version": "1.0.0",
  "generated_at": "YYYY-MM-DDTHH:mm:ssZ",
  "nodes": {
    "proj-checkout-api": { "type": "project", "title": "Checkout API", "path": "knowledge-base/projects/proj-checkout-api.md" },
    "rule-calculo-estorno": { "type": "rule", "title": "Cálculo de Estorno", "path": "knowledge-base/rules/rule-calculo-estorno.md" },
    "qry-pedidos-pendentes": { "type": "query", "title": "Pedidos Pendentes", "path": "knowledge-base/queries/qry-pedidos-pendentes.md" }
  },
  "edges": [
    { "source": "qry-pedidos-pendentes", "target": "proj-checkout-api", "relation": "belongs_to" },
    { "source": "qry-pedidos-pendentes", "target": "rule-calculo-estorno", "relation": "implements_rule" }
  ]
}
```

### Vantagens:
- **Resolução em 1 Passo:** O agente responde a perguntas de dependência lendo apenas um arquivo de poucos kilobytes.
- **Carregamento Seletivo:** O agente só abre o arquivo `.md` quando precisa ver o conteúdo executável (o SQL da query, os comandos do runbook).
