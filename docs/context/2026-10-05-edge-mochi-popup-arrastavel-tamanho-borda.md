# Popup menor, arrastável e sem borda branca

## Objetivo

Reduzir o popup, permitir que o usuário escolha onde deixá-lo e eliminar a borda branca que apareceu depois que a janela passou a ser opaca.

## Alterações realizadas

- Reduzi o tamanho padrão de 440×560 para 400×500 logical px, mantendo limites para telas menores.
- Tornei a área do título arrastável com `startDragging`; registrei a permissão Tauri correspondente.
- A janela registra a posição física durante o movimento e a restaura na próxima abertura. Se o monitor antigo não estiver disponível, usa o monitor atual e mantém o popup dentro da área visível.
- Removi a borda e o brilho branco internos do cartão. O fundo externo agora usa o mesmo tom escuro para que a janela opaca não revele uma faixa branca.
- Mantive `transparent: false` e `shadow: false` no popup. A variável `--utility-popup-opacity` controla a opacidade do cartão; transparência real também requer `transparent: true` e fundo externo transparente.
- Atualizei o `AGENTS.md` com essas decisões estruturais.

## Arquivos tocados

- `AGENTS.md`
- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/gen/schemas/capabilities.json`
- `docs/context/2026-10-05-edge-mochi-popup-arrastavel-tamanho-borda.md`

## Validações

- Conferi os nomes de API de `startDragging` e `onMoved` nas declarações locais do Tauri.
- Revisei estaticamente o salvamento/restauração da posição, o limite por monitor e a configuração de opacidade.
- Os arquivos JSON foram parseados e `git diff --check` não apontou erros de whitespace.
- Ainda não executei build ou testes; a validação visual e de arraste no Windows está pendente.

## Problemas conhecidos

- O comando Rust e a permissão de arrastar ainda precisam ser confirmados em runtime.
- A posição salva usa coordenadas físicas; se a configuração de monitores mudar, o comando tenta encaixar a janela em um monitor disponível.

## Próximos passos

- Reiniciar o app e conferir o tamanho e a ausência da borda branca.
- Arrastar o popup para diferentes posições e monitores, fechar e abrir novamente.
- Se quiser translucidez de vidro, ativar `transparent: true` para `utility-popup`, deixar `.utility-popup-window` transparente e ajustar `--utility-popup-opacity` em `src/style.css`.
