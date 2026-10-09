---
id: table-subscriptions
type: table
title: Tabela de Assinaturas (subscriptions)
database: postgres-billing
schema: public
service_owner: "[[proj-billing-engine]]"
primary_key: id
indexes:
  - idx_subscriptions_status_due (status, due_date)
  - idx_subscriptions_customer (customer_id)
retention: permanente
updated_at: 2026-10-09
tags: [database, table, billing, postgres]
---

# Tabela: Assinaturas (`subscriptions`)

## Descrição e Domínio
Tabela central de contratos de recorrência do cliente. Armazena o plano contratado, ciclo de cobrança, datas de vencimento e status da assinatura.

## Dicionário de Dados
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Sim | Identificador único da assinatura (PK). |
| `customer_id` | UUID | Sim | Identificador do cliente pagador. |
| `status` | VARCHAR(30) | Sim | Estado da assinatura: `ACTIVE`, `SUSPENDED`, `CANCELLED`. |
| `due_date` | DATE | Sim | Data de vencimento do ciclo corrente. |
| `amount` | NUMERIC(12,2) | Sim | Valor monetário nominal cobrado por ciclo. |
| `created_at` | TIMESTAMP | Sim | Data e hora de criação do contrato. |
| `updated_at` | TIMESTAMP | Sim | Data e hora da última alteração de estado. |

## Índices e Performance
- **Primary Key:** `id`
- **Índice Composto de Faturamento:** `idx_subscriptions_status_due` nas colunas `(status, due_date)`. Otimizado para varredura diária de faturamento.

## Relações e Integridade
- **Microsserviço Proprietário:** `[[proj-billing-engine]]`
- **Regra de Negócio:** `[[rule-cobranca-recorrente]]`
- **Consultas Críticas:** `[[qry-assinaturas-pendentes-faturamento]]`
