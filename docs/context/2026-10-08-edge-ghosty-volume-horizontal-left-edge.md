# Snapshot: slider de volume horizontal na borda esquerda

## Objetivo

Exibir o slider do volume principal na horizontal quando a ilha fica na borda esquerda.

## Alterações realizadas

- A orientação esquerda agora sobrescreve `writing-mode: vertical-lr` com `horizontal-tb` e `direction: ltr`.
- O slider ocupa o espaço horizontal disponível no cartão, mantendo altura de 18 px.

## Arquivos tocados

- `src/style.css`
- `docs/context/2026-10-08-edge-ghosty-volume-horizontal-left-edge.md`

## Validações

- Revisão do seletor específico de borda e do estilo base vertical.
- `git diff --check` sem erros.
- Build e testes não foram executados.

## Problemas conhecidos

- A composição na borda esquerda não foi aberta para inspeção visual nesta alteração.

## Próximos passos

- Conferir o slider na ilha vertical após o hot reload ou reinicialização do app.
