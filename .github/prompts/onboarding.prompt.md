---
mode: agent
description: Configura o Nome do Time, Tech Lead, Stacks Padrão (React, .NET, Oracle, etc.) e sincroniza os padrões dos plugins do VS Code.
---

Você está conduzindo o **Onboarding Inicial da Squad de IA**.

1. Leia o arquivo [`spec/squad-profile.json`](../../spec/squad-profile.json).
2. Pergunte ao usuário (ou confirme os valores caso ele já tenha informado na mensagem):
   - **Nome do Time / Squad de IA**
   - **Nome do Tech Lead**
   - **Stack de Frontend** (ex: React + TypeScript, Angular, etc.)
   - **Stack de Backend** (ex: .NET 8, Node.js, Go, Java, Python)
   - **Banco de Dados & ORM** (ex: Oracle, PostgreSQL, SQL Server)
   - **Padrão de Arquitetura** (ex: Clean Architecture, Hexagonal, DDD)
3. Assim que ele responder, atualize `spec/squad-profile.json` com `"is_configured": true` e execute:
   ```bash
   node skills/standards-extractor/scripts/extract-vscode-standards.js
   ```
   para importar automaticamente os padrões dos plugins instalados no VS Code dele!
4. Apresente um resumo de boas-vindas do Time configurado.
