# Snapshot — 2026-10-02: permissões do arrasto no Tauri

## Objetivo

Resolver o recebimento de arquivos e os eventos de hover que continuavam sem funcionar.

## Causa encontrada

O projeto não tinha arquivos de capability. No Tauri 2, o frontend precisa da permissão `core:event:allow-listen` para registrar listeners. `onDragDropEvent` registra quatro listeners (`enter`, `over`, `drop`, `leave`) usando essa API; sem a capability, o registro falhava e o drop nunca chegava ao código que grava o caminho no Bolso.

## Alterações realizadas

- Criada `src-tauri/capabilities/default.json`, concedendo `core:event:default` e `core:window:default` às janelas `main` e `display-*`.
- Referenciada a capability `default` em `app.security.capabilities` no `tauri.conf.json`.
- Mantidas as alterações anteriores de hitbox durante arrasto, persistência imediata do caminho e feedback visual.

## Arquivos tocados

- `src-tauri/capabilities/default.json`
- `src-tauri/tauri.conf.json`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-acl-arrasto.md`

## Validações

- Causa confirmada pela configuração local: `app.security.capabilities` estava ausente e `src-tauri/capabilities/` não existia.
- A API local de `onDragDropEvent` registra listeners do sistema de eventos do Tauri; a capability foi configurada com `core:event:default`.
- Não foi executado build nem teste automatizado.

## Problemas conhecidos

- A capability precisa ser carregada pelo processo Tauri, então uma instância antiga precisa ser encerrada completamente antes de testar.
- Ainda é necessária confirmação manual no Windows, arrastando um arquivo do Explorer para o Mochi.

## Próximos passos

- Encerrar todas as instâncias antigas do Edge Mochi e iniciar `npm run tauri dev` novamente.
- Arrastar um arquivo do Explorer para o notch e verificar a confirmação temporária e o item no Bolso.
- Se não funcionar, agora o console deve mostrar qualquer erro restante do registro ou processamento do evento.
