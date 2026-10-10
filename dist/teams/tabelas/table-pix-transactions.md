# [TABELA DE BANCO DE DADOS / MODELO] Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)

> **ID Técnico:** `table-pix-transactions` | **Atualizado em:** 2026-10-10

## 📋 Metadados de Contexto
- **Banco de Dados:** Oracle Database
- **Schema / Namespace:** PIX_CORE
- **Microsserviço Proprietário:** proj-pix-settlement
- **Status da Decisão:** VERIFIED
- **Tags:** tabela, oracle, pix, lgpd, pii

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`)
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle** (`adr-002-idempotencia-liquidacao-pix`) conecta via **REFERENCES**
- O PROCESS **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** (`proc-bloqueio-cautelar-med`) conecta via **REFERENCES**
- O PROJECT **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`) conecta via **REFERENCES**
- O QUERY **Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)** (`qry-consulta-limites-noturnos-pix`) conecta via **REFERENCES**
- O RULE **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`) conecta via **REFERENCES**
- O PROJECT **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`) conecta via **OWNS_TABLE**

## 📖 Conteúdo e Especificação Técnica

# Tabela `TB_PIX_TRANSACTIONS` (`table-pix-transactions`)

## Finalidade
Armazena todas as transações PIX iniciadas ou recebidas pelo **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`), incluindo chave de idempotência `END_TO_END_ID`, status de liquidação e classificação LGPD.

## Colunas Principais
| Coluna | Tipo (Oracle) | Nulo? | LGPD / PII | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `ID_PIX_TX` | `RAW(16) PK` | `NOT NULL` | Não | Identificador interno da transação |
| `CD_END_TO_END_ID` | `VARCHAR2(32) UNIQUE` | `NOT NULL` | Não | Identificador único Bacen (`UK_PIX_END_TO_END_ID`) |
| `NR_CPF_PAGADOR` | `VARCHAR2(11)` | `NOT NULL` | **SIM (PII - Mascarar em logs)** | CPF do titular pagador |
| `CD_CHAVE_PIX_DESTINO` | `VARCHAR2(77)` | `NOT NULL` | **SIM (PII - Mascarar em logs)** | Chave PIX do recebedor |
| `VL_TRANSACAO` | `NUMBER(15,2)` | `NOT NULL` | Não | Valor em reais da transação |
| `ST_LIQUIDACAO` | `VARCHAR2(20)` | `NOT NULL` | Não | `PENDING`, `SETTLED`, `BLOCKED_NIGHT_LIMIT`, `MED_FROZEN` |
| `DT_CRIACAO` | `TIMESTAMP` | `NOT NULL` | Não | Data/hora exata da solicitação |

