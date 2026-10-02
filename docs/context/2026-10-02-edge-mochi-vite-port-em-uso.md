# Contexto da tarefa — conflito na porta do Vite

Data: 2026-10-02  
Identificador: edge-mochi-vite-port-em-uso

## Objetivo

Investigar a falha de `npm run tauri dev` causada pela porta 1420 já estar em uso.

## Causa identificada

- A sessão `tauri dev` iniciada durante a validação anterior deixou o Vite ocupando a porta 1420.
- A sessão Tauri foi interrompida. O usuário informou que já iniciou o próprio comando depois disso.

## Arquivos tocados

- `docs/context/2026-10-02-edge-mochi-vite-port-em-uso.md`

## Validações

- O processo que ocupava a porta foi identificado como `vite.js` do repositório.
- Após interromper a sessão Tauri, o listener da porta ainda aparecia; ele não foi encerrado porque o usuário informou que o app já estava rodando.

## Problemas conhecidos e próximos passos

- Manter apenas uma sessão `npm run tauri dev` ativa por vez. Para iniciar outra, interromper a anterior com `Ctrl+C` no terminal correspondente.
