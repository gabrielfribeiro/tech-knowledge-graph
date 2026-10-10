# Legacy Order & Freight API (`legacy-order-api`)

Serviço responsável pelo fechamento de pedidos e cálculo de frete/desconto progressivo no e-commerce B2B.

## Stack
- **.NET 8 (C#)** + **Dapper**
- **Oracle Database** (`TB_ORDERS`, `TB_ORDER_ITEMS`)
- **RabbitMQ** (Publicação do evento `OrderConfirmedEvent`)

## Regras de Negócio Principais
1. **Frete Grátis VIP (`FREIGHT_VIP_RULE`):** Pedidos acima de R$ 500,00 ou de clientes com tier `DIAMOND` têm frete zero (`VL_FRETE = 0`).
2. **Desconto Progressivo Atacado:** Compras com mais de 10 unidades do mesmo SKU recebem 12% de desconto automático no item.
3. **Bloqueio de Inadimplência:** Clientes com faturas vencidas há mais de 15 dias não podem finalizar novos pedidos a prazo (apenas PIX à vista).
