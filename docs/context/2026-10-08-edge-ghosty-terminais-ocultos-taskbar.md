# Snapshot: terminais auxiliares ocultos e janelas fora da barra de tarefas

## Objetivo

Impedir que processos auxiliares do Edge Ghosty abram janelas de terminal e manter a ilha e o popup fora da barra de tarefas do Windows.

## Alterações realizadas

- Os processos PowerShell usados para consultar e buscar a posição da faixa recebem `CREATE_NO_WINDOW`.
- O `codex app-server` também recebe `CREATE_NO_WINDOW` ao iniciar.
- A janela principal reaplica `set_skip_taskbar(true)` na inicialização e ao reposicionar/mostrar a ilha.
- O popup reaplica `set_skip_taskbar(true)` antes de ser exibido. A configuração Tauri já marcava as duas janelas para não aparecerem na barra.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `src-tauri/src/codex_chat.rs`
- `docs/context/2026-10-08-edge-ghosty-terminais-ocultos-taskbar.md`

## Validações

- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou. O build manteve um aviso preexistente de `unused_mut` em `src-tauri/src/codex_hooks.rs`.
- `git diff --check` passou.
- `cargo fmt --check` apontou diferenças de formatação preexistentes em vários arquivos Rust; não foi aplicado um reformat geral.
- Não foi feita validação visual no runtime do Windows.

## Problemas conhecidos

- O comportamento precisa ser confirmado após reiniciar/recompilar o app no Windows.

## Próximos passos

- Abrir o Edge Ghosty e confirmar que a consulta de mídia e o chat não exibem janelas de terminal e que ilha/popup não aparecem na barra de tarefas.
