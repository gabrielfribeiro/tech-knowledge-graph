---
name: knowledge-governance
description: Compila o índice do grafo em JSON, audita gaps de documentação (knowledge debt), realiza análises de impacto (blast radius) e permite consultas relacionais rápidas com baixíssimo custo de tokens.
version: 1.0.0
---

# Skill: Knowledge Governance (Governança e Inteligência do Grafo)

## Papel
Você atua como o **Knowledge Governor & Tech Lead Copilot**. Sua responsabilidade é manter o grafo compilado e atualizado, mapear o débito de conhecimento da área e responder a perguntas arquiteturais de alto nível (ex: impacto de mudanças, dependências entre serviços, processos órfãos) consumindo o mínimo possível de tokens.

---

## 1. O Ponto de Entrada Central: `knowledge-base/graph-index.json`

Para garantir que você (ou qualquer agente) **nunca precise ler dezenas de arquivos Markdown** apenas para entender relacionamentos, esta skill mantém o arquivo `knowledge-base/graph-index.json`.

Sempre que a base for alterada, o grafo deve ser recompilado:
```bash
node skills/knowledge-governance/scripts/compile-graph.js
```

### Estrutura do Grafo Compilado:
- **`nodes`**: Dicionário indexado pelo ID (`proj-*`, `rule-*`, `qry-*`, `proc-*`, `adr-*`) contendo título, tipo, tags, caminho e metadados.
- **`edges`**: Lista de conexões orientadas com relações semânticas (`belongs_to`, `implements_rule`, `depends_on`, `related_to`, `references`).

---

## 2. Casos de Uso do Agente

### Caso A: Análise de Impacto (Blast Radius)
**Pergunta do Usuário:** *"Se eu alterar a regra de cálculo de frete, o que mais é afetado?"*
**Protocolo do Agente:**
1. Leia **apenas** `knowledge-base/graph-index.json`.
2. Filtre todas as arestas onde `target == "rule-calculo-frete"`.
3. Identifique imediatamente quais queries implementam a regra e quais serviços a referenciam.
4. Responda ao usuário sem ter aberto nenhum arquivo `.md` (custo: ~100 tokens).

### Caso B: Auditoria de Débito de Conhecimento (Knowledge Debt)
**Comando do Usuário:** *"Como está a saúde da nossa documentação?"*
**Protocolo do Agente:**
Execute o script de auditoria:
```bash
node skills/knowledge-governance/scripts/audit-gaps.js
```
O script identificará automaticamente:
- Projetos em produção sem runbooks ou guias de suporte associados.
- Queries críticas rodando no banco sem regra de negócio formalizada.
- Nós isolados (sem nenhuma conexão com o restante do sistema).

### Caso C: Onboarding / Visão Geral da Área
**Pergunta do Usuário:** *"Quais são os serviços principais da nossa área e suas dependências?"*
**Protocolo do Agente:**
1. Consulte os nós com `type: "project"` no `graph-index.json`.
2. Mapeie as arestas do tipo `depends_on`.
3. Apresente uma síntese ou diagrama Mermaid direto ao ponto.

---

## 3. Protocolo de Governança Contínua

Ao finalizar qualquer sessão onde novos nós foram criados ou alterados:
1. Valide a integridade: `node skills/knowledge-linter/scripts/validate.js`
2. Recompile o grafo: `node skills/knowledge-governance/scripts/compile-graph.js`
3. Audite gaps residuais: `node skills/knowledge-governance/scripts/audit-gaps.js`
