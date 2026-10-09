# [TABELA DE BANCO DE DADOS / MODELO] Tabela de Faturas (invoices)

> **ID Técnico:** `table-invoices` | **Atualizado em:** 2026-10-09

## 📋 Metadados de Contexto
- **Banco de Dados:** postgres-billing
- **Schema / Namespace:** public
- **Microsserviço Proprietário:** [[proj-billing-engine]]
- **Chave Primária (PK):** id
- **Retenção de Dados:** permanente
- **Tags:** database, table, billing, postgres

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[REFERENCES]** Aponta para o RULE: **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`)
- **[REFERENCES]** Aponta para o QUERY: **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`) conecta via **REFERENCES**
- O PROJECT **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`) conecta via **REFERENCES**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **READS_FROM_TABLE**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **REFERENCES**
- O PROJECT **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`) conecta via **OWNS_TABLE**

## 📖 Conteúdo e Especificação Técnica

# Tabela: Faturas (`invoices`)

## Descrição e Domínio
Registra cada emissão de cobrança gerada para uma assinatura em um ciclo determinado. Controla as tentativas de débito e o status do pagamento.

## Dicionário de Dados
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Sim | Identificador único da fatura (PK). |
| `subscription_id` | UUID | Sim | Chave estrangeira referenciando `**Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)`. |
| `period_date` | DATE | Sim | Data base do ciclo faturado. |
| `amount` | NUMERIC(12,2) | Sim | Valor cobrado na fatura. |
| `status` | VARCHAR(30) | Sim | Estado da fatura: `PENDING`, `PAID`, `FAILED`. |
| `attempt_count` | INT | Sim | Quantidade de tentativas de débito realizadas (máx 3). |

## Relações e Integridade
- **Microsserviço Proprietário:** `**Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)`
- **Chave Estrangeira:** `subscription_id` aponta para `**Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)`.
- **Regra de Negócio:** `**Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`)`
- **Consultas Críticas:** `**Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`)`

