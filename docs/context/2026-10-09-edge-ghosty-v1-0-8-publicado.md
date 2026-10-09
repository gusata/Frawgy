# 2026-10-09 — Publicação da versão 1.0.8

## Objetivo

Publicar a correção de versionamento do updater para que instalações elegíveis reconheçam uma versão superior à 1.0.4.

## Alterações realizadas

- Commit `5e013eb` com os manifestos em `1.0.8` e a validação de tag/versão no workflow foi enviado para `main`.
- A tag `v1.0.8` foi enviada ao GitHub.
- O workflow `Windows release` concluiu com sucesso (`37924956537`) e gerou o instalador NSIS assinado.
- O rascunho foi publicado. A API do GitHub e o endpoint que o updater consulta retornam `v1.0.8`, com `latest.json` anunciando `1.0.8`.
- Assets públicos: `Edge.Ghosty_1.0.8_x64-setup.exe`, `Edge.Ghosty_1.0.8_x64-setup.exe.sig` e `latest.json`.

## Arquivos tocados

- `AGENTS.md`
- `docs/context/2026-10-09-edge-ghosty-v1-0-8-publicado.md`

## Validações

- Workflow do Windows: sucesso; verificação de versões passou antes da compilação.
- Após publicação, `releases/latest` apontou para `v1.0.8` e `latest.json` retornou `version: 1.0.8`.
- Os dois alvos configurados (`windows-x86_64` e `windows-x86_64-nsis`) apontam para o instalador assinado da versão 1.0.8.
- `npm run build`, `cargo metadata --locked --no-deps` e `git diff --check` passaram antes do envio.

## Problemas conhecidos

- O updater verifica ao iniciar e a cada seis horas, mas a pessoa precisa abrir Configurações → Atualizações e iniciar “Instalar e reiniciar”.
- Instalações anteriores à 1.0.4 não incluem o updater e precisam de uma instalação manual única.

## Próximos passos

- Reiniciar o Ghosty em uma instalação 1.0.4+ para disparar a consulta e instalar a 1.0.8 pela tela de Atualizações.
