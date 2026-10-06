# Snapshot: permissões por ação no chat do Ghosty

## Objetivo

Dar ao usuário a opção de autorizar o Codex a executar ações que excedam o perfil de leitura, sem conceder acesso irrestrito por padrão.

## Alterações

- O `codex app-server` agora habilita `features.shell_tool` e usa `approvalPolicy: "on-request"` em `thread/start` e `turn/start`. O perfil inicial continua `permissions: ":read-only"`; hooks continuam desativados.
- A ponte JSON-RPC preserva os IDs das solicitações iniciadas pelo servidor. O novo comando Tauri `quick_chat_respond` envia ao app-server respostas válidas de aprovação.
- O chat exibe pedidos de comando, alteração de arquivo e permissões de filesystem/rede com o motivo, comando, diretório e escopo disponível. A pessoa pode permitir uma vez ou negar.
- Concessões feitas por `request_permissions` são limitadas ao subconjunto solicitado e à ação/turno atual. Não há aprovação automática nem opção persistente nesta interface.

## Arquivos tocados

- `src-tauri/src/codex_chat.rs`
- `src-tauri/src/lib.rs`
- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- Este snapshot.

## Validações

- `npm run build` passou.
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `codex app-server generate-ts` confirmou os formatos usados pelo app-server instalado para IDs de solicitação e respostas de comando, arquivo e permissões.
- `git diff --check` passou; Git apenas avisou sobre a conversão de LF/CRLF em arquivos modificados.
- Não foi feita validação interativa no popup Windows.

## Limites conhecidos

- O `cwd` da conversa continua sendo o diretório isolado de dados do chat; ainda não existe um seletor de projeto/pasta na interface. Pedidos de acesso exibem os caminhos específicos enviados pelo app-server.
- O shell é executado pelo app-server sob o perfil de leitura e sandbox do Codex; a interface do Ghosty não mostra um terminal interativo.

## Próximos passos

- Abrir o chat no Windows e confirmar um pedido real de comando e um de acesso a arquivos, verificando os fluxos de permitir e negar.
- Considerar um seletor de pasta de trabalho caso o usuário queira direcionar o chat a projetos específicos.
