# 2026-10-09 — Correção do versionamento do updater

## Objetivo

Investigar por que instalações do Edge Ghosty não detectavam a release nova e preparar a correção do fluxo de atualização.

## Diagnóstico

- A release publicada mais recente no GitHub é `v1.0.7`, mas seu `latest.json` anuncia `version: 1.0.4` e a assinatura do instalador também identifica a versão 1.0.4.
- Os manifestos locais em `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` e `src-tauri/tauri.conf.json` estavam todos em 1.0.4.
- O Tauri Updater compara SemVer e só considera atualizações com versão maior que a versão atual. Portanto, a instalação 1.0.4 não reconhece a release publicada como nova.
- O app já consulta ao iniciar e a cada seis horas. Depois de detectar uma versão, a instalação é iniciada explicitamente em Configurações; ela não é silenciosa.

## Alterações realizadas

- Alinhadas as versões do próximo release local em `1.0.8`.
- Criado `scripts/check-release-version.mjs` e conectado ao workflow para confirmar que a tag GitHub e os seis valores de versão nos manifestos coincidem antes da compilação/publicação.
- Registrada a correção na memória geral do projeto.

## Arquivos tocados

- `.github/workflows/release-windows.yml`
- `scripts/check-release-version.mjs`
- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `AGENTS.md`
- `docs/context/2026-10-09-edge-ghosty-updater-versao-tag.md`

## Validações

- Consulta ao release atual e ao `latest.json` confirmou `v1.0.7` versus `1.0.4`.
- `node scripts/check-release-version.mjs v1.0.8` — passou e confirmou todos os manifestos.
- `npm run build` — passou.
- `cargo metadata --locked --no-deps --manifest-path src-tauri/Cargo.toml` — passou.
- `git diff --check` — passou; o Git emitiu somente avisos de conversão LF/CRLF.

## Problemas conhecidos

- A correção ainda não foi publicada. O GitHub continua servindo a release `v1.0.7` com `latest.json` em `1.0.4` até que a versão 1.0.8 seja criada e publicada.
- O workflow gera release como rascunho; a publicação do rascunho é uma etapa manual.

## Próximos passos

- Revisar as alterações e publicar a próxima release `v1.0.8`; as instalações com updater que já rodam 1.0.4 deverão então reconhecer a nova versão.
- Depois da publicação, abrir Configurações → Atualizações para instalar e reiniciar. Futuras releases devem atualizar sem baixar o instalador manualmente.
