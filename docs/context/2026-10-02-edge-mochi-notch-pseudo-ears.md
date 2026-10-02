# Contexto da tarefa — orelhas do notch com pseudo-elementos

Data: 2026-10-02
Identificador: edge-mochi-notch-pseudo-ears

## Objetivo

Aplicar as orelhas do notch com `::before` e `::after`, conforme a referência visual indicada pelo usuário, e retirar os elementos HTML usados na tentativa anterior.

## Alterações realizadas

- As duas curvas agora são geradas por `.edge-island::before` e `.edge-island::after`.
- As pseudo-orelhas formam abas pretas convexas de 18 × 30 px em torno da haste central de 8 px; a janela nativa recolhida continua em 18 px.
- As pseudo-orelhas desaparecem ao expandir, enquanto o painel principal cresce e preserva os cantos arredondados.
- Removidos os dois elementos `.ear` do HTML.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-02-edge-mochi-notch-pseudo-ears.md`

## Referência analisada

O CSS Windows do Coucou define a ilha preta presa à borda e seus cantos arredondados. A construção com pseudo-elementos foi aplicada aqui às duas orelhas laterais, como o usuário especificou.

## Validações

- Conferência estática dos seletores `::before`/`::after`, dimensões e remoção dos elementos antigos.
- Build e conferência visual não foram executados nesta tarefa.

## Problemas conhecidos e próximos passos

- Conferir a forma em execução no Windows para comparar o contorno visual, principalmente a largura das abas em diferentes escalas de DPI.
