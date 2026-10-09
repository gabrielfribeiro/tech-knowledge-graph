# [CONSULTA SQL / AUDITORIA] Busca de Assinaturas Vencendo sem Fatura Gerada

> **ID Técnico:** `qry-assinaturas-pendentes-faturamento` | **Atualizado em:** 2026-10-09

## 📋 Metadados de Contexto
- **Banco de Dados:** postgres-billing
- **Tags:** sql, auditoria, billing

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[IMPLEMENTS_RULE]** Aponta para o RULE: **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`)
- **[READS_FROM_TABLE]** Aponta para o TABLE: **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)
- **[READS_FROM_TABLE]** Aponta para o TABLE: **Tabela de Faturas (invoices)** (`table-invoices`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Faturas (invoices)** (`table-invoices`)
- **[REFERENCES]** Aponta para o PROCESS: **Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`)

### Componentes que Dependem ou Utilizam Este Nó:
- O PROCESS **Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`) conecta via **REFERENCES**
- O TABLE **Tabela de Faturas (invoices)** (`table-invoices`) conecta via **REFERENCES**
- O TABLE **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# Query: Busca de Assinaturas Vencendo sem Fatura Gerada

## Objetivo
Identifica registros na `**Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)` com data de vencimento atingida para os quais ainda não consta fatura gerada na `**Tabela de Faturas (invoices)** (`table-invoices`)` no ciclo corrente.

## SQL
```sql
SELECT a.id, a.customer_id, a.due_date, a.amount 
FROM subscriptions a 
WHERE a.status = 'ACTIVE' 
  AND a.due_date <= CURRENT_DATE 
  AND NOT EXISTS (
    SELECT 1 FROM invoices i 
    WHERE i.subscription_id = a.id 
      AND i.period_date = CURRENT_DATE
  );
```

## Como Executar / Cuidados
- **Impacto de Performance:** Médio. Utiliza o índice `idx_subscriptions_status_due`.
- **Ações Associadas:** `**Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`)`

