# Edge Ghosty: correção de inicialização do Codex no Windows

## Objetivo

Corrigir o erro `%1 não é um aplicativo Win32 válido` ao abrir o chat rápido do Ghosty.

## Alterações realizadas

- A detecção do Codex no Windows deixou de tentar executar diretamente o arquivo `codex` sem extensão.
- A instalação npm encontrada neste ambiente tem esse arquivo como script POSIX com shebang `#!/bin/sh`; o `CreateProcess` do Windows não consegue iniciá-lo.
- O Ghosty agora segue pelo fallback já existente: executa `node_modules/@openai/codex/bin/codex.js` com `node.exe`. O Windows continua aceitando uma instalação nativa `codex.exe` como executável direto.

## Arquivos tocados

- `src-tauri/src/codex_chat.rs`
- `docs/context/2026-10-06-edge-ghosty-chat-win32-launch-fix.md` (este snapshot)

## Validações

- `npm run build` passou.
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- A execução de `node.exe ...\codex.js --version` confirmou `codex-cli 0.160.1`.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- O runtime do app-server ainda precisa ser conferido no app depois de reiniciar o Ghosty. A validação local confirmou o início do CLI, mas não completou uma conversa autenticada.

## Próximos passos

- Reiniciar o Edge Ghosty e abrir o chat rápido novamente.
- Se o perfil isolado do Ghosty pedir autenticação, conectar a conta ChatGPT e enviar uma mensagem.
