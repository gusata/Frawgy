# Contexto da tarefa — localizar e restaurar a borda do menu

Data: 2026-10-02  
Identificador: edge-mochi-localizacao-configurada

## Objetivo

Localizar onde o Edge Mochi escolhe em qual borda da tela aparece e explicar por que trocar o valor padrão pode não restaurar a posição.

## Análise

- `src/main.ts` guarda a chave `edge-mochi.edge` no `localStorage`; `readEdge()` usa o valor salvo antes de cair no padrão `left`.
- `src-tauri/src/lib.rs`, em `window_geometry`, converte `left`, `top` e `bottom` em posição nativa. `top` encosta a janela na coordenada superior do monitor, sem considerar a área de trabalho reduzida pela barra de tarefas.
- A preferência `alwaysOnTop` controla a ordem Z da janela; ela é independente da preferência `edge`.

## Arquivos inspecionados

- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-topmost-reforcado.md`
- `src/main.ts`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`

## Validações

- Inspeção estática dos pontos de leitura da preferência e de posicionamento nativo.
- Nenhum código de runtime foi alterado e nenhum build foi executado nesta tarefa.

## Problemas conhecidos e próximos passos

- A preferência `top` já salva no `localStorage` prevalece sobre `DEFAULTS.edge`; para forçar um teste em `left`, alterar temporariamente `readEdge()` para retornar `left`, ou atualizar a chave salva no WebView.
- Se o menu continuar inacessível na borda superior, voltar para `left` e testar novamente o hit testing antes de reativar `top` com a barra de tarefas nessa borda.
