---
name: standards-extractor
description: Extrai automaticamente padrões de arquitetura, código, snippets, prompts e regras de segurança a partir dos plugins/extensões instalados no VS Code da máquina corporativa, atualizando as Skills da Squad.
version: 1.0.0
---

# Skill: VS Code Standards Extractor (Absorvedor de Padrões da Empresa)

## Gatilho de Ativação
Ative esta skill quando o usuário pedir:
> **"Vamos sincronizar os padrões dos plugins do VS Code"**
> *(Ou durante o Onboarding da Squad no PC da empresa)*

---

## Papel e Funcionamento
Muitas empresas distribuem seus padrões de desenvolvimento, linters, snippets e instruções através de extensões internas instaladas no VS Code (`~/.vscode/extensions/`).

Para que a nossa **Squad de Agentes (`@architect`, `@dev`, `@sec`, `@qa`)** conheça e aplique essas mesmas regras preventivamente (antes de escrever o código) e de forma integrada ao Grafo de Conhecimento:

1. O script varre os diretórios `~/.vscode/extensions/` e `~/.vscode-insiders/extensions/`;
2. Inspeciona `package.json`, configurações (`contributes.configuration`), participantes de chat (`chatParticipants`), arquivos de instruções (`.instructions.md`, `.prompt.md`), snippets e templates de código;
3. Consolida as regras descobertas em `spec/company-standards.md` e `spec/company-standards.json`;
4. Atualiza o perfil da Squad em `spec/squad-profile.json`.

---

## 🛠️ Como Executar via Terminal

### 1. Varredura Geral de Extensões Instaladas:
```bash
npm run sync:standards
```

### 2. Filtrando pelo Nome da Empresa ou Prefixo do Plugin:
```bash
npm run sync:standards -- "nome-da-empresa"
```
