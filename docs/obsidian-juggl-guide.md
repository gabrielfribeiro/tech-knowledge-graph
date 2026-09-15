# Guia de Configuração do Juggl no Obsidian

Este documento ensina como visualizar o **Grafo de Propriedades com Rótulos de Aresta (Edge Labels)** utilizando o plugin comunitário **Juggl** dentro do Obsidian.

---

## 1. O que é o Juggl?

O [Juggl](https://juggl.io/) é um plugin de visualização avançada de grafos para o Obsidian, construído sobre o Cytoscape.js. Ele difere do visualizador nativo por suportar **arestas tipadas e rotuladas diretamente sobre as setas**.

---

## 2. Como Instalar

1. Abra a pasta `knowledge-base/` como um **Vault** no Obsidian.
2. Vá em **Settings** (ícone de engrenagem) > **Community plugins**.
3. Desative o "Restricted mode" e clique em **Browse**.
4. Procure por **Juggl** (autor: Emile van Krieken).
5. Clique em **Install** e, em seguida, em **Enable**.

---

## 3. Configurações Recomendadas para nosso Grafo

Nas opções do plugin (**Settings > Juggl**):

1. **Aba General:**
   - **Show Edge Labels:** Ative esta opção (Permite ver nomes como `depends_on`, `implements_rule` desenhados sobre as linhas).
   - **Layout Mode:** Recomendado `D3-force` ou `Cose-bilkent` para grafos de arquitetura técnica.
2. **Aba Metadata:**
   - O Juggl lê nativamente chaves do Frontmatter YAML como predicados de aresta. Como nossas notas utilizam `depends_on`, `belongs_to`, `implements_rule`, etc., ele mapeia as conexões automaticamente.

---

## 4. Cores e Estilos Recomendados

Você pode personalizar as cores dos nós no Juggl com base no campo `type` do YAML:
- **`project`**: Azul (`#3b82f6`)
- **`rule`**: Roxo (`#a855f7`)
- **`query`**: Âmbar / Laranja (`#f59e0b`)
- **`process`**: Verde (`#10b981`)
- **`stub`**: Vermelho / Rosa (`#f43f5e`)

---

## 5. Como Abrir o Grafo

1. Use o atalho `Ctrl + P` (ou `Cmd + P` no Mac) para abrir a Command Palette do Obsidian.
2. Digite **`Juggl: Open Global Graph`** para ver todo o ecossistema.
3. Ou digite **`Juggl: Open Local Graph`** enquanto estiver em uma nota para ver apenas os serviços e regras conectados diretamente a ela.
