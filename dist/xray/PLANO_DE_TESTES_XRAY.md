# 🧪 Plano de Testes & Evidências (Cypress + Jira Xray)

> **Squad:** Squad Jarvis Core | **Tech Lead:** Gabriel | **Gerado em:** `2026-10-10T23:43:34.559Z`

## 🎯 [XRAY-001] Regra de Cobrança Recorrente e Tentativas (`rule-cobranca-recorrente`)
- **Script Cypress:** `dist/xray/cypress/rule-cobranca-recorrente.cy.ts`
- **Pacote de Evidências Xray:** `dist/xray/evidences/xray-execution-payload.json`

| Passo | Critério / Ação (Cypress) | Resultado Esperado | Evidência Gerada (Xray) |
| :--- | :--- | :--- | :--- |
| **#1** | O faturamento é disparado automaticamente 3 dias antes do vencimento. | Regra `rule-cobranca-recorrente` atendida com sucesso | `XRAY-001-step-1-rule-cobranca-recorrente.png` |
| **#2** | Em caso de falha de cobrança na adquirente, são executadas até 3 tentativas automáticas com intervalo de 24 horas. | Regra `rule-cobranca-recorrente` atendida com sucesso | `XRAY-001-step-2-rule-cobranca-recorrente.png` |
| **#3** | Esgotadas as tentativas sem sucesso, o status da assinatura transiciona para `INADIMPLENTE`. | Regra `rule-cobranca-recorrente` atendida com sucesso | `XRAY-001-step-3-rule-cobranca-recorrente.png` |

---

