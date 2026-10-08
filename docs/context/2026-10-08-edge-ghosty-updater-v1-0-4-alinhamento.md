# Snapshot: alinhar o updater com a versão 1.0.4

## Objetivo

Corrigir o alvo da primeira versão com updater após confirmação de que `v1.0.3` já foi publicada.

## Alterações realizadas

- Confirmado no GitHub que `v1.0.3` foi publicada no commit `f6cf588`.
- Verificado o `tauri.conf.json` desse commit: a versão publicada ainda não inclui configuração nem plugin do updater.
- Alinhadas as versões em `package.json`, `package-lock.json`, `src-tauri/Cargo.toml` e `src-tauri/tauri.conf.json` para `1.0.4`, sem criar tag Git.
- Registrada a correção na memória geral. A chave privada continua em `C:\Users\gustavo.sanches\.tauri\edge-ghosty-updater.key`; o segredo do GitHub e a publicação de `v1.0.4` ainda dependem de ação do usuário.

## Arquivos tocados

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-updater-v1-0-4-alinhamento.md`

## Validações

- Release `v1.0.3` e commit `f6cf588` conferidos em [GitHub Releases](https://github.com/gusata/Ghosty/releases/tag/v1.0.3).
- O arquivo `src-tauri/tauri.conf.json` do commit publicado foi consultado e não contém `createUpdaterArtifacts` nem configuração `plugins.updater`.
- `npm version 1.0.4 --no-git-tag-version` atualizou os manifestos npm e não criou tag.
- Build e testes não foram executados.

## Problemas conhecidos e próximos passos

- Usuários da versão publicada `1.0.3` ainda não têm o updater e precisarão instalar `1.0.4` manualmente uma vez.
- Cadastrar `TAURI_SIGNING_PRIVATE_KEY` nos segredos Actions antes da release.
- Commitar a implementação, criar/enviar a tag `v1.0.4`, revisar e publicar o rascunho gerado pelo workflow.
- Depois da primeira instalação da `1.0.4`, testar a atualização in-app para uma versão posterior.
