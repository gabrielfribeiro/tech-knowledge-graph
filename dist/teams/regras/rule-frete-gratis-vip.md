# [REGRA DE NEGÓCIO] Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)

> **ID Técnico:** `rule-frete-gratis-vip` | **Atualizado em:** 2026-10-11

## 📋 Metadados de Contexto
- **Domínio de Negócio:** E-commerce B2B e Logística
- **Status da Decisão:** VERIFIED
- **Tags:** regra, frete, vip, ecommerce, seguranca

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Legacy Order & Freight API** (`proj-legacy-order-api`)
- **[READS_FROM_TABLE]** Aponta para o TABLE: **Tabela TB_ORDERS (Pedidos e Frete)** (`table-orders`)
- **[WRITES_TO_TABLE]** Aponta para o TABLE: **Tabela TB_ORDERS (Pedidos e Frete)** (`table-orders`)

### Componentes que Dependem ou Utilizam Este Nó:
- O PROJECT **Legacy Order & Freight API** (`proj-legacy-order-api`) conecta via **IMPLEMENTS_RULE**
- O TABLE **Tabela TB_ORDERS (Pedidos e Frete)** (`table-orders`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

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
3. Persistir o valor de frete em **Tabela TB_ORDERS (Pedidos e Frete)** (`table-orders`) sem qualquer alteração de regra fora do domínio explicitado.

