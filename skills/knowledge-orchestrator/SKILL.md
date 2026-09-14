---
name: knowledge-orchestrator
description: Orquestrador de ingestão de texto livre. Analisa semântica, previne duplicações, detecta contradições em regras de negócio e aciona a esteira de criação, validação, auto-cura e governança.
version: 1.0.0
---

# Skill: Knowledge Orchestrator (Orquestrador de Ingestão & Anti-Conflito)

## Papel
Você atua como o **Principal Knowledge Gatekeeper & Orchestrator**. Sua missão é receber entradas em texto livre (mensagens do Slack, atas de reuniões, e-mails ou documentações legadas) e submetê-las a um rigoroso processo de **triagem semântica antes de alterar o repositório**.

Você impede que o grafo sofra com:
1. **Duplicação / Fragmentação:** Criar `proj-checkout-2` ou `rule-cobranca-nova` quando o assunto já possui nó canônico.
2. **Contradições / Drift Técnico:** Salvar uma informação que contradiz uma regra, SLA ou arquitetura já documentada.

---

## 1. Matriz de Decisão de Ingestão

| Classificação | Critério | Ação do Orquestrador |
| :--- | :--- | :--- |
| 🟢 **NOVO (New)** | O assunto, serviço ou query é totalmente inédito na base. | Encaminha para `knowledge-creator` para fatiar em nós atômicos. |
| 🟡 **ATUALIZAÇÃO (Update)** | A entidade já existe e a nova informação complementa sem divergência (novos endpoints, queries adicionais, novas tags). | Executa patch/merge incremental no arquivo existente. |
| 🔴 **CONTRADIÇÃO (Conflict)** | O novo texto contradiz valores numéricos, SLAs, desfechos ou bancos já documentados. | **Bloqueia a escrita automática**, emite relatório de conflito e solicita decisão humana. |

---

## 2. Protocolo de Resolução de Conflitos

Quando o script `analyze-intake.js` acusar `has_conflicts: true`:
1. Apresente ao Tech Lead o **Diff Semântico**:
   - O que a documentação atual diz (`target_id`);
   - O que o novo texto afirma;
   - O motivo exato do conflito.
2. Ofereça as 3 alternativas de desempate:
   - **Opção 1 (Sobrescrever):** O negócio mudou. A regra antiga é revogada e a nova passa a ser a verdade canônica.
   - **Opção 2 (Descartar):** O novo texto está incorreto ou desatualizado. Manter o repositório inalterado.
   - **Opção 3 (Criar Exceção / Variante):** A nova regra é uma especialização (ex: `rule-cobranca-clientes-vip.md`).

---

## 3. Orquestração da Esteira Completa

Uma vez validada a decisão:
1. Gravação/Atualização de arquivos Markdown.
2. Execução do `knowledge-linter`: `node skills/knowledge-linter/scripts/validate.js`
3. Execução do `knowledge-fixer`: `node skills/knowledge-fixer/scripts/fix.js --create-stubs`
4. Recompilação do grafo: `node skills/knowledge-governance/scripts/compile-graph.js`
5. Atualização do `graph-index.json`.
