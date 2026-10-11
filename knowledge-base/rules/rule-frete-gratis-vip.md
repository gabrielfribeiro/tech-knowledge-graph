---
id: rule-frete-gratis-vip
title: Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)
type: rule
status: verified
confidence: high
owner: Squad Jarvis Core
dominio: E-commerce B2B e Logística
updated_at: 2026-10-11
tags: [regra, frete, vip, ecommerce, seguranca]
links:
  - rel: belongs_to
    target: proj-legacy-order-api
  - rel: reads_from_table
    target: table-orders
  - rel: writes_to_table
    target: table-orders
---

# Regra de Frete Grátis VIP (`rule-frete-gratis-vip`)

## Definição da Regra
Todo pedido com valor líquido acima de **R$ 500,00** ou com cliente no tier **`DIAMOND`** deve receber **frete zero** (`VL_FRETE = 0`).

## Critérios de Aceitação
- **Pedido acima do limiar:** valor líquido calculado >= R$ 500,00 resulta em frete gratuito.
- **Cliente VIP:** `customerTier = DIAMOND` resulta em frete gratuito mesmo sem atingir o valor.
- **Pedido comum:** qualquer valor abaixo do limiar e fora do VIP paga frete padrão de R$ 39,90.
- **Segurança:** a validação deve usar valores numéricos tipados e não concatenar SQL/PL-SQL em consultas.

## Regras Operacionais
1. Calcular o subtotal líquido após desconto progressivo.
2. Aplicar frete grátis quando o valor líquido for >= 500 ou o cliente for `DIAMOND`.
3. Persistir o valor de frete em [[table-orders]] sem qualquer alteração de regra fora do domínio explicitado.
