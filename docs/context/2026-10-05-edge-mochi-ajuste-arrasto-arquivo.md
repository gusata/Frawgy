# Ajuste da animação de arrasto de arquivos

## Objetivo

Corrigir a aparência observada no arrasto de arquivos: ampliar o corpo arredondado que recebe o item e tornar mais perceptível o acompanhamento horizontal do cursor.

## Alterações realizadas

- Ampliei o formato durante a ingestão de 80×80 para 88×88 unidades e ajustei o raio dos cantos.
- Ampliei o canvas do Mochi em destaque para 150% da largura do personagem, centralizado, criando espaço lateral sem alterar o canvas dos pets pequenos da Home.
- Passei a usar a largura lógica real do canvas em destaque para centralizar o personagem, acompanhar o cursor e limitar o deslocamento com uma margem de segurança nas bordas.
- Ajustei a posição dos elementos desenhados no canvas que usam o centro horizontal, para que continuem alinhados após a mudança de proporção.
- Mantive a mola, a abertura da boca e as etapas de ingestão existentes.

## Arquivos tocados

- `src/pet-motion.ts`
- `src/style.css`
- `docs/context/2026-10-05-edge-mochi-ajuste-arrasto-arquivo.md` (este snapshot)

## Validação

- Revisão estática do cálculo de escala, centro, deslocamento máximo e margem do corpo dentro do canvas.
- `git diff --check` sem erros de whitespace; a inspeção de whitespace do arquivo novo `src/pet-motion.ts` também não encontrou linhas com espaços finais.
- Build, testes e inspeção visual no Windows não foram executados nesta tarefa.

## Problemas conhecidos

- O novo tamanho e o deslocamento precisam ser conferidos visualmente durante um arrasto real no app, incluindo as bordas do painel e monitores com escala diferente.

## Próximos passos

- Abrir o app no Windows, arrastar um arquivo sobre o Mochi e confirmar se o tamanho e o movimento lateral ficaram confortáveis sem cortar o personagem.
