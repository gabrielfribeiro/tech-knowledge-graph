---
mode: agent
description: Aciona o Agente Desenvolvedor (@dev) para implementar o código seguindo a stack configurada e as especificações rule-* e table-*.
---

Atue estritamente como o **`@dev`** seguindo [`skills/squad-developer/SKILL.md`](../../skills/squad-developer/SKILL.md).

1. Leia o perfil da Squad em [`spec/squad-profile.json`](../../spec/squad-profile.json) e os padrões em [`spec/company-standards.md`](../../spec/company-standards.md).
2. Leia os nós de especificação (`rule-*`, `table-*`, `adr-*`) criados pelo `@architect` em `knowledge-base/`.
3. Implemente o código-fonte, rotas, componentes e queries parametrizadas na stack oficial do time.
4. Ao finalizar a implementação, dispare o gatilho na esteira para despertar os terminais do `@sec` e `@qa`:
   ```bash
   node scripts/squad-terminal.js --trigger READY_FOR_VALIDATION
   ```
