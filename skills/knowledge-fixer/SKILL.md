---
name: knowledge-fixer
description: Repara automaticamente inconsistências na base de conhecimento (sincronização de IDs, datas ausentes, pastas incorretas, criação de stubs para links órfãos e desagregação de notas longas).
version: 1.0.0
---

# Skill: Knowledge Fixer (Auto-Healing & Remediation)

## Papel
Você atua como o **Remediation & Healing Engineer** da base de conhecimento. Seu papel é fechar o ciclo de qualidade: receber os apontamentos de erros emitidos pelo `knowledge-linter` e `knowledge-governance` e aplicar correções imediatas para restabelecer a integridade do grafo.

---

## 1. Tipos de Correção

### A. Reparos Mecânicos Automatizados (Script `fix.js`)
Executados diretamente sem custo de tokens da LLM:
- **`SYNC_ID`:** Ajusta o campo `id` no frontmatter para bater com o nome do arquivo.
- **`MOVE_FILE`:** Se um arquivo tiver prefixo incompatível com sua pasta (ex: `qry-*` na pasta `projects/`), move para o diretório correto.
- **`INJECT_DEFAULTS`:** Preenche campos ausentes com valores padrão (data atual em `updated_at`, array `tags: []`).
- **`CREATE_STUBS` (Cura de Links Órfãos):** Ao usar `--create-stubs`, cria notas placeholder com `status: stub` para links `[[...]]` que ainda não possuem arquivo criado.

**Comandos Shell:**
```bash
# Simular sem alterar arquivos
node skills/knowledge-fixer/scripts/fix.js --dry-run

# Executar correções básicas
node skills/knowledge-fixer/scripts/fix.js

# Executar correções E criar stubs para todos os links órfãos
node skills/knowledge-fixer/scripts/fix.js --create-stubs
```

---

### B. Reparos Cognitivos (Executados pelo Agente LLM)
Problemas que demandam interpretação semântica:
1. **Desagregação de Notas Longas (`LINT-007`):**
   - Quando um arquivo tem mais de 400 palavras misturando conceitos:
     - Crie os nós atômicos satélites (ex: extrair SQL para `queries/qry-*.md`).
     - Substitua o bloco original por uma referência `[[qry-*]]`.
2. **Enriquecimento de Stubs:**
   - Pegar notas que possuem `status: stub` e preenchê-las com a regra, SQL ou documentação definitiva.

---

## 2. O Ciclo de Auto-Recuperação (Self-Healing Protocol)

Sempre que executar manutenção na base:

```bash
# Passo 1: Auditar a base
node skills/knowledge-linter/scripts/validate.js

# Passo 2: Se houver erros, rodar o auto-fixer com stubs
node skills/knowledge-fixer/scripts/fix.js --create-stubs

# Passo 3: Revalidar a base para garantir 100% de conformidade
node skills/knowledge-linter/scripts/validate.js

# Passo 4: Recompilar o índice consolidado do grafo
node skills/knowledge-governance/scripts/compile-graph.js
```
