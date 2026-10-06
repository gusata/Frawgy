# Edge Ghosty: recuperação de configuração inválida do chat

## Objetivo

Corrigir `Codex failed to load workspace requirements` ao abrir o chat rápido.

## Alterações realizadas

- A causa era um `config.toml` antigo no `CODEX_HOME` isolado do Ghosty: ele definia um perfil `[permissions]` sem `default_permissions`, rejeitado pelo Codex CLI.
- Foi feita uma cópia de segurança em `config.toml.edge-ghosty-invalid-profile.bak` e removido somente o `config.toml` isolado que continha esse bloco do Ghosty.
- O login e os dados do app-server foram preservados. A implementação atual usa o perfil nativo `:read-only` e não recria essa configuração antiga.
- Registrada a descoberta no `AGENTS.md`.

## Arquivos tocados

- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-invalid-config-recovery.md` (este snapshot)
- Dados locais fora do repositório: removido `config.toml` do `CODEX_HOME` isolado; cópia preservada como `config.toml.edge-ghosty-invalid-profile.bak`.

## Validações

- Antes da correção, `codex login status` no `CODEX_HOME` do Ghosty retornou `Error loading configuration: config defines [permissions] profiles but does not set default_permissions`.
- Após remover somente o arquivo inválido, o mesmo comando retornou `Logged in using ChatGPT`.
- Nenhum teste automatizado ou build foi executado; não houve alteração no código da aplicação.

## Problemas conhecidos

- O popup atual precisa ser fechado e reaberto para o app-server iniciar lendo a configuração limpa.
- A cópia de segurança fica no diretório local do app; não restaurá-la, pois contém o perfil incompleto que causou o erro.

## Próximos passos

- Reabrir o Ghosty, abrir o chat rápido e enviar uma mensagem.
- Se a mesma mensagem persistir depois da reinicialização, capturar o erro atualizado do app-server; a configuração inválida local já foi removida.
