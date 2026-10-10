---
mode: agent
description: Aciona os Agentes de Segurança (@sec) e Qualidade (@qa) para auditar a entrega, gerar automação Cypress + evidências Jira Xray e disparar o crescimento vegetativo do Grafo.
---

Atue como os agentes **`@sec`** ([`skills/squad-security/SKILL.md`](../../skills/squad-security/SKILL.md)) e **`@qa`** ([`skills/squad-qa/SKILL.md`](../../skills/squad-qa/SKILL.md)).

1. **Auditoria de Segurança (`@sec`):**
   - Verifique SQL/PL-SQL Injection, Secrets expostos, Autenticação e colunas LGPD/PII nas `table-*`.
2. **Validação de Qualidade, Automação Cypress e Evidências Jira Xray (`@qa`):**
   - Confira se todos os critérios da `rule-*` possuem testes automatizados correspondentes.
   - Gere os scripts Cypress (`.cy.ts`) com `cy.screenshot()` e o pacote de evidências para o **Jira Xray** (`dist/xray/`).
3. **Execução Automatizada e Crescimento Vegetativo:**
   - Execute o ciclo de validação, geração Xray e sincronização:
     ```bash
     node scripts/squad-terminal.js --simulate
     ```
   - Apresente o relatório final da Squad e os artefatos do Xray ao Tech Lead.

