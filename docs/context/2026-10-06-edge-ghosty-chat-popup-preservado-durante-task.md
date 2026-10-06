# Snapshot: manter o chat aberto durante uma tarefa

## Objetivo

Evitar que um clique fora do popup encerre uma resposta ou pedido de permissão em andamento no chat rápido.

## Alterações

- Ao perder foco, o frontend registra se o chat está com o login pendente, aguardando uma resposta ou com aprovações pendentes.
- Se uma dessas condições estiver ativa no momento da perda de foco, o popup permanece aberto e a sessão do app-server continua ativa.
- O estado é capturado no evento de perda de foco para evitar que uma tarefa concluída durante os 160 ms de atraso ainda seja encerrada pelo clique que ocorreu enquanto estava ativa.
- Depois que esse evento é ignorado, uma nova perda de foco volta ao fechamento normal. Escape e o fechamento explícito continuam disponíveis.

## Arquivos tocados

- `src/main.ts`
- `AGENTS.md`
- Este snapshot.

## Validações

- `npm run build` passou.
- `git diff --check` passou; Git avisou apenas que poderá converter LF para CRLF nos arquivos modificados.
- Não foi feita inspeção interativa do popup no runtime do Windows nesta tarefa.

## Problemas conhecidos e limites

- O comportamento se aplica ao chat rápido quando há login pendente, uma resposta ativa ou uma aprovação aguardando decisão. Os outros popups mantêm o fechamento atual ao perder foco.
- Escape e controles de fechamento explícito ainda podem encerrar o popup durante uma tarefa.

## Próximos passos

- Conferir no Windows que um clique em outra aplicação não encerra uma resposta longa ou aprovação, e que a próxima perda de foco após o término fecha o popup normalmente.
