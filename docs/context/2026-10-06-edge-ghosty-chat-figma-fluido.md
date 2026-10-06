# Edge Ghosty: chat rápido guiado pelo Figma

## Objetivo

Reintroduzir o chat rápido a pedido do usuário e reconstruir a interface conforme o novo mock, preservando a seleção de modelo e reasoning, as respostas em streaming e o perfil isolado do Codex.

## Alterações realizadas

- O `utility-popup` agora tem um modo de chat com composição proporcional ao Figma: superfície cinza clara, Ghosty Canvas sem fundo escuro no canto inferior esquerdo, busca no alto à direita, histórico fixo com rolagem interna, campo largo e controles alinhados embaixo.
- As mensagens mais recentes permanecem no fim da lista; o popup não cresce com a conversa. O campo de busca filtra mensagens locais.
- `Ctrl + Shift + Espaço` abre o chat, centralizado 72 logical px acima da borda inferior. A entrada é escalonada: Ghosty sobe de trás da borda, o compositor aparece em seguida e os demais controles entram por último. Há ajuste para `prefers-reduced-motion`.
- O catálogo `model/list` alimenta os seletores de modelo e reasoning. A escolha continua persistida localmente; `Ctrl + N` encerra a transcrição atual e inicia uma conversa nova.
- Restaurado o app-server local no `CODEX_HOME` isolado existente. O fluxo usa OAuth do Codex, pesquisa web e permissões `:read-only`; shell e hooks ficam desativados. A pasta `sessions` é limpa ao abrir uma sessão nova e ao fechar o chat; os dados de autenticação são preservados.
- A interface executa apenas ações locais explicitamente reconhecidas para atalhos salvos, URLs HTTP(S) e Foco. As respostas do modelo chegam por deltas do app-server.
- Atualizados README e memória operacional do projeto para registrar a reintrodução e o novo layout.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/src/codex_chat.rs` (novo)
- `src-tauri/src/quick_chat_hotkey.rs` (novo)
- `src-tauri/tauri.conf.json`
- `README.md`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-figma-fluido.md` (este snapshot)

## Validações

- `npm run build` passou.
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou; Git mostrou apenas avisos de conversão LF/CRLF.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- O chat ainda não foi aberto no runtime do Windows nesta tarefa. A tela, o login OAuth, o catálogo, o atalho global, o streaming e a entrada animada precisam de inspeção visual e manual.
- O seletor usa o catálogo retornado pelo app-server; é necessário que o Codex CLI esteja instalado e a conta ChatGPT esteja conectada no perfil isolado do Ghosty.

## Próximos passos

- Reiniciar o app no Windows e abrir `Ctrl + Shift + Espaço`.
- Conferir se Ghosty, compositor e controles entram na ordem e sem cortes no tamanho 560×472 e em telas menores.
- Conectar a conta, trocar modelo e reasoning, enviar várias mensagens, interromper uma resposta, pesquisar no histórico e testar `Ctrl + N`.
