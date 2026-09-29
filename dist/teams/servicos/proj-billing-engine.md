# [SERVIÇO / MICROSSERVIÇO] Motor de Cobrança (Billing Engine)

> **ID Técnico:** `proj-billing-engine` | **Atualizado em:** 2026-09-14

## 📋 Metadados de Contexto
- **Squad / Responsável:** Squad Monetização
- **Repositório Git:** https://github.com/empresa/billing-engine
- **Tags:** backend, golang, financeiro, billing

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[DEPENDS_ON]** Aponta para o PROJECT: **Serviço: proj-payment-gateway** (`proj-payment-gateway`)

### Componentes que Dependem ou Utilizam Este Nó:
- O PROCESS **Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`) conecta via **BELONGS_TO**
- O PROCESS **Reprocessamento Manual de Cobranças Pendentes** (`proc-reprocessar-cobranca-falha`) conecta via **REFERENCES**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **BELONGS_TO**
- O RULE **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`) conecta via **BELONGS_TO**
- O RULE **Regra de Cobrança Recorrente e Tentativas** (`rule-cobranca-recorrente`) conecta via **REFERENCES**

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

