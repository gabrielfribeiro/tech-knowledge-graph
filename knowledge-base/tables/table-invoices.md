---
id: table-invoices
type: table
title: Tabela de Faturas (invoices)
database: postgres-billing
schema: public
service_owner: "[[proj-billing-engine]]"
primary_key: id
foreign_keys:
  - column: subscription_id
    references_table: "[[table-subscriptions]]"
    references_column: id
indexes:
  - idx_invoices_subscription_period (subscription_id, period_date)
retention: permanente
updated_at: 2026-10-09
tags: [database, table, billing, postgres]
---

# Tabela: Faturas (`invoices`)

## Descrição e Domínio
Registra cada emissão de cobrança gerada para uma assinatura em um ciclo determinado. Controla as tentativas de débito e o status do pagamento.

## Dicionário de Dados
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Sim | Identificador único da fatura (PK). |
| `subscription_id` | UUID | Sim | Chave estrangeira referenciando `[[table-subscriptions]]`. |
| `period_date` | DATE | Sim | Data base do ciclo faturado. |
| `amount` | NUMERIC(12,2) | Sim | Valor cobrado na fatura. |
| `status` | VARCHAR(30) | Sim | Estado da fatura: `PENDING`, `PAID`, `FAILED`. |
| `attempt_count` | INT | Sim | Quantidade de tentativas de débito realizadas (máx 3). |

## Relações e Integridade
- **Microsserviço Proprietário:** `[[proj-billing-engine]]`
- **Chave Estrangeira:** `subscription_id` aponta para `[[table-subscriptions]]`.
- **Regra de Negócio:** `[[rule-cobranca-recorrente]]`
- **Consultas Críticas:** `[[qry-assinaturas-pendentes-faturamento]]`
