# Correções de transição entre animações do Mochi

## Objetivo

Aplicar as correções identificadas na análise dos movimentos que pulavam entre etapas ou voltavam bruscamente ao estado neutro.

## Alterações realizadas

- O agendador inicia cada etapa no `startsAt` original e depois avalia o canal no horário do quadro atual. Quadros atrasados deixam de substituir etapas intermediárias pelo próximo alvo.
- O cancelamento do arrasto mantém a pose de arquivo durante o retorno: deslocamento, inclinação, abertura e pequeno hop voltam gradualmente ao neutro. O retorno termina quando os valores residuais ficam abaixo de limites visuais mínimos.
- Reentrada durante o retorno preserva os valores atuais da mola em vez de reiniciar o corpo na posição central.
- Interrupções da saudação guardam a pose atual e retornam escala, posição, inclinação, olhar e mãos ao repouso em 180 ms. Mudanças de estado e emote também interrompem a saudação com essa saída.
- Formas dos olhos fazem crossfade em 120 ms; com movimento reduzido, a troca permanece imediata.
- `doRoll()` parte do ângulo atual, removendo o reset que podia reposicionar o Mochi antes do giro. O fim do giro continua no ângulo neutro equivalente.
- O hop da captura agora acompanha e libera por suavização; ao ativar movimento reduzido, os valores auxiliares são zerados.

## Arquivos tocados

- `src/pet-motion.ts`
- `docs/context/2026-10-05-edge-mochi-correcoes-transicoes-animacao.md` (este snapshot)

## Validação

- Revisão estática das linhas do tempo, interrupções, retorno do arrasto, transição de olhos e rotação.
- `git diff --check` passou. A verificação de espaços finais em `src/pet-motion.ts` não encontrou ocorrências.
- Build, testes e inspeção visual no Windows não foram executados nesta tarefa.

## Problemas conhecidos

- Os tempos e a composição dos crossfades precisam de confirmação visual no WebView2, especialmente ao cancelar um arquivo já capturado, interromper uma saudação e iniciar um segundo giro durante o primeiro.

## Próximos passos

- Inspecionar no app as transições normais e interrompidas, além do retorno de um arrasto cancelado nas escalas de monitor usadas pelo projeto.
