# Contexto da tarefa — hover abre e recolhe

Data: 2026-10-02  
Identificador: edge-mochi-hover-reage

## Objetivo

Investigar por que passar o mouse sobre a barrinha não abria o menu.

## Causa identificada

- O polling nativo alternava corretamente o click-through: em teste no app rodando, `WS_EX_TRANSPARENT` saía ao entrar na área da barrinha e voltava ao sair.
- O estado visual dependia dos eventos `edge-mochi-cursor`; se a transição inicial não chegava ao frontend, a janela aceitava mouse, mas o menu continuava recolhido.
- O app em execução estava na borda esquerda, com a janela em `(0, 180)`.

## Alterações realizadas

- Reativados `pointerenter` e `pointerleave` de `.island-body` no Tauri como caminho adicional para abrir/recolher; o polling nativo continua responsável pelo click-through e também reporta transições.
- Os dois caminhos compartilham `setExpanded`, que ignora mudanças repetidas de estado.
- Atualizadas as instruções operacionais para registrar essa redundância intencional.

## Arquivos tocados

- `src/main.ts`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-hover-reage.md`

## Validações

- `npm run build` passou (TypeScript e Vite).
- Na janela Tauri ativa, mover o cursor até a barrinha sem clicar abriu o painel; mover para fora recolheu o painel.

## Problemas conhecidos e próximos passos

- A janela ativa durante o teste estava à esquerda; a interação com a barra de tarefas quando o menu está configurado no topo não foi testada.
- Se houver nova falha, verificar a camada da barra de tarefas e o retângulo de hover no monitor onde o app está selecionado.
