# Snapshot: curvatura da ilha no estilo Coucou Windows

## Objetivo

Aplicar à ilha do Edge Ghosty a abordagem de curvatura usada pelo port Windows do Coucou.

## Alterações realizadas

- Removidos os pseudo-elementos `::before`/`::after` que desenhavam orelhas com gradientes radiais.
- O próprio corpo preto da ilha agora usa `border-radius`: 14 px recolhido e 22 px expandido.
- O corpo continua recortando seu conteúdo com `overflow: hidden`.
- Removidas a constante `EAR_RADIUS` e as atualizações de `--bar-ear-offset` em JavaScript.
- Atualizada a memória geral do projeto para registrar a abordagem vigente.

## Arquivos tocados

- `src/style.css`
- `src/main.ts`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-curvatura-coucou-windows.md`

## Validações

- Consultado o CSS do port Windows do Coucou: `#island` usa `border-radius: 0 0 14px 14px`, e `#island-clip` recorta o conteúdo com `overflow: hidden` e `border-radius: inherit`.
- `git diff --check -- src/main.ts src/style.css` passou.
- Build, testes e inspeção visual no runtime não foram executados.

## Problemas conhecidos

- A aparência nas bordas superior, inferior e esquerda ainda precisa de inspeção visual no app.
- O arredondamento efetivo depende da espessura configurada da barrinha, como ocorre em CSS quando o raio é maior que a dimensão disponível.

## Próximos passos

- Conferir no runtime os três posicionamentos e os valores de espessura disponíveis.
