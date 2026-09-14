---
id: rule-cobranca-recorrente
type: rule
title: Regra de Cobrança Recorrente e Tentativas
dominio: Monetização e Faturamento
updated_at: 2026-09-14
tags: [regras, financeiro, assinaturas]
related_projects:
  - "[[proj-billing-engine]]"
---

# Regra: Cobrança Recorrente e Tentativas

## Definição
Define as janelas de disparo de cobrança e a política de retentativas para assinaturas de clientes.

## Critérios de Aplicação
- O faturamento é disparado automaticamente **3 dias antes do vencimento**.
- Em caso de falha de cobrança na adquirente, são executadas até **3 tentativas automáticas com intervalo de 24 horas**.
- Esgotadas as tentativas sem sucesso, o status da assinatura transiciona para `INADIMPLENTE`.

## Referências
- Implementado em: `[[proj-billing-engine]]`
