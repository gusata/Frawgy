# Snapshot: reaplicar ocultação da barra após exibir janela

## Objetivo

Corrigir o botão do Edge Ghosty que reaparecia na barra de tarefas depois da instalação e inicialização.

## Alterações realizadas

- A ilha reaplica `set_skip_taskbar(true)` imediatamente depois do `show()` em `apply_display_layout`.
- O popup utilitário reaplica a opção imediatamente depois do próprio `show()`.
- A ordem correta foi registrada em `AGENTS.md` para futuras mudanças no ciclo de vida dessas janelas.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-taskbar-reaplica-apos-show.md`

## Validações

- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou. O build manteve um aviso de `unused_mut` em `src-tauri/src/codex_hooks.rs:436`.
- `git diff --check` passou.
- A nova build ainda não foi instalada para inspeção visual.

## Problemas conhecidos

- A correção precisa de uma nova build instalada para confirmar que o botão some da barra no runtime do Windows.

## Próximos passos

- Gerar/instalar a próxima build e confirmar o resultado após inicialização, mudança de layout e abertura do popup.
