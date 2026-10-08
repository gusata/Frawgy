# Contexto da tarefa: mídia, pílulas e Ghosty

Data: 2026-10-08  
Identificador: edge-ghosty-midia-botoes-ghosty-blur

## Objetivo

Corrigir a composição da vista Mídia depois da implementação do player e do mixer: manter as pílulas de navegação no tamanho normal, continuar mostrando Ghosty como antes e usar a capa da faixa como fundo desfocado.

## Alterações realizadas

- Removidas as regras que estreitavam a coluna de navegação na vista Mídia e que ocultavam o Ghosty.
- Mantida a margem reservada para o personagem no cartão principal.
- Adicionado fundo com a arte da faixa ampliada, desfocada e escurecida atrás da capa nítida e dos controles.
- No mixer horizontal, reservada uma coluna de aproximadamente 352 px para as pílulas. Na borda esquerda, a coluna principal mantém até 420 px com os cartões empilhados; o mixer ocupa a lateral.
- Atualizada a memória geral do projeto com essa decisão de interface.

## Arquivos tocados

- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-midia-botoes-ghosty-blur.md`

## Validações

- Não foram executados build, verificações automatizadas ou inspeção visual no runtime nesta revisão.

## Problemas conhecidos

- O resultado visual do blur e as dimensões do mixer ainda precisam de conferência manual no Windows, especialmente na borda esquerda e em monitores estreitos.
- A implementação do player e do mixer descrita no snapshot anterior ainda precisa de build e inspeção no runtime.

## Próximos passos

- Conferir a alternância entre Agora e Mídia e confirmar que as pílulas mantêm a dimensão.
- Com uma faixa tocando, conferir a capa nítida, o fundo desfocado e Ghosty visível.
- Abrir o mixer nas bordas horizontal e esquerda e ajustar a coluna se a conferência visual mostrar cortes ou excesso de espaço.
