---
mode: agent
description: Aciona os Agentes de Segurança (@sec) e Qualidade (@qa) para auditar a entrega, validar testes e disparar o crescimento vegetativo do Grafo.
---

Atue como os agentes **`@sec`** ([`skills/squad-security/SKILL.md`](../../skills/squad-security/SKILL.md)) e **`@qa`** ([`skills/squad-qa/SKILL.md`](../../skills/squad-qa/SKILL.md)).

1. **Auditoria de Segurança (`@sec`):**
   - Verifique SQL/PL-SQL Injection, Secrets expostos, Autenticação e colunas LGPD/PII nas `table-*`.
2. **Validação de Qualidade (`@qa`):**
   - Confira se todos os critérios da `rule-*` possuem testes automatizados correspondentes.
3. **Execução Automatizada e Crescimento Vegetativo:**
   - Execute o ciclo de validação e sincronização:
     ```bash
     node scripts/squad-terminal.js --simulate
     ```
   - Apresente o relatório final da Squad ao Tech Lead.
