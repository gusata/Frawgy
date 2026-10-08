# Contexto: ilha expandida ajustada ao conteúdo

Data: 2026-10-08  
Identificador: edge-ghosty-ilha-ajustada-ao-conteudo

## Objetivo

Eliminar o espaço preto excessivo ao redor dos novos cartões inspirados no Coucou, mostrado pelo usuário na Home do Edge Ghosty, sem reduzir a área necessária para Pet, Atalhos e Configurações nem modificar a barrinha recolhida ou o modelo Canvas do Ghosty.

## Alterações realizadas

- `expandedIslandSize()` em `src/main.ts` define dimensões expandidas por tela. A Home usa até 800×210 logical px, suficientes para os cartões 760×150, cabeçalho e margens. Pet usa até 800×330. Atalhos usa até 800×380 nas bordas horizontais e 800×430 na esquerda. Configurações/onboarding usam até 800×380 nas bordas horizontais e 800×520 na esquerda.
- `animateIsland()` usa esses alvos, mantendo a animação spring já existente. A troca de aba reaplica o tamanho; o retângulo nativo de cursor/click-through continua publicado a cada quadro por `setBodyGeometry()`.
- `applyIslandVariables()` publica `--expanded-width` e `--expanded-height` para que o CSS e a geometria inline tenham o mesmo alvo. As regras expandidas em `src/style.css`, incluindo o caso de janela baixa, usam as variáveis.
- Ao reconstruir o conteúdo para abrir/fechar Configurações, `render()` reaproveita a geometria visual anterior e anima até a nova medida, evitando salto da superfície preta.
- A janela Tauri hospedeira segue transparente e com tamanho estável; o preto visível e sua área interativa é que foram ajustados. A barrinha recolhida, as orelhas e o motor Canvas do Ghosty não mudaram.
- A decisão estrutural e a descrição atual do projeto foram atualizadas em `AGENTS.md`.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- Este novo snapshot em `docs/context/`

Alterações e snapshots anteriores que já estavam no workspace foram preservados.

## Validações

- `npm run build` passou (TypeScript e Vite).
- `git diff --check` não encontrou erro de whitespace.
- Inspeção no app Windows em execução via Orca: Home com cerca de 800×210 envolve os dois cartões sem a faixa preta vazia anterior; Pet expande para acomodar o Ghosty e o painel lateral; Atalhos expande e mantém rolagem; Configurações mantém seus cartões roláveis.
- A árvore de acessibilidade continuou expondo navegação, controles de mídia, Pet, Atalhos e Configurações.
- Nenhum teste foi adicionado ou executado.

## Problemas conhecidos

- A janela hospedeira transparente continua maior que a superfície visível por necessidade do posicionamento estável e do click-through. Sua área externa não deve capturar cliques quando o retângulo nativo publicado está correto.
- Atalhos e Configurações têm mais conteúdo do que cabe nas alturas horizontais disponíveis e continuam com rolagem interna, como antes.

## Próximos passos

- Confirmar visualmente a borda esquerda e monitores menores, onde os alvos são limitados ao tamanho da janela hospedeira.
- Se surgirem recortes em conteúdo específico, ajustar o layout dessa tela mantendo `expandedIslandSize()`, o CSS e o retângulo nativo sincronizados.
