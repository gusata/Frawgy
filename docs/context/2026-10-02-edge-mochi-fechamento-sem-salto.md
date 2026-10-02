# Contexto da tarefa — fechamento sem salto

Data: 2026-10-02  
Identificador: edge-mochi-fechamento-sem-salto

## Objetivo

Remover a piscada observada no final da animação de recolhimento da barrinha.

## Alterações realizadas

- Substituídas as chamadas nativas separadas para mudar tamanho e posição por uma única chamada `SetWindowPos` do Windows, preservando a posição e o tamanho sem um estado intermediário.
- A operação atômica também é usada quando o layout é reposicionado por configurações e por monitor.
- Habilitado no crate `windows` o feature `Win32_UI_WindowsAndMessaging`.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml`
- `docs/context/2026-10-02-edge-mochi-fechamento-sem-salto.md`

## Validações

- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou no Developer PowerShell do Visual Studio 2022.
- `git diff --check` passou.
- Não foi feita validação visual interativa.

## Problemas conhecidos e próximos passos

- Confirmar no app em execução que a janela termina de recolher sem piscar.
