# Diagnóstico de transições abruptas nas animações do Mochi

## Objetivo

Investigar por que algumas animações parecem pular diretamente para a etapa seguinte e identificar conflitos entre sequências, estados e interrupções.

## Resultado da análise

O renderer combina canais interpolados (`play`/`Track`) com poses calculadas diretamente por estado ou tempo. Os canais independentes normalmente se misturam; os saltos aparecem nas interrupções que desligam uma pose diretamente e em sequências atrasadas que o agendador processa no mesmo quadro.

Achados com maior chance de explicar o comportamento observado:

1. **Etapas atrasadas podem ser descartadas pelo agendador.** Em `advance()`, todas as etapas vencidas são retiradas da fila no mesmo quadro e `startTrack(step, now)` inicia cada uma no horário atual do quadro. Se houver atraso suficiente para vencer duas etapas do mesmo canal, a segunda substitui a primeira antes que ela seja desenhada. Isso pode fazer uma sequência parecer pular um squash, um tremor ou a rotação inteira. O horário de início programado (`step.startsAt`) deixa de ser respeitado nesse caminho.
2. **Cancelar a recepção de arquivo corta propriedades que não usam `Track`.** `cancelFileReceive()` desliga `receivingFile` e zera `ingestStartedAt`. Com isso, o renderer para de desenhar `fileBodyX` e `fileTilt` imediatamente e a mola de retorno deixa de avançar. Se o Mochi estiver deslocado para o lado, ele volta ao centro num quadro. A boca também troca de `fileMouth` para o canal `mouth` (normalmente zero) de uma vez, embora a morph do corpo ainda esteja recolhendo.
3. **Interromper a saudação remove a pose calculada sem transição.** `interruptGreet()` zera `greetingStartedAt`. A escala, posição, inclinação e direção do olhar da saudação são calculadas por `greetingPose()`; ao remover essa pose diretamente, voltam ao valor base no próximo desenho. As mãos recebem uma saída interpolada, mas o restante do corpo não.
4. **Olhos e emotes trocam de forma imediatamente.** `eyeShape()` escolhe uma forma (`pill`, `cup`, `happy`, `line` etc.) diretamente de `receivingFile`, `activity` ou `emote`. Iniciar/terminar um emote ou passar de uma etapa da ingestão para outra troca o desenho num quadro; não há morph ou crossfade entre formas. Isso é perceptível, por exemplo, nas mudanças temporizadas da ingestão e quando um estado limpa `emote`.
5. **Uma nova rotação pode zerar a rotação em curso.** `doRoll()` chama `snap("roll", 0)` antes de iniciar a nova animação. Se `finished` e `dizzy` se sobrepuserem, o ângulo atual é descartado e o Mochi pode voltar à posição zero antes de girar outra vez.

Outras partes já interpoladas: o deslocamento horizontal enquanto o arquivo continua sobre o pet usa uma mola; cor, canais de morph/squash/mãos, olhar, piscada e entrada/saída do badge usam interpolação. Isso sugere que os saltos percebidos não vêm de uma regra global do Canvas, mas de alguns caminhos específicos acima.

## Arquivos inspecionados

- `src/pet-motion.ts`
- `src/main.ts`
- `AGENTS.md` e snapshots recentes em `docs/context/`
- `docs/context/2026-10-05-edge-mochi-diagnostico-pulos-animacoes.md` (este snapshot)

## Validação

- Revisão estática do agendador, do renderer, das interrupções de saudação, das rotinas de ingestão e dos gatilhos Tauri de `enter`/`over`/`leave`/`drop`.
- Nenhum código do motor foi alterado nesta análise.
- Build, testes e inspeção em runtime não foram executados.

## Problemas conhecidos e próximos passos

- O caminho mais direto para corrigir os saltos é iniciar cada etapa no seu `startsAt` original e atualizar o canal até o horário atual depois de processar etapas vencidas.
- O cancelamento do arrasto precisa preservar a pose atual e animar a boca, inclinação e deslocamento de volta ao repouso.
- A saudação interrompida precisa de uma saída curta da pose completa, não apenas das mãos.
- Para suavizar a expressão, interpolar os parâmetros dos olhos entre formas; manter a prioridade de estados e emotes explícita quando houver sobreposição.
- Não foi feita correção de código nesta tarefa; os achados precisam ser aplicados e conferidos visualmente em runtime.
