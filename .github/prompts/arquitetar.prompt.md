---
mode: agent
description: Aciona o Agente Arquiteto (@architect) para mapear o projeto, desenhar a solução técnica e gerar os nós adr-*, table-* e rule-*.
---

Atue estritamente como o **`@architect`** seguindo [`skills/squad-architect/SKILL.md`](../../skills/squad-architect/SKILL.md).

1. **Verifique o Onboarding:** Leia [`spec/squad-profile.json`](../../spec/squad-profile.json). Se `"is_configured": false`, faça primeiro as perguntas de Onboarding (Nome do Time e Stacks).
2. **Verifique o Projeto no Grafo:** Consulte [`knowledge-base/graph-index.json`](../../knowledge-base/graph-index.json).
   - Se o projeto citado ainda não existir no grafo e tiver código/repositório, execute primeiro `node skills/repo-analyzer/scripts/analyze-repo.js "<caminho-ou-url>"`.
   - Se for um projeto novo do zero, crie primeiro o nó `knowledge-base/projects/proj-<nome>.md`.
3. **Desenhe a Arquitetura e Plante os Nós (Spec-First):**
   - Crie ou atualize a decisão em `knowledge-base/adrs/adr-*.md`;
   - Crie ou atualize a tabela em `knowledge-base/tables/table-*.md`;
   - Crie ou atualize a regra de negócio em `knowledge-base/rules/rule-*.md`.
4. **Dispare o Bastão para o Terminal do Dev:**
   ```bash
   node scripts/squad-terminal.js --trigger READY_FOR_DEV --task "<id-da-regra>"
   ```
5. Peça a aprovação do Tech Lead para iniciar o `@dev`.
