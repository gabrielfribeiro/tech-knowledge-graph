---
id: proj-legacy-order-api
title: Legacy Order & Freight API
type: project
status: verified
confidence: high
owner: Squad Jarvis Core
responsavel: Squad Jarvis Core
updated_at: 2026-10-11
tags: [legacy, ecommerce, pedidos, frete, dotnet, oracle]
stack: [.NET 8, Dapper, Oracle Database, RabbitMQ]
repository: ./examples/legacy-order-api
links:
  - rel: owns_table
    target: table-orders
  - rel: implements_rule
    target: rule-frete-gratis-vip
---

# Legacy Order & Freight API (`proj-legacy-order-api`)

## Visão Geral
Sistema legado de fechamento de pedidos e cálculo de frete para e-commerce B2B.

## Responsabilidades
- Registrar pedidos e calcular subtotal, desconto e frete.
- Aplicar a regra de frete grátis para clientes VIP e pedidos acima de R$ 500,00.
- Publicar eventos de confirmação do pedido em fila interna de integração.

## Arquitetura e Integrações
- **Backend:** `.NET 8 (C#)` com `Dapper`.
- **Persistência:** [[table-orders]] no Oracle Database.
- **Regra crítica:** [[rule-frete-gratis-vip]].
- **Mensageria:** RabbitMQ para `OrderConfirmedEvent`.
