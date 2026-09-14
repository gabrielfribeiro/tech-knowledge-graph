---
name: knowledge-linter
description: Valida a conformidade de schemas YAML, integridade referencial de links bidirecionais, regras de atomicidade e orçamento de tokens na base de conhecimento.
version: 1.0.0
---

# Skill: Knowledge Linter (Validador e Auditor da Base)

## Papel
Você atua como o **Quality & Compliance Engineer** da base de conhecimento. Sua responsabilidade é garantir que nenhuma nota quebre o grafo, viole os padrões de nomenclatura, crie links órfãos ou ultrapasse o orçamento de tokens.

---

## 1. Regras de Validação (Lint Rules)

### 🏷️ Nomenclatura e Identificação
- **`LINT-001` (ID & Filename):** O nome do arquivo DEVE ser `<id>.md`.
- **`LINT-002` (Prefixo e Pasta):**
  - Prefixo `proj-` deve estar em `knowledge-base/projects/` com `type: project`.
  - Prefixo `rule-` deve estar em `knowledge-base/rules/` com `type: rule`.
  - Prefixo `qry-` deve estar em `knowledge-base/queries/` com `type: query`.
  - Prefixo `proc-` deve estar em `knowledge-base/processes/` com `type: process`.
  - Prefixo `adr-` deve estar em `knowledge-base/adrs/` com `type: adr`.

### 📋 Campos Obrigatórios do Frontmatter
- **`LINT-003` (Campos Globais):** Todo arquivo deve conter:
  - `id: string`
  - `type: "project" | "rule" | "query" | "process" | "adr"`
  - `title: string`
  - `updated_at: YYYY-MM-DD`
  - `tags: array`
- **`LINT-004` (Campos Específicos por Tipo):**
  - **Query:** deve conter `database: string` e `belongs_to: "[[proj-<nome>]]"`.
  - **Rule:** deve conter `dominio: string` e `related_projects: array`.
  - **Process:** deve conter `related_projects: array`.
  - **Project:** deve conter `responsavel: string`.

### 🔗 Integridade Referencial
- **`LINT-005` (Links Órfãos / Dead Links):** Todo link no formato `[[id]]` (seja no frontmatter ou no corpo markdown) DEVE corresponder a um arquivo existente em `knowledge-base/**/<id>.md`.
- **`LINT-006` (Semântica de Relação):**
  - O campo `belongs_to` de uma query deve apontar estritamente para um nó do tipo `project`.
  - O campo `implements_rule` de uma query deve apontar estritamente para um nó do tipo `rule`.

### ⚡ Atomicidade e Economia de Tokens
- **`LINT-007` (Token Budget):** O corpo do arquivo (excluindo frontmatter) não deve ultrapassar **400 palavras**. Se ultrapassar, emitir aviso de recomendação de desagregação.
- **`LINT-008` (Isolamento de Responsabilidade):**
  - Arquivos de projeto NÃO devem conter blocos de queries SQL completos (apenas referências `[[qry-*]]`).
  - Arquivos de regra NÃO devem conter código SQL de implementação (apenas referências).

---

## 2. Modos de Execução

### Modo A: Execução via Script Automatizado (Custo Zero de Tokens)
Se o ambiente do agente permitir execução de comandos shell, execute o script embutido:
```bash
node skills/knowledge-linter/scripts/validate.js
```
O script varre todos os arquivos em `knowledge-base/`, avalia as regras de `LINT-001` a `LINT-008` e retorna um relatório estruturado em JSON ou tabela.

### Modo B: Validação Cognitiva pelo LLM
Caso o script não possa ser executado, o agente deve:
1. Ler o arquivo alvo e os metadados dos nós referenciados.
2. Conferir manualmente a lista de regras de `LINT-001` a `LINT-008`.
3. Emitir o Relatório de Diagnóstico padronizado.

---

## 3. Formato do Relatório de Validação

O agente (ou o script) deve reportar os resultados no seguinte formato:

```markdown
## 🩺 Relatório de Validação da Base de Conhecimento

**Total de Arquivos Analisados:** X
**Status Geral:** [PASS | WARN | FAIL]

| Severidade | Arquivo | Regra | Detalhe | Ação Corretiva |
| :--- | :--- | :--- | :--- | :--- |
| ❌ ERROR | `queries/qry-busca.md` | `LINT-005` | Aponta para `[[rule-xyz]]` que não existe. | Criar a regra ou ajustar o link. |
| ⚠️ WARN | `projects/proj-core.md` | `LINT-007` | 520 palavras detectadas. | Mover detalhes operacionais para runbooks. |
```
