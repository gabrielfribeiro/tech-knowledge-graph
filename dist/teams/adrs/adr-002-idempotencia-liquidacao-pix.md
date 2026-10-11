# [DECISÃO ARQUITETURAL / ADR] ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle

> **ID Técnico:** `adr-002-idempotencia-liquidacao-pix` | **Atualizado em:** 2026-10-10

## 📋 Metadados de Contexto
- **Status da Decisão:** ACCEPTED
- **Decisores:** Gabriel, Squad Jarvis Core
- **Tags:** adr, pix, idempotencia, redis, oracle

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[DECIDES_ON]** Aponta para o PROJECT: **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`)
- **[REFERENCES]** Aponta para o RULE: **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`)

### Componentes que Dependem ou Utilizam Este Nó:
- O PROJECT **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`) conecta via **REFERENCES**
- O TABLE **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle

## Contexto
Transações PIX no **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`) sofrem retentativas de rede do aplicativo mobile e webhooks duplicados do SPI/Bacen. Sem idempotência estrita, ocorreria débito duplicado na conta do cliente.

## Decisão
1. Todo request de pagamento exige o header `X-Idempotency-Key` (UUID v4) que gera o `EndToEndId` (padrão Bacen de 32 caracteres).
2. Lock distribuído no Redis (`SET NX EX 60`) antes de iniciar a validação de **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`).
3. Garantia final no banco via índice único `UK_PIX_END_TO_END_ID` na tabela **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`).

## Consequências
- **Positivas:** Zero duplicidade de débito mesmo sob falha de rede ou concorrência alta.
- **Negativas:** Latência adicional de ~2ms para validação da chave no Redis.

