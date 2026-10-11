# [SERVIÇO / MICROSSERVIÇO] Motor de Liquidação Instantânea PIX & Anti-Fraude

> **ID Técnico:** `proj-pix-settlement` | **Atualizado em:** 2026-10-10

## 📋 Metadados de Contexto
- **Squad / Responsável:** Squad Jarvis Core
- **Status da Decisão:** VERIFIED
- **Tags:** pix, bacen, pagamentos, antifraude, dotnet, oracle

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[DEPENDS_ON]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[OWNS_TABLE]** Aponta para o TABLE: **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`)
- **[IMPLEMENTS_RULE]** Aponta para o RULE: **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`)
- **[REFERENCES]** Aponta para o ADR: **ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle** (`adr-002-idempotencia-liquidacao-pix`)
- **[REFERENCES]** Aponta para o PROCESS: **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** (`proc-bloqueio-cautelar-med`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle** (`adr-002-idempotencia-liquidacao-pix`) conecta via **DECIDES_ON**
- O PROCESS **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** (`proc-bloqueio-cautelar-med`) conecta via **RECOVERS_SERVICE**
- O QUERY **Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)** (`qry-consulta-limites-noturnos-pix`) conecta via **BELONGS_TO**
- O RULE **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`) conecta via **BELONGS_TO**
- O TABLE **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`) conecta via **BELONGS_TO**

## 📖 Conteúdo e Especificação Técnica

# Motor de Liquidação Instantânea PIX & Anti-Fraude (`proj-pix-settlement`)

## Visão Geral e Responsabilidade
Serviço crítico responsável por validar, autorizar e liquidar transações PIX 24x7 junto ao SPI (Sistema de Pagamentos Instantâneos do Banco Central), aplicando validações de limite noturno e prevenção a fraudes (MED).

## Arquitetura e Integrações
- **Backend:** `.NET 8 (C#)` em Clean Architecture + CQRS.
- **Persistência:** **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`) em `Oracle Database` com acesso via `Dapper`.
- **Idempotência:** Controlada via `Redis` + Unique Constraint conforme **ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle** (`adr-002-idempotencia-liquidacao-pix`).
- **Regras Críticas:** Aplica **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`) e aciona **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** (`proc-bloqueio-cautelar-med`) em suspeitas de fraude.

