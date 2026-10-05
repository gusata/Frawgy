# Snapshot: comportamentos do Coucou aplicados ao Edge Mochi

## Objetivo

Portar para o Mochi os comportamentos e movimentos do personagem do Coucou que têm equivalente no Edge Mochi, mantendo o desenho próprio do projeto. O usuário excluiu a barra de progresso do upload e os modos de ilha do Coucou.

## Alterações realizadas

- Alinhados os estados, badges, cores de estado, piscadas, olhar e partículas ao motor do Coucou.
- Ajustadas as formas dos olhos no Canvas com proporções do original, mantendo a tinta preta fosca exigida para o Mochi.
- Integradas a saudação longa na primeira abertura e a saudação curta nas aberturas seguintes, com aceno e movimentos das mãos.
- Portada a reação a toques: squash nos primeiros toques, tontura após três em 1,7 s e rotação de duas voltas; toques seguintes são ignorados enquanto o estado `dizzy` estiver ativo.
- O foco em andamento/concluído aciona `working`/`finished`; texto na busca do lançador aciona `searching`.
- O arrasto do arquivo move o corpo horizontalmente com mola, usa o limiar de captura e abre a fenda superior. Ao soltar, o Mochi faz a sequência de sucção, aperto e mastigação, e retorna à forma normal sem virar uma bolinha de progresso.
- As mãos continuam recolhidas em repouso. A silhueta assimétrica e a identidade visual do Edge foram preservadas.
- Registradas no `AGENTS.md` as decisões de mapeamento e as exceções de escopo.

## Arquivos tocados

- `src/pet-motion.ts`
- `src/main.ts`
- `AGENTS.md`
- `docs/context/2026-10-05-edge-mochi-port-comportamentos-coucou.md` (este snapshot)

## Referências consultadas

- [engine.ts — estados, emotes, olhos e ingestão](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/engine.ts)
- [sequence.ts — acompanhamento e coreografia do arquivo](https://raw.githubusercontent.com/Louis-CFM/coucou/main/windows/src/upload/sequence.ts)
- [greeting.ts — saudação longa e poses das mãos](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/greeting.ts)

## Validação

- Revisão estática dos canais de movimento, estados e eventos de entrada.
- `git diff --check` não apontou whitespace inválido nos arquivos versionados; `src/pet-motion.ts` é um arquivo novo ainda não rastreado e foi inspecionado separadamente.
- Build, testes e execução do aplicativo não foram feitos nesta tarefa.

## Problemas conhecidos e limites

- Os movimentos precisam de inspeção visual no runtime Windows, em especial a saudação, os gestos das mãos e a captura do cursor em diferentes escalas de monitor.
- Sons do Coucou não foram portados; esta aplicação cobre as animações e os movimentos no Canvas.
- A barra de progresso da coreografia de upload e os modos de ilha do Coucou permanecem excluídos. O temporizador de foco do Edge conserva seus próprios controles existentes.
- Estados Coucou sem evento equivalente no Edge permanecem no motor, mas não recebem gatilhos artificiais.

## Próximos passos

- Inspecionar o Mochi no app Windows durante primeira abertura, reabertura, cliques, foco e arrasto/soltura de arquivos.
- Corrigir discrepâncias visuais encontradas na inspeção sem alterar as exceções de escopo.
