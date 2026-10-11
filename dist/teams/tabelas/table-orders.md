# [TABELA DE BANCO DE DADOS / MODELO] Tabela TB_ORDERS (Pedidos e Frete)

> **ID Técnico:** `table-orders` | **Atualizado em:** 2026-10-11

## 📋 Metadados de Contexto
- **Banco de Dados:** Oracle Database
- **Schema / Namespace:** ORDER_CORE
- **Microsserviço Proprietário:** proj-legacy-order-api
- **Status da Decisão:** VERIFIED
- **Tags:** tabela, oracle, pedidos, frete, lgpd

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Legacy Order & Freight API** (`proj-legacy-order-api`)
- **[REFERENCES]** Aponta para o RULE: **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** (`rule-frete-gratis-vip`)

### Componentes que Dependem ou Utilizam Este Nó:
- O PROJECT **Legacy Order & Freight API** (`proj-legacy-order-api`) conecta via **OWNS_TABLE**
- O RULE **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** (`rule-frete-gratis-vip`) conecta via **READS_FROM_TABLE**
- O RULE **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** (`rule-frete-gratis-vip`) conecta via **WRITES_TO_TABLE**

## 📖 Conteúdo e Especificação Técnica

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
- A regra de frete grátis está diretamente vinculada a esta tabela por meio de **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** (`rule-frete-gratis-vip`).
- Registros sensíveis devem ser mascarados em logs e coletados apenas na camada apropriada.

