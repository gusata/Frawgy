# Release Edge Ghosty v1.0.0 — 2026-10-08

## Objetivo

Alinhar as versões do app com a tag `v1.0.0`, corrigir seu destino para incluir o instalador e gerar a release Windows pelo GitHub Actions.

## Alterações realizadas

- Atualizei a versão para `1.0.0` em npm, Cargo e na configuração Tauri, incluindo os lockfiles.
- Fiz fast-forward até o commit mais recente da branch de trabalho e criei o commit `fcc8af3` com os números de versão alinhados.
- Confirmei que a tag existente não tinha uma Release pública nem execuções anteriores do workflow; depois a movi para `fcc8af3`.
- Enviei o commit e a tag ao repositório canônico `gusata/Ghosty` e atualizei o `origin` local.
- O workflow de Windows compilou o instalador e criou o rascunho `Edge Ghosty v1.0.0` com o setup anexado.

## Arquivos tocados nesta etapa

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `AGENTS.md`
- Este snapshot em `docs/context/`

## Validações

- `npm run build:windows` concluiu com sucesso localmente e gerou `src-tauri/target/release/bundle/nsis/Edge Ghosty_1.0.0_x64-setup.exe` (5.12 MiB).
- A execução [Windows release #37799149467](https://github.com/gusata/Ghosty/actions/runs/37799149467) concluiu com sucesso.
- O rascunho `Edge Ghosty v1.0.0` contém `Edge.Ghosty_1.0.0_x64-setup.exe`, com 5,417,463 bytes. O ativo está carregado no GitHub.
- A tag `v1.0.0` aponta para `fcc8af3cbd684b083569b09ef9c99ba5472ff528`.

## Problemas conhecidos

- A release ainda é um rascunho privado até ser publicada manualmente.
- O setup ainda não tem assinatura de código e pode exibir o aviso do SmartScreen.
- O build mantém os avisos já existentes sobre o identificador Tauri terminado em `.app` e `unused_mut` em `src-tauri/src/codex_hooks.rs`.

## Próximos passos

- Revisar e publicar o rascunho no GitHub Releases.
- Considerar assinatura de código antes de uma distribuição mais ampla.
