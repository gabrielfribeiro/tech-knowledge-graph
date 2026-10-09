---
id: adr-001-cobranca-assincrona-com-filas
type: adr
title: "ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS"
status: accepted
date: 2026-09-14
deciders:
  - "Staff Architect"
  - "Tech Lead Monetização"
updated_at: 2026-10-09
tags: [adr, arquitetura, billing, sqs, resiliencia]
affects_projects:
  - "[[proj-billing-engine]]"
  - "[[proj-payment-gateway]]"
---

# ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS

## Contexto e Desafio
O processamento síncrono de faturas em lote causava timeouts severos de banco de dados e lentidão nas respostas das adquirentes durante o pico das 08h00. Quando uma adquirente apresentava oscilação, todo o lote ficava bloqueado, gerando faturas presas em estado indeterminado.

## Decisão Tomada
Adotamos o desacoplamento assíncrono via fila AWS SQS (`billing-events`). 
1. O faturamento diário identifica as faturas pendentes na `[[table-subscriptions]]` e posta mensagens individuais na fila.
2. Workers assíncronos consomem cada mensagem e chamam o `[[proj-payment-gateway]]`.
3. Em caso de falha transitória, a mensagem vai para DLQ e pode ser reprocessada pelo `[[proc-reprocessar-cobranca-falha]]`.

## Consequências e Trade-offs
- **Positivas:**
  - Isolamento de falhas por fatura individual (falha em um cliente não atrasa os demais).
  - Controle de taxa de requisições (rate limiting) suave para o gateway.
  - Resiliência operacional através de DLQ e runbook de reprocessamento.
- **Negativas / Atenção:**
  - Consistência eventual: o status da `[[table-invoices]]` pode demorar alguns segundos para refletir `PAID`.
  - Necessidade de idempotência no consumidor com deduplicação de mensagens.

## Componentes Afetados
- **Serviços:** `[[proj-billing-engine]]`, `[[proj-payment-gateway]]`
- **Tabelas:** `[[table-subscriptions]]`, `[[table-invoices]]`
- **Regras e Processos:** `[[rule-cobranca-recorrente]]`, `[[proc-reprocessar-cobranca-falha]]`
