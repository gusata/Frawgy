# Correção da janela de console no Windows — 2026-10-08

## Objetivo

Corrigir o terminal que aparecia junto ao Edge Ghosty instalado e cujo fechamento encerrava o app.

## Alterações realizadas

- Marquei o entry point Rust para usar `windows_subsystem = "windows"` somente em builds de release. O desenvolvimento continua mantendo o console.
- Bump das versões npm, Cargo e Tauri de `1.0.0` para `1.0.1`, sem alterar a release publicada.
- Enviei o commit `a29cf77` e criei a tag `v1.0.1` para gerar um rascunho com o instalador corrigido.
- Atualizei a memória operacional do projeto neste snapshot e em `AGENTS.md`.

## Arquivos tocados

- `src-tauri/src/main.rs`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `package.json`
- `package-lock.json`
- `AGENTS.md`
- Este snapshot em `docs/context/`

## Validações

- `npm run build:windows` concluiu com sucesso e gerou `src-tauri/target/release/bundle/nsis/Edge Ghosty_1.0.1_x64-setup.exe` (5.12 MiB).
- Inspecionei o cabeçalho PE do executável e confirmei o subsistema `WINDOWS_GUI`, que remove o console do build de release.
- A execução [Windows release #37808604506](https://github.com/gusata/Ghosty/actions/runs/37808604506) concluiu com sucesso.
- O rascunho `Edge Ghosty v1.0.1` contém `Edge.Ghosty_1.0.1_x64-setup.exe` (5,415,288 bytes).
- A tag `v1.0.1` aponta para o commit `a29cf77164f7718127d981064c1a0864b5bf1c54`.

## Problemas conhecidos

- O rascunho precisa ser publicado para o instalador ficar disponível publicamente.
- O instalador não tem assinatura de código e pode exibir o aviso do SmartScreen.
- O build mantém o aviso preexistente de `unused_mut` em `src-tauri/src/codex_hooks.rs:436` e o aviso sobre o identificador Tauri terminado em `.app`.

## Próximos passos

- Revisar e publicar o rascunho da `v1.0.1` no GitHub Releases.
- Instalar a `v1.0.1` para confirmar o comportamento na máquina do usuário.
