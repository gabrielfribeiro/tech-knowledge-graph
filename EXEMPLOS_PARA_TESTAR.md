# 🧪 Playbook de Exemplos Práticos para Testar a Squad e o Grafo

Este guia contém **exemplos prontos (copiar e colar)** para testar todas as capacidades da sua Squad de IA com **Custo Mínimo de Tokens (Modo Zero-Fluff)**.

---

## ⚡ Como funciona a Economia de Custo de IA (Token-Saver)

1. **Pacote de Contexto Minificado ([`dist/context/active-context.md`](dist/context/active-context.md)):**
   - Em vez de a IA ler 15 arquivos Markdown (~4.500 tokens por pergunta), o script `node scripts/context-pack.js` comprime o Perfil da Squad + os nós conectados à tarefa ativa em **~250 tokens** (redução de **~94%** de leitura).
2. **Offload Determinístico (0 Tokens de LLM):**
   - Linter, Auto-Fixer, Compilação do Grafo, Extração de Plugins VS Code e Geração de Cypress + Jira Xray rodam localmente via Node.js sem gastar 1 centavo de IA.
3. **Modo Telegráfico nos Agentes (`.github/agents/*.agent.md`):**
   - Os 4 agentes estão proibidos de dar "bom dia", explicar teoria ou repetir código no chat. Eles editam os arquivos direto e respondem em **até 4 linhas** (`STATUS / ARQUIVOS / PRÓXIMO`).

---

## 🎮 PARTE 1: Testes Rápidos via Terminal (0 Tokens de IA)

Rode estes comandos no terminal do VS Code (`Ctrl + '`) para validar toda a engrenagem local:

### 1. Testar Ciclo Completo (Architect ➔ Dev ➔ Sec + QA Cypress/Xray ➔ Grafo Vegetativo)
```powershell
npm.cmd run squad:simulate
```
> **O que acontece:** Simula os 4 agentes trabalhando na tarefa ativa, gera o contexto minificado em `dist/context/active-context.md`, cria os testes Cypress das regras (`dist/xray/cypress/*.cy.ts`), monta o payload do Jira Xray (`dist/xray/evidences/xray-execution-payload.json`) e recompila o Grafo (`15 nós`).

### 2. Testar Veto de Segurança do `@sec` (SQL Injection bloqueado e corrigido)
```powershell
npm.cmd run squad:simulate-veto
```
> **O que acontece:** Simula o `@dev` subindo uma query concatenada no projeto PIX (`proj-pix-settlement`), o `@sec` vetando a entrega (`REJECTED_BY_SEC`), o retorno para o `@dev` corrigir com Bind Variable (`:p_cpf_pagador`) e a aprovação final com evidências Xray.

### 3. Testar Geração de Contexto Minificado (Token-Saver) para qualquer Projeto/Regra
```powershell
node scripts/context-pack.js --project proj-pix-settlement --task rule-limite-pix-noturno
```
> Abra [`dist/context/active-context.md`](dist/context/active-context.md) para ver como toda a especificação de PIX Noturno + Tabela Oracle + ADR cabe em poucas linhas ultra-densas.

### 4. Testar Auto-Onboarding de Projeto Legado Não Mapeado (`examples/legacy-order-api`)
Temos um projeto C# + Oracle de exemplo na pasta [`examples/legacy-order-api/`](examples/legacy-order-api/README.md) que **ainda não está no grafo**. Para testar o analisador automático:
```powershell
node skills/repo-analyzer/scripts/analyze-repo.js "./examples/legacy-order-api" --keep-clone
```

### 5. Abrir a Sala de Guerra com 4 Terminais Sincronizados
```powershell
npm.cmd run squad:war-room
```

---

## 🤖 PARTE 2: Prompts Curtos para Testar no Dropdown do GitHub Copilot Chat

No painel do **GitHub Copilot Chat**, escolha o agente correspondente no seletor (dropdown ao lado do botão de enviar) e cole os prompts abaixo:

---

### Cenário A — Testando o `📐 Architect (Squad)`

1. **Mapear o projeto legado de Pedidos (`examples/legacy-order-api`) que não está no grafo:**
   > `Mapeie o projeto não catalogado em ./examples/legacy-order-api, crie proj-legacy-order-api, table-orders e rule-frete-gratis-vip no grafo e libere para o @dev.`

2. **Criar uma nova especificação de negócio no motor de PIX (`proj-pix-settlement`):**
   > `No proj-pix-settlement, crie a rule-bloqueio-chave-pix-suspeita (bloqueia chaves com > 3 denúncias no DICT) vinculada à table-pix-transactions e libere READY_FOR_DEV.`

3. **Criar um projeto Greenfield (100% do zero):**
   > `Crie do zero a arquitetura do projeto proj-notificacoes-push (envio de push e WhatsApp via RabbitMQ), criando proj-*, adr-*, table-notification-logs e rule-optout-lgpd.`

---

### Cenário B — Testando o `💻 Dev (Squad)`

1. **Implementar a Regra de Limite PIX Noturno (.NET 8 + Dapper + Oracle):**
   > `Implemente em src/PixSettlement/PixNightLimitService.cs a validação da rule-limite-pix-noturno usando a query parametrizada qry-consulta-limites-noturnos-pix e acione READY_FOR_VALIDATION.`

2. **Implementar a Regra de Estorno Pro-Rata de Cancelamento (`proj-billing-engine`):**
   > `Implemente em src/Billing/RefundCalculator.cs a rule-estorno-proporcional-cancelamento (100% até 7 dias CDC e pro-rata após 7 dias) e acione READY_FOR_VALIDATION.`

---

### Cenário C — Testando o `🛡️ Sec Auditor (Squad)`

1. **Auditar a implementação atual e tabelas LGPD:**
   > `Audite a tarefa ativa em dist/context/active-context.md verificando SQL Injection (bind variables), secrets e mascaramento LGPD de NR_CPF_PAGADOR na table-pix-transactions.`

---

### Cenário D — Testando o `🧪 QA & Grafo (Squad)` (Cypress + Jira Xray)

1. **Gerar Automação Cypress + Pacote de Evidências Jira Xray para todas as regras:**
   > `Gere os scripts Cypress (.cy.ts) com cy.screenshot() e o pacote de evidências do Jira Xray para rule-limite-pix-noturno e rule-estorno-proporcional-cancelamento, e aprove a entrega.`

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
