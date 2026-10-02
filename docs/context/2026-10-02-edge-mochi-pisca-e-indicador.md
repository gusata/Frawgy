# Contexto da tarefa — correção do pisca ao recolher

Data: 2026-10-02  
Identificador: edge-mochi-pisca-e-indicador

## Objetivo

Corrigir a piscada ao recolher o menu e o aparecimento momentâneo da barrinha na extremidade superior do painel durante o hover.

## Alterações realizadas

- Mantido o estado visual `is-closing` durante a animação e até o fim do redimensionamento nativo da janela.
- Barrinha e pseudo-elementos das orelhas ficam ocultos enquanto o painel encolhe; reaparecem após a janela nativa concluir o recolhimento.
- Eventos `pointerenter` e `pointermove` não reabrem o menu durante esse estado de fechamento.
- Movimento real do ponteiro sobre a barrinha ainda consegue abrir o menu caso a janela tenha sido redimensionada sob um ponteiro parado.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-02-edge-mochi-pisca-e-indicador.md`

## Validações

- `npm run build` passou (`tsc` e Vite).
- `git diff --check` passou.
- Não foi feita validação visual interativa no aplicativo.

## Problemas conhecidos e próximos passos

- Confirmar no app em execução que a barrinha só reaparece após o recolhimento e que o hover não dispara um ciclo de abre/fecha.
- Se ainda houver piscada sem movimento do ponteiro, inspecionar a transparência/hit testing da janela WebView2 durante `SetWindowPos`.
