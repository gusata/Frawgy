# Contexto da tarefa — maos ocultas e ingestao de arquivo

Data: 2026-10-05  
Identificador: edge-mochi-maos-e-engolida

## Objetivo

Deixar as maos do Mochi escondidas em repouso, rever o repertorio do Coucou e reproduzir no Edge Mochi o estado em que ele recebe e engole um arquivo, com uma abertura de boca temporaria.

## Pesquisa de referencia

- O README do Coucou descreve o hover com piscada e olhos maiores, o clique com squash/irritacao, a tontura apos cliques repetidos, o aceno de chegada e a transformacao em caixa para engolir arquivos.
- O motor Windows implementa o engolir como uma fenda/slot na parte superior do corpo transformado. O slot abre, fica aberto por cerca de 460 ms, fecha e inicia aproximadamente 800 ms de mastigacao; o corpo tambem faz squash/stretch e pisca.
- As maos do Coucou sao desenhadas atras do corpo e so entram na composicao quando o canal de maos esta ativo. A adaptacao manteve a identidade do Edge Mochi e os olhos pretos sem brilho.

## Alteracoes realizadas

- `src/pet-motion.ts` agora omite maos e hastes quando o canal de gesto esta em repouso e reduz sua opacidade durante a entrada e a retirada.
- Foi criado o estado persistente `prepareForFile()`: durante o arrasto, o corpo assume morph de caixa, a fenda superior abre, os olhos aumentam discretamente e as maos se estendem.
- Sair/cancelar o arrasto chama `cancelFileReceive()` e recolhe o slot, as maos e o corpo.
- Ao soltar, `gulp()` mantem a abertura por cerca de 460 ms, fecha a fenda, executa tres mordidas com squash/tilt e retrai as maos e a caixa. A fenda e desenhada como um slot no topo do corpo, sem boca visivel em repouso.
- O evento nativo do Tauri e o drop de texto no Bolso agora dirigem entrada, cancelamento e ingestao no motor Canvas.
- O morsel continua voando por 650 ms, mas a tela so e recriada depois de 1600 ms para nao interromper a animacao de mastigacao.
- `AGENTS.md` registra que a boca aparece apenas durante a recepcao/ingestao e que as maos ficam ocultas em repouso.

## Arquivos tocados

- `src/pet-motion.ts`
- `src/main.ts`
- `AGENTS.md`
- `docs/context/2026-10-05-edge-mochi-maos-e-engolida.md`

## Validacoes

- Revisao estatica do fluxo Tauri `enter` / `over` / `leave` / `drop`, do dropzone de texto e dos canais Canvas de maos, morph e slot.
- Build, testes e inspecao visual no WebView2 nao foram executados nesta tarefa.

## Problemas conhecidos e proximos passos

- Inspecionar visualmente o slot no topo e a proporcao das maos no Windows, incluindo arrasto longo, cancelamento, arquivo real e texto.
- Confirmar que a animacao de ingestao completa no WebView2 e que `prefers-reduced-motion` deixa o estado estatico sem movimento.
- A animacao de chegada, olhar, blink, squash, giro, celebration e emotes existentes no motor continua adaptada; esta tarefa conectou especificamente a recepcao de arquivos ao slot do Coucou.
