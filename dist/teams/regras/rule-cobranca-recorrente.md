# [REGRA DE NEGÓCIO] Regra de Cobrança Recorrente e Tentativas

> **ID Técnico:** `rule-cobranca-recorrente` | **Atualizado em:** 2026-09-14

## 📋 Metadados de Contexto
- **Domínio de Negócio:** Monetização e Faturamento
- **Tags:** regras, financeiro, assinaturas

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[BELONGS_TO]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)

### Componentes que Dependem ou Utilizam Este Nó:
- O ADR **ADR 001: Cobrança Assíncrona e Resiliência com Filas SQS** (`adr-001-cobranca-assincrona-com-filas`) conecta via **REFERENCES**
- O QUERY **Busca de Assinaturas Vencendo sem Fatura Gerada** (`qry-assinaturas-pendentes-faturamento`) conecta via **IMPLEMENTS_RULE**
- O TABLE **Tabela de Faturas (invoices)** (`table-invoices`) conecta via **REFERENCES**
- O TABLE **Tabela de Assinaturas (subscriptions)** (`table-subscriptions`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# Regra: Cobrança Recorrente e Tentativas

## Definição
Define as janelas de disparo de cobrança e a política de retentativas para assinaturas de clientes.

## Critérios de Aplicação
- O faturamento é disparado automaticamente **3 dias antes do vencimento**.
- Em caso de falha de cobrança na adquirente, são executadas até **3 tentativas automáticas com intervalo de 24 horas**.
- Esgotadas as tentativas sem sucesso, o status da assinatura transiciona para `INADIMPLENTE`.

## Referências
- Implementado em: `**Motor de Cobrança (Billing Engine)** (`proj-billing-engine`)`

