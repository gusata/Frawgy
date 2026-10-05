# Contexto da tarefa — visual abstrato do Mochi

Data: 2026-10-05  
Identificador: edge-mochi-seixo-vivo

## Objetivo

Redesenhar o Mochi como uma forma abstrata com olhos pretos grandes e mãozinhas laterais, aproximando a simplicidade e a expressividade desejadas sem reproduzir a silhueta do Coucou nem dar ao pet aparência de animal.

## Alterações realizadas

- A silhueta simétrica foi substituída por um corpo de seixo macio e assimétrico, desenhado por curvas Bézier no Canvas.
- Foram removidos do desenho as orelhas, o focinho/rosto com boca, as bochechas e os traços de pata.
- Os olhos agora são ovais grandes quase pretos, com pequenos reflexos; o olhar continua acompanhando o cursor e muda com estados como irritação, mastigação e tontura.
- Duas mãos sem dedos ou almofadinhas ficam visíveis nas laterais e avançam para acenar. Os gestos seguem no motor Canvas existente.
- As três aparências foram clareadas para manter contraste com os olhos; os acessórios configuráveis permanecem.
- Atualizado `AGENTS.md` com a nova direção visual.

## Arquivos tocados

- `src/pet-motion.ts`
- `AGENTS.md`
- `docs/context/2026-10-05-edge-mochi-seixo-vivo.md`

## Validações

- Revisão estática do desenho Canvas e busca por referências aos elementos visuais removidos.
- Build e inspeção visual no Windows não foram executados nesta tarefa.

## Problemas conhecidos

- A leitura das mãos, o tamanho dos olhos e o contraste das três aparências ainda precisam ser avaliados no WebView2 nos tamanhos compacto e grande.
- A arte permanece vetorial procedural própria do Edge Mochi; não reutiliza o código nem a silhueta do Coucou.

## Próximos passos

- Abrir o app no Windows e ajustar proporções das mãos e dos olhos caso a inspeção visual indique necessidade.
- Conferir aceno, olhar, piscada, ingestão e `prefers-reduced-motion` com o novo desenho.
