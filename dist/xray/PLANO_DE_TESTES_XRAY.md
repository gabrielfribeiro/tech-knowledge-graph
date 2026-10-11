# 🧪 Plano de Testes & Evidências (Cypress + Jira Xray)

> **Squad:** Squad Jarvis Core | **Tech Lead:** Gabriel | **Gerado em:** `2026-10-11T00:42:05.061Z`

## 🎯 [XRAY-001] Regra de Cobrança Recorrente e Tentativas (`rule-cobranca-recorrente`)
- **Script Cypress:** `dist/xray/cypress/rule-cobranca-recorrente.cy.ts`
- **Pacote de Evidências Xray:** `dist/xray/evidences/xray-execution-payload.json`

| Passo | Critério / Ação (Cypress) | Resultado Esperado | Evidência Gerada (Xray) |
| :--- | :--- | :--- | :--- |
| **#1** | O faturamento é disparado automaticamente 3 dias antes do vencimento. | Regra `rule-cobranca-recorrente` atendida com sucesso | `XRAY-001-step-1-rule-cobranca-recorrente.png` |
| **#2** | Em caso de falha de cobrança na adquirente, são executadas até 3 tentativas automáticas com intervalo de 24 horas. | Regra `rule-cobranca-recorrente` atendida com sucesso | `XRAY-001-step-2-rule-cobranca-recorrente.png` |
| **#3** | Esgotadas as tentativas sem sucesso, o status da assinatura transiciona para `INADIMPLENTE`. | Regra `rule-cobranca-recorrente` atendida com sucesso | `XRAY-001-step-3-rule-cobranca-recorrente.png` |

---

## 🎯 [XRAY-002] Regra de Estorno Proporcional (Pro-Rata) em Cancelamento de Assinatura (`rule-estorno-proporcional-cancelamento`)
- **Script Cypress:** `dist/xray/cypress/rule-estorno-proporcional-cancelamento.cy.ts`
- **Pacote de Evidências Xray:** `dist/xray/evidences/xray-execution-payload.json`

| Passo | Critério / Ação (Cypress) | Resultado Esperado | Evidência Gerada (Xray) |
| :--- | :--- | :--- | :--- |
| **#1** | rel: belongs_to | Regra `rule-estorno-proporcional-cancelamento` atendida com sucesso | `XRAY-002-step-1-rule-estorno-proporcional-cancelamento.png` |
| **#2** | rel: reads_from_table | Regra `rule-estorno-proporcional-cancelamento` atendida com sucesso | `XRAY-002-step-2-rule-estorno-proporcional-cancelamento.png` |
| **#3** | rel: writes_to_table | Regra `rule-estorno-proporcional-cancelamento` atendida com sucesso | `XRAY-002-step-3-rule-estorno-proporcional-cancelamento.png` |
| **#4** | rel: references | Regra `rule-estorno-proporcional-cancelamento` atendida com sucesso | `XRAY-002-step-4-rule-estorno-proporcional-cancelamento.png` |

---

## 🎯 [XRAY-003] Regra de Frete Grátis VIP (FREIGHT_VIP_RULE) (`rule-frete-gratis-vip`)
- **Script Cypress:** `dist/xray/cypress/rule-frete-gratis-vip.cy.ts`
- **Pacote de Evidências Xray:** `dist/xray/evidences/xray-execution-payload.json`

| Passo | Critério / Ação (Cypress) | Resultado Esperado | Evidência Gerada (Xray) |
| :--- | :--- | :--- | :--- |
| **#1** | rel: belongs_to | Regra `rule-frete-gratis-vip` atendida com sucesso | `XRAY-003-step-1-rule-frete-gratis-vip.png` |
| **#2** | rel: reads_from_table | Regra `rule-frete-gratis-vip` atendida com sucesso | `XRAY-003-step-2-rule-frete-gratis-vip.png` |
| **#3** | rel: writes_to_table | Regra `rule-frete-gratis-vip` atendida com sucesso | `XRAY-003-step-3-rule-frete-gratis-vip.png` |
| **#4** | Pedido acima do limiar: valor líquido calculado >= R$ 500,00 resulta em frete gratuito. | Regra `rule-frete-gratis-vip` atendida com sucesso | `XRAY-003-step-4-rule-frete-gratis-vip.png` |
| **#5** | Cliente VIP: `customerTier = DIAMOND` resulta em frete gratuito mesmo sem atingir o valor. | Regra `rule-frete-gratis-vip` atendida com sucesso | `XRAY-003-step-5-rule-frete-gratis-vip.png` |
| **#6** | Pedido comum: qualquer valor abaixo do limiar e fora do VIP paga frete padrão de R$ 39,90. | Regra `rule-frete-gratis-vip` atendida com sucesso | `XRAY-003-step-6-rule-frete-gratis-vip.png` |
| **#7** | Segurança: a validação deve usar valores numéricos tipados e não concatenar SQL/PL-SQL em consultas. | Regra `rule-frete-gratis-vip` atendida com sucesso | `XRAY-003-step-7-rule-frete-gratis-vip.png` |

---

## 🎯 [XRAY-004] Regra de Limite PIX Noturno (20h às 06h) e Prevenção a Fraude (`rule-limite-pix-noturno`)
- **Script Cypress:** `dist/xray/cypress/rule-limite-pix-noturno.cy.ts`
- **Pacote de Evidências Xray:** `dist/xray/evidences/xray-execution-payload.json`

| Passo | Critério / Ação (Cypress) | Resultado Esperado | Evidência Gerada (Xray) |
| :--- | :--- | :--- | :--- |
| **#1** | rel: belongs_to | Regra `rule-limite-pix-noturno` atendida com sucesso | `XRAY-004-step-1-rule-limite-pix-noturno.png` |
| **#2** | rel: reads_from_table | Regra `rule-limite-pix-noturno` atendida com sucesso | `XRAY-004-step-2-rule-limite-pix-noturno.png` |
| **#3** | rel: writes_to_table | Regra `rule-limite-pix-noturno` atendida com sucesso | `XRAY-004-step-3-rule-limite-pix-noturno.png` |
| **#4** | rel: references | Regra `rule-limite-pix-noturno` atendida com sucesso | `XRAY-004-step-4-rule-limite-pix-noturno.png` |
| **#5** | rel: references | Regra `rule-limite-pix-noturno` atendida com sucesso | `XRAY-004-step-5-rule-limite-pix-noturno.png` |

---

