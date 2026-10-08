# Snapshot: próxima versão de correção

## Objetivo

Avançar a versão de correção do Edge Ghosty após a tag existente `v1.0.2`.

## Alterações realizadas

- Alinhada a versão do aplicativo em `1.0.3` nos manifests do npm e Rust, no lockfile do Cargo e na configuração Tauri.
- A tag Git `v1.0.3` não foi criada: o workflow do repositório inicia a preparação de um release quando uma tag `v*` é enviada, e esta árvore ainda contém alterações sem commit.

## Arquivos tocados

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `docs/context/2026-10-08-edge-ghosty-versao-correcao-1.0.3.md`

## Validações

- Confirmada a versão `1.0.3` em todos os manifests do aplicativo.
- `git diff --check` passou para os arquivos alterados.
- Build e testes não foram executados.

## Problemas conhecidos

- Ainda não existe uma tag `v1.0.3` apontando para um commit com esta versão.

## Próximos passos

- Depois que as alterações a lançar forem commitadas, criar e enviar a tag `v1.0.3` se a intenção for preparar o release pelo workflow do GitHub.
