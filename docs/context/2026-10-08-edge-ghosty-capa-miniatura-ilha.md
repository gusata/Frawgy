# Contexto da tarefa: capa da música ao lado da ilha

Data: 2026-10-08  
Identificador: edge-ghosty-capa-miniatura-ilha

## Objetivo

Quando uma sessão de mídia do Windows estiver tocando e fornecer a capa, mostrar uma miniatura ao lado da barrinha recolhida do Edge Ghosty.

## Alterações realizadas

- Adicionada uma miniatura quadrada de 42 px ao lado da barrinha nas orientações esquerda, superior e inferior.
- A capa aparece somente durante a reprodução, fica oculta enquanto a ilha está expandida e não captura cliques.
- A miniatura acompanha a troca de faixa e usa uma entrada breve com redução de movimento respeitada.
- A janela principal consulta a sessão de mídia em intervalos de quatro segundos quando a tela Mídia não está aberta; mantém a atualização de 1,5 segundo na tela Mídia. Janelas adicionais de monitor também atualizam a miniatura em segundo plano.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- Este snapshot em `docs/context/`

## Validações

- Revisão estática do estado da sessão, atualização da miniatura, posicionamento por borda e comportamento de click-through.
- Build, testes e inspeção visual no runtime do Windows não foram executados nesta tarefa.

## Problemas conhecidos

- A miniatura depende de o player fornecer capa pela sessão de mídia do Windows.
- O tamanho e o posicionamento precisam de confirmação visual nas três bordas e em monitores adicionais.

## Próximos passos

- Com uma música que forneça capa, conferir a miniatura recolhida nas bordas esquerda, superior e inferior.
- Conferir que a capa some ao pausar ou expandir e que cliques nas aplicações atrás da miniatura continuam passando.
