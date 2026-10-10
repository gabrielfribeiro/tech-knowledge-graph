# [CONSULTA SQL / AUDITORIA] Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)

> **ID Técnico:** `qry-consulta-limites-noturnos-pix` | **Atualizado em:** 2026-10-10

## 📋 Metadados de Contexto
- **Banco de Dados:** Oracle Database
- **Status da Decisão:** VERIFIED
- **Tags:** query, oracle, pix, limite-noturno

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`)
- **[REFERENCES]** Aponta para o RULE: **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`)

### Componentes que Dependem ou Utilizam Este Nó:
- O RULE **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# Query de Apuração do Acumulado PIX Noturno (`qry-consulta-limites-noturnos-pix`)

## Objetivo
Consultar na **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`) o somatório de transações PIX liquidadas (`SETTLED`) pelo CPF pagador dentro da janela noturna atual para validar a **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`).

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

