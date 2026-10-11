# [SERVIÇO / MICROSSERVIÇO] Legacy Order & Freight API

> **ID Técnico:** `proj-legacy-order-api` | **Atualizado em:** 2026-10-11

## 📋 Metadados de Contexto
- **Squad / Responsável:** Squad Jarvis Core
- **Status da Decisão:** VERIFIED
- **Tags:** legacy, ecommerce, pedidos, frete, dotnet, oracle

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[OWNS_TABLE]** Aponta para o TABLE: **Tabela TB_ORDERS (Pedidos e Frete)** (`table-orders`)
- **[IMPLEMENTS_RULE]** Aponta para o RULE: **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** (`rule-frete-gratis-vip`)

### Componentes que Dependem ou Utilizam Este Nó:
- O RULE **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** (`rule-frete-gratis-vip`) conecta via **BELONGS_TO**
- O TABLE **Tabela TB_ORDERS (Pedidos e Frete)** (`table-orders`) conecta via **BELONGS_TO**

## 📖 Conteúdo e Especificação Técnica

# Legacy Order & Freight API (`proj-legacy-order-api`)

## Visão Geral
Sistema legado de fechamento de pedidos e cálculo de frete para e-commerce B2B.

## Responsabilidades
- Registrar pedidos e calcular subtotal, desconto e frete.
- Aplicar a regra de frete grátis para clientes VIP e pedidos acima de R$ 500,00.
- Publicar eventos de confirmação do pedido em fila interna de integração.

## Arquitetura e Integrações
- **Backend:** `.NET 8 (C#)` com `Dapper`.
- **Persistência:** **Tabela TB_ORDERS (Pedidos e Frete)** (`table-orders`) no Oracle Database.
- **Regra crítica:** **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** (`rule-frete-gratis-vip`).
- **Mensageria:** RabbitMQ para `OrderConfirmedEvent`.

