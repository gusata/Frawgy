# Edge Ghosty: perfil de permissões compatível com Windows

## Objetivo

Corrigir a rejeição de `readOnly.access` no chat rápido e permitir que `thread/start` e `turn/start` iniciem no Codex CLI instalado.

## Alterações realizadas

- O handshake do app-server declara `capabilities.experimentalApi = true` para habilitar o campo de seleção de perfil.
- `thread/start` e `turn/start` selecionam o perfil nativo `:read-only` pelo campo `permissions`; removidos `sandbox` e `sandboxPolicy` desses pedidos.
- Removido `--sandbox read-only` da linha de comando para não combinar o modo legado com um perfil de permissões.
- Confirmado que o sandbox unelevated do Windows recusa o perfil customizado `:root = deny` com concessão de leitura ao workspace, em vez de iniciar sem isolamento. O app mantém o perfil suportado `:read-only`, que bloqueia escritas; `shell_tool` e hooks continuam desativados.
- Atualizado `AGENTS.md` para registrar a decisão e a limitação do sandbox do Windows.

## Arquivos tocados

- `src-tauri/src/codex_chat.rs`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-permission-profile-windows-fix.md` (este snapshot)

## Validações

- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou; Git mostrou somente avisos existentes de conversão LF/CRLF.
- No Codex CLI 0.160.1, o schema experimental confirmou que `permissions` é o campo de perfil em `thread/start` e `turn/start` e que `experimentalApi` o habilita.
- Uma sessão local isolada confirmou `permissionProfile/list` com `:read-only` permitido e `thread/start` bem-sucedido com esse perfil.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- O perfil nativo `:read-only` permite leitura ampla do filesystem; ele não permite escrita. O shell e os hooks permanecem desativados. Restringir leituras somente à pasta do chat requer um sandbox Windows elevado que consiga aplicar essa política.
- A conversa autenticada ainda precisa ser conferida no app após reiniciar o Ghosty.

## Próximos passos

- Reiniciar o Edge Ghosty e enviar uma mensagem no chat rápido.
- Confirmar streaming, pesquisa web e resposta autenticada.
