# Home horizontal enxuta do Edge Mochi

## Objetivo

Simplificar a Home após o feedback do usuário: sem rolagem, com mídia, volume e poucos atalhos, desenhada para o formato horizontal inspirado nas capturas do Coucou. Preservar a ilha e todas as animações.

## Alterações realizadas

- A Home agora tem uma composição única: Mochi e três atalhos salvos à esquerda; faixa, controles de mídia e volume à direita no formato horizontal.
- Removi da Home os blocos de foco, busca, Bolso e prancheta. Foco continua como atalho; Bolso permanece na aba Pet; a prancheta fica em um detalhe recolhido na aba Atalhos.
- Retirei o nome/subtítulo do cabeçalho e alinhei navegação à esquerda, com configurações e fechar à direita.
- Desativei rolagem somente na Home; a composição horizontal usa uma única superfície escura e divisória discreta.
- Não alterei `src/pet-motion.ts`, os keyframes, as transições do pet, `.island-body`, a geometria da ilha nem o hitbox.
- Atualizei a memória geral do projeto com a nova organização da Home.

## Arquivos tocados

- `AGENTS.md`
- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-05-edge-mochi-home-horizontal-enxuta.md`

## Validações

- Reabri as capturas 03, 04 e 16 do Coucou para orientar proporções, alinhamento e hierarquia.
- A árvore de acessibilidade do app Tauri em execução refletiu a Home reduzida: mídia, volume e três atalhos, sem busca, foco, Bolso ou prancheta.
- A janela atual foi reportada como 400×720, então a inspeção por pixel não correspondeu ao formato horizontal solicitado. A captura anterior da janela transparente também mostrava conteúdo atrás dela.
- Não executei build nem testes.

## Problemas conhecidos e próximos passos

- Conferir visualmente a Home quando o Edge Mochi estiver configurado na borda horizontal, sobretudo o ajuste de altura e os rótulos dos atalhos.
- Fazer essa revisão sem alterar a geometria da ilha ou as animações do Mochi.
