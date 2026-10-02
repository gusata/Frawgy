# Contexto da tarefa — manter Edge Mochi no topo

Data: 2026-10-02  
Identificador: edge-mochi-topmost-reforcado

## Objetivo

Manter todas as janelas do Edge Mochi na camada superior do Windows, sem ativá-las nem roubar o foco.

## Alterações realizadas

- Mantido `alwaysOnTop: true` na janela principal e `.always_on_top(true)` nas janelas secundárias.
- `place_window` agora chama `SetWindowPos` com `HWND_TOPMOST` e `SWP_NOACTIVATE`, sem `SWP_NOZORDER`, e reafirma `set_always_on_top(true)`.
- A camada superior é reafirmada depois de mostrar/reposicionar janelas e quando o polling troca o modo de click-through.
- Atualizada a memória operacional do projeto.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-topmost-reforcado.md`

## Validações

- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check` passou.
- Não foi feita validação visual interativa.

## Problemas conhecidos e próximos passos

- Confirmar com o app rodando que a janela permanece acima das janelas comuns após alternar monitores e click-through.
- `HWND_TOPMOST` mantém o app no grupo superior padrão do Windows; outras janelas também marcadas como topmost ainda podem ser ordenadas acima dele pelo sistema.
