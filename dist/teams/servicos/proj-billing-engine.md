# [SERVIÇO / MICROSSERVIÇO] Motor de Cobrança (Billing Engine)

> **ID Técnico:** `proj-billing-engine` | **Atualizado em:** 2026-09-14

## 📋 Metadados de Contexto
- **Squad / Responsável:** Squad Monetização
- **Repositório Git:** https://github.com/empresa/billing-engine
- **Tags:** backend, golang, financeiro, billing

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[DEPENDS_ON]** Aponta para o PROJECT: **Serviço: proj-payment-gateway** (`proj-payment-gateway`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela de Faturas (invoices)** (`table-invoices`)
- **[REFERENCES]** Aponta para o ADR: **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`)
- **[OWNS_TABLE]** Aponta para o TABLE: **Tabela de Faturas (invoices)** (`table-invoices`)
- **[OWNS_TABLE]** Aponta para o TABLE: **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`) conecta via **DECIDES_ON**
- O ADR **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`) conecta via **REFERENCES**
- O PROCESS **Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`) conecta via **BELONGS_TO**
- O PROCESS **Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`) conecta via **REFERENCES**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **BELONGS_TO**
- O RULE **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`) conecta via **BELONGS_TO**
- O RULE **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`) conecta via **REFERENCES**
- O TABLE **Tabela de Faturas (invoices)** (`table-invoices`) conecta via **BELONGS_TO**
- O TABLE **Tabela de Faturas (invoices)** (`table-invoices`) conecta via **REFERENCES**
- O TABLE **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`) conecta via **BELONGS_TO**
- O TABLE **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# Motor de Cobrança (Billing Engine)

## Finalidade
Serviço responsável por orquestrar o ciclo de faturamento recorrente (mensal e anual) dos clientes e transacionar cobranças via adquirentes.

## Tecnologias e Infra
- **Linguagem / Framework:** Go / Echo
- **Banco de Dados:** PostgreSQL (RDS Postgres Billing)
- **Mensageria:** SQS (Fila `billing-events`)

## Pontos de Entrada Críticos
- `POST /internal/v1/billing/retry`: Endpoint operacional para reprocessamento de faturas em lote.

## Modelagem de Dados & Arquitetura
- **Tabelas Principais:** `**Tabela de Assinaturas (subscriptions)** (`table-subscriptions`)`, `**Tabela de Faturas (invoices)** (`table-invoices`)`
- **Decisões Registradas:** `**ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`)`

