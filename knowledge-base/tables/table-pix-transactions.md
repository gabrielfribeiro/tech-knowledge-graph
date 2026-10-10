---
id: table-pix-transactions
title: Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)
type: table
status: verified
confidence: high
owner: Squad Jarvis Core
service_owner: proj-pix-settlement
updated_at: 2026-10-10
tags: [tabela, oracle, pix, lgpd, pii]
database: Oracle Database
schema: PIX_CORE
links:
  - rel: belongs_to
    target: proj-pix-settlement
  - rel: references
    target: rule-limite-pix-noturno
  - rel: references
    target: adr-002-idempotencia-liquidacao-pix
---

# Tabela `TB_PIX_TRANSACTIONS` (`table-pix-transactions`)

## Finalidade
Armazena todas as transações PIX iniciadas ou recebidas pelo [[proj-pix-settlement]], incluindo chave de idempotência `END_TO_END_ID`, status de liquidação e classificação LGPD.

## Colunas Principais
| Coluna | Tipo (Oracle) | Nulo? | LGPD / PII | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `ID_PIX_TX` | `RAW(16) PK` | `NOT NULL` | Não | Identificador interno da transação |
| `CD_END_TO_END_ID` | `VARCHAR2(32) UNIQUE` | `NOT NULL` | Não | Identificador único Bacen (`UK_PIX_END_TO_END_ID`) |
| `NR_CPF_PAGADOR` | `VARCHAR2(11)` | `NOT NULL` | **SIM (PII - Mascarar em logs)** | CPF do titular pagador |
| `CD_CHAVE_PIX_DESTINO` | `VARCHAR2(77)` | `NOT NULL` | **SIM (PII - Mascarar em logs)** | Chave PIX do recebedor |
| `VL_TRANSACAO` | `NUMBER(15,2)` | `NOT NULL` | Não | Valor em reais da transação |
| `ST_LIQUIDACAO` | `VARCHAR2(20)` | `NOT NULL` | Não | `PENDING`, `SETTLED`, `BLOCKED_NIGHT_LIMIT`, `MED_FROZEN` |
| `DT_CRIACAO` | `TIMESTAMP` | `NOT NULL` | Não | Data/hora exata da solicitação |
