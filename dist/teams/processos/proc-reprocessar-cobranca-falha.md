# [RUNBOOK OPERACIONAL / PROCESSO] Reprocessamento Manual de Cobranças Pendentes

> **ID Técnico:** `proc-reprocessar-cobranca-falha` | **Atualizado em:** 2026-09-14

## 📋 Metadados de Contexto
- **Tags:** runbook, suporte, incidente

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[REFERENCES]** Aponta para o QUERY: **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`)
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`) conecta via **REFERENCES**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# Processo: Reprocessamento Manual de Cobranças Pendentes

## Quando Acionar
Utilizado quando ocorre instabilidade na mensageria ou webhooks e assinaturas ativas deixam de gerar faturas no dia previsto.

## Pré-requisitos
- Acesso de leitura ao banco `postgres-billing` (réplica ou produção).
- Acesso à VPN interna para chamar endpoints administrativos.

## Passo a Passo
1. Executar a query `**Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`)` e exportar o resultado com a lista de IDs.
2. Formatar os IDs em JSON array (`{"subscription_ids": ["uuid-1", "uuid-2"]}`).
3. Disparar a chamada de retry no endpoint do `**Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)`:
   ```bash
   curl -X POST https://billing.empresa.internal/internal/v1/billing/retry \
     -H "Content-Type: application/json" \
     -d @payload.json
   ```
4. Acompanhar a fila no Datadog/CloudWatch para confirmar a emissão.

