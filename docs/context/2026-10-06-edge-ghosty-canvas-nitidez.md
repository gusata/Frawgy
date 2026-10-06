# Edge Ghosty: nitidez do personagem

## Objetivo

Deixar o desenho do Ghosty mais definido, especialmente no aviso animado de conclusão.

## Alterações realizadas

- O canvas do personagem agora renderiza com pelo menos 2× a resolução CSS e acompanha a densidade da tela até 3×.
- Antes, a resolução interna era limitada a 2× e podia ficar abaixo da densidade de monitores com escala alta.
- O tamanho visual, o estilo e as animações do personagem não foram alterados.

## Arquivos tocados

- `src/pet-motion.ts`
- `docs/context/2026-10-06-edge-ghosty-canvas-nitidez.md`

## Validações

- `npm run build` passou: TypeScript e Vite concluíram a compilação.
- `git diff --check` passou sem erros; houve apenas avisos de conversão dos finais de linha do workspace.

## Problemas conhecidos

- Ainda falta conferir visualmente no runtime do Windows se o Ghosty aparece mais nítido em cada monitor usado.

## Próximos passos

- Observar o próximo aviso de conclusão e confirmar a nitidez do personagem.
