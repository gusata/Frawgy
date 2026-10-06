# Edge Ghosty: aprovações contextuais do Codex

## Objetivo

Mostrar pedidos de permissão do Codex no Ghosty com um resumo curto da ação e botões para aprovar ou recusar. O aviso externo e o aviso de tarefa concluída aparecem apenas com o menu recolhido; com o menu aberto, a aprovação ocupa a área do Ghosty com uma entrada animada.

## Alterações realizadas

- O hook `PermissionRequest` agora é síncrono e aguarda uma escolha explícita por até 570 segundos. `allow` e `deny` são devolvidos ao Codex como decisões reais; se o Ghosty não estiver ativo, a integração for desligada ou o pedido expirar, o hook deixa o fluxo normal do Codex continuar.
- O script local publica apenas identificador, ferramenta, resumo limitado a 220 caracteres e expiração na fila local. A descrição vem do resumo fornecido pela ferramenta, de uma prévia curta de comando Bash ou de uma mensagem genérica.
- O frontend mostra Aprovar/Recusar no aviso animado quando recolhido e numa camada animada sobre a ilha quando expandida. Os pedidos em espera são enfileirados e expiram localmente.
- O retângulo nativo de interação acompanha o aviso animado para permitir clique na janela transparente. A barra continua sem expandir quando o cursor está sobre a notificação.
- Avisos de conclusão são suprimidos enquanto o menu estiver expandido ou houver uma aprovação pendente.
- A sincronização atualiza hooks antigos do Ghosty sem remover grupos de hooks de terceiros; as instruções e a memória do projeto foram atualizadas.

## Arquivos tocados

- `AGENTS.md`
- `src/main.ts`
- `src/style.css`
- `src-tauri/src/codex-hook.ps1`
- `src-tauri/src/codex_hooks.rs`
- `src-tauri/src/lib.rs`
- `docs/context/2026-10-06-edge-ghosty-aprovacoes-contextuais.md`

## Validações

- `npm run build` passou.
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou no Developer PowerShell do Visual Studio.
- `git diff --check` passou; o Git mostrou apenas avisos de conversão LF/CRLF já presentes no workspace.
- Não foi feita validação manual de interface nem executado teste automatizado.

## Problemas conhecidos

- O Codex precisa ser reiniciado para carregar a versão síncrona atualizada do hook. Se solicitado, o usuário precisa aprovar a atualização do hook do Ghosty.
- O fluxo visual, os cliques nas duas opções e o fallback de desconexão/expiração ainda precisam ser conferidos no runtime do Windows com o Codex ativo.
- Algumas ferramentas podem não fornecer uma descrição detalhada; nesses casos o Ghosty mostra uma prévia curta do comando Bash ou um resumo genérico da ferramenta.

## Próximos passos

- Reiniciar o Codex e aceitar a atualização do hook, se solicitada.
- Conferir um pedido real com a ilha recolhida e outro com a ilha aberta; verificar tanto Aprovar quanto Recusar.
- Confirmar visualmente as animações e testar que uma aprovação pendente volta ao fluxo normal quando o Ghosty é fechado ou deixa de responder.
