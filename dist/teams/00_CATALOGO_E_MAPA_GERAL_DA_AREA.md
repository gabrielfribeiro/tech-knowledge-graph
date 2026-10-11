# 🗺️ Catálogo Mestre da Área Técnica (Visão Geral para IA & Equipe)

Este documento consolida toda a arquitetura, microsserviços, regras de negócio, queries críticas e processos da área técnica para alimentar consultas e agentes no **Microsoft Teams**.

## 📊 Resumo Executivo da Base
- **Total de Componentes:** 18
- **Total de Conexões Relacionais:** 60
- **Última Compilação:** 2026-10-11T00:42:05.223Z

## 📦 Microsserviços e Sistemas

| ID | Nome do Serviço | Squad / Dono | Banco / Infra | Depende De |
| :--- | :--- | :--- | :--- | :--- |
| `proj-billing-engine` | **Motor de Cobrança (Billing Engine)** | Squad Monetização | - | `proj-payment-gateway` |
| `proj-legacy-order-api` | **Legacy Order & Freight API** | Squad Jarvis Core | - | Nenhuma |
| `proj-payment-gateway` | **Serviço: proj-payment-gateway** | Squad Pagamentos | - | Nenhuma |
| `proj-pix-settlement` | **Motor de Liquidação Instantânea PIX & Anti-Fraude** | Squad Jarvis Core | - | `proj-billing-engine` |

## 📜 Regras de Negócio e Políticas

| ID | Regra de Negócio | Domínio | Implementado No Serviço |
| :--- | :--- | :--- | :--- |
| `rule-cobranca-recorrente` | **Regra de Cobrança Recorrente e Tentativas** | Monetização e Faturamento | `adr-001-cobranca-assincrona-com-filas`, `qry-assinaturas-pendentes-faturamento`, `table-invoices`, `table-subscriptions` |
| `rule-estorno-proporcional-cancelamento` | **Regra de Estorno Proporcional (Pro-Rata) em Cancelamento de Assinatura** | Faturamento e Assinaturas | `proj-billing-engine`, `table-subscriptions`, `table-invoices`, `adr-001-cobranca-assincrona-com-filas` |
| `rule-frete-gratis-vip` | **Regra de Frete Grátis VIP (FREIGHT_VIP_RULE)** | E-commerce B2B e Logística | `proj-legacy-order-api`, `table-orders` |
| `rule-limite-pix-noturno` | **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** | Pagamentos Instantâneos (PIX) | `adr-002-idempotencia-liquidacao-pix`, `proc-bloqueio-cautelar-med`, `proj-pix-settlement`, `qry-consulta-limites-noturnos-pix`, `table-pix-transactions` |

## 🔍 Consultas SQL & Scripts de Banco Críticos

| ID | Nome da Consulta | Banco de Dados | Serviço Dono | Regra que Executa |
| :--- | :--- | :--- | :--- | :--- |
| `qry-assinaturas-pendentes-faturamento` | **Busca de Assinaturas Vencendo sem Fatura Gerada** | postgres-billing | `proj-billing-engine` | `rule-cobranca-recorrente` |
| `qry-consulta-limites-noturnos-pix` | **Query de Apuração do Acumulado PIX Noturno por CPF (Oracle)** | Oracle Database | `proj-pix-settlement` | `N/A` |

## 🛠️ Processos Operacionais e Runbooks de Incidente

| ID | Nome do Processo | Serviços Envolvidos |
| :--- | :--- | :--- |
| `proc-bloqueio-cautelar-med` | **Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)** | `proj-pix-settlement`, `rule-limite-pix-noturno`, `table-pix-transactions` |
| `proc-reprocessar-cobranca-falha` | **Reprocessamento Manual de Cobranças Pendentes** | `proj-billing-engine`, `qry-assinaturas-pendentes-faturamento` |

## 🗄️ Tabelas de Banco de Dados & Schemas

| ID | Nome da Tabela | Banco / Schema | Microsserviço Proprietário | Chave Primária |
| :--- | :--- | :--- | :--- | :--- |
| `table-invoices` | **Tabela de Faturas (invoices)** | postgres-billing (public) | `proj-billing-engine` | `id` |
| `table-orders` | **Tabela TB_ORDERS (Pedidos e Frete)** | Oracle Database (ORDER_CORE) | `proj-legacy-order-api` | `id` |
| `table-pix-transactions` | **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** | Oracle Database (PIX_CORE) | `proj-pix-settlement` | `id` |
| `table-subscriptions` | **Tabela de Assinaturas (subscriptions)** | postgres-billing (public) | `proj-billing-engine` | `id` |

## 📐 Decisões Arquiteturais Registradas (ADRs)

| ID | Título da Decisão | Status | Data | Componentes Afetados |
| :--- | :--- | :--- | :--- | :--- |
| `adr-001-cobranca-assincrona-com-filas` | **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** | ACCEPTED | 2026-09-14 | `proj-billing-engine`, `proj-payment-gateway` |
| `adr-002-idempotencia-liquidacao-pix` | **ADR 002 - Idempotência Distribuída na Liquidação PIX com Redis e Oracle** | ACCEPTED | 2026-10-10 | `proj-pix-settlement` |

