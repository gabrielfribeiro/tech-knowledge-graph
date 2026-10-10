---
id: rule-limite-pix-noturno
title: Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude
type: rule
status: verified
confidence: high
owner: Squad Jarvis Core
dominio: Pagamentos Instantâneos (PIX)
updated_at: 2026-10-10
tags: [regra, pix, bacen, limite-noturno, seguranca]
links:
  - rel: belongs_to
    target: proj-pix-settlement
  - rel: reads_from_table
    target: table-pix-transactions
  - rel: writes_to_table
    target: table-pix-transactions
  - rel: references
    target: qry-consulta-limites-noturnos-pix
  - rel: references
    target: proc-bloqueio-cautelar-med
---

# Regra de Limite PIX Noturno (`rule-limite-pix-noturno`)

## Definição da Regra ( Normativo Bacen )
No serviço [[proj-pix-settlement]], toda transação PIX realizada no período noturno (entre **20:00 e 05:59 BRT**) possui limite acumulado máximo de **R$ 1.000,00** por CPF (`NR_CPF_PAGADOR`), salvo se o cliente tiver optado previamente por horário customizado com carência de 24h.

## Critérios de Aceite e Casos de Borda (Para `@dev` e `@qa` Cypress/Xray)
1. **Transação Diurna (06:00 às 19:59):** Permitir valores até o limite diurno da conta (ex: R$ 10.000,00), gravando `ST_LIQUIDACAO = 'SETTLED'` na [[table-pix-transactions]].
2. **Transação Noturna Dentro do Limite (<= R$ 1.000,00 acumulados na noite):** Aprovar transação (`ST_LIQUIDACAO = 'SETTLED'`).
3. **Transação Noturna Acima de R$ 1.000,00 (isolada ou somada a outras da mesma noite via [[qry-consulta-limites-noturnos-pix]]):** Recusar com HTTP `422 Unprocessable Entity` (`PIX_NIGHT_LIMIT_EXCEEDED`) e gravar `ST_LIQUIDACAO = 'BLOCKED_NIGHT_LIMIT'`.
4. **Conta Destino com Alerta de Fraude:** Bloquear imediatamente (`ST_LIQUIDACAO = 'MED_FROZEN'`) e acionar [[proc-bloqueio-cautelar-med]].
