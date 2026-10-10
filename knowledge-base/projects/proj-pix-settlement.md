---
id: proj-pix-settlement
title: Motor de Liquidação Instantânea PIX & Anti-Fraude
type: project
status: verified
confidence: high
owner: Squad Jarvis Core
responsavel: Squad Jarvis Core
updated_at: 2026-10-10
tags: [pix, bacen, pagamentos, antifraude, dotnet, oracle]
stack: [.NET 8, React, Oracle Database, RabbitMQ, Redis]
repository: https://github.com/empresa/pix-settlement-service
links:
  - rel: depends_on
    target: proj-billing-engine
  - rel: owns_table
    target: table-pix-transactions
  - rel: implements_rule
    target: rule-limite-pix-noturno
  - rel: references
    target: adr-002-idempotencia-liquidacao-pix
  - rel: references
    target: proc-bloqueio-cautelar-med
---

# Motor de Liquidação Instantânea PIX & Anti-Fraude (`proj-pix-settlement`)

## Visão Geral e Responsabilidade
Serviço crítico responsável por validar, autorizar e liquidar transações PIX 24x7 junto ao SPI (Sistema de Pagamentos Instantâneos do Banco Central), aplicando validações de limite noturno e prevenção a fraudes (MED).

## Arquitetura e Integrações
- **Backend:** `.NET 8 (C#)` em Clean Architecture + CQRS.
- **Persistência:** [[table-pix-transactions]] em `Oracle Database` com acesso via `Dapper`.
- **Idempotência:** Controlada via `Redis` + Unique Constraint conforme [[adr-002-idempotencia-liquidacao-pix]].
- **Regras Críticas:** Aplica [[rule-limite-pix-noturno]] e aciona [[proc-bloqueio-cautelar-med]] em suspeitas de fraude.
