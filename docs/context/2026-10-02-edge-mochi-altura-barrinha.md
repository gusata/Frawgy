# Contexto da tarefa — altura da barrinha recolhida

Data: 2026-10-02
Identificador: edge-mochi-altura-barrinha

## Objetivo

Apontar os locais exatos que controlam a altura da barrinha pequena do Edge Mochi.

## Alterações realizadas

- Nenhum código do app foi alterado.
- Identificado que a altura recolhida é definida tanto no valor CSS inicial quanto no alvo da animação em TypeScript.
- Identificados os offsets das orelhas radiais que devem acompanhar a altura da barrinha.
- Confirmado que a janela nativa Tauri usa sua altura atual e não precisa ser alterada para mudar só a barrinha visual.

## Arquivos tocados

- `docs/context/2026-10-02-edge-mochi-altura-barrinha.md`

## Validações

- Leitura do snapshot anterior, `src/style.css`, `src/main.ts` e `src-tauri/src/lib.rs`.
- Sem build ou execução, pois nenhum código do app foi modificado.

## Problemas conhecidos e próximos passos

- Para manter as orelhas alinhadas aos extremos, recalcular `54px` como metade da nova altura mais 14px.
- Se o usuário pedir a mudança, atualizar CSS e o alvo da animação juntos.
