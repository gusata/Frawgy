# Popup para foco e ferramentas do Mochi

## Objetivo

Fazer o modo de foco ter uma interface visível e mover os fluxos secundários (Foco, Bolso, personalização e prancheta) para um popup independente, fora do corpo animado da ilha.

## Alterações realizadas

- O atalho Foco agora inicia ou retoma o temporizador e abre seus controles em uma janela própria. Antes, o temporizador podia iniciar sem uma interface visível na Home compacta.
- Bolso, personalização do Mochi e prancheta também abrem no popup. A Home continua mostrando mídia, volume e atalhos; as animações e a geometria da ilha não foram alteradas.
- Foi adicionada a janela Tauri oculta `utility-popup`, posicionada no centro do monitor da janela que abriu o recurso, em tamanho limitado à tela e sempre no topo.
- O popup fecha pelo botão, Escape ou quando perde o foco. O estado é compartilhado entre as janelas por `localStorage`; foco, contadores, itens do Bolso e personalização atualizam entre elas.
- O Bolso no popup mantém suporte a drop de arquivos e texto. O arquivo original continua no lugar.
- Adicionei a capability de `hide` necessária para fechar a janela pelo frontend e estilos próprios para o cartão escuro do popup.
- Atualizei o `AGENTS.md` com a nova decisão estrutural e o estado atual dos fluxos.

## Arquivos tocados

- `AGENTS.md`
- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `docs/context/2026-10-05-edge-mochi-popup-fluxos-secundarios.md`

## Validações

- Revisei estaticamente a abertura, o posicionamento, o fechamento e a sincronização dos dados entre as janelas.
- `git diff --check` não apontou erros de whitespace.
- Não executei build ou testes. A inspeção no runtime do Windows continua pendente.

## Problemas conhecidos

- A janela e o comando Rust ainda precisam ser compilados no Developer PowerShell do Visual Studio.
- O posicionamento, a perda de foco, o temporizador e o drop de arquivos no popup precisam de validação manual no Windows.

## Próximos passos

- Reiniciar o app e testar o atalho Foco na Home e em Atalhos.
- Abrir Bolso, personalização e prancheta; verificar abertura, fechamento e sincronização com a ilha.
- Soltar um arquivo no popup e confirmar que ele aparece no Bolso sem mover o original.
