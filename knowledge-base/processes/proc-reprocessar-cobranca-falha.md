---
id: proc-reprocessar-cobranca-falha
type: process
title: Reprocessamento Manual de Cobranças Pendentes
updated_at: 2026-09-14
tags: [runbook, suporte, incidente]
related_projects:
  - "[[proj-billing-engine]]"
---

# Processo: Reprocessamento Manual de Cobranças Pendentes

## Quando Acionar
Utilizado quando ocorre instabilidade na mensageria ou webhooks e assinaturas ativas deixam de gerar faturas no dia previsto.

## Pré-requisitos
- Acesso de leitura ao banco `postgres-billing` (réplica ou produção).
- Acesso à VPN interna para chamar endpoints administrativos.

## Passo a Passo
1. Executar a query `[[qry-assinaturas-pendentes-faturamento]]` e exportar o resultado com a lista de IDs.
2. Formatar os IDs em JSON array (`{"subscription_ids": ["uuid-1", "uuid-2"]}`).
3. Disparar a chamada de retry no endpoint do `[[proj-billing-engine]]`:
   ```bash
   curl -X POST https://billing.empresa.internal/internal/v1/billing/retry \
     -H "Content-Type: application/json" \
     -d @payload.json
   ```
4. Acompanhar a fila no Datadog/CloudWatch para confirmar a emissão.
