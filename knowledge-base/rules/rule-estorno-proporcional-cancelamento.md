---
id: rule-estorno-proporcional-cancelamento
title: Regra de Estorno Proporcional (Pro-Rata) em Cancelamento de Assinatura
type: rule
status: verified
confidence: high
owner: Squad Jarvis Core
dominio: Faturamento e Assinaturas
updated_at: 2026-10-10
tags: [regra, billing, estorno, pro-rata, cdc]
links:
  - rel: belongs_to
    target: proj-billing-engine
  - rel: reads_from_table
    target: table-subscriptions
  - rel: writes_to_table
    target: table-invoices
  - rel: references
    target: adr-001-cobranca-assincrona-com-filas
---

# Regra de Estorno Proporcional em Cancelamento (`rule-estorno-proporcional-cancelamento`)

## Definição da Regra
No [[proj-billing-engine]], quando um assinante solicita cancelamento de plano ativo na [[table-subscriptions]], o sistema deve calcular o reembolso ou crédito nas faturas da [[table-invoices]]:

## Critérios de Aceite e Casos de Borda (Para `@dev` e `@qa` Cypress/Xray)
1. **Arrependimento CDC (Até 7 dias corridos da contratação):** Estorno integral de **100%** do valor pago na última fatura (`ST_INVOICE = 'REFUNDED_FULL'`).
2. **Cancelamento Após 7 Dias (Pro-Rata):** Calcular dias restantes no ciclo de 30 dias (`VL_ESTORNO = (VL_PLANO / 30) * DIAS_RESTANTES` com arredondamento financeiro de 2 casas decimais) e publicar comando de estorno na fila conforme [[adr-001-cobranca-assincrona-com-filas]].
3. **Assinatura já Inadimplente (`PAST_DUE` ou `SUSPENDED`):** Cancelar assinatura imediatamente sem gerar crédito de estorno (`VL_ESTORNO = 0`).
