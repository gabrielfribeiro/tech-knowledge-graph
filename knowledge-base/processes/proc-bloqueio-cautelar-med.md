---
id: proc-bloqueio-cautelar-med
title: Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)
type: process
status: verified
confidence: high
owner: Squad Jarvis Core
updated_at: 2026-10-10
tags: [processo, runbook, pix, med, antifraude]
links:
  - rel: recovers_service
    target: proj-pix-settlement
  - rel: references
    target: rule-limite-pix-noturno
  - rel: references
    target: table-pix-transactions
---

# Runbook de Bloqueio Cautelar e Devolução PIX (`proc-bloqueio-cautelar-med`)

## Gatilho Operacional
Acionado quando o [[proj-pix-settlement]] recebe notificação de infração do DICT/Bacen ou detecta anomalia severa na [[rule-limite-pix-noturno]].

## Passo a Passo de Execução
1. Atualizar `ST_LIQUIDACAO = 'MED_FROZEN'` na [[table-pix-transactions]] para o `CD_END_TO_END_ID` reportado (bloqueio cautelar de até 72h).
2. Notificar o motor de faturamento e compliance sem expor `NR_CPF_PAGADOR` em texto aberto nos canais de log.
3. Caso a fraude seja confirmada em até 72h, efetivar a devolução integral ao pagador original via código de devolução `MD06` (SPI).
