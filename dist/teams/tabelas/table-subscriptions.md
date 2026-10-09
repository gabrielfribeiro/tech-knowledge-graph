# [TABELA DE BANCO DE DADOS / MODELO] Tabela de Assinaturas (subscriptions)

> **ID Técnico:** `table-subscriptions` | **Atualizado em:** 2026-10-09

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
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[REFERENCES]** Aponta para o RULE: **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`)
- **[REFERENCES]** Aponta para o QUERY: **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`) conecta via **REFERENCES**
- O PROJECT **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`) conecta via **REFERENCES**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **READS_FROM_TABLE**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **REFERENCES**
- O TABLE **Tabela de Faturas (invoices)** (`table-invoices`) conecta via **REFERENCES**
- O PROJECT **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`) conecta via **OWNS_TABLE**

## 📖 Conteúdo e Especificação Técnica

# Tabela: Assinaturas (`subscriptions`)

## Descrição e Domínio
Tabela central de contratos de recorrência do cliente. Armazena o plano contratado, ciclo de cobrança, datas de vencimento e status da assinatura.

## Dicionário de Dados
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Sim | Identificador único da assinatura (PK). |
| `customer_id` | UUID | Sim | Identificador do cliente pagador. |
| `status` | VARCHAR(30) | Sim | Estado da assinatura: `ACTIVE`, `SUSPENDED`, `CANCELLED`. |
| `due_date` | DATE | Sim | Data de vencimento do ciclo corrente. |
| `amount` | NUMERIC(12,2) | Sim | Valor monetário nominal cobrado por ciclo. |
| `created_at` | TIMESTAMP | Sim | Data e hora de criação do contrato. |
| `updated_at` | TIMESTAMP | Sim | Data e hora da última alteração de estado. |

## Índices e Performance
- **Primary Key:** `id`
- **Índice Composto de Faturamento:** `idx_subscriptions_status_due` nas colunas `(status, due_date)`. Otimizado para varredura diária de faturamento.

## Relações e Integridade
- **Microsserviço Proprietário:** `**Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)`
- **Regra de Negócio:** `**Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`)`
- **Consultas Críticas:** `**Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`)`

