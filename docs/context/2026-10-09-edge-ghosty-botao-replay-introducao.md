# Contexto da tarefa: replay da introdução nas Configurações

## Objetivo

Adicionar às Configurações um botão para repetir a animação de entrada e facilitar testes visuais.

## Alterações realizadas

- A página Geral ganhou “Reproduzir animação de entrada”, com indicação de que a cena começa no topo e termina no assistente de configuração.
- A janela de Configurações chama um comando Tauri que mostra e foca a janela principal; um evento encaminha o pedido para o frontend da ilha.
- O replay reutiliza a animação e a tela inicial de configuração existentes. Durante a introdução, a ilha vai temporariamente para o centro da borda superior.
- A borda e a posição previamente salvas são mantidas em memória e restauradas quando o usuário termina ou pula o assistente. A posição temporária não é persistida.
- A primeira execução continua usando seu fluxo existente.

## Arquivos tocados

- `src/main.ts`
- `src-tauri/src/lib.rs`
- `docs/context/2026-10-09-edge-ghosty-botao-replay-introducao.md` (este snapshot)

## Validação

- Revisão estática do botão, do comando/evento entre janelas e da restauração da borda e da posição.
- `git diff --check` executado.
- Nenhum teste ou build foi executado.

## Problemas conhecidos

- A animação repetida não foi conferida visualmente em runtime nesta tarefa.

## Próximos passos

- Clicar no botão em Configurações e conferir a entrada pelo topo, a transição para a configuração e a restauração da borda ao concluir ou pular.
