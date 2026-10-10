---
id: qry-consulta-limites-noturnos-pix
title: Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)
type: query
status: verified
confidence: high
owner: Squad Jarvis Core
belongs_to: proj-pix-settlement
updated_at: 2026-10-10
tags: [query, oracle, pix, limite-noturno]
database: Oracle Database
links:
  - rel: belongs_to
    target: proj-pix-settlement
  - rel: reads_from_table
    target: table-pix-transactions
  - rel: references
    target: rule-limite-pix-noturno
---

# Query de Apuração do Acumulado PIX Noturno (`qry-consulta-limites-noturnos-pix`)

## Objetivo
Consultar na [[table-pix-transactions]] o somatório de transações PIX liquidadas (`SETTLED`) pelo CPF pagador dentro da janela noturna atual para validar a [[rule-limite-pix-noturno]].

## SQL Parametrizado (Oracle / Dapper - Bind Variables Obrigatórias)
```sql
SELECT
    NVL(SUM(t.VL_TRANSACAO), 0) AS VL_ACUMULADO_NOITE,
    COUNT(1)                    AS QTD_TRANSACOES_NOITE
FROM PIX_CORE.TB_PIX_TRANSACTIONS t
WHERE t.NR_CPF_PAGADOR = :p_cpf_pagador
  AND t.ST_LIQUIDACAO  = 'SETTLED'
  AND t.DT_CRIACAO    >= :p_inicio_janela_noturna
  AND t.DT_CRIACAO    <= :p_fim_janela_noturna;
```
