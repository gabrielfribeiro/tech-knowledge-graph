# 🧪 Playbook de Exemplos Práticos para Testar a Squad e o Grafo

Este guia contém **exemplos prontos (copiar e colar)** para testar todas as capacidades da sua Squad de IA com **Custo Mínimo de Tokens (Modo Zero-Fluff)**.

---

## ⚡ Como funciona a Economia de Custo de IA

1. **Leitura 100% Livre da Base de Conhecimento (Entrada Rica):**
   - O agente lê livremente toda a `knowledge-base/` (`projects/`, `rules/`, `tables/`, `queries/`, `processes/`, `adrs/`, `graph-index.json`) e `spec/` para nunca perder contexto nem alucinar regras.
2. **Zero Conversa Fiada na Resposta (Saída Enxuta):**
   - Onde a IA mais gasta dinheiro e tempo é gerando texto inútil no chat (saudações, explicações teóricas, repetindo código). O Orquestrador é proibido de conversar à toa: ele **edita os arquivos direto** e responde em **até 5 linhas executivas**.
3. **Offload Determinístico (0 Tokens de LLM):**
   - Linter, Auto-Fixer, Compilação do Grafo, Extração de Plugins VS Code e Geração de Cypress + Jira Xray rodam localmente via Node.js sem gastar cota de IA.

---

## 🎮 PARTE 1: Testes Rápidos via Terminal (0 Tokens de IA)

Rode estes comandos no terminal do VS Code (`Ctrl + '`) para validar toda a engrenagem local:

### 1. Testar Ciclo Completo (Architect ➔ Dev ➔ Sec + QA Cypress/Xray ➔ Grafo Vegetativo)
```powershell
npm.cmd run squad:simulate
```
> **O que acontece:** Simula o Orquestrador acionando as 4 etapas na tarefa ativa, cria os testes Cypress das regras (`dist/xray/cypress/*.cy.ts`), monta o payload do Jira Xray (`dist/xray/evidences/xray-execution-payload.json`) e recompila o Grafo (`15 nós`).

### 2. Testar Veto de Segurança do `@sec` (SQL Injection bloqueado e corrigido)
```powershell
npm.cmd run squad:simulate-veto
```
> **O que acontece:** Simula o `@dev` subindo uma query concatenada no projeto PIX (`proj-pix-settlement`), o `@sec` vetando a entrega (`REJECTED_BY_SEC`), o retorno para o `@dev` corrigir com Bind Variable (`:p_cpf_pagador`) e a aprovação final com evidências Xray.

### 3. Testar Auto-Onboarding de Projeto Legado Não Mapeado (`examples/legacy-order-api`)
Temos um projeto C# + Oracle de exemplo na pasta [`examples/legacy-order-api/`](examples/legacy-order-api/README.md) que **ainda não está no grafo**. Para testar o analisador automático:
```powershell
node skills/repo-analyzer/scripts/analyze-repo.js "./examples/legacy-order-api" --keep-clone
```

### 4. Abrir a Sala de Guerra com 4 Terminais Sincronizados
```powershell
npm.cmd run squad:war-room
```

---

## 👑 PARTE 2: Prompts para Testar no `👑 Squad Orquestrador (TL)` (Seletor do VS Code)

No seletor de agentes do **GitHub Copilot Chat**, agora você escolhe apenas **1 único agente**: **`👑 Squad Orquestrador (TL)`**.
Você passa a demanda como Tech Lead e **ele mesmo controla `@architect` ➔ `@dev` ➔ `@sec` ➔ `@qa` (Cypress + Xray) ➔ `@scribe` (Grafo) de ponta a ponta!**

Cole qualquer um dos exemplos abaixo no chat com o **`👑 Squad Orquestrador (TL)`** selecionado:

### Exemplo 1 — Mapear Projeto Legado Não Catalogado + Implementar + Gerar Cypress/Xray
> `Mapeie o projeto existente em ./examples/legacy-order-api no grafo (criando proj-legacy-order-api, table-orders e rule-frete-gratis-vip), implemente um endpoint de validação de frete, audite a segurança (@sec) e gere a automação Cypress + evidências Jira Xray (@qa).`

### Exemplo 2 — Nova Regra de Negócio Completa no Motor PIX (`proj-pix-settlement`)
> `No proj-pix-settlement, crie a rule-bloqueio-chave-pix-suspeita (bloqueia chaves com > 3 denúncias no DICT), implemente o serviço C# em src/PixSettlement/PixFraudService.cs com Dapper parametrizado, audite LGPD e gere os testes Cypress + payload Jira Xray.`

### Exemplo 3 — Implementar Regra Existente de Limite PIX Noturno de Ponta a Ponta
> `Execute o ciclo completo da Squad para a rule-limite-pix-noturno do proj-pix-settlement: implemente src/PixSettlement/PixNightLimitValidator.cs seguindo a qry-consulta-limites-noturnos-pix, crie o teste unitário xUnit, rode a auditoria @sec e gere as evidências Cypress/Xray.`

### Exemplo 4 — Implementar Regra de Estorno Pro-Rata CDC (`proj-billing-engine`)
> `Execute o ciclo completo da Squad para a rule-estorno-proporcional-cancelamento no proj-billing-engine: implemente src/Billing/RefundCalculator.cs (100% até 7 dias e pro-rata após 7 dias), audite e gere os artefatos Cypress e Jira Xray.`

### Exemplo 5 — Criar um Projeto Greenfield (100% do Zero)
> `Vamos criar do zero o projeto proj-notificacoes-push (disparo de alertas transacionais via RabbitMQ): desenhe o proj-*, adr-*, table-notification-logs e rule-optout-lgpd no grafo, implemente o worker inicial e gere o pacote de testes Xray.`

---

## 📂 Onde conferir os arquivos gerados nos testes

- **Contexto Ultra-Compacto (Token-Saver):** [`dist/context/active-context.md`](dist/context/active-context.md)
- **Scripts Cypress E2E com `cy.screenshot()`:**
  - [`dist/xray/cypress/rule-cobranca-recorrente.cy.ts`](dist/xray/cypress/rule-cobranca-recorrente.cy.ts)
  - [`dist/xray/cypress/rule-limite-pix-noturno.cy.ts`](dist/xray/cypress/rule-limite-pix-noturno.cy.ts)
  - [`dist/xray/cypress/rule-estorno-proporcional-cancelamento.cy.ts`](dist/xray/cypress/rule-estorno-proporcional-cancelamento.cy.ts)
- **Payload de Execução para Upload no Jira Xray:** [`dist/xray/evidences/xray-execution-payload.json`](dist/xray/evidences/xray-execution-payload.json)
- **Plano de Testes Formatado para Jira:** [`dist/xray/PLANO_DE_TESTES_XRAY.md`](dist/xray/PLANO_DE_TESTES_XRAY.md)
- **Pacote do Microsoft Teams / Copilot Studio:** [`dist/teams/00_CATALOGO_E_MAPA_GERAL_DA_AREA.md`](dist/teams/00_CATALOGO_E_MAPA_GERAL_DA_AREA.md)
