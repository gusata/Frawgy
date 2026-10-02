# Contexto da tarefa — abas e orelhas expandidas

Data: 2026-10-02  
Identificador: edge-mochi-abas-orelhas

## Objetivo

Manter as orelhas do notch visiveis nas extremidades do menu aberto e separar a interface em tres abas: Home, Pet e Atalhos. A Home deve mostrar versoes compactas do pet e dos atalhos.

## Alteracoes realizadas

- A Home agora apresenta volume, um resumo compacto do Mochi e uma previa dos atalhos.
- A aba Pet mostra o pet e o uso dos agentes em destaque.
- A aba Atalhos mostra os atalhos completos e preserva arrastar para reordenar.
- As orelhas recalculam sua posicao pela geometria atual do island, inclusive durante a abertura e quando o conteudo muda.
- A troca de abas atualiza somente o painel de conteudo; o corpo nativo da janela e a animacao permanecem intactos.
- O layout horizontal organiza os tres resumos da Home em colunas e reduz os cartoes das abas Pet e Atalhos para caberem na altura disponivel.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-abas-orelhas.md`

## Validacoes

- `npm run build` passou (`tsc` e `vite build`).
- Inspecao da janela em execucao confirmou Home, Pet e Atalhos na orientacao horizontal inferior; navegar entre abas manteve o menu aberto.
- Retornei a interface para Home e recolhi o menu apos a inspecao.

## Problemas conhecidos

- Nenhum problema novo conhecido nesta tarefa.
- O botao de adicionar atalho mantem o comportamento visual temporario que ja existia.

## Proximos passos

- Ajustar espacamentos ou tamanhos se a revisao visual do usuario indicar alguma preferencia diferente.
