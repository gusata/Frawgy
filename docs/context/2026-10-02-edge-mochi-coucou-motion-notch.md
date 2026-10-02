# Contexto da tarefa — notch e animações do Coucou

Data: 2026-10-02
Identificador: edge-mochi-coucou-motion-notch

## Objetivo

Analisar o repositório Coucou e aproximar o Edge Mochi do desenho do notch e das animações de abertura, fechamento e do Mochi.

## Alterações realizadas

- Adaptado o notch para a borda esquerda: superfície preta colada à borda, cantos convexos arredondados e duas curvas curtas nas extremidades quando recolhido.
- Implementada abertura com mola baseada no perfil usado pelo Coucou (resposta de 0,5 s e amortecimento de 0,72) e fechamento com a curva cúbica de Bézier `.45, 0, .2, 1` em 340 ms.
- A janela Tauri só volta à largura estreita depois da animação de fechamento, evitando cortar o painel no meio do movimento. A largura recolhida continua em 18 px.
- Animado o pet com respiração, piscadas e olhos que acompanham o cursor; o primeiro hover acena, o hover prolongado mostra um coração e três cliques rápidos deixam o pet tonto.
- Respeitada a preferência de movimento reduzido.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-02-edge-mochi-coucou-motion-notch.md`

## Referência analisada

`Louis-CFM/coucou`, principalmente `windows/src/style.css`, `windows/src/island/island.ts`, `windows/src/core/anim.ts` e `windows/README.md`. O Coucou usa uma ilha preta presa à borda, geometria animada por mola ao abrir, fechamento em 340 ms e um Mochi que respira, pisca, acompanha o cursor, acena e reage a hover e cliques. O Edge Mochi aplica essas ideias à sua orientação lateral e mantém o estilo monocromático atual.

## Validações

- Revisão estática das alterações e dos trechos de referência.
- Build e execução visual não foram realizados nesta tarefa.

## Problemas conhecidos e próximos passos

- Conferir a forma do notch em execução, especialmente nas escalas de DPI diferentes; a janela estreita limita as curvas visíveis ao espaço de 18 px.
- Confirmar no Developer PowerShell que a redução atrasada da janela e a animação continuam sincronizadas ao entrar e sair rapidamente com o cursor.
- Build Rust/Tauri permanece pendente no ambiente MSVC indicado no `AGENTS.md`.
