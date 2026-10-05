# Contexto da tarefa — análise das animações do Mochi no Coucou

Data: 2026-10-05  
Identificador: edge-mochi-analise-mochi-coucou

## Objetivo

Entender em detalhe como o Coucou desenha e anima o Mochi, com foco nos mecanismos que dão fluidez, e comparar esse motor com o personagem atual do Edge Mochi.

## Fontes e análise

- Repositório público `Louis-CFM/coucou`, clonado somente para leitura em uma pasta temporária. Revisado no commit `7314790a814d48e57d7a732d1a317e5583149adf`.
- Arquivos centrais: `windows/src/mochi/engine.ts`, `windows/src/core/anim.ts`, `windows/src/island/island.ts`, `NotchBuddy/Sources/CoucouKit/BotEngine.swift` e `NotchBuddy/Sources/App/BotCanvasView.swift`.
- A implementação do Coucou usa Canvas 2D no Windows e SwiftUI Canvas/TimelineView no macOS. Um motor de personagem mantém valores animados independentes — olhar, rotação, escalas X/Y, abertura dos olhos, cor, blush, morph, mãos, acessórios e partículas — e redesenha o Mochi a cada quadro.
- Os gestos principais são sequências de tweens com durações em milissegundos e easing `out`, `inOut`, `back` e `lin`. Cada tween começa no valor atual e bloqueia aquele canal enquanto executa; isso permite interromper ou encadear movimentos sem voltar ao início. O movimento do olhar e o settling de alguns canais usam suavização exponencial baseada em `dt`; a boca da forma de caixa e acessórios no motor macOS usam springs com velocidade.
- A silhueta e os olhos são construídos por geometria, sem sprites. A silhueta é uma superelipse; a posição e a compressão dos olhos acompanham yaw/pitch como se estivessem sobre uma superfície curva. Estados e gestos mudam a expressão, o squash, o tilt, o bounce, o roll e os efeitos.
- Diferença documental observada: o README descreve respiração ociosa; no estado `idle` do motor revisado `breathes` está desligado. A respiração está configurada para `sleeping`, e os Mochis mini têm uma pulsação ociosa leve. O motor macOS no commit também tem física de acessórios e dança que não aparecem no port TypeScript de Windows consultado.
- No Edge Mochi atual, o personagem é composto por elementos HTML e keyframes CSS em `src/style.css`; o olhar é uma pequena translação da face em `src/main.ts`. `src/anim.ts` porta os helpers de spring/curva para a geometria do island, não o movimento do personagem. O Edge Mochi tem respiração/squish, piscada, aceno, afeto, irritação, tontura e ingestão, mas ainda não tem o motor procedural e os canais independentes do Coucou.

## Alterações realizadas

- Nenhuma alteração foi feita no código do produto ou no `AGENTS.md`.
- Este snapshot foi criado para registrar a análise e preservar a referência exata do commit consultado.

## Arquivos tocados

- `docs/context/2026-10-05-edge-mochi-analise-mochi-coucou.md`

## Validações

- Revisão estática dos arquivos-fonte acima e comparação com `src/main.ts`, `src/style.css` e `src/anim.ts` do Edge Mochi.
- Não foram executados build ou testes; a tarefa foi de pesquisa e análise.

## Problemas conhecidos

- A alegação de respiração ociosa no README não coincide com a configuração do estado `idle` no motor consultado.
- Os motores macOS e Windows compartilham a base, mas não todos os recursos na versão consultada.
- A análise não mediu desempenho nem cadência de quadros em runtime.

## Próximos passos

- Se o usuário quiser aproximar a animação do Edge Mochi, desenhar um motor de movimento próprio para o personagem (estado, tweens por propriedade, suavização do olhar e microgestos) usando a arte atual do Edge Mochi; avaliar Canvas versus manter os elementos CSS antes de alterar a implementação.
- Validar qualquer futura mudança visualmente no Windows, nos tamanhos compacto e grande, e conferir `prefers-reduced-motion`.
