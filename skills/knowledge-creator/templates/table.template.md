---
id: table-{{name}}
type: table
title: {{title}}
database: {{database_name}}
schema: {{schema_name}}
service_owner: "[[proj-service]]"
primary_key: id
foreign_keys: []
indexes: []
retention: permanente
updated_at: {{date}}
tags: [database, table, {{tags}}]
---

# Tabela: {{title}}

## Descrição e Domínio
{{description}}

## Dicionário de Dados / Colunas Principais
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID / BIGINT | Sim | Identificador único primário. |
| `status` | VARCHAR(50) | Sim | Estado da entidade no ciclo de vida. |
| `created_at` | TIMESTAMP | Sim | Data e hora de criação do registro. |
| `updated_at` | TIMESTAMP | Sim | Data e hora da última modificação. |

## Índices e Performance
- **Primary Key:** `id`
- **Índices Secundários:** {{indexes}}

## Relações e Integridade
- **Serviço Proprietário:** `[[proj-service]]`
- **Consultas Frequentes:** `[[qry-query-name]]`
- **Regras de Negócio:** `[[rule-business-rule]]`
