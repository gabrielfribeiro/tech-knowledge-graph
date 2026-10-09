# [DECISÃO ARQUITETURAL / ADR] ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS

> **ID Técnico:** `adr-001-cobranca-assincrona-com-filas` | **Atualizado em:** 2026-10-09

## 📋 Metadados de Contexto
- **Status da Decisão:** ACCEPTED
- **Decisores:** Staff Architect, Tech Lead Monetização
- **Data da Decisão:** 2026-09-14
- **Tags:** adr, arquitetura, billing, sqs, resiliencia

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[DECIDES_ON]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[DECIDES_ON]** Aponta para o PROJECT: **Serviço: proj-payment-gateway** (`proj-payment-gateway`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)
- **[REFERENCES]** Aponta para o PROJECT: **Serviço: proj-payment-gateway** (`proj-payment-gateway`)
- **[REFERENCES]** Aponta para o PROCESS: **Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Faturas (invoices)** (`table-invoices`)
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[REFERENCES]** Aponta para o RULE: **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`)

### Componentes que Dependem ou Utilizam Este Nó:
- O PROJECT **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS

## Contexto e Desafio
O processamento síncrono de faturas em lote causava timeouts severos de banco de dados e lentidão nas respostas das adquirentes durante o pico das 08h00. Quando uma adquirente apresentava oscilação, todo o lote ficava bloqueado, gerando faturas presas em estado indeterminado.

## Decisão Tomada
Adotamos o desacoplamento assíncrono via fila AWS SQS (`billing-events`). 
1. O faturamento diário identifica as faturas pendentes na `**Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)` e posta mensagens individuais na fila.
2. Workers assíncronos consomem cada mensagem e chamam o `**Serviço: proj-payment-gateway** (`proj-payment-gateway`)`.
3. Em caso de falha transitória, a mensagem vai para DLQ e pode ser reprocessada pelo `**Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`)`.

## Consequências e Trade-offs
- **Positivas:**
  - Isolamento de falhas por fatura individual (falha em um cliente não atrasa os demais).
  - Controle de taxa de requisições (rate limiting) suave para o gateway.
  - Resiliência operacional através de DLQ e runbook de reprocessamento.
- **Negativas / Atenção:**
  - Consistência eventual: o status da `**Tabela de Faturas (invoices)** (`table-invoices`)` pode demorar alguns segundos para refletir `PAID`.
  - Necessidade de idempotência no consumidor com deduplicação de mensagens.

## Componentes Afetados
- **Serviços:** `**Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)`, `**Serviço: proj-payment-gateway** (`proj-payment-gateway`)`
- **Tabelas:** `**Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)`, `**Tabela de Faturas (invoices)** (`table-invoices`)`
- **Regras e Processos:** `**Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`)`, `**Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`)`

