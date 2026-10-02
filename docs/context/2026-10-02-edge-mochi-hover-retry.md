# Contexto da tarefa — recuperar abertura por hover

Data: 2026-10-02  
Identificador: edge-mochi-hover-retry

## Objetivo

Corrigir casos em que passar o cursor pela barrinha não abria o menu, preservando a animação existente.

## Alterações realizadas

- O polling nativo agora repete o evento de cursor a cada 100 ms enquanto o cursor está na área de hover. Isso recupera um primeiro evento perdido ao retirar a janela do modo click-through.
- O frontend agora abre sempre que recebe uma posição dentro da barrinha, mesmo que o estado local da transição esteja desatualizado. `setExpanded` continua idempotente.
- Nenhuma função, curva ou duração da animação foi alterada.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `src/main.ts`
- `docs/context/2026-10-02-edge-mochi-hover-retry.md`

## Validações

- Revisão estática das condições de polling, abertura idempotente e fechamento por saída da área.
- Não foi executado build ou teste nesta tarefa.

## Problemas conhecidos e próximos passos

- Como a mudança inclui Rust, o processo Tauri que já está aberto precisa ser reiniciado para carregar o polling atualizado.
- Depois de reiniciar, confirmar o hover com o cursor parado sobre a barrinha, incluindo a borda inferior que estava selecionada durante a inspeção.
