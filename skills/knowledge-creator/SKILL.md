---
name: knowledge-creator
description: Extrai e cria nós atômicos de conhecimento técnico (projetos, regras, queries, processos, ADRs) em formato Markdown para grafos de conhecimento interoperáveis entre agentes de IA e Obsidian.
version: 1.0.0
---

# Skill: Knowledge Creator (Criador de Nós de Conhecimento)

## Papel
Você atua como o **Knowledge Architect** da área técnica. Seu objetivo é ingerir informações técnicas (código, documentações existentes, transcrições de reuniões, regras de negócio ou queries SQL) e transformá-las em nós atômicos padronizados, com links relacionais bidirecionais (`[[id]]`) e metadados estruturados em YAML.

---

## 1. Princípios Fundamentais

1. **Atomicidade:** 1 arquivo = 1 conceito. Nunca misture projeto, queries e regras no mesmo arquivo.
2. **Baixo Consumo de Tokens:** Redija de forma concisa e técnica. Elimine introduções retóricas e saudações. Cada nota deve ter idealmente entre 100 e 300 palavras.
3. **Padrão de IDs e Nomes de Arquivo:** O nome do arquivo DEVE ser `<id>.md`.
4. **Links Bidirecionais:** Relacione nós usando `[[id-do-no]]`.

---

## 2. Padrão de Nomenclatura e Pastas

| Tipo | Diretório Alvo | Formato do ID | Exemplo de Arquivo |
| :--- | :--- | :--- | :--- |
| **Projeto / Serviço** | `knowledge-base/projects/` | `proj-<kebab-case>` | `knowledge-base/projects/proj-checkout-api.md` |
| **Regra de Negócio** | `knowledge-base/rules/` | `rule-<kebab-case>` | `knowledge-base/rules/rule-calculo-estorno.md` |
| **Query / SQL** | `knowledge-base/queries/` | `qry-<kebab-case>` | `knowledge-base/queries/qry-busca-pedidos-travados.md` |
| **Processo / Runbook** | `knowledge-base/processes/` | `proc-<kebab-case>` | `knowledge-base/processes/proc-deploy-hotfix.md` |
| **Decisão de Arquitetura** | `knowledge-base/adrs/` | `adr-<000>-<kebab-case>` | `knowledge-base/adrs/adr-001-adotar-postgres.md` |

---

## 3. Estrutura dos Nós

### 3.1 Projeto / Serviço (`projects/proj-*.md`)
```markdown
---
id: proj-<nome>
type: project
title: <Nome Legível do Projeto>
responsavel: <Squad ou Responsável>
repositorio: <URL do Repositório>
updated_at: <YYYY-MM-DD>
tags: [tag1, tag2]
depends_on:
  - "[[proj-<outro-servico>]]"
---

# <Nome Legível do Projeto>

## Finalidade
Descrição técnica em 2 ou 3 frases sobre o propósito principal do serviço.

## Tecnologias e Infra
- **Linguagem / Framework:** <Stack>
- **Banco de Dados:** <Instância / Engine>
- **Mensageria / Filas:** <Kafka / SQS / RabbitMQ>

## Pontos de Entrada Críticos
- `<METODO> <ENDPOINT>`: <Resumo>
```

### 3.2 Regra de Negócio (`rules/rule-*.md`)
```markdown
---
id: rule-<nome>
type: rule
title: <Nome Legível da Regra>
dominio: <Nome do Domínio>
updated_at: <YYYY-MM-DD>
tags: [regras, dominio]
related_projects:
  - "[[proj-<servico>]]"
---

# Regra: <Nome da Regra>

## Definição
Explicação técnica e objetiva da regra.

## Critérios de Aplicação
- Critério 1
- Critério 2

## Referências
- Implementado em: `[[proj-<servico>]]`
```

### 3.3 Query / Script de Banco (`queries/qry-*.md`)
```markdown
---
id: qry-<nome>
type: query
title: <Título da Query>
database: <Instância / Database>
updated_at: <YYYY-MM-DD>
tags: [sql, tag]
belongs_to: "[[proj-<servico>]]"
implements_rule: "[[rule-<nome>]]"
---

# Query: <Título da Query>

## Objetivo
Finalidade técnica e de negócio da consulta.

## SQL
```sql
SELECT ...
```

## Como Executar / Cuidados
- **Impacto de Performance:** <Baixo / Médio / Crítico>
- **Ações Associadas:** `[[proc-<runbook>]]`
```

### 3.4 Processo / Runbook (`processes/proc-*.md`)
```markdown
---
id: proc-<nome>
type: process
title: <Título do Processo>
updated_at: <YYYY-MM-DD>
tags: [runbook, operacao]
related_projects:
  - "[[proj-<servico>]]"
---

# Processo: <Título do Processo>

## Quando Acionar
Gatilho operacional (ex: incidentes, rotinas, deploys manuais).

## Pré-requisitos
- Permissões, acessos, VPN, ferramentas necessárias.

## Passo a Passo
1. Passo 1 com links para queries ou scripts (ex: `[[qry-<nome>]]`).
2. Passo 2.
3. Validação final.
```

---

## 4. Protocolo de Execução do Agente

1. **Decomposição:** Ao receber um bloco de informação, identifique todas as entidades implícitas ou explícitas.
2. **Geração de IDs:** Normalize os nomes usando `kebab-case` precedido pelo prefixo correspondente (`proj-`, `rule-`, `qry-`, `proc-`, `adr-`).
3. **Interligação:** Preencha os campos `belongs_to`, `implements_rule`, `related_projects` e referências no corpo do texto usando `[[id]]`.
4. **Gravação:** Salve cada arquivo em seu respectivo diretório dentro de `knowledge-base/`.
5. **Relatório Conciso de Saída:**
   - Lista dos arquivos criados.
   - Conexões (arestas) estabelecidas.
   - Gaps identificados (ex: entidades citadas que ainda não possuem nota criada).
