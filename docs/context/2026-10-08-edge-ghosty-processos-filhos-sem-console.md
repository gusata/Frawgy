# Consoles dos processos filhos no Windows — 2026-10-08

## Objetivo

Corrigir as janelas de terminal que apareciam e fechavam repetidamente enquanto o Edge Ghosty estava aberto.

## Alterações realizadas

- Identifiquei que a janela principal consulta os metadados de mídia via `powershell.exe` ao iniciar e repete a consulta a cada quatro segundos, inclusive quando a tela de mídia não está aberta.
- Configurei `CREATE_NO_WINDOW` nas chamadas PowerShell de mídia e busca de faixa. Isso preserva stdout/stderr capturados sem alocar janelas de console.
- Centralizei essa flag e passei a usá-la também nos comandos `reg.exe` existentes.
- Configurei o mesmo modo no processo filho do Codex app-server, para o chat não abrir uma janela de console ao ser iniciado.
- Atualizei npm, Cargo e Tauri para `1.0.2`, mantendo a tag `v1.0.1` publicada sem alterações.
- Enviei o commit `b004e67` e a tag `v1.0.2`; o GitHub Actions gerou um rascunho com o instalador.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `src-tauri/src/codex_chat.rs`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `package.json`
- `package-lock.json`
- `AGENTS.md`
- Este snapshot em `docs/context/`

## Validações

- `npm run build:windows` concluiu com sucesso e gerou `src-tauri/target/release/bundle/nsis/Edge Ghosty_1.0.2_x64-setup.exe` (5.12 MiB).
- A execução [Windows release #37811319019](https://github.com/gusata/Ghosty/actions/runs/37811319019) concluiu com sucesso.
- O rascunho `Edge Ghosty v1.0.2` contém `Edge.Ghosty_1.0.2_x64-setup.exe` (5,416,787 bytes).
- A tag `v1.0.2` aponta para o commit `b004e67dc0cd08d6c8be34abec1232efc98094b5`.

## Problemas conhecidos

- O rascunho precisa ser publicado para o instalador ficar disponível publicamente.
- O instalador não tem assinatura de código e pode exibir o aviso do SmartScreen.
- Ainda falta a confirmação do usuário instalando a `1.0.2` no Windows onde os flashes foram observados.

## Próximos passos

- Publicar o rascunho de `v1.0.2` e substituir a versão instalada pela nova.
- Confirmar que a consulta periódica da mídia não abre terminais durante o uso e que o chat do Codex segue abrindo sem console.
