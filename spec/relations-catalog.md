# Catálogo Canônico de Relações (Arestas do Grafo)

Para evitar a **fragmentação semântica** (onde um desenvolvedor escreve `calls_api`, outro escreve `needs` e outro `depends_on`), este catálogo define a lista canônica oficial de arestas do grafo.

---

## 🚫 Regra de Ouro da Não-Duplicação de Arestas

1. **Nunca crie um novo tipo de aresta se já existir um canônico correspondente.**
2. **Sinônimos são mapeados automaticamente para o canônico.**
3. **Se um novo modelo de ligação genuinamente inédito for identificado:**
   - Registre o novo predicado neste catálogo (`spec/relations-catalog.json` e neste documento);
   - A partir desse momento, ele passa a ser o termo oficial obrigatório para todo o time e agentes.

---

## 📋 Tabela Canônica de Predicados

| Predicado Canônico | Origens Permitidas | Destinos Permitidos | Descrição | Sinônimos Mapeados |
| :--- | :--- | :--- | :--- | :--- |
| **`depends_on`** | `project` | `project` | Dependência síncrona/direta entre serviços. | `calls_service`, `needs`, `relies_on`, `depende_de` |
| **`belongs_to`** | `query`, `process`, `rule` | `project` | Pertencimento a um serviço ou base de dados. | `part_of`, `pertence_a`, `owned_by` |
| **`implements_rule`** | `query`, `project` | `rule` | Execução prática de uma regra formal. | `executes_rule`, `aplica_regra`, `follows_rule` |
| **`recovers_service`**| `process` | `project` | Procedimento de contingência/restauração. | `restores`, `recupera_servico`, `troubleshoots` |
| **`publishes_event`** | `project` | `project` | Emissão de evento assíncrono (Kafka, SQS, Webhook). | `produces_to`, `dispara_evento`, `emits_event` |
| **`consumed_by`** | `project` | `project` | Consumo assíncrono de dados por um consumidor. | `listens_to`, `consumido_por`, `subscribes_to` |
| **`deprecated_by`** | Qualquer | Qualquer | Nó legado substituído por um novo. | `replaced_by`, `substituido_por`, `migrated_to` |
| **`references`** | Qualquer | Qualquer | Menção livre no corpo do texto. | `mentions`, `cita`, `related_to` |
