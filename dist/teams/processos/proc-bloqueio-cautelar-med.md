# [RUNBOOK OPERACIONAL / PROCESSO] Runbook de Bloqueio Cautelar e Devolução PIX (MED Bacen)

> **ID Técnico:** `proc-bloqueio-cautelar-med` | **Atualizado em:** 2026-10-10

## 📋 Metadados de Contexto
- **Status da Decisão:** VERIFIED
- **Tags:** processo, runbook, pix, med, antifraude

## 🔗 Relações e Conexões com o Ecossistema
### Dependências e Saídas:
- **[REFERENCES]** Aponta para o PROJECT: **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`)
- **[REFERENCES]** Aponta para o RULE: **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`)
- **[REFERENCES]** Aponta para o TABLE: **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`)

### Componentes que Dependem ou Utilizam Este Nó:
- O PROJECT **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`) conecta via **REFERENCES**
- O RULE **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`) conecta via **REFERENCES**

## 📖 Conteúdo e Especificação Técnica

# Runbook de Bloqueio Cautelar e Devolução PIX (`proc-bloqueio-cautelar-med`)

## Gatilho Operacional
Acionado quando o **Motor de Liquidação Instantânea PIX & Anti-Fraude** (`proj-pix-settlement`) recebe notificação de infração do DICT/Bacen ou detecta anomalia severa na **Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude** (`rule-limite-pix-noturno`).

## Passo a Passo de Execução
1. Atualizar `ST_LIQUIDACAO = 'MED_FROZEN'` na **Tabela TB_PIX_TRANSACTIONS (Transações e Liquidação PIX)** (`table-pix-transactions`) para o `CD_END_TO_END_ID` reportado (bloqueio cautelar de até 72h).
2. Notificar o motor de faturamento e compliance sem expor `NR_CPF_PAGADOR` em texto aberto nos canais de log.
3. Caso a fraude seja confirmada em até 72h, efetivar a devolução integral ao pagador original via código de devolução `MD06` (SPI).

