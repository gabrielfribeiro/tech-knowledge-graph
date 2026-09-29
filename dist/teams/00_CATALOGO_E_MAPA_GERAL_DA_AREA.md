# 🗺️ Catálogo Mestre da Área Técnica (Visão Geral para IA & Equipe)

Este documento consolida toda a arquitetura, microsserviços, regras de negócio, queries críticas e processos da área técnica para alimentar consultas e agentes no **Microsoft Teams**.

## 📊 Resumo Executivo da Base
- **Total de Componentes:** 5
- **Total de Conexões Relacionais:** 9
- **Última Compilação:** 2026-09-29T18:46:22.158Z

## 📦 Microsserviços e Sistemas

| ID | Nome do Serviço | Squad / Dono | Banco / Infra | Depende De |
| :--- | :--- | :--- | :--- | :--- |
| `proj-billing-engine` | **Motor de Cobrança (Billing Engine)** | Squad Monetização | - | `proj-payment-gateway` |
| `proj-payment-gateway` | **Serviço: proj-payment-gateway** | Não definido | - | Nenhuma |

## 📜 Regras de Negócio e Políticas

| ID | Regra de Negócio | Domínio | Implementado No Serviço |
| :--- | :--- | :--- | :--- |
| `rule-cobranca-recorrente` | **Regra de Cobrança Recorrente e Tentativas** | Monetização e Faturamento | `qry-assinaturas-pendentes-faturamento` |

## 🔍 Consultas SQL & Scripts de Banco Críticos

| ID | Nome da Consulta | Banco de Dados | Serviço Dono | Regra que Executa |
| :--- | :--- | :--- | :--- | :--- |
| `qry-assinaturas-pendentes-faturamento` | **Busca de Assinaturas Vencendo sem Fatura Gerada** | postgres-billing | `proj-billing-engine` | `rule-cobranca-recorrente` |

## 🛠️ Processos Operacionais e Runbooks de Incidente

| ID | Nome do Processo | Serviços Envolvidos |
| :--- | :--- | :--- |
| `proc-reprocessar-cobranca-falha` | **Reprocessamento Manual de Cobranças Pendentes** | `proj-billing-engine`, `qry-assinaturas-pendentes-faturamento`, `proj-billing-engine` |

