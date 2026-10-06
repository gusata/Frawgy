# Edge Ghosty: remoção do chat rápido

## Objetivo

Remover por completo o chat rápido do produto e manter as demais funções do Edge Ghosty, incluindo aprovações do Codex.

## Alterações realizadas

- Removidos a interface do chat, as preferências de modelo/esforço e o atalho global.
- Removidos os módulos Rust que iniciavam o `codex app-server` e registravam o atalho global; removidos também os comandos Tauri correspondentes.
- Restaurado o popup genérico usado por Foco, Bolso, personalização e prancheta.
- Ao iniciar, o frontend descarta as antigas preferências locais do chat e um modo de popup inválido que possa ter ficado salvo.
- Atualizada a memória do projeto. O histórico das decisões anteriores sobre o chat permanece apenas como registro.
- Mantidos os hooks de presença e aprovação do Codex. As credenciais locais do `CODEX_HOME` separado não foram apagadas; o app não as usa mais para esse recurso.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- Removidos `src-tauri/src/codex_chat.rs` e `src-tauri/src/quick_chat_hotkey.rs`
- `README.md`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-removido.md`

## Validações

- `npm run build` passou (`tsc` e `vite build`).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou.
- A busca no código ativo não encontrou interface, comandos ou registro do atalho; a única ocorrência restante remove preferências antigas no próximo início do app.

## Problemas conhecidos

- O app não foi aberto para inspeção visual nesta tarefa. É preciso reiniciá-lo para carregar a versão sem o chat e liberar o atalho da instância anterior.
- Os arquivos de autenticação locais separados do Codex foram preservados; não são carregados pelo Ghosty após a remoção do recurso.

## Próximos passos

- Reiniciar o Edge Ghosty e confirmar que o menu e os popups restantes abrem normalmente e que o atalho antigo não faz nada.
- Confirmar que os hooks de aprovação do Codex continuam respondendo como antes.
