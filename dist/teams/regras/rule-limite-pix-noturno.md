# [REGRA DE NEGÓCIO] Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude

> **ID Técnico:** `rule-limite-pix-noturno` | **Atualizado em:** 2026-10-10

## 📋 Metadados de Contexto
- **Domínio de Negócio:** Pagamentos Instantâneos (PIX)
- **Status da Decisão:** VERIFIED
- **Tags:** regra, pix, bacen, limite-noturno, seguranca

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`)
- **[READS_FROM_TABLE]** Aponta para o TABLE: **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`)
- **[WRITES_TO_TABLE]** Aponta para o TABLE: **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`)
- **[REFERENCES]** Aponta para o QUERY: **Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)** (`qry-consulta-limites-noturnos-pix`)
- **[REFERENCES]** Aponta para o PROCESS: **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** (`proc-bloqueio-cautelar-med`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle** (`adr-002-idempotencia-liquidacao-pix`) conecta via **REFERENCES**
- O PROCESS **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** (`proc-bloqueio-cautelar-med`) conecta via **REFERENCES**
- O PROJECT **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`) conecta via **IMPLEMENTS_RULE**
- O QUERY **Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)** (`qry-consulta-limites-noturnos-pix`) conecta via **REFERENCES**
- O TABLE **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# Regra de Limite PIX Noturno (`rule-limite-pix-noturno`)

## Definição da Regra ( Normativo Bacen )
No serviço **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`), toda transação PIX realizada no período noturno (entre **20:00 e 05:59 BRT**) possui limite acumulado máximo de **R$ 1.000,00** por CPF (`NR_CPF_PAGADOR`), salvo se o cliente tiver optado previamente por horário customizado com carência de 24h.

## Critérios de Aceite e Casos de Borda (Para `@dev` e `@qa` Cypress/Xray)
1. **Transação Diurna (06:00 às 19:59):** Permitir valores até o limite diurno da conta (ex: R$ 10.000,00), gravando `ST_LIQUIDACAO = 'SETTLED'` na **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`).
2. **Transação Noturna Dentro do Limite (<= R$ 1.000,00 acumulados na noite):** Aprovar transação (`ST_LIQUIDACAO = 'SETTLED'`).
3. **Transação Noturna Acima de R$ 1.000,00 (isolada ou somada a outras da mesma noite via **Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)** (`qry-consulta-limites-noturnos-pix`)):** Recusar com HTTP `422 Unprocessable Entity` (`PIX_NIGHT_LIMIT_EXCEEDED`) e gravar `ST_LIQUIDACAO = 'BLOCKED_NIGHT_LIMIT'`.
4. **Conta Destino com Alerta de Fraude:** Bloquear imediatamente (`ST_LIQUIDACAO = 'MED_FROZEN'`) e acionar **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** (`proc-bloqueio-cautelar-med`).

