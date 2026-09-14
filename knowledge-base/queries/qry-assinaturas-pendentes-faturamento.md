---
id: qry-assinaturas-pendentes-faturamento
type: query
title: Busca de Assinaturas Vencendo sem Fatura Gerada
database: postgres-billing
updated_at: 2026-09-14
tags: [sql, auditoria, billing]
belongs_to: "[[proj-billing-engine]]"
implements_rule: "[[rule-cobranca-recorrente]]"
---

# Query: Busca de Assinaturas Vencendo sem Fatura Gerada

## Objetivo
Identifica assinaturas ativas com data de vencimento atingida para as quais ainda não foi emitida fatura no período atual.

## SQL
```sql
SELECT a.id, a.customer_id, a.due_date, a.amount 
FROM subscriptions a 
WHERE a.status = 'ACTIVE' 
  AND a.due_date <= CURRENT_DATE 
  AND NOT EXISTS (
    SELECT 1 FROM invoices i 
    WHERE i.subscription_id = a.id 
      AND i.period_date = CURRENT_DATE
  );
```

## Como Executar / Cuidados
- **Impacto de Performance:** Médio. Utiliza o índice `idx_subscriptions_status_due`.
- **Ações Associadas:** `[[proc-reprocessar-cobranca-falha]]`
