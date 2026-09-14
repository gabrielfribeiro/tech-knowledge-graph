---
id: proj-billing-engine
type: project
title: Motor de Cobrança (Billing Engine)
responsavel: Squad Monetização
repositorio: https://github.com/empresa/billing-engine
updated_at: 2026-09-14
tags: [backend, golang, financeiro, billing]
depends_on:
  - "[[proj-payment-gateway]]"
---

# Motor de Cobrança (Billing Engine)

## Finalidade
Serviço responsável por orquestrar o ciclo de faturamento recorrente (mensal e anual) dos clientes e transacionar cobranças via adquirentes.

## Tecnologias e Infra
- **Linguagem / Framework:** Go / Echo
- **Banco de Dados:** PostgreSQL (RDS Postgres Billing)
- **Mensageria:** SQS (Fila `billing-events`)

## Pontos de Entrada Críticos
- `POST /internal/v1/billing/retry`: Endpoint operacional para reprocessamento de faturas em lote.
