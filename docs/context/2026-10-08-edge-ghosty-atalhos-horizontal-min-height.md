# Snapshot: altura dos atalhos na ilha horizontal

## Objetivo

Corrigir a sobreposição dos atalhos personalizados nas bordas superior e inferior.

## Alterações realizadas

- Removidas regras horizontais antigas que mantinham `min-height` de 82 px nos botões e 88 px na grade. A especificidade delas fazia com que vencessem os estilos compactos definidos depois.
- A grade horizontal agora usa os cartões compactos de 38 px já definidos para a tela de Atalhos.

## Arquivos tocados

- `src/style.css`
- `docs/context/2026-10-08-edge-ghosty-atalhos-horizontal-min-height.md`

## Validações

- Hot reload do Vite aplicado na janela Tauri em execução.
- Inspeção visual confirmou duas linhas de atalhos com espaçamento, sem sobreposição.
- `git diff --check` sem erros.
- Build e testes não foram executados.

## Problemas conhecidos

- Nenhum observado na composição horizontal após a atualização visual.

## Próximos passos

- Conferir a mesma tela nas bordas superior e inferior após reiniciar o app.
