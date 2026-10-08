# Snapshot: recolhimento ao sair da vista Mídia

## Objetivo

Corrigir o abre/fecha intermitente relatado ao sair da vista Mídia, nas bordas superior e inferior.

## Alterações realizadas

- O temporizador de recolhimento agora confere o estado mais recente do polling nativo do cursor, além de `:hover` no DOM. Isso evita recolher a ilha quando `pointerleave` chega antes da atualização nativa; quando o cursor realmente sai da área ativa, a transição nativa para fora agenda o recolhimento.
- A geometria maior da vista Mídia foi inspecionada. A janela em execução permaneceu aberta com o cursor parado sobre o cartão; a correção trata a corrida no caminho de saída.

## Arquivos tocados

- `src/main.ts`
- `docs/context/2026-10-08-edge-ghosty-hover-race-media.md`

## Validações

- Revisão estática do fluxo `scheduleClose` e do evento `edge-ghosty-cursor`.
- `git diff --check` sem erros.
- Inspeção visual da janela Tauri em execução na vista Mídia; não foi possível reproduzir o caminho de saída apenas com a interface de inspeção.
- Build e testes não foram executados.

## Problemas conhecidos

- Confirmar manualmente no Windows movendo o cursor para fora da vista Mídia pelas bordas superior e inferior.

## Próximos passos

- Conferir que o menu permanece aberto enquanto o cursor continua na ilha e recolhe uma vez após sair da área ativa.
