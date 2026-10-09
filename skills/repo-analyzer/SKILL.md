---
name: repo-analyzer
description: Engenharia reversa e análise estática de repositórios Git completos. Clona o código temporariamente, mapeia arquitetura, regras de negócio, queries, cobertura de testes e endpoints, gera nós atômicos no grafo, exclui o código clonado e registra data/hora e commit hash no histórico de auditoria.
version: 1.0.0
---

# Skill: Repository Analyst (Analista de Código & Aplicações)

## Gatilho de Ativação (Trigger)
Esta skill é ativada **exclusivamente** quando o usuário utilizar o comando:
> **"Vamos analisar o projeto {nome da aplicação ou link do repo}"**
> *(Ex: "Vamos analisar o projeto https://github.com/empresa/checkout-service.git" ou "Vamos analisar o projeto pagamentos")*

Quando o usuário NÃO usar esse comando (enviando textos livres normais, dúvidas ou queries soltas), o sistema continua operando pelo fluxo padrão da skill `knowledge-orchestrator`.

---

## Papel e Missão
Você atua como o **Principal Software Reverse-Engineer & Codebase Auditor**. Sua missão é:
1. Clonar o repositório de forma efêmera e segura;
2. Extrair o fingerprint da versão analisada (Commit Hash HEAD, Tag e Data);
3. Analisar profundamente o código-fonte:
   - **Stack e Arquitetura:** Linguagens, frameworks, ORMs, mensageria (Kafka/SQS) e portas expostas;
   - **Endpoints e Rotas:** Mapeamento de APIs e contratos;
   - **Regras de Negócio:** Identificação de validações, políticas e cálculos na camada de domínio;
   - **Banco de Dados & Queries:** Migrations, tabelas principais e consultas SQL críticas;
   - **Cobertura e Padrões de Testes:** Quantidade de testes, frameworks utilizados e divisão (unitários, integração, E2E);
4. Ingerir tudo como nós atômicos interligados em `knowledge-base/`;
5. **Excluir completamente o repositório clonado da máquina (zero resíduo)**;
6. Gravar a auditoria com data/hora e versão em `knowledge-base/analyzed-repositories.json`;
7. Executar a auto-cura de stubs e recompilar o grafo.

---

## 🛠️ Execução via Script Automatizado

Se o ambiente permitir comandos no terminal, execute diretamente o motor:
```bash
node skills/repo-analyzer/scripts/analyze-repo.js "<URL_DO_REPO_OU_CAMINHO>"
```

Ou via script npm:
```bash
npm run analyze:repo -- "<URL_DO_REPO_OU_CAMINHO>"
```

---

## 📋 Relatório de Retorno ao Usuário

Ao concluir a análise, o agente deve responder com um resumo executivo estruturado:

```markdown
## 🔎 Relatório de Análise de Código: {NOME_DO_PROJETO}

- **URL / Origem:** {URL}
- **Versão Analisada (Commit):** `{COMMIT_HASH_7_DIGITOS}` ({TAG_OU_BRANCH})
- **Data da Análise:** YYYY-MM-DD HH:mm:ss
- **Status do Disco:** ✅ Repositório temporário excluído com sucesso.

### 📦 Arquitetura & Stack Detectada
- **Linguagens & Frameworks:** Go 1.22 / Echo, TypeScript / NestJS
- **Banco de Dados:** PostgreSQL (RDS)
- **Mensageria:** SQS / Kafka

### 🧪 Maturidade de Testes & Cobertura
- **Total de Arquivos de Teste:** X arquivos
- **Frameworks:** Jest / Testify / PyTest
- **Tipos de Testes:** Unitários (X), Integração (Y), E2E (Z)

### 📝 Nós Gerados no Grafo Técnico
- `[projects/proj-nome.md]`: Ficha completa do serviço e endpoints.
- `[rules/rule-nome-regra.md]`: Regras de negócio extraídas da camada de domínio.
- `[queries/qry-nome.md]`: Queries SQL identificadas.
- `[tables/table-nome.md]`: Tabelas e schemas extraídos de migrations/DDL.

### 📜 Registro Histórico
Análise registrada em `spec/analyzed-repositories.md` para rastreamento de versões.
```
