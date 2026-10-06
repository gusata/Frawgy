# Edge Ghosty: correção do formato de sandbox no app-server

## Objetivo

Corrigir a rejeição do `thread/start` exibida no chat rápido: `unknown variant readOnly`.

## Alterações realizadas

- O campo `sandbox` enviado em `thread/start` agora usa o valor wire `read-only`, aceito pelo app-server.
- Mantido `sandboxPolicy.type: readOnly` em `turn/start`: esse campo usa o tipo discriminado da política de sandbox e tem formato próprio.
- O chat continua em modo somente leitura.

## Arquivos tocados

- `src-tauri/src/codex_chat.rs`
- `docs/context/2026-10-06-edge-ghosty-chat-sandbox-wire-fix.md` (este snapshot)

## Validações

- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou; Git mostrou apenas avisos existentes de conversão LF/CRLF.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- O fluxo precisa ser conferido no app reiniciado; esta validação não abriu uma conversa autenticada.

## Próximos passos

- Reiniciar o Ghosty e enviar uma mensagem no chat rápido.
- Se surgir outro erro do app-server, registrar a mensagem completa para ajustar o campo específico do protocolo.
