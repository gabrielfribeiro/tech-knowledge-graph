# 🗺️ Catálogo Mestre da Área Técnica (Visão Geral para IA & Equipe)

Este documento consolida toda a arquitetura, microsserviços, regras de negócio, queries críticas e processos da área técnica para alimentar consultas e agentes no **Microsoft Teams**.

## 📊 Resumo Executivo da Base
- **Total de Componentes:** 8
- **Total de Conexões Relacionais:** 35
- **Última Compilação:** 2026-10-09T18:09:14.613Z

## 📦 Microsserviços e Sistemas

| ID | Nome do Serviço | Squad / Dono | Banco / Infra | Depende De |
| :--- | :--- | :--- | :--- | :--- |
| `proj-billing-engine` | **Motor de Cobrança (Billing Engine)** | Squad Monetização | - | `proj-payment-gateway` |
| `proj-payment-gateway` | **Serviço: proj-payment-gateway** | Squad Pagamentos | - | Nenhuma |

## 📜 Regras de Negócio e Políticas

| ID | Regra de Negócio | Domínio | Implementado No Serviço |
| :--- | :--- | :--- | :--- |
| `rule-cobranca-recorrente` | **Regra de Cobrança Recorrente e Tentativas** | Monetização e Faturamento | `adr-001-cobranca-assincrona-com-filas`, `qry-assinaturas-pendentes-faturamento`, `table-invoices`, `table-subscriptions` |

## 🔍 Consultas SQL & Scripts de Banco Críticos

| ID | Nome da Consulta | Banco de Dados | Serviço Dono | Regra que Executa |
| :--- | :--- | :--- | :--- | :--- |
| `qry-assinaturas-pendentes-faturamento` | **Busca de Assinaturas Vencendo sem Fatura Gerada** | postgres-billing | `proj-billing-engine` | `rule-cobranca-recorrente` |

## 🛠️ Processos Operacionais e Runbooks de Incidente

| ID | Nome do Processo | Serviços Envolvidos |
| :--- | :--- | :--- |
| `proc-reprocessar-cobranca-falha` | **Reprocessamento Manual de Cobranças Pendentes** | `proj-billing-engine`, `qry-assinaturas-pendentes-faturamento`, `proj-billing-engine` |

## 🗄️ Tabelas de Banco de Dados & Schemas

| ID | Nome da Tabela | Banco / Schema | Microsserviço Proprietário | Chave Primária |
| :--- | :--- | :--- | :--- | :--- |
| `table-invoices` | **Tabela de Faturas (invoices)** | postgres-billing (public) | `proj-billing-engine` | `id` |
| `table-subscriptions` | **Tabela de Assinaturas (subscriptions)** | postgres-billing (public) | `proj-billing-engine` | `id` |

## 📐 Decisões Arquiteturais Registradas (ADRs)

| ID | Título da Decisão | Status | Data | Componentes Afetados |
| :--- | :--- | :--- | :--- | :--- |
| `adr-001-cobranca-assincrona-com-filas` | **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** | ACCEPTED | 2026-09-14 | `proj-billing-engine`, `proj-payment-gateway` |

