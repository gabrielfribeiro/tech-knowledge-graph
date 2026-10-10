# [REGRA DE NEGÓCIO] Regra de Estorno Proporcional (Pro-Rata) em Cancelamento de Assinatura

> **ID Técnico:** `rule-estorno-proporcional-cancelamento` | **Atualizado em:** 2026-10-10

## 📋 Metadados de Contexto
- **Domínio de Negócio:** Faturamento e Assinaturas
- **Status da Decisão:** VERIFIED
- **Tags:** regra, billing, estorno, pro-rata, cdc

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Faturas (invoices)** (`table-invoices`)
- **[REFERENCES]** Aponta para o ADR: **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`)

## 📖 Conteúdo e Especificação Técnica

# Regra de Estorno Proporcional em Cancelamento (`rule-estorno-proporcional-cancelamento`)

## Definição da Regra
No **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`), quando um assinante solicita cancelamento de plano ativo na **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`), o sistema deve calcular o reembolso ou crédito nas faturas da **Tabela de Faturas (invoices)** (`table-invoices`):

## Critérios de Aceite e Casos de Borda (Para `@dev` e `@qa` Cypress/Xray)
1. **Arrependimento CDC (Até 7 dias corridos da contratação):** Estorno integral de **100%** do valor pago na última fatura (`ST_INVOICE = 'REFUNDED_FULL'`).
2. **Cancelamento Após 7 Dias (Pro-Rata):** Calcular dias restantes no ciclo de 30 dias (`VL_ESTORNO = (VL_PLANO / 30) * DIAS_RESTANTES` com arredondamento financeiro de 2 casas decimais) e publicar comando de estorno na fila conforme **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`).
3. **Assinatura já Inadimplente (`PAST_DUE` ou `SUSPENDED`):** Cancelar assinatura imediatamente sem gerar crédito de estorno (`VL_ESTORNO = 0`).

