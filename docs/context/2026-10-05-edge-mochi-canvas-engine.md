# Contexto da tarefa — motor Canvas dedicado para o Mochi

Data: 2026-10-05  
Identificador: edge-mochi-canvas-engine

## Objetivo

Aplicar ao Mochi do Edge Mochi a abordagem de animação do Coucou: desenho procedural em Canvas 2D e motor próprio por quadro, sem usar peças HTML e keyframes CSS para representar e animar o personagem. A mudança preserva o layout, os controles e a arquitetura da ilha.

## Alterações realizadas

- Criado `src/pet-motion.ts`, que desenha a silhueta orgânica, orelhas, olhos, expressões, acessórios, pata e partículas no Canvas 2D.
- O motor controla canais separados para squash, inclinação, pata, alegria, irritação, tontura e mastigação. Tweens partem do valor atual, usam easing e podem ser substituídos por uma ação de prioridade maior.
- O olhar acompanha o ponteiro com suavização baseada em `dt`; o Mochi também faz micro olhares e piscadas autônomas.
- As ações de aceno, carinho, irritação, tontura e ingestão foram conectadas ao motor. O desenho continua obedecendo à aparência e ao acessório configurados.
- O ciclo para quando a janela fica oculta ou o elemento sai do DOM; o canvas acompanha o tamanho do personagem e limita a resolução interna a DPR 2. `prefers-reduced-motion` desativa os movimentos autônomos e gestos animados.
- `src/main.ts` mantém o botão como alvo acessível e roteia seus eventos para o motor. `src/style.css` mantém layout e tamanho, removendo keyframes e peças visuais CSS do personagem. `src/anim.ts` segue responsável somente pela geometria da ilha.
- Atualizado `AGENTS.md`, pois a renderização do personagem mudou de arquitetura.

## Arquivos tocados

- `src/pet-motion.ts`
- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-05-edge-mochi-canvas-engine.md`

## Validações

- Revisão estática dos pontos de integração, dos seletores e da remoção das animações CSS antigas.
- Build, testes e inspeção visual no Windows não foram executados nesta tarefa.

## Problemas conhecidos

- O resultado visual, a leitura das expressões nos tamanhos compacto e grande e a cadência do canvas ainda precisam ser avaliados no WebView2.
- O código implementa a técnica de desenho e animação em canvas com geometria própria para o Edge Mochi; ele não reutiliza o desenho nem o código-fonte do Coucou.

## Próximos passos

- Rodar `npm run build` e abrir o app no Windows para avaliar Home, aba Pet, três aparências, dois acessórios, gestos, ingestão e `prefers-reduced-motion`.
- Ajustar a escala da figura e os detalhes do rosto com base nessa inspeção visual.
