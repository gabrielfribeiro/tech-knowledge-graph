---
id: table-orders
title: Tabela TB_ORDERS (Pedidos e Frete)
type: table
status: verified
confidence: high
owner: Squad Jarvis Core
service_owner: proj-legacy-order-api
updated_at: 2026-10-11
tags: [tabela, oracle, pedidos, frete, lgpd]
database: Oracle Database
schema: ORDER_CORE
links:
  - rel: belongs_to
    target: proj-legacy-order-api
  - rel: references
    target: rule-frete-gratis-vip
---

# Tabela `TB_ORDERS` (`table-orders`)

## Finalidade
Armazena os pedidos fechados, incluindo subtotal, descontos, frete e status do processamento.

## Colunas principais
| Coluna | Tipo (Oracle) | Nulo? | LGPD / PII | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `ID_ORDER` | `VARCHAR2(64) PK` | `NOT NULL` | Não | Identificador do pedido |
| `ID_CUSTOMER` | `VARCHAR2(64)` | `NOT NULL` | **SIM (PII - mascarar em logs)** | Código do cliente |
| `VL_SUBTOTAL` | `NUMBER(15,2)` | `NOT NULL` | Não | Valor bruto sem frete |
| `VL_DESCONTO` | `NUMBER(15,2)` | `NOT NULL` | Não | Desconto aplicado |
| `VL_FRETE` | `NUMBER(15,2)` | `NOT NULL` | Não | Valor do frete calculado |
| `VL_TOTAL` | `NUMBER(15,2)` | `NOT NULL` | Não | Total final |
| `TP_PAGAMENTO` | `VARCHAR2(30)` | `NOT NULL` | Não | `PIX`, `BOLETO_PRAZO`, etc. |
| `ST_ORDER` | `VARCHAR2(30)` | `NOT NULL` | Não | Status do pedido |
| `DT_CRIACAO` | `TIMESTAMP` | `NOT NULL` | Não | Data de criação |

## Observações
- A regra de frete grátis está diretamente vinculada a esta tabela por meio de [[rule-frete-gratis-vip]].
- Registros sensíveis devem ser mascarados em logs e coletados apenas na camada apropriada.
