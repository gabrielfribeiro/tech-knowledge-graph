---
id: adr-002-idempotencia-liquidacao-pix
title: ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle
type: adr
status: accepted
confidence: high
owner: Squad Jarvis Core
deciders: [Gabriel, Squad Jarvis Core]
updated_at: 2026-10-10
tags: [adr, pix, idempotencia, redis, oracle]
links:
  - rel: decides_on
    target: proj-pix-settlement
  - rel: references
    target: table-pix-transactions
  - rel: references
    target: rule-limite-pix-noturno
---

# ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle

## Contexto
Transações PIX no [[proj-pix-settlement]] sofrem retentativas de rede do aplicativo mobile e webhooks duplicados do SPI/Bacen. Sem idempotência estrita, ocorreria débito duplicado na conta do cliente.

## Decisão
1. Todo request de pagamento exige o header `X-Idempotency-Key` (UUID v4) que gera o `EndToEndId` (padrão Bacen de 32 caracteres).
2. Lock distribuído no Redis (`SET NX EX 60`) antes de iniciar a validação de [[rule-limite-pix-noturno]].
3. Garantia final no banco via índice único `UK_PIX_END_TO_END_ID` na tabela [[table-pix-transactions]].

## Consequências
- **Positivas:** Zero duplicidade de débito mesmo sob falha de rede ou concorrência alta.
- **Negativas:** Latência adicional de ~2ms para validação da chave no Redis.
